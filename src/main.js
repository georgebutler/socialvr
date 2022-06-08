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
