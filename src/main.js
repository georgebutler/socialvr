import "./components/barge-button";
import "./components/barge-clock";
import "./components/barge-slot";
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

  // Clock
  const clock = document.createElement("a-entity");
  clock.setAttribute("radius", 0.1);
  clock.setAttribute("socialvr-barge-clock", "");
  clock.setAttribute("position", document.querySelector(".clock-placeholder").object3D.position);
  scene.appendChild(clock);

  // Ranking Slots
  for (let index = 1; index <= 3; index++) {
    const slot = document.createElement("a-entity");
    slot.setAttribute("position", { x: 0, y: -1 + (0.4 * index), z: 0 });
    slot.setAttribute("socialvr-barge-slot", `type: knowledge; rank: ${4 - index}`);
    document.querySelector(".knowledgeFrame_phase1").appendChild(slot); 
  }

  for (let index = 1; index <= 3; index++) {
    const slot = document.createElement("a-entity");
    slot.setAttribute("position", { x: 0, y: -1 + (0.4 * index), z: 0 });
    slot.setAttribute("socialvr-barge-slot", `type: abilities; rank: ${4 - index}`);
    document.querySelector(".KSA_ranking_frameglb_1_phase1").appendChild(slot); 
  }

  for (let index = 1; index <= 3; index++) {
    const slot = document.createElement("a-entity");
    slot.setAttribute("position", { x: 0, y: -1 + (0.4 * index), z: 0 });
    slot.setAttribute("socialvr-barge-slot", `type: skills; rank: ${4 - index}`);
    document.querySelector(".KSA_ranking_frameglb_phase1").appendChild(slot); 
  }

  // Canidate Slot
  const slot = document.createElement("a-entity");
  slot.setAttribute("socialvr-barge-slot", `type: canidate; rank: 1; width: 0.5; height: 1; depth: 1;`);
  document.querySelector(".candidate_frameglb_phase3").appendChild(slot); 

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
