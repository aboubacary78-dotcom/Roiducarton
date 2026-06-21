import { useGame } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const HERO_IMG = 'https://private-us-east-1.manuscdn.com/sessionFile/IEX0yCKgQPAC1tCVyeLNRB/sandbox/5lqRDFcTLj7trFCP2zuZbn-img-1_1770979933000_na1fn_aGVyby1jYXJkYm9hcmQtY2l0eQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvSUVYMHlDS2dRUEFDMXRDVnllTE5SQi9zYW5kYm94LzVscVJERmNUTGo3dHJGQ1AyenVaYm4taW1nLTFfMTc3MDk3OTkzMzAwMF9uYTFmbl9hR1Z5YnkxallYSmtZbTloY21RdFkybDBlUS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=r1WeZvkNVc3K1ijLRCcylXkytw-88JbOMcV9xQmv9Sft7-0L9z6U1v4T3ugQgH7vWWZydN1AuVR~y4Dv-Yl1-kV65VscCenjCLxO0FixMS~wXg1qcRNGSwysZNKllKpk9ajOArUtHxSgqXwJOFROdSiolmPCaCp4z~4G~XEX0t9Bws7iEgCv~PROC2jVC84VQH6HDI-bJiM-3EXtlqaMnsJvQD-SIwFFgsVsDY9swm0WWKIm~1WHaLBUfhHKq2vkwf5R9CGIEYPiVKlTXpNSGqvL9lktFCPEZfp3mJaBA2h-wfYnXP9rH0zrLQL4ibKRd4NRtRn3JcA~rGjOrOlorw__';

const SAVE_KEY = 'roi-du-carton-save';

export default function TitleScreen() {
  const { dispatch } = useGame();
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.character && data.character.alive) {
          setHasSave(true);
        }
      }
    } catch { /* silent */ }
  }, []);

  return (
    <div className="min-h-screen bg-texture flex flex-col items-center justify-center p-5 gap-5">
      {/* Hero Image */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="w-full rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(42,31,26,0.12)]"
      >
        <img src={HERO_IMG} alt="Ville en carton" className="w-full h-48 object-cover" />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center"
      >
        <h1 className="text-4xl text-[#2A1F1A] leading-tight">
          Le Roi du Carton
        </h1>
        <p className="text-sm text-[#8B6B4A] mt-1.5">
          Une Épopée Urbaine
        </p>
        <p className="text-xs text-[#A08B70] mt-3 max-w-xs mx-auto">
          Survivez dans la rue. Devenez une légende.
        </p>
      </motion.div>

      {/* Buttons */}
      <div className="w-full flex flex-col gap-3 mt-2">
        {hasSave && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => dispatch({ type: 'CONTINUE_SAVE' })}
            className="w-full py-3.5 text-sm font-semibold text-white rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #4A9B5F, #3d8b4f)',
              boxShadow: '0 4px 16px rgba(74, 155, 95, 0.3)',
            }}
          >
            Continuer la partie
          </motion.button>
        )}

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: hasSave ? 0.6 : 0.5 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => dispatch({ type: 'START_GAME' })}
          className="btn-primary w-full py-3.5 text-sm"
        >
          Nouvelle Partie
        </motion.button>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: hasSave ? 0.7 : 0.6 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'settings' })}
          className="action-btn w-full py-3 text-sm text-[#6B5740] font-medium"
        >
          ⚙️ Options
        </motion.button>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs text-[#A08B70] text-center italic mt-2"
      >
        "La rue est dure, mais l'humour est plus dur."
      </motion.p>
    </div>
  );
}
