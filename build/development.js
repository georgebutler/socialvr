(function () {
  'use strict';

  // button for turning specified social VR systems on and off

  AFRAME.registerComponent("socailvr-toolbox-button", {
    dependencies: ["is-remote-hover-target", "hoverable-visuals"],

    schema: {type: "string", default: "Barge"},

    init: function() {
      // button text
      const textEl = document.createElement("a-entity");
      textEl.setAttribute("text", `value: ${this.data.toUpperCase()}; align: center; color: black`);
      textEl.setAttribute("rotation", "0 270 0");
      textEl.setAttribute("position", "0 0.4 0");
      this.el.appendChild(textEl);

      this.onClick = this.onClick.bind(this);
      this.el.object3D.addEventListener("interact", this.onClick);

      // precondition: barge already in the scene
      this.barge = this.el.sceneEl.systems["socialvr-barge"].barge;
      
      NAF.connection.subscribeToDataChannel("createBarge", this.createBarge.bind(this));
      NAF.connection.subscribeToDataChannel("removeBarge", this.removeBarge.bind(this));
    },

    remove: function() {
      this.el.object3D.removeEventListener("interact", this.onClick);
      NAF.connection.unsubscribeToDataChannel("createBarge");
      NAF.connection.unsubscribeToDataChannel("removeBarge");
    },

    onClick: function() {
      this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
        11,
        this.el.object3D
      );

      switch (this.data) {
        case "Barge":
          if (this.barge.getAttribute("visible")) {
            this.removeBarge();
            NAF.connection.broadcastData("removeBarge", {});
          } else {
            this.createBarge();
            NAF.connection.broadcastData("createBarge", {});          
          }

        default:
          console.log(`Invalid social VR system ${this.data}`);
      }
    },

    createBarge() {
      this.barge.setAttribute("visible", true);
      this.barge.play();
    },

    removeBarge() {
      this.barge.emit("resetBargeEvent");   // current behavior: onboard passengers teleport back to spawn
      this.barge.setAttribute("visible", false);
      this.barge.pause();
    }
  });

  // responsible for barge children creation and movement

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
      window.APP.utils.GLTFModelPlus.loadModel("https://statuesque-rugelach-4185bd.netlify.app/assets/barge_testing.glb")
      .then(model => {
        console.log(`[Social VR] Barge System - Mesh Loaded`);
        const mesh = window.APP.utils.threeUtils.cloneObject3D(model.scene);
        const min = new window.APP.utils.THREE.Vector3(-4, -4, -100);
        const max = new window.APP.utils.THREE.Vector3(4, 4, 100);

        this.el.setObject3D("mesh", mesh);
        this.el.object3D.scale.set(0.6, 0.6, 0.6);
        this.el.object3D.matrixNeedsUpdate = true;
        this.bbox = new window.APP.utils.THREE.Box3(min, max);

        // DEBUG
        this.debugHelper = new window.APP.utils.THREE.BoxHelper(this.el.getObject3D("mesh"), 0xffff00);
        this.el.sceneEl.object3D.add(this.debugHelper);
        this.debugHelper.update();

        console.log(`Min: ${this.bbox.min.x}, ${this.bbox.min.y}, ${this.bbox.min.z}`);
        console.log(`Max: ${this.bbox.max.x}, ${this.bbox.max.y}, ${this.bbox.max.z}`);
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
      
      this.barge = null;
    },

    register: function(el) {
      if (this.barge != null) {
        this.el.removeChild(this.barge);
      }
      
      this.barge = el;
    },

    unregister: function() {
      this.barge = null;
    },
  });

  function CreateBarge() {
    // Barge: invisible, paused
    const barge =  document.createElement("a-entity");
    barge.setAttribute("socialvr-barge", "");
    barge.setAttribute("visible", false);
    
    // toolbox button
    const bargeToolboxButton = document.createElement("a-sphere");
    bargeToolboxButton.setAttribute("socailvr-toolbox-button", "Barge");
    bargeToolboxButton.setAttribute("radius", "0.3");
    bargeToolboxButton.setAttribute("material", "color: pink");
    bargeToolboxButton.setAttribute("tags", "singleActionButton: true");
    bargeToolboxButton.setAttribute("css-class", "interactable");
    bargeToolboxButton.setAttribute("position", {
      x: 5,
      y: 2,
      z: 3
    });
    
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

  const scene = document.querySelector("a-scene");
  const [barge, bargeToolboxButton] = CreateBarge();
  scene.appendChild(barge);
  scene.appendChild(bargeToolboxButton);

  console.log("[Social VR] Barge - Create Barge");

  // Changes camera inspection system to show background, regardless of user preferences.
  const cameraSystem = scene.systems["hubs-systems"].cameraSystem;
  cameraSystem.lightsEnabled = true;

  // Floaty gravity change.
  function disableFloatyPhysics() {
    const floaties = document.querySelectorAll('[floaty-object=""]');

    floaties.forEach((floaty) => {
      floaty.setAttribute("floaty-object", { reduceAngularFloat: true, releaseGravity: -1 });
    });
  }

  scene.addEventListener("object_spawned", (e) => {
    disableFloatyPhysics();
  });

  // Phase testing commands
  window.startPhaseTesting = function() {
    let phase = 1;

    barge.emit("advancePhaseEvent");
    console.log(`[Social VR] Barge - Current Phase: ${phase}`);
  };

  disableFloatyPhysics();

  // from https://github.com/mkremins/hubs/blob/hubs-cloud-barge/src/max-additions.js

  /// utils

  // function createElement(htmlString) {
  //   const div = document.createElement("div");
  //   div.innerHTML = htmlString.trim();
  //   return div.firstChild;
  // }

  // function scale(num, oldLower, oldUpper, newLower, newUpper) {
  //   const oldRange = oldUpper - oldLower;
  //   const newRange = newUpper - newLower;
  //   return ((num - oldLower) / oldRange) * newRange + newLower;
  // }

  // function randInt(min, max) {
  //   min = Math.ceil(min);
  //   max = Math.floor(max);
  //   return Math.floor(Math.random() * (max - min) + min); // max exclusive, min inclusive
  // }

  // function retryUntilTruthy(fn, retryFrequencyMS) {
  //   const interval = setInterval(function() {
  //     const retVal = fn();
  //     if (retVal) {
  //       clearInterval(interval);
  //     }
  //   }, retryFrequencyMS);
  // }

  // /// constants

  // const MIC_PRESENCE_VOLUME_THRESHOLD = 0.00001;

  // const SPEECH_TIME_PER_TICK = 10; // every speech tick = 10ms of realtime
  // const MIN_SPEECH_TIME_FOR_EVENT = 100; // 0.1s realtime
  // const MAX_SPEECH_TIME_FOR_EVENT = 5000; // 5s realtime
  // const CONTINUOUS_SPEECH_LENIENCY_TIME = 100; // 0.1s realtime

  // const ORB_CONTAINER_POS = [0, 0, 0]; //[7,0,2]
  // const ORB_CONTAINER_SIZE = 1;
  // const ORB_CONTAINER_DEPTH = 4;

  // const MIN_ORB_SIZE = 0.05;
  // const MAX_ORB_SIZE = 0.9;
  // const SPEECH_ORB_LIFETIME = 1000 * 60 * 5; // 5mins realtime
  // const ORB_GROWTH_PER_TICK =
  //   (MAX_ORB_SIZE - MIN_ORB_SIZE) / ((MAX_SPEECH_TIME_FOR_EVENT - MIN_SPEECH_TIME_FOR_EVENT) / SPEECH_TIME_PER_TICK);

  // const DST_ITEM_NAMES = [
  //   "book",
  //   "jacket",
  //   "pills",
  //   "canteen",
  //   "flashlight",
  //   "compass",
  //   "knife",
  //   "mirror",
  //   "newspaper",
  //   "bottle",
  //   "medic",
  //   "map"
  // ];

  // /// main code

  // const interval = setInterval(initMaxAdditions, 10);

  // let showConversationBalanceViz = true;

  // function initMaxAdditions(scene) {
  //   if (!window.APP || !window.APP.scene) return;
  //   clearInterval(interval);
  //   console.log("!!!initMaxAdditions!!!");

  //   // remove the barge from scenes where the barge isn't wanted
  //   retryUntilTruthy(function() {
  //     const sceneNameHolder = document.querySelector("#environment-scene > a-entity > a-entity");
  //     if (!sceneNameHolder) return;
  //     const sceneName = sceneNameHolder.className;
  //     console.log("sceneName", sceneName);
  //     if (sceneName.includes("DSTTable")) {
  //       console.log("Removing barge from scene due to sceneName:", sceneName);
  //       document.querySelector("[socialvr-barge]").remove();
  //     }
  //     if (sceneName.includes("BargeDemoWaypoints")) {
  //       console.log("Disabling conversation balance viz due to sceneName:", sceneName);
  //       showConversationBalanceViz = false;
  //     }
  //     return true;
  //   }, 100);

  //   // when we receive a speech event from another client, call the appropriate handler
  //   NAF.connection.subscribeToDataChannel("startSpeech", startSpeech);
  //   NAF.connection.subscribeToDataChannel("stopSpeech", stopSpeech);

  //   // periodically poll for voice input to spawn utterances for this client
  //   setInterval(speechTick, SPEECH_TIME_PER_TICK);

  //   /*
  //   // spawn orb container
  //   const radius = ORB_CONTAINER_SIZE;
  //   const center = ORB_CONTAINER_POS;
  //   center[1] = ORB_CONTAINER_DEPTH / 2;
  //   const wallPositions = [
  //     `${center[0] - radius} ${center[1]} ${center[2]}`,
  //     `${center[0]} ${center[1]} ${center[2] - radius}`,
  //     `${center[0] + radius} ${center[1]} ${center[2]}`,
  //     `${center[0]} ${center[1]} ${center[2] + radius}`
  //   ];
  //   const wallOrientations = ["vert", "horiz", "vert", "horiz"];
  //   for (let i = 0; i < 4; i++) {
  //     const isVert = wallOrientations[i] === "vert";
  //     const wall = document.createElement("a-entity");
  //     wall.setAttribute("geometry", {
  //       primitive: "box",
  //       width: isVert ? "0.1" : radius * 2,
  //       height: ORB_CONTAINER_DEPTH,
  //       depth: isVert ? radius * 2 : "0.1"
  //     });
  //     wall.setAttribute("material", "color:white;transparent:true;opacity:0.5");
  //     wall.setAttribute("position", wallPositions[i]);
  //     wall.setAttribute("body-helper", {type: TYPE.STATIC});
  //     wall.setAttribute("shape-helper", {type: SHAPE.BOX});
  //     APP.scene.appendChild(wall);
  //   }
  //   */

  //   /*
  //   // give unhatted avatars hats
  //   // FIXME: don't poll for this, do it once on new user entry event
  //   setInterval(function() {
  //     for (let playerInfo of APP.componentRegistry["player-info"]) {
  //       spawnHat(playerInfo);
  //     }
  //   }, 1000);
  //   */

  //   // suppress visibility of all DST spawners until a moderater calls beginDST()
  //   const suppressDSTInterval = setInterval(function() {
  //     const dstSpawners = DST_ITEM_NAMES.map(name => document.querySelector(`.${name}`));
  //     const cooldown = 1000 * 60 * 60 * 24 * 7; // one week is probably enough
  //     for (const spawner of dstSpawners) {
  //       if (!spawner) continue; // bail out early if no spawner found for this item name
  //       spawner.setAttribute("visible", false);
  //     }
  //   }, 1000);

  //   // selectively re-disable spawners when they're used
  //   function disableSpawner(senderId, dataType, data, targetId) {
  //     console.log("disableSpawner", data);
  //     const spawner = document.querySelector(`.${data.itemName}`);
  //     spawner.setAttribute("visible", false);
  //     spawner.object3D.position.y = -10; // do we have to hide it *both* ways? :(((
  //   }
  //   NAF.connection.subscribeToDataChannel("disableSpawner", disableSpawner);

  //   // code to enable DST spawners
  //   function enableDSTSpawners() {
  //     console.log("beginDST");
  //     clearInterval(suppressDSTInterval);
  //     const dstSpawners = DST_ITEM_NAMES.map(name => document.querySelector(`.${name}`));
  //     for (const spawner of dstSpawners) {
  //       if (!spawner) continue;
  //       spawner.setAttribute("visible", true);

  //       // attach a spawn event listener
  //       spawner.addEventListener("spawned-entity-created", function() {
  //         const itemName = spawner.classList[0];
  //         console.log("spawned-entity-created", itemName);
  //         const eventData = { itemName: itemName };
  //         disableSpawner(null, null, eventData);
  //         NAF.connection.broadcastData("disableSpawner", eventData);
  //       });
  //     }
  //   }
  //   window.beginDST = function() {
  //     enableDSTSpawners();
  //     NAF.connection.broadcastData("beginDST", {});
  //   };
  //   NAF.connection.subscribeToDataChannel("beginDST", enableDSTSpawners);

  //   // add a globally accessible event log to the window
  //   window.eventLog = [];

  //   // and a function for the moderator to log DST item positions
  //   window.logItemPositions = logItemPositions;

  //   // and a single "log everything" function
  //   window.logEverything = function() {
  //     logItemPositions();
  //     return JSON.stringify(window.eventLog, null, 2);
  //   };
  // }

  // function spawnHat(playerInfo) {
  //   // bail out early if session ID not yet assigned
  //   if (!playerInfo.playerSessionId) return;

  //   // bail out early if avatar not yet loaded, or hat already present
  //   const avatar = playerInfo.el;
  //   if (!avatar.querySelector(".Spine")) return;
  //   if (avatar.querySelector(".hat")) return;

  //   // create, color, position, and scale the hat
  //   const hat = document.createElement("a-entity");
  //   hat.classList.add("hat");
  //   hat.setAttribute("geometry", "primitive:cylinder;segmentsHeight:1;radius:0.16;height:0.25");
  //   const color = playerInfoToColor(playerInfo);
  //   hat.setAttribute("material", `color:${color};shader:flat`);
  //   hat.setAttribute("position", "0 0 0");

  //   // add the hat to the avatar
  //   avatar.querySelector(".Spine").appendChild(hat);

  //   // add "gloves" if hands present
  //   const leftHand = avatar.querySelector(".LeftHand");
  //   if (leftHand) {
  //     const leftGlove = document.createElement("a-entity");
  //     leftGlove.classList.add("glove");
  //     leftGlove.classList.add("leftGlove");
  //     leftGlove.setAttribute("geometry", "primitive:sphere;radius:0.1");
  //     leftGlove.setAttribute("material", `color:${color};shader:flat`);
  //     leftGlove.setAttribute("position", "0 0 0");
  //     leftHand.appendChild(leftGlove);
  //   }
  //   const rightHand = avatar.querySelector(".RightHand");
  //   if (rightHand) {
  //     const rightGlove = document.createElement("a-entity");
  //     rightGlove.classList.add("glove");
  //     rightGlove.classList.add("rightGlove");
  //     rightGlove.setAttribute("geometry", "primitive:sphere;radius:0.1");
  //     rightGlove.setAttribute("material", `color:${color};shader:flat`);
  //     rightGlove.setAttribute("position", "0 0 0");
  //     rightHand.appendChild(rightGlove);
  //   }

  //   return hat;
  // }

  // function sessionIDToColor(sessionID) {
  //   return "#" + sessionID.substring(0, 6); // just use first 6 chars lol
  // }

  // function playerInfoToColor(playerInfo) {
  //   // keys are "Avatar listing sid"s from Approved Avatars admin tab
  //   const colorsByAvatar = {
  //     WUvZgGK: "lightskyblue",
  //     qpOOt9I: "hotpink",
  //     "2s2UuzN": "red",
  //     wAUg76e: "limegreen",
  //     RczWQgy: "#222",
  //     xb4PVBE: "yellow",
  //     yw4c83R: "purple",
  //     "4r1KpVk": "orange",
  //     bs7pLac: "darkblue"
  //   };
  //   const avatarURL = playerInfo.data.avatarSrc;
  //   for (const avatarSID of Object.keys(colorsByAvatar)) {
  //     if (avatarURL.includes(avatarSID)) return colorsByAvatar[avatarSID];
  //   }
  //   return sessionIDToColor(playerInfo.playerSessionId);
  // }

  // function getPlayerInfo(sessionID) {
  //   const playerInfos = APP.componentRegistry["player-info"];
  //   return playerInfos.find(pi => pi.playerSessionId === sessionID);
  // }

  // function logEvent(eventType, event) {
  //   event.eventType = eventType;
  //   event.timestamp = Date.now();
  //   window.eventLog.push(event);
  // }

  // const activeSpeechOrbs = {};

  // function startSpeech(senderId, dataType, data, targetId) {
  //   console.log("startSpeech", senderId, dataType, data, targetId);
  //   logEvent("startSpeech", data);

  //   // bail out early if conversation balance viz disabled
  //   if (!showConversationBalanceViz) return;

  //   // if no already-active speech orb for this speaker, spawn one
  //   const activeOrb = activeSpeechOrbs[data.speaker];
  //   if (activeOrb) {
  //     activeOrb.classList.add("finished"); // FIXME replace w/ stopSpeech call for consistency?
  //   }
  //   const playerInfo = getPlayerInfo(data.speaker);
  //   const newOrb = spawnOrb(MIN_ORB_SIZE, playerInfoToColor(playerInfo));
  //   activeSpeechOrbs[data.speaker] = newOrb;

  //   // position the orb relative to the player and the center of the scene
  //   const centerObj = document.querySelector(".Table");
  //   const centerPos = centerObj ? centerObj.object3D.position.clone() : new THREE.Vector3(...ORB_CONTAINER_POS);
  //   centerPos.y = 1.5;
  //   const playerPos = playerInfo.el.object3D.position.clone();
  //   playerPos.y = 1.5;
  //   const offset = new THREE.Vector3().subVectors(playerPos, centerPos).normalize();
  //   const orbPos = new THREE.Vector3().addVectors(centerPos, offset);
  //   newOrb.setAttribute("position", orbPos);
  // }

  // function stopSpeech(senderId, dataType, data, targetId) {
  //   console.log("stopSpeech", senderId, dataType, data, targetId);
  //   logEvent("stopSpeech", data);
  //   const activeOrb = activeSpeechOrbs[data.speaker];
  //   if (activeOrb) {
  //     activeOrb.setAttribute("geometry", {
  //       primitive: "cylinder",
  //       segmentsHeight: 1,
  //       segmentsRadial: 6,
  //       radius: 0.1,
  //       height: data.size
  //     });
  //     activeOrb.classList.add("finished");
  //     delete activeSpeechOrbs[data.speaker];
  //   }
  // }

  // function spawnOrb(size, color) {
  //   color = color || "yellow";
  //   console.log("spawnOrb", size, color);

  //   // create, color, position, and scale the orb
  //   //const pos = ORB_CONTAINER_POS;
  //   const orb = document.createElement("a-entity");
  //   orb.classList.add("speechOrb");
  //   orb.setAttribute("geometry", {
  //     primitive: "cylinder",
  //     segmentsHeight: 1,
  //     segmentsRadial: 6,
  //     radius: 0.1,
  //     height: size
  //   });
  //   orb.setAttribute("material", `color:${color};shader:flat`);
  //   //orb.setAttribute("position", `${pos[0]} ${pos[1] + 5} ${pos[2]}`);

  //   /*
  //   // add physics and a collider
  //   orb.setAttribute("body-helper", {
  //     collisionFilterMask: COLLISION_LAYERS.ALL,
  //     gravity: {x: 0, y: -9.8, z: 0}
  //   });
  //   orb.setAttribute("shape-helper", {type: SHAPE.SPHERE});
  //   */

  //   // add the orb to the scene
  //   APP.scene.appendChild(orb);

  //   // queue the orb for deletion later
  //   setTimeout(() => orb.remove(), SPEECH_ORB_LIFETIME);

  //   return orb;
  // }

  // // track how much the local user is talking
  // let continuousSpeechTime = 0;
  // let continuousSpeechLeniencyTime = 0;

  // function doStopSpeech(speechTime) {
  //   const orbSize = scale(speechTime, MIN_SPEECH_TIME_FOR_EVENT, MAX_SPEECH_TIME_FOR_EVENT, MIN_ORB_SIZE, MAX_ORB_SIZE);
  //   const playerInfo = APP.componentRegistry["player-info"][0];
  //   const eventData = {
  //     size: orbSize,
  //     speaker: playerInfo.playerSessionId,
  //     speakerName: playerInfo.displayName
  //   };
  //   stopSpeech(null, null, eventData); // local
  //   NAF.connection.broadcastData("stopSpeech", eventData); // networked
  // }

  // function speechTick() {
  //   const playerInfo = APP.componentRegistry["player-info"][0];
  //   const muted = playerInfo.data.muted;
  //   const localAudioAnalyser = window.APP.scene.systems["local-audio-analyser"];
  //   const speaking = !muted && localAudioAnalyser.volume > MIC_PRESENCE_VOLUME_THRESHOLD;

  //   // maintain speech event state of local user, send events as needed
  //   if (speaking) {
  //     if (continuousSpeechTime === 0) {
  //       // speech event started
  //       const eventData = { speaker: playerInfo.playerSessionId, speakerName: playerInfo.displayName };
  //       startSpeech(null, null, eventData); // local
  //       NAF.connection.broadcastData("startSpeech", eventData); // networked
  //     }
  //     continuousSpeechTime += SPEECH_TIME_PER_TICK;
  //     continuousSpeechLeniencyTime = CONTINUOUS_SPEECH_LENIENCY_TIME;
  //     // if this is a single really long speech event, break it off and start a new one
  //     if (continuousSpeechTime >= MAX_SPEECH_TIME_FOR_EVENT) {
  //       doStopSpeech(continuousSpeechTime);
  //       continuousSpeechTime = 0;
  //     }
  //   } else {
  //     if (continuousSpeechLeniencyTime > 0) {
  //       continuousSpeechLeniencyTime -= SPEECH_TIME_PER_TICK;
  //     }
  //     if (continuousSpeechLeniencyTime <= 0 && continuousSpeechTime >= MIN_SPEECH_TIME_FOR_EVENT) {
  //       // speech event ended
  //       doStopSpeech(continuousSpeechTime);
  //       continuousSpeechTime = 0;
  //     }
  //   }

  //   // update speech orb sizes and positions
  //   for (const finishedOrb of document.querySelectorAll(".speechOrb.finished")) {
  //     const pos = finishedOrb.getAttribute("position");
  //     pos.y += ORB_GROWTH_PER_TICK; // synchronize movement speed with orb growth rate
  //     finishedOrb.setAttribute("position", pos);
  //   }
  //   for (const activeOrb of Object.values(activeSpeechOrbs)) {
  //     // grow each active speech orb by ORB_GROWTH_PER_TICK
  //     const size = activeOrb.getAttribute("geometry").height + ORB_GROWTH_PER_TICK;
  //     activeOrb.setAttribute("geometry", {
  //       primitive: "cylinder",
  //       segmentsHeight: 1,
  //       segmentsRadial: 6,
  //       radius: 0.1,
  //       height: size
  //     });

  //     // move its center upward by half of the growth amount,
  //     // to keep the bottom position fixed at the "now" plane
  //     const pos = activeOrb.getAttribute("position");
  //     pos.y += ORB_GROWTH_PER_TICK / 2;
  //     activeOrb.setAttribute("position", pos);
  //   }
  // }

  // /// log item positions

  // function makeItemNameTable() {
  //   const itemNamesByModelURL = {};
  //   for (const itemName of DST_ITEM_NAMES) {
  //     const dstSpawner = document.querySelector(`.${itemName}`);
  //     const modelURL = dstSpawner.components["gltf-model-plus"].data.src;
  //     itemNamesByModelURL[modelURL] = itemName;
  //   }
  //   return itemNamesByModelURL;
  // }

  // /*
  // function makeCells() {
  //   const table = document.querySelector(".Table");
  //   const tablePos = table.object3D.position;
  //   const cells = [];
  //   const rowSize = 0.2;
  //   const colSize = 0.2;
  //   for (let row = 2; row >= 0; row--) {
  //     for (let col = 0; col < 5; col++) {
  //       const cellNum = cells.length;
  //       const rowOffset = row - 1;
  //       const colOffset = col - 2;
  //       cells.push({
  //         x: tablePos.x + (rowOffset * rowSize),
  //         z: tablePos.z + (colOffset * colSize),
  //         cellNum
  //       });
  //     }
  //   }
  //   return cells;
  // }
  // */

  // function makeCells() {
  //   // hardcoded based on DSTTable scene
  //   return [
  //     { x: 0, z: -0.85, cellNum: 1 },
  //     { x: 0, z: -0.71, cellNum: 2 },
  //     { x: 0, z: -0.575, cellNum: 3 },
  //     { x: 0, z: -0.45, cellNum: 4 },
  //     { x: 0, z: -0.31, cellNum: 5 },
  //     { x: 0, z: -0.17, cellNum: 6 },
  //     { x: 0, z: -0.04, cellNum: 7 },
  //     { x: 0, z: 0.09, cellNum: 8 },
  //     { x: 0, z: 0.23, cellNum: 9 },
  //     { x: 0, z: 0.365, cellNum: 10 },
  //     { x: 0, z: 0.5, cellNum: 11 },
  //     { x: 0, z: 0.635, cellNum: 12 }
  //   ];
  // }

  // function getClosestCell(pos) {
  //   const cells = makeCells();
  //   cells.sort((a, b) => {
  //     const aPos = new THREE.Vector3(a.x, 0, a.z);
  //     const bPos = new THREE.Vector3(b.x, 0, b.z);
  //     return pos.distanceToSquared(aPos) - pos.distanceToSquared(bPos);
  //   });
  //   return cells[0];
  // }

  // function logItemPositions() {
  //   const eventData = { itemRanks: {}, itemPositions: {} };
  //   const itemNameTable = makeItemNameTable();
  //   // get potential DST items, i.e., objects spawned from super-spawners
  //   const uiInteractables = [...document.querySelectorAll(".interactable > .ui.interactable-ui")];
  //   const items = uiInteractables.map(el => el.parentNode);
  //   for (const item of items) {
  //     const itemModel = item.components["gltf-model-plus"];
  //     if (!itemModel) continue;
  //     const itemName = itemNameTable[itemModel.data.src];
  //     if (!itemName) continue;
  //     const itemPos = item.object3D.position;
  //     const cell = getClosestCell(itemPos);
  //     eventData.itemRanks[itemName] = cell.cellNum;
  //     eventData.itemPositions[itemName] = { x: itemPos.x, z: itemPos.z };
  //   }
  //   logEvent("itemPositions", eventData);
  //   return eventData;
  // }

})();
//# sourceMappingURL=development.js.map
