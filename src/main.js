import "./components/barge-button";
import "./components/barge-clock";
import "./components/barge-slot";
import "./components/barge-data";
import "./components/world-mover";
import "./components/halo";
import "./components/toolbox-dashboard";
import "./components/toolbox-dashboard-button";

import "./components/emoji";
import "./components/emoji-target";
import "./components/emoji-button";
import "./components/emoji-cancel-button";
import "./components/emoji-audio";

import "./systems/emoji-target";
import "./systems/emoji-button";

window.APP.scene.addEventListener("environment-scene-loaded", () => {
  const dashboard = document.createElement("a-entity");

  dashboard.setAttribute("socialvr-toolbox-dashboard", "");
  dashboard.setAttribute("position", new THREE.Vector3(0, 1.2, 0));
  window.APP.scene.appendChild(dashboard);

  // Backup command
  window.logBargeData = () => {
    window.APP.scene.emit("generateDataEvent");
  }

  // Changes camera inspection system to show background, regardless of user preferences.
  const cameraSystem = window.APP.scene.systems["hubs-systems"].cameraSystem;
  cameraSystem.lightsEnabled = true;
}, { once: true });

window.APP.scene.addEventListener("object_spawned", (e) => {
  const floaties = document.querySelectorAll("[floaty-object]");

  floaties.forEach((floaty) => {
    floaty.setAttribute("floaty-object", {
      reduceAngularFloat: true,
      autoLockOnRelease: true,
      gravitySpeedLimit: 0
    });
  });
});