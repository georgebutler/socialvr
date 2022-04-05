import "./components/toolbox-button";
import "./components/barge";
import "./components/barge-button";

import { CreateBarge } from "./systems/barge";

const scene = document.querySelector("a-scene");
const [barge, bargeToolboxButton] = CreateBarge();

scene.appendChild(barge);
scene.appendChild(bargeToolboxButton);

console.log("[Social VR] Barge - Create Barge");

// window.startPhaseTesting = function() {
//   let phase = 1;
//   barge.emit("advancePhaseEvent");
//   console.log(`[Social VR] Barge - Current Phase: ${phase}`);
// };
