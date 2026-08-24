package com.roiducarton.game;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;

import androidx.core.graphics.Insets;
import androidx.core.view.OnApplyWindowInsetsListener;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.getcapacitor.BridgeActivity;

import java.util.Locale;

/**
 * LES VRAIES MARGES DU TÉLÉPHONE, DONNÉES AU CSS.
 *
 * Depuis qu'on vise l'API 35 — ce que le Play Store exige — Android 15 impose
 * le BORD À BORD : l'application dessine derrière la barre d'état et derrière
 * la barre de navigation, au lieu de commencer en dessous. Le haut de l'écran
 * du jeu passait donc sous l'heure et la batterie.
 *
 * Le CSS prévoyait pourtant des marges de sécurité, avec `env(safe-area-inset-*)`.
 * Mais ces valeurs ne sont renseignées que par la vue web d'iOS : sur Android
 * elles valent toujours zéro, quelle que soit la version. La protection
 * existait donc dans le code et ne protégeait rien.
 *
 * On lit donc les marges du côté natif, où elles sont exactes, et on les pose
 * en variables CSS sur la racine du document. `client/src/index.css` s'en sert
 * comme plancher : `max(env(...), var(--inset-top, 0px))`. Sur le web les
 * variables n'existent pas et valent 0, donc rien ne change ; sur iOS
 * `env(...)` reprend la main ; sur Android c'est cette classe qui parle.
 *
 * L'écouteur est rappelé à chaque changement — rotation, clavier qui s'ouvre,
 * barre de navigation gestuelle qui apparaît — et non une seule fois au
 * démarrage : les marges ne sont pas constantes.
 */
public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final WebView web = getBridge().getWebView();
        if (web == null) return;

        ViewCompat.setOnApplyWindowInsetsListener(web, new OnApplyWindowInsetsListener() {
            @Override
            public WindowInsetsCompat onApplyWindowInsets(View v, WindowInsetsCompat insets) {
                // La découpe d'écran compte autant que les barres système : sur
                // un téléphone à encoche, l'heure n'est pas le seul obstacle.
                Insets marges = insets.getInsets(
                        WindowInsetsCompat.Type.systemBars()
                                | WindowInsetsCompat.Type.displayCutout());

                float densite = getResources().getDisplayMetrics().density;
                if (densite <= 0) densite = 1f;

                final String script = String.format(Locale.US,
                        "(function(r){"
                                + "r.style.setProperty('--inset-top','%.0fpx');"
                                + "r.style.setProperty('--inset-bottom','%.0fpx');"
                                + "r.style.setProperty('--inset-left','%.0fpx');"
                                + "r.style.setProperty('--inset-right','%.0fpx');"
                                + "})(document.documentElement)",
                        marges.top / densite,
                        marges.bottom / densite,
                        marges.left / densite,
                        marges.right / densite);

                web.post(new Runnable() {
                    @Override
                    public void run() {
                        web.evaluateJavascript(script, null);
                    }
                });

                return insets;
            }
        });
    }
}
