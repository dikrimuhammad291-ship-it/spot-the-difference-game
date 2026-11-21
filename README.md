[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/dikrimuhammad291-ship-it/spot-the-difference-game/rank.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/dikrimuhammad291-ship-it/spot-the-difference-game/reward.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)

# Mirror Mystery — Spot the Difference

An original spot-the-difference game that plays fully offline in a desktop
browser. Two pictures look the same — they are not. Find all 6 differences
in each of 3 hand-drawn cartoon scenes before the clock runs out.

## How to play

- **Click a difference** on either picture to mark it — a gold ring appears on
  both pictures and the counter updates.
- **Wrong clicks cost 5 seconds.** Hints cost 50 points (3 per level, `H` key).
- **Streaks pay:** find differences quickly in a row for bonus points.
- **Time pressure:** 150s on the beach, 120s in the kitchen, 100s in space.
- **Keyboard:** `H` hint, `R` restart level, `Enter` start / next, `Esc` menu.

## Levels

1. **Sunny Beach Day** — the calm shore hides 6 changes.
2. **Cozy Kitchen** — somebody tidied up… or did they?
3. **Space Adventure** — deep space, sharp eyes.

## Run it

Serve `game/` with any static HTTP server and open `index.html`:

```sh
node serve.ts
# then open http://localhost:8080
```

No build step, no network requests: every script, image and sound is a file
under `game/` (sounds are synthesised with the Web Audio API).

## Layout

- `game/index.html` — page layout, HUD, boards, overlays
- `game/css/style.css` — all styling
- `game/src/levels.js` — level data: pictures, timers, difference coordinates
- `game/src/game.js` — game logic: clicks, timer, hints, scoring
- `game/src/sound.js` — synthesised sound effects (Web Audio, no files)
- `game/src/main.js` — entry point
- `game/img/` — the six scene pictures (original art for this game)
- `screenshots/` — real renders of the game in a browser
- `main.ts` — hand-in program: copies `game/` + `screenshots/` to `/output`
  and writes `dossier.json`
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

## Screenshots

`1-cover.jpg` shows a level mid-play: two pictures side by side, markers on
the differences found, several still unfound, and the counter of how many
remain. The other shots show the kitchen and space scenes and a level-clear.

## License

MIT — see [LICENSE](LICENSE).
