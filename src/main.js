import "./components/speech";
// import "./components/toolbox-button";
// import "./components/barge";
// import "./components/barge-button";

import "./systems/speech";
// import "./systems/barge";
// import { CreateBarge } from "./systems/barge";

const scene = document.querySelector("a-scene");

const speech =  document.createElement("socialvr-speech");
scene.appendChild(speech);

// console.log("[Social VR] Barge - Create Barge");
// const [barge, bargeToolboxButton] = CreateBarge();
// scene.appendChild(barge);
// scene.appendChild(bargeToolboxButton);

// window.startPhaseTesting = function() {
//   let phase = 1;
//   barge.emit("advancePhaseEvent");
//   console.log(`[Social VR] Barge - Current Phase: ${phase}`);
// };
