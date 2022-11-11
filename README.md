# SocialVR
*This repo is currently not maintained*
Social VR is a code base that modifies a [Mozilla Hubs](https://hubs.mozilla.com/) room via [code injection](https://github.com/georgebutler/hubs/commit/f9ceaf3bf06596dc008489f2b2a7a802974a4fd6) in order to provide experimental tools for VR meetings. To learn more about the tools, go to the [Social Superpowers website](https://socialsuperpowers.net/).
## Injection methodology
Iteration cycles for custom Mozilla Hubs functionality can involve tedious modification of back-end code and redeployment. With code injection, a developer works on self contained scripts hosted on an external server that are loaded when a user joins a room. This method has several advantages:
- Faster iteration speed - external servers can redeploy faster than a Mozilla Hubs instance
- Interfaces agnostic to room environment - these external scripts can be injected into any room
- Improves collaboration - developers can contribute to the development without Mozilla Hubs expertise
## Code Overview
`rollup.config.js` - The project is a [Rollup](https://www.netlify.com/) project. Configuration for development is contained here.

`netlify.toml` - [Netlify](https://www.netlify.com/) was used for a development and production build pipeline
### `src`
`main.js` - Root entry point of the app. Determines whether it should be a [time barge]() or [toolbox]() and instantiates appropriate components

`util.js` - Collection of functions that are referenced across files such as logging or [NAF](https://github.com/networked-aframe/networked-aframe#documentation) schema modification 

`config.js - Configurations for avatar colors in conversation balance and time barge
### `src/components`
**Barge components**

`barge-button.js` - Base component for interactable button on barge

`barge-clock.js` - Displays users current time on barge (location defined on `main.js`)

`barge-data.js` - Generates and handles user behavioral data related to time management study

`barge-slot.js` -Geometry that contains a single point in order to determine block ranking by distance

`world-mover.js` - Generic component that loads a model and moves it through waypoints

**Toolbox components**

`emoji-target.js` - Permits entity to receive emojis

`speech.js` - Conversation Visualization tool

`toolbox-button.js` - (deprecated)

`toolbox-dashboard-button.js` - Base class for all toolbox buttons for toggling them ON/OFF

`toolbox-dashboard.js` - Instantiates toolbox features such as conversation visualization and emoji sending

### `src/systems` is deprecated
# Instructions
– creator of the room needs to add the script URL
Dashboard & selection

## Instructions
`npm run build` -> `production` is true

`npm run dev` -> `production` is false

`npm run build` builds the application to `build/production.js`, along with a sourcemap file for debugging.

`npm run dev` builds the application to `build/development.js`, along with a sourcemap file for debugging.

### Local Development
`npm run dev` starts server at localhost:3000

`ngrok http 3000` starts ngrok server at url in terminal output

injection url: `ngrok_terminal_output_url/development.js`

<br/>

## Components
Naming convention: Filenames should be concise and specific, i.e. "barge.js". The respective component name registered with A-Frame is "socialvr-filename", i.e. "socialvr-barge".

`toolbox-button`<br/>
Buttons located within the scene that allow participants to turn on/off specific features within the Social VR Toolbox.

`barge`<br/>
Feature within the Social VR Toolbox. A moving platform that takes participants on a set path through the environment aimed to promote better time management.

`barge-button`<br/>
Buttons on the barge that allow participants to pause, resume, or reset the barge motion.
