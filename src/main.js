import "./components/barge-button";
import "./components/world-mover";

const scene = document.querySelector("a-scene");

scene.addEventListener("environment-scene-loaded", () => {
  // Button
  let button = document.createElement("a-entity");
  let position = document.querySelector(".startButton").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0))

  button.setAttribute("socialvr-barge-button", "text: Start; radius: 0.3; color: #C576F6; phaseID: 1");
  button.setAttribute("position", position);
  scene.appendChild(button);

  // Button
  button = document.createElement("a-entity");
  position = document.querySelector(".CompleteButton_phase3").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0))

  button.setAttribute("socialvr-barge-button", "text: Complete; radius: 0.3; color: #C576F6; phaseID: 2");
  button.setAttribute("position", position);
  scene.appendChild(button);

  // Frames
  const frameKnowledge = document.querySelector(".knowledgeFrame_phase1");

  for (let index = 1; index <= 3; index++) {
    const slot = document.createElement("a-box");

    slot.setAttribute("position", { x: 0, y: -1 + (0.4 * index), z: 0 });
    slot.setAttribute("material", { color: "#FF0000", transparent: true, opacity: 0.5 });
    slot.setAttribute("width", 2);
    slot.setAttribute("height", 0.25);
    slot.setAttribute("ksa-type", "knowledge");
    slot.setAttribute("ksa-ranking", 4 - index);
    frameKnowledge.appendChild(slot); 
  }

  const frameAbilities = document.querySelector(".KSA_ranking_frameglb_1_phase1");

  for (let index = 1; index <= 3; index++) {
    const slot = document.createElement("a-box");

    slot.setAttribute("position", { x: 0, y: -1 + (0.4 * index), z: 0 });
    slot.setAttribute("material", { color: "#FF0000", transparent: true, opacity: 0.5 });
    slot.setAttribute("width", 2);
    slot.setAttribute("height", 0.25);
    slot.setAttribute("ksa-type", "abilities");
    slot.setAttribute("ksa-ranking", 4 - index);
    frameAbilities.appendChild(slot); 
  }

  const frameSkills = document.querySelector(".KSA_ranking_frameglb_phase1");

  for (let index = 1; index <= 3; index++) {
    const slot = document.createElement("a-box");

    slot.setAttribute("position", { x: 0, y: -1 + (0.4 * index), z: 0 });
    slot.setAttribute("material", { color: "#FF0000", transparent: true, opacity: 0.5 });
    slot.setAttribute("width", 2);
    slot.setAttribute("height", 0.25);
    slot.setAttribute("ksa-type", "skills");
    slot.setAttribute("ksa-ranking", 4 - index);
    frameSkills.appendChild(slot); 
  }

  // Canidate Frame
  const frameCanidate = document.querySelector(".candidate_frameglb_phase3");
  const slot = document.createElement("a-box");

  // slot.setAttribute("position", { x: 0, y: -1 + (0.4 * index), z: 0 });
  slot.setAttribute("material", { color: "#FF0000", transparent: true, opacity: 0.5 });
  slot.setAttribute("width", 0.5);
  slot.setAttribute("height", 1);
  slot.setAttribute("depth", 1);
  slot.setAttribute("canidate-frame", "");
  frameCanidate.appendChild(slot); 

  // World Mover
  const worldMover = document.createElement("a-entity");
  worldMover.setAttribute("socialvr-world-mover", "");
  scene.appendChild(worldMover);

  // Changes camera inspection system to show background, regardless of user preferences.
  const cameraSystem = scene.systems["hubs-systems"].cameraSystem;
  cameraSystem.lightsEnabled = true;

  // Disable floaty physics
  scene.addEventListener("object_spawned", (e) => {
    const floaties = document.querySelectorAll('[floaty-object=""]');

    floaties.forEach((floaty) => {
      floaty.setAttribute("floaty-object", { reduceAngularFloat: true, releaseGravity: -1 });
    });
  });
}, { once: true })
