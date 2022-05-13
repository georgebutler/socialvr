// import "./components/toolbox-button";

// const scene = document.querySelector("a-scene");

// ///////////
// // BARGE //
// ///////////

// import "./components/barge";
// import "./components/barge-button";
// import "./systems/barge";
// import { CreateBarge } from "./systems/barge";

// const [barge, bargeToolboxButton] = CreateBarge();
// scene.appendChild(barge);
// scene.appendChild(bargeToolboxButton);

// window.startPhaseTesting = function() {
//   let phase = 1;
//   barge.emit("advancePhaseEvent");
//   console.log(`[Social VR] Barge - Current Phase: ${phase}`);
// };

// /////////////
// // SPEECH  //
// /////////////

// import "./components/speech";
// import "./systems/speech";
// import { CreateSpeech } from "./systems/speech";

// const [speechVisEl, speechToolboxButton] = CreateSpeech();
// scene.appendChild(speechVisEl);
// scene.appendChild(speechToolboxButton);

import "./components/emoji-target";
import "./components/emoji-button";
import "./hubs/emoji";

const scene = document.querySelector("a-scene");

const dummy = document.createElement("a-box");
dummy.setAttribute("socialvr-emoji-target", "");
scene.appendChild(dummy);
