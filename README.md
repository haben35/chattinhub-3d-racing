# ChattinHub 3D Racing Pro

A Three.js (WebGL) 3D racing game that runs in a mobile browser and as a Telegram Mini App.
Files: `index.html`, `style.css`, `game.js`. No build step, no backend, **no bot token anywhere**.

## What's included (honest status)
Working by design: 3D circuit (road, curbs, walls, start/finish gantry, checkpoints, trees, mountains, buildings, grandstand, lights), 6 detailed procedural cars with spinning wheels, chase camera, 3 AI rivals, 3-lap races with real line-crossing + 3 checkpoints, position/lap/time HUD, nitro, off-road slowdown, wall collisions, auto-respawn, pause/restart/results, garage (6 cars, colours, wheels, spoiler, 5 upgrades, credits), Quick Race / Time Trial / Practice, WebAudio sound (engine, screech, nitro, crash, countdown, music, mute), touch + keyboard controls, safe-area handling.

**Not included:** Championship mode and extra tracks (only one circuit). Single flat track (no elevation). Rivals follow a racing line and don't physically push each other. Cars are procedural Three.js geometry (no downloaded models).
**Not tested on a real device by the author** — the code passed a JavaScript syntax check only. Please run the checklist below and report bugs.

## Run locally
```
cd chattinhub-racing
python3 -m http.server 8000     # open http://localhost:8000
```
Three.js r128 loads from cdnjs (MIT licence); the Telegram SDK loads from telegram.org. Internet is required.
Keyboard: Arrows/WASD drive, Space/Shift nitro, P/Esc pause, R respawn.

## Publish with GitHub Pages (HTTPS)
1. Create a GitHub repo, upload the three files to its root.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / root → Save.
3. Your URL: `https://<user>.github.io/<repo>/` (wait ~1 minute).

## Connect to your bot (BotFather)
1. `/newbot` (or use an existing bot). Keep the token private — never paste it into this project.
2. `/newapp` → choose bot → title, description, (640×360 photo), send your HTTPS URL, short name → you get `https://t.me/<bot>/<shortname>`.
3. Optional menu button: `/mybots` → bot → Bot Settings → Menu Button → Configure → paste the URL.
4. Optional inline button: send a message from your bot server with an `InlineKeyboardButton` using `web_app: {url}`.

## Android / Telegram test checklist
- [ ] Loads (progress bar completes) in Chrome and in Telegram; no error text
- [ ] Menu → Quick Race shows full car, countdown 3-2-1-GO
- [ ] GAS moves car; releasing a button stops that input; multi-touch (steer + gas) works
- [ ] Steering turns car; BRAKE slows/reverses; N2O drains bar and speeds up
- [ ] Rivals drive the circuit; wall hits slow you and spark
- [ ] Checkpoints flash; lap increments only after crossing the line; 3 laps → results
- [ ] Restart, Pause/Resume, Garage, Main Menu buttons work
- [ ] Garage: rotate/drag, buy car, colour/wheels/spoiler, upgrades, credits persist after reload
- [ ] Page never scrolls/zooms; controls clear of notch and Telegram header; portrait + landscape
- [ ] Sound starts only after first tap; Sound toggle mutes
- [ ] Graphics: Low improves FPS on weak phones
- [ ] Source contains no secrets

## Privacy
No Telegram user data is read or sent. localStorage keeps only credits, car setup and best times.

## Credits / licences
Three.js r128 — MIT. All geometry, textures (canvas-generated) and sounds (WebAudio synthesis) are original.
