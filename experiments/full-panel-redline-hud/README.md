# Full panel + Redline HUD experiment (NOT an installable fix)

Goal: keep Cluster Themes' full 1920x720 `panel` display visible while HUD Widgets' Redline 800x480 `hud` display is visible.

## Source-level baseline, 2026-11-09
Upstream: robertnisipeanu/idrive-apps, native/cluster-render.
- `panel_scene_id = 0x01000400`
- `hud_scene_id = 0x01000400`
- `scene_ids_allowed = 0x010004f0,0x01000400,0x010004f1`
- SlotManager prevents simultaneous requested targets with the same scene ID.
- Upstream README reports KOMBI restarts from trying other scene IDs (7702 and 7703).
- The supported `map` + `hud` pair is NOT equivalent to full `panel` + `hud`.

## Safe test plan
1. Keep the production Store source and Cluster Themes v0.13.22 unchanged.
2. In an isolated copy of upstream cluster-render, add a host-only regression test: request `panel` and `hud` concurrently using their existing shared scene ID. Assert the second request waits, and the first target is not forcibly unmapped.
3. Verify target release and reacquisition after a simulated shutdown and renderer restart.
4. Investigate only hardware-supported alternate scene allocation or a distinct HUD drawing path. Do not assume arbitrary scene IDs are valid.
5. Run upstream `make test` and `make target` before any device deployment. Requires the upstream native source, dependencies and build environment.
6. Test a separately packaged renderer on hardware only with verified recovery access and owner approval. Monitor for loss of speed, warnings, cluster/HUD restart or mapping guard disablement. Stop on first failure.
7. Only after successful on-car verification publish an opt-in MGU Store package; keep the known-good version available for rollback.

## Current status
Baseline source checks completed. No native patch or binary produced. No MGU Store package published. No on-car test performed.

Tracking: https://github.com/robertnisipeanu/idrive-apps/issues/123
