import "./components/barge-button";
import "./components/barge-clock";
import "./components/barge-slot";
import "./components/barge-data";

//import "./components/halo";
import "./components/world-mover";
//import "./components/eye-laser";

import "./components/emoji";
import "./components/emoji-target";
import "./components/emoji-button";
import "./components/emoji-cancel-button";
import "./components/emoji-audio";

import "./systems/emoji-target";
import "./systems/emoji-button";

import "./components/speech";
import "./systems/speech";

import "./components/toolbox-dashboard";
import "./components/toolbox-dashboard-button";

APP.scene.addEventListener("environment-scene-loaded", () => {
  if (document.querySelector(".barge")) {
    // Button
    let button = document.createElement("a-entity");
    let position = document.querySelector(".startButton").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

    button.setAttribute("socialvr-barge-button", "text: Start; radius: 0.3; color: #C576F6; phaseID: 1");
    button.setAttribute("position", position);
    window.APP.scene.appendChild(button);

    // Button
    button = document.createElement("a-entity");
    position = document.querySelector(".CompleteButton_phase1").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

    button.setAttribute("socialvr-barge-button", "text: Next Task; radius: 0.3; color: #C576F6; phaseID: 2");
    button.setAttribute("position", position);
    window.APP.scene.appendChild(button);

    // Button
    button = document.createElement("a-entity");
    position = document.querySelector(".CompleteButton_phase2").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

    button.setAttribute("socialvr-barge-button", "text: Next Task; radius: 0.3; color: #C576F6; phaseID: 3");
    button.setAttribute("position", position);
    window.APP.scene.appendChild(button);

    // Button
    button = document.createElement("a-entity");
    position = document.querySelector(".CompleteButton_phase3").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

    button.setAttribute("socialvr-barge-button", "text: Complete; radius: 0.3; color: #C576F6; phaseID: 4");
    button.setAttribute("position", position);
    window.APP.scene.appendChild(button);

    // Clock
    const clock = document.createElement("a-entity");
    clock.setAttribute("radius", 0.1);
    clock.setAttribute("socialvr-barge-clock", "");
    clock.setAttribute("position", document.querySelector(".clock-placeholder").object3D.position);
    window.APP.scene.appendChild(clock);

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
    worldMover.setAttribute("socialvr-world-mover", "overrideSky: true");
    window.APP.scene.appendChild(worldMover);

    // Data Logger
    const dataLogger = document.createElement("a-entity");
    dataLogger.setAttribute("socialvr-barge-data", "");
    window.APP.scene.appendChild(dataLogger);

    // Backup command
    window.logBargeData = () => {
      window.APP.scene.emit("generateDataEvent");
    }

    // Changes camera inspection system to show background, regardless of user preferences.
    window.APP.scene.systems["hubs-systems"].cameraSystem.lightsEnabled = true;
  }
  else if (document.querySelector(".workshopbargeglb")) {
    // Button
    let button = document.createElement("a-entity");
    let position = new THREE.Vector3(0, 0.65, 0);

    button.setAttribute("socialvr-barge-button", "text: Start; radius: 0.1; color: #C576F6; eventName: startMovingWorld");
    button.setAttribute("position", position);
    window.APP.scene.appendChild(button);

    // World Mover
    const worldMover = document.createElement("a-entity");
    worldMover.setAttribute("socialvr-world-mover", "modelURL: https://statuesque-rugelach-4185bd.netlify.app/assets/meeting-hall-1.glb");
    window.APP.scene.appendChild(worldMover);
  } 
  else {
    // Dashboard
    const dashboard = document.createElement("a-entity");

    dashboard.setAttribute("socialvr-toolbox-dashboard", "");
    APP.scene.appendChild(dashboard);

    APP.hubChannel.presence.onJoin(() => {
      if (dashboard.components["socialvr-toolbox-dashboard"].features.EMOJI.enabled) {
        dashboard.components["socialvr-toolbox-dashboard"].initEmoji();
      }

      if (dashboard.components["socialvr-toolbox-dashboard"].features.HALO.enabled) {
        dashboard.components["socialvr-toolbox-dashboard"].initHalos();
      }
    });
  }
}, { once: true });

APP.scene.addEventListener("object_spawned", (e) => {
  const floaties = document.querySelectorAll("[floaty-object]");

  floaties.forEach((floaty) => {
    floaty.setAttribute("floaty-object", {
      reduceAngularFloat: true,
      autoLockOnRelease: true,
      gravitySpeedLimit: 0
    });
  });
});