# GTA VI Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Nvlfbrynsyah/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Nvlfbrynsyah/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

A local GTA VI trophy tracker for all 55 entries in the repository's source dataset. Every trophy has an original multi-sentence guide, a difficulty rating, a time estimate, and links identifying its sources. Unconfirmed triggers and reported totals are marked in the guides; the tracker is planning advice, not a claim of verified gameplay.

## Guide features

- Click any of the four roadmap stages to filter the checklist. Each stage shows its trophy count, earned count, and a live progress bar.
- Combine search, kind, grade, stage, and Hide earned. Sort by roadmap order (the default), name, grade, difficulty, or estimated time.
- See overall progress and earned/total counts for platinum, gold, silver, and bronze. Counts come from the dataset and your checklist.
- Open a trophy for its guide, difficulty, estimated time, count target when present, and any missable note. Positive Mental Attitude is categorized as an activity with a separate missable flag, so the detail panel has one Missable badge.
- Hide story spoilers, export or import checklist JSON, and reset progress after a confirmation. Browser localStorage preserves earned trophies between visits.

The missable review is limited to what the existing notes establish. Positive Mental Attitude remains the only flagged trophy: the notes report that Lucia's Chapter 1 balcony meditation becomes unavailable after the chapter, with no mission replay. Keep a separate chapter-start save. Suggestions to save before other encounters do not by themselves establish additional lockouts.

## Difficulty and time methodology

Ratings and times are editorial planning estimates, not measured completion times or source-confirmed durations. Difficulty uses a 1–5 effort scale: 1 for straightforward story beats, 2 for short activities, 3 for multi-step tasks or repeated practice, 4 for larger collections or demanding challenges, and 5 for extensive completion work. Large-count objectives receive more effort than short story beats. Some cryptic trophies retain uncertain triggers, so their estimates are especially provisional.

Time strings use minutes or hours. The runtime summary sums each trophy's estimate using range midpoints; an open-ended value such as `10+ h` uses 1.5 times its stated lower bound as a rough planning allowance. The overall difficulty label uses the arithmetic mean of all ratings: below 1.5 Trivial, below 2.5 Manageable, below 3.5 Moderate, below 4.5 Demanding, otherwise Long-haul.

The displayed combined effort is a sum of individual estimates, not a measured platinum duration. Chapter trophies, individual missions, stranger strands, and completion goals overlap, so real elapsed time can be substantially lower or higher. The platinum's own five-minute estimate covers the final checklist check, not the full route. Both the total and difficulty label are calculated from the data at runtime.

## Run it

From this directory:

```sh
node serve.ts
```

Then open [http://localhost:8080](http://localhost:8080).

The server serves the HTML, CSS, JavaScript module, and JSON from `app/`. There are no remote scripts, fonts, images, or data loads. Source links open only when selected. Keep the local server running to load or reload the page; no service worker or remote account is required.

## Verification

Round 3 S2 verified all 55 difficulty/time records and the protected README badge/footer lines. Browser assertions passed for combined filters, every sort, stage-card selection, live stage/grade progress, detail targets and missable notes, a single missable badge, spoiler persistence, keyboard controls, hide earned, reset, and import/export. The capture run recorded zero browser errors and zero external requests. The four real JPEG captures in `screenshots/` each measure 1280×800 and remain below 256 KiB; `shots.json` defines their states.

The rewritten standard-library entrypoint produced byte-identical `dossier.json` files in two fresh output directories, confirmed with `cmp`. Verification ran on Node 24.22.1. The local kit check reported 4 passed, 0 failed, 16 skipped, and 5 checks deferred to submission; transcript and server-side checks remain outside that local result. These checks do not validate gameplay claims.

---

<sub>Entered on [make.fun](https://make.fun/?ref=x2bhbzsv&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
