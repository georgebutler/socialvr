# SocialVR

## Instructions
`npm run build` -> `production` is true

`npm run dev` -> `production` is false

`npm run build` builds the application to `build/production.js`, along with a sourcemap file for debugging.

`npm run dev` builds the application to `build/development.js`, along with a sourcemap file for debugging.

### Local Development
NOTE: not working currently due to CSP issue, use netlify url instead

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

`emoji`<br/>
The emoji object that gets sent. Contains logic on the parabolic path. Responsible for broadcasting audio event, and which sound is played.

`emoji-target`<br/>
The avatar that can receive emojis. Contains hover state visualization. Responsible for creating the HUD for selecting default or custom emojis. The corresponding system contains logic for displaying hover state, and having different HUD styles for VR and desktop.

`emoji-button`<br/>
The HUD emoji button for selecting emojis. The corresponding system facilitates removing all buttons once the HUD is removed.

`emoji-cancel-button`<br/>
The HUD cancel button for removing the HUD.

`emoji-audio`<br/>
Listens for emoji audio NAF events and plays sound for the recipient.
