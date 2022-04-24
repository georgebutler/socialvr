import "./components/toolbox-button";
import "./components/barge";
import "./components/barge-button";

import "./systems/barge";
import { CreateBarge } from "./systems/barge";

const scene = document.querySelector("a-scene");

scene.addEventListener("environment-scene-loaded", () => {
  const [barge, bargeToolboxButton] = CreateBarge();
  scene.appendChild(barge);
  scene.appendChild(bargeToolboxButton);

  console.log("[Social VR] Barge - Create Barge");

  // Changes camera inspection system to show background, regardless of user preferences.
  const cameraSystem = scene.systems["hubs-systems"].cameraSystem;
  cameraSystem.lightsEnabled = true;

  // Floaty gravity change.
  function disableFloatyPhysics() {
    const floaties = document.querySelectorAll('[floaty-object=""]');

    floaties.forEach((floaty) => {
      floaty.setAttribute("floaty-object", { reduceAngularFloat: true, releaseGravity: -1 });
    });
  }

  scene.addEventListener("object_spawned", (e) => {
    disableFloatyPhysics();
  });

  // Phase testing commands
  window.startPhaseTesting = function () {
    let phase = 1;

    barge.emit("advancePhaseEvent");
    console.log(`[Social VR] Barge - Current Phase: ${phase}`);
  };

  disableFloatyPhysics()
})
