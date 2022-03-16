import "./components/toolbox-button";
import "./components/barge";
import "./components/barge-button";

import "./systems/barge";

const scene = document.querySelector("a-scene");
const environmentScene = document.querySelector("#environment-scene");

// Spoke environment loaded
environmentScene.addEventListener("model-loaded", ({ detail: { model } }) => {

  const [barge, bargeToolboxButton] = CreateBarge();
  scene.appendChild(barge);
  scene.appendChild(bargeToolboxButton);

  window.startPhaseTesting = function() {
    let phase = 1;
    barge.emit("advancePhaseEvent");
    console.log(`[Social VR] Barge - Current Phase: ${phase}`);
  };
});
