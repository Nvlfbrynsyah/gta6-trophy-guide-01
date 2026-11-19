# GTA VI Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Nvlfbrynsyah/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Nvlfbrynsyah/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline-first GTA VI trophy tracker for all 55 trophies. Follow the four-stage Leonida roadmap, filter by story, missable, collectibles, or activities, and open any trophy for an original route note and its source links. Progress stays in the browser, with JSON export and import for a portable checklist. Story spoilers can be hidden until a trophy is marked earned. Save at each chapter start and visit Lucia’s Chapter 1 balcony for Positive Mental Attitude before advancing; mission replay is unavailable.

## Guide features

The tracker organizes the full list into a four-stage route through Leonida. Category filters make it quick to isolate story goals, missables, collectibles, or activities, while each trophy has its own route note and source links. The spoiler control keeps story details out of view until the related trophy is marked earned.

Your checklist is stored locally in the browser. Use the JSON export and import controls to move progress between browsers or keep a backup. Because the app is self-contained, it can be used without a network connection after the files are available locally.

## Run it

From this directory:

```sh
node serve.ts
```

Then open [http://localhost:8080](http://localhost:8080).

The server delivers the static HTML, CSS, module, and trophy data from `app/`; no service or online account is needed to maintain a checklist.

## Verification

The entrypoint was run twice with fresh output directories, and the generated `dossier.json` files were compared byte-for-byte.
The kit check was run against this repository from the GTA VI trophy guide kit.
The entrypoint output is deterministic and offline; the app loads its tracked local assets without network requests.

---

<sub>Entered on [make.fun](https://make.fun/?ref=x2bhbzsv&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
