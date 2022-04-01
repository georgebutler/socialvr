# SocialVR

## Instructions
`npm run build` -> `production` is true

`npm run dev` -> `production` is false

`npm run build` builds the application to `build/production.js`, along with a sourcemap file for debugging.

`npm run dev` builds the application to `build/development.js`, along with a sourcemap file for debugging.

<br/>

## Components
Naming convention: Filenames should be concise and specific, i.e. "barge.js". The respective component name registered with A-Frame is "socialvr-filename", i.e. "socialvr-barge".

`toolbox-button`<br/>
Buttons located within the scene that allow participants to turn on/off specific features within the Social VR Toolbox.

`barge`<br/>
Feature within the Social VR Toolbox. A moving platform that takes participants on a set path through the environment aimed to promote better time management.

`barge-button`<br/>
Buttons on the barge that allow participants to pause, resume, or reset the barge motion.