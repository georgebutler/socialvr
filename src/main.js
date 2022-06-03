import "./components/barge-button";
import "./components/world-mover";

const scene = document.querySelector("a-scene");

scene.addEventListener("environment-scene-loaded", () => {
  // Phases

  // Button - Phase 1
  let button = document.createElement("a-entity");
  let position = document.querySelector(".startButton").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0))

  button.setAttribute("socialvr-barge-button", "text: Start; radius: 0.3; color: #C576F6; phaseID: 1");
  button.setAttribute("position", position);
  scene.appendChild(button);

  // Button - Phase 2
  button = document.createElement("a-entity");
  position = document.querySelector(".phase1CompleteButton_phase1").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0))

  button.classList.add("phase1");
  button.setAttribute("socialvr-barge-button", "text: Done; radius: 0.3; color: #C576F6; phaseID: 2");
  button.setAttribute("position", position);
  scene.appendChild(button);

  // Button - Phase 3
  button = document.createElement("a-entity");
  position = document.querySelector(".phase2CompleteButton_phase2").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0))

  button.classList.add("phase2");
  button.setAttribute("socialvr-barge-button", "text: Done; radius: 0.3; color: #C576F6; phaseID: 3");
  button.setAttribute("position", position);
  scene.appendChild(button);

  // Button - Phase 4
  button = document.createElement("a-entity");
  position = document.querySelector(".phase3CompleteButton_phase3").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0))

  button.classList.add("phase3");
  button.setAttribute("socialvr-barge-button", "text: Complete; radius: 0.3; color: #C576F6; phaseID: 4");
  button.setAttribute("position", position);
  scene.appendChild(button);

  // World Mover
  const worldMover = document.createElement("a-entity");
  worldMover.setAttribute("socialvr-world-mover", "");
  scene.appendChild(worldMover);

  window.APP.utils.GLTFModelPlus
    .loadModel("https://statuesque-rugelach-4185bd.netlify.app/assets/moving-world.glb")
    .then((model) => {
      worldMover.setObject3D("mesh", window.APP.utils.threeUtils.cloneObject3D(model.scene, true));
      worldMover.setAttribute("matrix-auto-update", "");
    })
    .catch((e) => {
      console.error(e);
    });
}, { once: true })
