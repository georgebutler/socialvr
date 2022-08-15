import "./components/barge-button";
import "./components/barge-clock";
import "./components/barge-slot";
import "./components/barge-data";
import "./components/world-mover";
import "./components/halo";
import "./components/eye-laser";

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

  window.APP.hubChannel.presence.onJoin(() => {
    if (dashboard.components["socialvr-toolbox-dashboard"].features.EMOJI.enabled) {
      dashboard.components["socialvr-toolbox-dashboard"].initEmoji();
    }

    if (dashboard.components["socialvr-toolbox-dashboard"].features.HALO.enabled) {
      dashboard.components["socialvr-toolbox-dashboard"].initHalos();
    }

    // Eye laser
    APP.componentRegistry["player-info"].forEach((playerInfo) => {
      /*       
        if (!playerInfo.socialVREyeLaser) {
          const laser = document.createElement("a-entity");
          laser.setAttribute("socialvr-eye-laser", "");
          laser.setAttribute("position", "0 1.75 0");
  
          playerInfo.el.appendChild(laser);
          playerInfo.socialVREyeLaser = true;
        } 
      */
    });
  });

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