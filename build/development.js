(function () {
  'use strict';

  // button for turning specified social VR systems on and off

  AFRAME.registerComponent("socailvr-toolbox-button", {
    dependencies: ["is-remote-hover-target", "hoverable-visuals"],

    schema: {type: "string", default: "barge"},

    init: function() {
      // TODO: auto position toolbox button based on existing buttons

      // TODO: custom apearances
      this.el.setAttribute("geometry", "primitive:sphere; radius:0.3");
      this.el.setAttribute("material", "color: pink");
      this.el.setAttribute("tags", "singleActionButton:true");
      this.el.setAttribute("css-class", "interactable");

      // button text
      const textEl = document.createElement("a-entity");
      textEl.setAttribute("text", `value: ${this.data.toUpperCase()}; align: center; color: black`);
      textEl.setAttribute("rotation", "0 90 0");
      textEl.setAttribute("position", "0 0.4 0");
      this.el.appendChild(textEl);

      this.onClick = this.onClick.bind(this);
      this.el.object3D.addEventListener("interact", this.onClick);

      NAF.connection.subscribeToDataChannel("buttonClicked", this.handleClick.bind(this));
    },

    remove: function() {
      this.el.object3D.removeEventListener("interact", this.onClick);
      NAF.connection.unsubscribeToDataChannel("buttonClicked");
    },

    onClick: function() {
      this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
        11,
        this.el.object3D
      );

      this.handleClick();
      NAF.connection.broadcastData("buttonClicked", {});
    },

    handleClick(senderId, dataType, data, targetId) {
      const tool = this.el.sceneEl.systems[`socialvr-${this.data.toLowerCase()}`].tool;

      if (tool.getAttribute("visible")) {
        // REMOVE

        // handle reset events
        tool.emit("resetBargeEvent");
        tool.emit("clearSpeechEvent");

        tool.setAttribute("visible", false);
        tool.pause();
      } else {
        // CREATE
        tool.setAttribute("visible", true);
        tool.play();
      }
    }
  });

  // responsible for barge children creation and movement

  const modelURL = "https://statuesque-rugelach-4185bd.netlify.app/assets/barge_testing.glb";

  let positions = [];
  let lastKeyChange = 0;

  AFRAME.registerComponent("socialvr-barge", {
    schema: {
      speed: { type: "number", default: 1 },
      moving: { type: "boolean", default: false },
      targetKey: { type: "number", default: 0 }
    },

    init() {
      this.direction = new window.APP.utils.THREE.Vector3();
      this.bbox = new window.APP.utils.THREE.Box3();

      // Load model
      window.APP.utils.GLTFModelPlus.loadModel(modelURL)
      .then(model => {
        console.log(`[Social VR] Barge System - Mesh Loaded`);
        const mesh = window.APP.utils.threeUtils.cloneObject3D(model.scene);

        this.el.setObject3D("mesh", mesh);
        this.el.object3D.scale.set(0.6, 0.6, 0.6);
        this.el.object3D.matrixNeedsUpdate = true;

        this.bbox.setFromObject(this.el.getObject3D("mesh"), false);

        // DEBUG
        this.debugHelper = new window.APP.utils.THREE.BoxHelper(this.el.getObject3D("mesh"), 0xffff00);
        this.el.sceneEl.object3D.add(this.debugHelper);
      }).catch((e) => {
        console.error(`[Social VR] Barge System - ${e}`);
      });

      // Reset Button
      const buttonResetEl = document.createElement("a-sphere");
      buttonResetEl.setAttribute("socialvr-barge-button", "reset");
      buttonResetEl.setAttribute("radius", "0.15");
      buttonResetEl.setAttribute("material", "color: #3B56DC");
      buttonResetEl.setAttribute("tags", "singleActionButton: true");
      buttonResetEl.setAttribute("css-class", "interactable");
      buttonResetEl.setAttribute("position", {
        x: this.el.object3D.position.x + (2 - 0.2),
        y: this.el.object3D.position.y + 1,
        z: this.el.object3D.position.z
      });
      this.el.appendChild(buttonResetEl);

      // Start Button
      const buttonGoEl = document.createElement("a-sphere");
      buttonGoEl.setAttribute("socialvr-barge-button", "start");
      buttonGoEl.setAttribute("radius", "0.15");
      buttonGoEl.setAttribute("material", "color: #32CD32");
      buttonGoEl.setAttribute("tags", "singleActionButton: true");
      buttonGoEl.setAttribute("css-class", "interactable");
      buttonGoEl.setAttribute("position", {
        x: this.el.object3D.position.x + (2 - 0.2),
        y: this.el.object3D.position.y + 1,
        z: this.el.object3D.position.z + 1 // Right
      });
      this.el.appendChild(buttonGoEl);

      // Stop Button
      const buttonStopEl = document.createElement("a-sphere");
      buttonStopEl.setAttribute("socialvr-barge-button", "stop");
      buttonStopEl.setAttribute("radius", "0.15");
      buttonStopEl.setAttribute("material", "color: #FF0000");
      buttonStopEl.setAttribute("tags", "singleActionButton: true");
      buttonStopEl.setAttribute("css-class", "interactable");
      buttonStopEl.setAttribute("position", {
        x: this.el.object3D.position.x + (2 - 0.2),
        y: this.el.object3D.position.y + 1,
        z: this.el.object3D.position.z - 1 // Left
      });
      this.el.appendChild(buttonStopEl);

      const bargeSpawn = document.querySelector(".BargeSpawn");

      if (bargeSpawn) {
        this.el.setAttribute("position", bargeSpawn.getAttribute("position"));
      }

      // Client
      this.el.addEventListener("startBargeEvent", this.startBarge.bind(this));
      this.el.addEventListener("stopBargeEvent", this.stopBarge.bind(this));
      this.el.addEventListener("resetBargeEvent", this.resetBarge.bind(this));

      // Broadcast Event
      NAF.connection.subscribeToDataChannel("startBarge", this._startBarge.bind(this));
      NAF.connection.subscribeToDataChannel("stopBarge", this._stopBarge.bind(this));
      NAF.connection.subscribeToDataChannel("resetBarge", this._resetBarge.bind(this));

      this.system.register(this.el);
    },

    remove() {
      this.el.removeEventListener("startBargeEvent", this.startBarge.bind(this));
      this.el.removeEventListener("stopBargeEvent", this.stopBarge.bind(this));
      this.el.removeEventListener("resetBargeEvent", this.resetBarge.bind(this));

      NAF.connection.unsubscribeToDataChannel("startBarge");
      NAF.connection.unsubscribeToDataChannel("stopBarge");
      NAF.connection.unsubscribeToDataChannel("resetBarge");

      this.el.removeObject3D("mesh");
      this.system.unregister();
    },

    tick(t, dt) {
      // TODO: more elegant solution?
      if (this.el.getAttribute("visible")) {
        this.el.play();
      } else {
        this.el.pause();
      }

      const position = this.el.object3D.position;
      const avatar = window.APP.componentRegistry["player-info"][0];
      const avposition = avatar.el.getAttribute("position");
      const characterController = this.el.sceneEl.systems["hubs-systems"].characterController;

      if (this.data.moving) {
        const targetPosition = positions[this.data.targetKey];
        const direction = this.direction;

        if (!targetPosition) {
          this.data.moving = false;
          return;
        }

        direction.copy(targetPosition).sub(position);

        if (position.distanceToSquared(targetPosition) >= 1) {
          const factor = this.data.speed / direction.length();

          // Barge movement
          ["x", "y", "z"].forEach(function(axis) {
            direction[axis] *= factor * (dt / 1000);
          });

          // Bounding box movement
          this.bbox.translate(direction);

          // DEBUG movement
          this.debugHelper.update();

          // Mesh movement
          this.el.setAttribute("position", {
            x: position.x + direction.x,
            y: position.y + direction.y,
            z: position.z + direction.z
          });

          // Avatar Movement
          if (this.bbox.containsPoint(avposition)) {
            characterController.fly = true;

            avatar.el.setAttribute("position", {
              x: avposition.x + direction.x,
              y: position.y - 2 / 2 + window.APP.utils.getCurrentPlayerHeight() / 2,
              z: avposition.z + direction.z
            });
          }

          // Floaty Movement
          const floaties = document.querySelectorAll('[floaty-object=""]');

          floaties.forEach((floaty) => {
            if (this.bbox.containsPoint(floaty.object3D.position)) {
              const x = floaty.object3D.position.x;
              const y = floaty.object3D.position.y;
              const z = floaty.object3D.position.z;

              floaty.object3D.position.set(x + direction.x, y - direction.y, z + direction.z);
            }
          });

          // Interactable Movement
          const interactables = document.querySelectorAll('[interactable=""]');

          interactables.forEach((interactable) => {
            if (this.bbox.containsPoint(interactable.object3D.position)) {
              const x = interactable.object3D.position.x;
              const y = interactable.object3D.position.y;
              const z = interactable.object3D.position.z;

              interactable.object3D.position.set(x + direction.x, y - direction.y, z + direction.z);
            }
          });
        } else {
          // Avatar floor height check
          if (this.bbox.containsPoint(avposition)) {
            avatar.el.setAttribute("position", {
              x: avposition.x,
              y: position.y - 2 / 2 + window.APP.utils.getCurrentPlayerHeight() / 2,
              z: avposition.z
            });
          }

          // NaN check
          if (isNaN(lastKeyChange) || t >= lastKeyChange) {
            lastKeyChange = t + 100;
            this.data.targetKey = this.data.targetKey + 1;
          }

          // console.log(t);
          // console.log(this.data.targetKey);
        }
      }
    },

    // eslint-disable-next-line no-unused-vars
    _startBarge(senderId, dataType, data, targetId) {
      positions = [];

      for (let i = 1; i < 100; i++) {
        const wp = document.querySelector(".Waypoint_" + i);

        if (wp) {
          positions.push(wp.object3D.position);
        }
      }

      if (positions.length >= 1) {
        console.log(`Registered ${positions.length} waypoints for the barge.`);
      } else {
        console.warn("No waypoints found!");
        console.warn("Registering some default waypoints for the barge.");

        positions.push(new window.APP.utils.THREE.Vector3(10, 0, 0));
        positions.push(new window.APP.utils.THREE.Vector3(10, 0, 20));
        positions.push(new window.APP.utils.THREE.Vector3(-10, 10, 20));
        positions.push(new window.APP.utils.THREE.Vector3(-10, 20, 30));
      }

      console.log(positions);
      this.data.moving = true;
    },

    // eslint-disable-next-line no-unused-vars
    _stopBarge(senderId, dataType, data, targetId) {
      this.data.moving = false;
    },

    // eslint-disable-next-line no-unused-vars
    _resetBarge(senderId, dataType, data, targetId) {
      this.data.targetKey = 0;
      this.data.moving = false;
      this.el.setAttribute("position", new window.APP.utils.THREE.Vector3(0, 0, 0));

      const avatar = window.APP.componentRegistry["player-info"][0];
      const characterController = this.el.sceneEl.systems["hubs-systems"].characterController;

      if (this.bbox.containsPoint(avatar.el.getAttribute("position"))) {
        avatar.el.setAttribute("position", new window.APP.utils.THREE.Vector3(0, 0, 0));
      }

      // Reset flight
      characterController.fly = false;

      // DEBUG movement
      this.debugHelper.update();
    },

    startBarge() {
      this._startBarge(null, null, {});
      NAF.connection.broadcastData("startBarge", {});
    },

    stopBarge() {
      this._stopBarge(null, null, {});
      NAF.connection.broadcastData("stopBarge", {});
    },

    resetBarge() {
      this._resetBarge(null, null, {});
      NAF.connection.broadcastData("resetBarge", {});
    }
  });

  //import "./systems/sound-effects-system";

  AFRAME.registerComponent("socialvr-barge-button", {
    dependencies: ["is-remote-hover-target", "hoverable-visuals"],
    
    // start, stop, reset
    schema: {type: "string", default: "start"},

    init: function() {
      // button text
      const textEl = document.createElement("a-entity");
      textEl.setAttribute("text", `value: ${this.data.toUpperCase()}; align: center;`);
      textEl.setAttribute("rotation", "0 270 0");
      textEl.setAttribute("position", "0 0.2 0");
      this.el.appendChild(textEl);
      
      this.onClick = this.onClick.bind(this);
      this.el.object3D.addEventListener("interact", this.onClick);
    },

    remove: function() {
      this.el.object3D.removeEventListener("interact", this.onClick);
    },

    onClick: function() {
      this.el.emit(`${this.data}BargeEvent`);
      this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
        11,
        this.el.object3D
      );
    }
  });

  // responsible for barge creation and advancing phase

  AFRAME.registerSystem("socialvr-barge", {
    init: function() {
      console.log("[Social VR] Barge System - Initialized");
      this.tool = null;
    },

    register: function(el) {
      if (this.tool != null) {
        this.el.removeChild(this.tool);
      }
      
      console.log("[Social VR] Barge Component - Registered");
      this.tool = el;
    },

    unregister: function() {
      this.tool = null;
    },
  });

  function CreateBarge() {
    // Barge: invisible, paused
    const barge =  document.createElement("a-entity");
    barge.setAttribute("socialvr-barge", "");
    barge.setAttribute("visible", false);
    
    // toolbox button
    const bargeToolboxButton = document.createElement("a-entity");
    bargeToolboxButton.setAttribute("socailvr-toolbox-button", "barge");
    bargeToolboxButton.setAttribute("position", { x: 0, y: 2, z: 0 });
    
    // hide phase 1 objects
    TogglePhase1(false);

    // Client
    barge.addEventListener("advancePhaseEvent", function() {
      TogglePhase1(true);
      NAF.connection.broadcastData("advancePhase", {});
    });
    // Broadcast Event
    NAF.connection.subscribeToDataChannel("advancePhase", TogglePhase1(true));  // TODO: arrow function?

    return [barge, bargeToolboxButton];
  }

  // toggle: true/false
  function TogglePhase1(toggle) {
    
    // TODO: add phase index parameter

    console.log("[Social VR] Barge - Phase Initialized");

    const phase1 = document.querySelector(".phase-1");

    if (phase1) {
      console.log("[Social VR] Barge - Phase 1 Found");

      phase1.children.forEach(child => {
        child.setAttribute("visible", toggle);
      });
    } else {
      console.warn("[Social VR] Barge - Phase 1 Not Found");
    }
  }

  const MIC_PRESENCE_VOLUME_THRESHOLD = 0.00001;

  const SPEECH_TIME_PER_TICK = 10; // every speech tick = 10ms of realtime
  const MIN_SPEECH_TIME_FOR_EVENT = 100; // 0.1s realtime
  const MAX_SPEECH_TIME_FOR_EVENT = 5000; // 5s realtime
  const CONTINUOUS_SPEECH_LENIENCY_TIME = 100; // 0.1s realtime

  const ORB_CONTAINER_POS = [0, 0, 0]; // [7,0,2]

  const MIN_ORB_SIZE = 0.05;
  const MAX_ORB_SIZE = 0.9;
  const SPEECH_ORB_LIFETIME = 1000 * 60 * 5; // 5mins realtime
  const ORB_GROWTH_PER_TICK = (MAX_ORB_SIZE - MIN_ORB_SIZE) / ((MAX_SPEECH_TIME_FOR_EVENT - MIN_SPEECH_TIME_FOR_EVENT) / SPEECH_TIME_PER_TICK);

  AFRAME.registerComponent("socialvr-speech", {
    init() {
      this.localAudioAnalyser = this.el.sceneEl.systems["local-audio-analyser"];
      this.playerInfo = APP.componentRegistry["player-info"][0];

      this.activeSpeechOrbs = {};
      this.continuousSpeechTime = 0;
      this.continuousSpeechLeniencyTime = 0;

      // Client
      this.el.addEventListener("clearSpeechEvent", this.clearSpeech.bind(this));

      // Broadcast Event
      NAF.connection.subscribeToDataChannel("startSpeech", this._startSpeech.bind(this));
      NAF.connection.subscribeToDataChannel("stopSpeech", this._stopSpeech.bind(this));
      NAF.connection.subscribeToDataChannel("clearSpeech", this._clearSpeech.bind(this));

      console.log("[Social VR] Speech System - Initialized");
      this.system.register(this.el);
    },

    remove() {
      this.el.removeEventListener("clearSpeechEvent", this.clearSpeech.bind(this));

      NAF.connection.unsubscribeToDataChannel("startSpeech");
      NAF.connection.unsubscribeToDataChannel("stopSpeech");
      NAF.connection.unsubscribeToDataChannel("clearSpeech");
      
      this.system.unregister();
    },

    tick(t, dt) {
      // TODO: more elegant solution?
      if (this.el.getAttribute("visible")) {
        this.el.play();
      } else {
        this.el.pause();
      }

      const muted = this.playerInfo.data.muted;
      const speaking = !muted && this.localAudioAnalyser.volume > MIC_PRESENCE_VOLUME_THRESHOLD;
    
      // maintain speech event state of local user, send events as needed
      if (speaking) {
        if (this.continuousSpeechTime === 0) {
          // speech event started
          const eventData = { speaker: this.playerInfo.playerSessionId, speakerName: this.playerInfo.displayName };
          this._startSpeech(null, null, eventData, null); // local
          NAF.connection.broadcastData("startSpeech", eventData); // networked
        }
        this.continuousSpeechTime += SPEECH_TIME_PER_TICK;
        this.continuousSpeechLeniencyTime = CONTINUOUS_SPEECH_LENIENCY_TIME;
        // if this is a single really long speech event, break it off and start a new one
        if (this.continuousSpeechTime >= MAX_SPEECH_TIME_FOR_EVENT) {
          this.doStopSpeech(this.continuousSpeechTime);
          this.continuousSpeechTime = 0;
        }
      } else {
        if (this.continuousSpeechLeniencyTime > 0) {
          this.continuousSpeechLeniencyTime -= SPEECH_TIME_PER_TICK;
        }
        if (this.continuousSpeechLeniencyTime <= 0 && this.continuousSpeechTime >= MIN_SPEECH_TIME_FOR_EVENT) {
          // speech event ended
          this.doStopSpeech(this.continuousSpeechTime);
          this.continuousSpeechTime = 0;
        }
      }
    
      // update speech orb sizes and positions
      for (const finishedOrb of document.querySelectorAll(".speechOrb.finished")) {
        const pos = finishedOrb.getAttribute("position");
        pos.y += ORB_GROWTH_PER_TICK; // synchronize movement speed with orb growth rate
        finishedOrb.setAttribute("position", pos);
      }

      for (const activeOrb of Object.values(this.activeSpeechOrbs)) {
        // grow each active speech orb by ORB_GROWTH_PER_TICK
        const size = parseFloat(activeOrb.getAttribute("height")) + ORB_GROWTH_PER_TICK;
        activeOrb.setAttribute("height", size);
        activeOrb.setAttribute("radius", 0.1);
    
        // move its center upward by half of the growth amount,
        // to keep the bottom position fixed at the "now" plane
        const pos = activeOrb.getAttribute("position");
        pos.y += ORB_GROWTH_PER_TICK / 2;
        activeOrb.setAttribute("position", pos);
      }
    },

    _startSpeech(senderId, dataType, data, targetId) { 
      // if no already-active speech orb for this speaker, spawn one
      const activeOrb = this.activeSpeechOrbs[data.speaker];
      if (activeOrb) {
        activeOrb.classList.add("finished"); // FIXME replace w/ stopSpeech call for consistency?
      }
      const speakerInfo = this.getPlayerInfo(data.speaker);
      const newOrb = this.spawnOrb(MIN_ORB_SIZE, this.playerInfoToColor(speakerInfo));
      this.activeSpeechOrbs[data.speaker] = newOrb;
    
      // position the orb relative to the player and the center of the scene
      const centerObj = this.el;
      const centerPos = centerObj ? centerObj.object3D.position.clone() : new THREE.Vector3(...ORB_CONTAINER_POS);
      //centerPos.y = 1.5;
      centerPos.y = 0.5;
      const playerPos = speakerInfo.el.object3D.position.clone();
      //playerPos.y = 1.5;
      playerPos.y = 0.5;
      const offset = new THREE.Vector3().subVectors(playerPos, centerPos).normalize();
      const orbPos = new THREE.Vector3().addVectors(centerPos, offset);

      newOrb.object3D.position.copy(orbPos);
    },

    doStopSpeech(speechTime) {
      const orbSize = this.scale(speechTime, MIN_SPEECH_TIME_FOR_EVENT, MAX_SPEECH_TIME_FOR_EVENT, MIN_ORB_SIZE, MAX_ORB_SIZE);
      const eventData = {
        size: orbSize,
        speaker: this.playerInfo.playerSessionId,
        speakerName: this.playerInfo.displayName
      };
      this._stopSpeech(null, null, eventData, null); // local
      NAF.connection.broadcastData("stopSpeech", eventData); // networked
    },

    _stopSpeech(senderId, dataType, data, targetId) {
      const activeOrb = this.activeSpeechOrbs[data.speaker];
      if (activeOrb) {
        activeOrb.classList.add("finished");
        activeOrb.setAttribute("radius", 0.1);
        activeOrb.setAttribute("height", data.size);

        delete this.activeSpeechOrbs[data.speaker];
      }
    },

    scale(num, oldLower, oldUpper, newLower, newUpper) {
      const oldRange = oldUpper - oldLower;
      const newRange = newUpper - newLower;
      return ((num - oldLower) / oldRange) * newRange + newLower;
    },

    getPlayerInfo(sessionID) {
      const playerInfos = APP.componentRegistry["player-info"];
      return playerInfos.find(pi => pi.playerSessionId === sessionID);
    },

    sessionIDToColor(sessionID) {
      return "#" + sessionID.substring(0, 6); // just use first 6 chars lol
    },
    
    playerInfoToColor(playerInfo) {
      // keys are "Avatar listing sid"s from Approved Avatars admin tab
      const colorsByAvatar = {
        WUvZgGK: "lightskyblue",
        qpOOt9I: "hotpink",
        "2s2UuzN": "red",
        wAUg76e: "limegreen",
        RczWQgy: "#222",
        xb4PVBE: "yellow",
        yw4c83R: "purple",
        "4r1KpVk": "orange",
        bs7pLac: "darkblue"
      };
      const avatarURL = playerInfo.data.avatarSrc;
      for (const avatarSID of Object.keys(colorsByAvatar)) {
        if (avatarURL.includes(avatarSID)) return colorsByAvatar[avatarSID];
      }
      return this.sessionIDToColor(playerInfo.playerSessionId);
    },

    spawnOrb(size, color) {
      color = color || "yellow";
    
      // create, color, position, and scale the orb
      const orb = document.createElement("a-cylinder");
      orb.classList.add("speechOrb");
      orb.setAttribute("segments-height", 1);
      orb.setAttribute("segments-radial", 6);
      orb.setAttribute("radius", 1);
      orb.setAttribute("height", size);
      orb.setAttribute("color", color);
    
      // add the orb to the scene
      this.el.appendChild(orb);
    
      // queue the orb for deletion later
      setTimeout(() => orb.remove(), SPEECH_ORB_LIFETIME);
    
      return orb;
    },

    _clearSpeech(senderId, dataType, data, targetId) {
      for (const finishedOrb of document.querySelectorAll(".speechOrb.finished")) {
        finishedOrb.parentNode.removeChild(finishedOrb);
      }
    },

    clearSpeech() {
      this._clearSpeech(null, null, {}, null);
      NAF.connection.broadcastData("clearSpeech", {});
    }
  });

  AFRAME.registerSystem("socialvr-speech", {
    init: function() {
      console.log("[Social VR] Speech System - Initialized");
      this.tool = null;
    },

    register: function(el) {
      if (this.tool != null) {
        this.el.removeChild(this.tool);
      }
      
      console.log("[Social VR] Speech Component - Registered");
      this.tool = el;
    },

    unregister: function() {
      this.tool = null;
    },
  });

  function CreateSpeech() {
    // use element with CSS tag SpeechVis as visualization object
    let speechVisEl = document.querySelector(".SpeechVis");

    // if no such CSS tag, use cylinder as visualization object
    if (speechVisEl == null) {
      speechVisEl = document.createElement("a-cylinder");
      speechVisEl.setAttribute("color", "cyan");
      speechVisEl.setAttribute("height", "0.2");
      speechVisEl.setAttribute("radius", "1");
    }

    speechVisEl.setAttribute("socialvr-speech", "");
    speechVisEl.setAttribute("visible", false); // invisible, paused

    // toolbox button
    const speechToolboxButton = document.createElement("a-entity");
    speechToolboxButton.setAttribute("socailvr-toolbox-button", "speech");
    speechToolboxButton.setAttribute("position", { x: 0, y: 2, z: 1 });

    return [speechVisEl, speechToolboxButton];
  }

  const scene = document.querySelector("a-scene");

  const [barge, bargeToolboxButton] = CreateBarge();
  scene.appendChild(barge);
  scene.appendChild(bargeToolboxButton);

  window.startPhaseTesting = function() {
    let phase = 1;
    barge.emit("advancePhaseEvent");
    console.log(`[Social VR] Barge - Current Phase: ${phase}`);
  };

  const [speechVisEl, speechToolboxButton] = CreateSpeech();
  scene.appendChild(speechVisEl);
  scene.appendChild(speechToolboxButton);

})();
//# sourceMappingURL=development.js.map
