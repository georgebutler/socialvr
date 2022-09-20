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

// Utils
// import { sendLog } from "./utils";

/* 
function initSchemas() {
  const vectorRequiresUpdate = epsilon => {
    return () => {
      let prev = null;

      return curr => {
        if (prev === null) {
          prev = new THREE.Vector3(curr.x, curr.y, curr.z);
          return true;
        } else if (!NAF.utils.almostEqualVec3(prev, curr, epsilon)) {
          prev.copy(curr);
          return true;
        }

        return false;
      };
    };
  }

  // NAF Template
  const assets = document.querySelector("a-assets");
  const newTemplate = document.createElement("template");
  newTemplate.id = "sent-emoji";

  newTemplate.content.appendChild(document.createElement("a-entity"));
  assets.appendChild(newTemplate);

  // NAF Schema
  const schema = { ...NAF.schemas.schemaDict["#static-media"] }
  schema.template = "#sent-emoji";
  schema.components.push({ component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001) });
  schema.components.push({ component: "rotation", requiresNetworkUpdate: vectorRequiresUpdate(0.5) });
  schema.components.push({ component: "scale", requiresNetworkUpdate: vectorRequiresUpdate(0.001) });
  schema.components.push({ component: "billboard", property: "onlyY" });
  schema.components.push({ component: "particle-emitter" });
  NAF.schemas.add(schema);
}
*/

APP.scene.addEventListener("environment-scene-loaded", () => {
  //initSchemas();

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
    const button = document.createElement("a-entity");

    button.setAttribute("position", new THREE.Vector3(0, 0.65, 0));
    button.setAttribute("socialvr-barge-button", {
      text: "Start",
      radius: 0.1,
      color: 0xC576F6,
      phaseID: 1
    });

    window.APP.scene.appendChild(button);

    // World Mover
    const worldMover = document.createElement("a-entity");

    worldMover.setAttribute("socialvr-world-mover", {
      modelURL: "https://statuesque-rugelach-4185bd.netlify.app/assets/meeting-hall-4.glb"
    });

    window.APP.scene.appendChild(worldMover);
  }
  else {
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

/*
APP.scene.addEventListener("avatar_updated", (e) => {
  sendLog("avatarChange", { clientId: NAF.clientId, displayName: "unknown", playerSessionId: "unknown", avatar: "unknown" });
});

APP.scene.addEventListener("object_spawned", (e) => {
  sendLog("spaceMakingKit", { clientId: NAF.clientId, objectID: e.detail.objectType, timestamp: Date.now() });

  document.querySelectorAll("[floaty-object]").forEach((floaty) => {
    floaty.setAttribute("floaty-object", {
      reduceAngularFloat: true,
      autoLockOnRelease: true,
      gravitySpeedLimit: 0
    });
  });
});

document.body.addEventListener("clientConnected", (e) => {
  sendLog("joined", { clientId: NAF.clientId, joinedClientId: e.detail.clientId, joinedOrLeft: "joined" });
});

document.body.addEventListener("clientDisconnected", (e) => {
  sendLog("joined", { clientId: NAF.clientId, joinedClientId: e.detail.clientId, joinedOrLeft: "left" });
}); 
*/