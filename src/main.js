///////////
// BARGE //
///////////

// import "./components/toolbox-button";
// import "./components/barge";
// import "./components/barge-button";

// import "./systems/barge";
// import { CreateBarge } from "./systems/barge";

// console.log("[Social VR] Barge - Create Barge");
// const [barge, bargeToolboxButton] = CreateBarge();
// scene.appendChild(barge);
// scene.appendChild(bargeToolboxButton);

// window.startPhaseTesting = function() {
//   let phase = 1;
//   barge.emit("advancePhaseEvent");
//   console.log(`[Social VR] Barge - Current Phase: ${phase}`);
// };


////////////////////////////////////
// SPEECH entity-component-system //
////////////////////////////////////

import "./components/speech";

const scene = document.querySelector("a-scene");

const speechVisEl = document.createElement("a-cylinder");
speechVisEl.setAttribute("color", "blue");
speechVisEl.setAttribute("height", "0.2");
speechVisEl.setAttribute("radius", "1");
speechVisEl.setAttribute("position", {
  x: 5,
  y: 1,
  z: 0
});
speechVisEl.setAttribute("socialvr-speech", "")

scene.appendChild(speechVisEl);
