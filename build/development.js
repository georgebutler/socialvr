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
    barge.setAttribute("visible", true);
    
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

  console.log("[Social VR] Barge - Create Barge");
  const [barge, bargeToolboxButton] = CreateBarge();
  scene.appendChild(barge);
  scene.appendChild(bargeToolboxButton);

  window.startPhaseTesting = function() {
    let phase = 1;
    barge.emit("advancePhaseEvent");
    console.log(`[Social VR] Barge - Current Phase: ${phase}`);
  };

})();
//# sourceMappingURL=development.js.map
