# Reaction Speed Study

This static web app measures how cognitive load affects reaction speed across three stages:

1. **Green control:** A uniform green target appears after a random delay. Press **Space** as quickly as possible for 10 valid trials.
2. **Selective response:** Red or green appears at random. Press **Space** only for green. Red distractors, missed responses, and incorrect responses are excluded; the stage continues until 10 successful green responses are recorded.
3. **Three-colour discrimination:** Red, green, or blue appears at random. Do not press for red, press **Space** for green, and press **Right Arrow** for blue. The stage records 10 valid mixed-colour trials by default. Red is accuracy-only, while correct green and blue responses provide reaction times.

Green and blue stimuli remain visible until the participant responds, so there is no response time limit. Red distractors in Stage 2 and red trials in Stage 3 use a one-second no-press observation window so the participant cannot get stuck. Presses during the random waiting period are ignored. Incorrect or missed trials repeat and are not included in the valid reaction-time statistics.

Each stage begins with an explainer and a participant-controlled pause before the next stage starts. The stage tabs show the current stage and which stages have been completed. Progress changes only after a valid response is recorded; distractors, missed responses, and incorrect responses do not advance it.

After the participant confirms a stage briefing, the start button becomes disabled, Stop study becomes available, and a three-second ready countdown appears before the random pre-stimulus delay begins.

Researchers can open **Researcher controls** to move between stages freely, skip the current stage, stop/resume a study, tune timing parameters, and set the valid repetition count independently for each stage (10 by default). Stage progress is retained when switching stages. The default settings are unchanged unless edited.

After all stages finish, download:

- **Trial CSV:** analysis-ready trial data with red incorrect-response rows excluded. It includes stage, colour, key, correctness, outcome, and reaction time where applicable.
- **Summary CSV:** one row per stage/colour with columns in plotting order: `stage`, `colour`, `average_ms`, `highest_ms`, `lowest_ms`, and `deviation_ms`. Stage 3 red has no reaction-time statistics because the correct response is no press.

Reaction-time feedback and the Results section remain hidden during testing to avoid influencing participants. When the study is complete, the page reveals a Chart.js graph comparing each stage's average reaction time and standard deviation.

This app was made for the Week 4 homework of module SCCM5410 at Lancaster University by Team One from the lab session (Grp-HCI-SCCM5410-Lab-P01/09)
