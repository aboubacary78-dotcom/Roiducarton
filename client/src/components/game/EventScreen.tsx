import { useGame } from '@/contexts/GameContext';
import { motion } from 'framer-motion';

const COMBAT_IMG_FALLBACK = 'https://private-us-east-1.manuscdn.com/sessionFile/IEX0yCKgQPAC1tCVyeLNRB/sandbox/5lqRDFcTLj7trFCP2zuZbn-img-3_1770979942000_na1fn_Y29tYmF0LXNjZW5l.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvSUVYMHlDS2dRUEFDMXRDVnllTE5SQi9zYW5kYm94LzVscVJERmNUTGo3dHJGQ1AyenVaYm4taW1nLTNfMTc3MDk3OTk0MjAwMF9uYTFmbl9ZMjl0WW1GMExYTmpaVzVsLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=POSygRuFbafowk8yUCiQxWUDcO6gNC-MgN0npOf8UcEgAqmG42~u-kCepnMQM7e0hRMVxg4jWd6gxz0y4zNFSxsazX8r~8g1b13bPnThnN6f4nrjAtenuztGg0gFiplsEjH9DObaPqIHWCwc-MdjcvTnNe7WSmHuL2ZJOBAuoPl9yjF5BBkfa32rnIEuC5xfkPicQC8WbTd18SP5Z3BHeipfP6MEjO3CBUh9eKROSEu1XS5buwsg9MaYZX6CR5lcf2vhVgcLSrUNIXWs2TkSXx7LW3wZZpOanBfj-xlgnZj3LdjlVmdmHga91kDP2sVVEf9xUj40YDEXc1t~I9SYMQ__';

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  combat: { label: 'Combat', color: '#D94F4F' },
  social: { label: 'Rencontre', color: '#4A8FBF' },
  discovery: { label: 'Découverte', color: '#4A9B5F' },
  narrative: { label: 'Événement', color: '#B8860B' },
};

export default function EventScreen() {
  const { state, dispatch } = useGame();
  const event = state.currentEvent;

  if (!event) {
    dispatch({ type: 'SET_SCREEN', screen: 'main' });
    return null;
  }

  const isCombat = event.type === 'combat';
  const isFollowUp = event.isFollowUp;
  const eventImage = event.image || (isCombat ? COMBAT_IMG_FALLBACK : null);
  const typeInfo = TYPE_LABELS[event.type] || TYPE_LABELS['narrative'];

  return (
    <div className="min-h-screen bg-texture p-4 flex flex-col gap-3">
      {/* Follow-up banner */}
      {isFollowUp && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#7B68EE]/8 border border-[#7B68EE]/20"
        >
          <span className="text-xs font-medium text-[#7B68EE]">
            Suite d'une rencontre précédente
          </span>
        </motion.div>
      )}

      {/* Event illustration */}
      {eventImage && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full h-44 rounded-xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.1)] relative"
        >
          <img
            src={eventImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </motion.div>
      )}

      {/* Event Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="craft-card p-4"
      >
        {/* Type badge */}
        <div className="mb-2">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
            style={{ backgroundColor: isFollowUp ? '#7B68EE' : typeInfo.color }}
          >
            {isFollowUp ? 'Suite narrative' : typeInfo.label}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-2xl text-[#2A1F1A] mb-2">{event.title}</h2>

        {/* Description */}
        <p className="text-sm text-[#5C4A38] leading-relaxed mb-4">{event.description}</p>

        {/* Choices */}
        <div className="flex flex-col gap-2">
          {event.choices.map((choice, i) => (
            <motion.button
              key={i}
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              whileHover={{ scale: 1.01, x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => dispatch({ type: 'CHOOSE_EVENT', choiceIndex: i })}
              className="action-btn p-3 text-left flex items-start gap-2.5"
            >
              <span className="text-lg mt-0.5">{choice.emoji}</span>
              <span className="text-sm text-[#3D3020] font-medium flex-1">{choice.text}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Back */}
      <button
        onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'main' })}
        className="text-sm text-[#A08B70] font-medium text-center py-2 hover:text-[#6B5740] transition-colors"
      >
        ← Retour
      </button>
    </div>
  );
}
