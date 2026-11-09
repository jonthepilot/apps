'use strict';
/**
 * Cluster Themes: redraws the iDrive 7 instrument cluster (the 1920x720 "panel" target) through cluster-render.
 *
 * The center screen is the app's own page (shared/page.js, a canvas screen): the themes with their
 * pictures, which drive mode shows which, and the settings. Each choice is saved in the app's data/settings.json
 * by the kit; the shared engine (hud.js) listens and redraws at once. It keeps running after the page is
 * closed (OAP apps stay up in the background), so the page is only needed for changes. The kit's own
 * settings list stays one tap away (the bar's All settings).
 */
const mgu = require('./kit/mgu');
const HudApp = require('./hud');
const Page = require('./page');
const palettes = require('./hud_themes').THEMES;
const colors = {amber:[255,154,38],red:[255,55,65],blue:[55,175,255],green:[70,235,125],purple:[190,95,255],white:[240,245,255]};
function applyAccent(ctx){const rgb=colors[ctx.settings.get('accentPreset')]||colors.amber;for(const k of ['roadster','track','gt3','dyno']){const p=palettes[k];if(!p)continue;p.arc=[...rgb,255];p.accent=[...rgb,255];p.needle=[...rgb,255];p.bar={...p.bar,low:rgb,mid:rgb};p.rev={from:rgb,to:rgb};if(k==='dyno')p.head=[...rgb,255];}}


mgu.run({
    start(ctx) {
        let hud;
        applyAccent(ctx);
        ctx.settings.onChange((key)=>{if(key==='accentPreset'){applyAccent(ctx); if(hud){try{hud.refresh?.();}catch(e){}}}});
        try {
            hud = new HudApp(ctx);
        } catch (e) {
            // nothing drawn, but stay up: an exit here would count as a crash on the car
            ctx.log.error('Cluster failed to start: ' + (e && e.stack || e));
            return;
        }
        hud.start();
        new Page(ctx, hud, {
            title: ctx.spec.title, what: 'cluster',
            look: { name: 'Themes', style: 'hero', tags: {roadster:'E46 classic',track:'GT4',gt3:'endurance',dyno:'telemetry'} },
            tabs: ['look', 'readouts', 'badge', 'map', 'alerts', 'settings'],
            settings: ['accentPreset', 'units', 'clock', 'redline', 'shiftBefore', 'coldGuard', 'showBoost', 'nightDim', 'gFlipLat', 'gFlipLong', 'demo'],
        }).start();
        process.on('exit', () => { try { hud.stop(); } catch (e) { /* exiting anyway */ } });
    },
});
