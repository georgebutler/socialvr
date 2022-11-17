// Barge
import "./components/barge-button";
import "./components/barge-clock";
import "./components/barge-slot";
import "./components/barge-data";
import "./components/world-mover";

// Emoji
import "./components/emoji-target";

// Speech
import "./components/speech";
import "./systems/speech";

// Toolbox
import "./components/toolbox-dashboard";
import "./components/toolbox-dashboard-button";

import { initSchemas, sendLog } from "./utils";
import { COLOR_OFF, SELECTOR_BARGE, SELECTOR_BARGE_WORKSHOP, SELECTOR_TUTORIAL } from "./config";

APP.scene.addEventListener("environment-scene-loaded", () => {
  initSchemas();

  if (document.querySelector(SELECTOR_BARGE)) {
    // Button
    let button = document.createElement("a-entity");
    let position = document.querySelector(".startButton").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

    button.setAttribute("socialvr-barge-button", "text: Start; radius: 0.3; color: #C576F6; phaseID: 1");
    button.setAttribute("position", position);
    APP.scene.appendChild(button);

    // Button
    button = document.createElement("a-entity");
    position = document.querySelector(".CompleteButton_phase1").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

    button.setAttribute("socialvr-barge-button", "text: Next Task; radius: 0.3; color: #C576F6; phaseID: 2");
    button.setAttribute("position", position);
    APP.scene.appendChild(button);

    // Button
    button = document.createElement("a-entity");
    position = document.querySelector(".CompleteButton_phase2").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

    button.setAttribute("socialvr-barge-button", "text: Next Task; radius: 0.3; color: #C576F6; phaseID: 3");
    button.setAttribute("position", position);
    APP.scene.appendChild(button);

    // Button
    button = document.createElement("a-entity");
    position = document.querySelector(".CompleteButton_phase3").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

    button.setAttribute("socialvr-barge-button", "text: Complete; radius: 0.3; color: #C576F6; phaseID: 4");
    button.setAttribute("position", position);
    APP.scene.appendChild(button);

    // Clock
    const clock = document.createElement("a-entity");
    clock.setAttribute("radius", 0.1);
    clock.setAttribute("socialvr-barge-clock", "");
    clock.setAttribute("position", document.querySelector(".clock-placeholder").object3D.position);
    APP.scene.appendChild(clock);

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
    APP.scene.appendChild(worldMover);

    // Data Logger
    const dataLogger = document.createElement("a-entity");
    dataLogger.setAttribute("socialvr-barge-data", "");
    APP.scene.appendChild(dataLogger);

    // Backup command
    window.logBargeData = () => {
      APP.scene.emit("generateDataEvent");
    }

    // Changes camera inspection system to show background, regardless of user preferences.
    APP.scene.systems["hubs-systems"].cameraSystem.lightsEnabled = true;
  }
  else if (document.querySelector(SELECTOR_BARGE_WORKSHOP)) {
    const button = document.createElement("a-entity");
    button.setAttribute("position", new THREE.Vector3(0, 0.65, 0));
    button.setAttribute("socialvr-barge-button", { text: "Start", radius: 0.1, color: COLOR_OFF, phaseID: 1 });
    APP.scene.appendChild(button);

    const worldMover = document.createElement("a-entity");
    worldMover.setAttribute("socialvr-world-mover", { modelURL: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/meeting-hall-6.glb" });
    APP.scene.appendChild(worldMover);
  }
  else if (document.querySelector(SELECTOR_TUTORIAL)) {
    const button = document.createElement("a-entity");
    button.setAttribute("position", document.querySelector(".flying-platform-button").object3D.position);
    button.setAttribute("socialvr-barge-button", { text: "Start", radius: 0.1, color: COLOR_OFF, phaseID: 1 });
    APP.scene.appendChild(button);

    const worldMover = document.createElement("a-entity");
    worldMover.setAttribute("socialvr-world-mover", { modelURL: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/hubstutorialenvironment11.15.glb" });
    APP.scene.appendChild(worldMover);
    
    const dashboard = document.createElement("a-entity");
    dashboard.setAttribute("socialvr-toolbox-dashboard", "");
    APP.scene.appendChild(dashboard);
  }
  else {
    const dashboard = document.createElement("a-entity");
    dashboard.setAttribute("socialvr-toolbox-dashboard", "");
    APP.scene.appendChild(dashboard);
  }
}, { once: true });

APP.scene.addEventListener("avatar_updated", (e) => {
  sendLog("avatarChange", { clientId: NAF.clientId, displayName: "unknown", playerSessionId: "unknown", avatar: "unknown" });
});

APP.scene.addEventListener("object_spawned", (e) => {
  sendLog("spaceMakingKit", { clientId: NAF.clientId, objectID: e.detail.objectType, timestamp: Date.now() });

  /*
  document.querySelectorAll("[floaty-object]").forEach((floaty) => {
    floaty.setAttribute("floaty-object", {
      unthrowable: true
    });
  });
  */
});

document.body.addEventListener("clientConnected", (e) => {
  const dashboard = document.querySelector('[socialvr-toolbox-dashboard=""]');

  if (dashboard && dashboard.components["socialvr-toolbox-dashboard"].features.EMOJI.enabled) {
    dashboard.components["socialvr-toolbox-dashboard"].initEmoji();
  }

  sendLog("joined", { clientId: NAF.clientId, clientName: APP.store.state.profile.displayName, joinedClientId: e.detail.clientId, joinedOrLeft: "joined" });
});

document.body.addEventListener("clientDisconnected", (e) => {
  sendLog("joined", { clientId: NAF.clientId, joinedClientId: e.detail.clientId, joinedOrLeft: "left" });
});