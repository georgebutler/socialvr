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
  let shouldAvatarBeInBargeMode = false;

  const width = 30;
  const depth = 30;

  function moveWithBox(parent, child, direction, isAvatar) {
    const parentPosition = parent.object3D?.position;
    const childPosition = child.object3D?.position;

    const minX = parentPosition.x - width;
    const maxX = parentPosition.x + width;
    const minZ = parentPosition.z - depth;
    const maxZ = parentPosition.z + depth;

    if (childPosition.x >= minX && childPosition.x <= maxX && childPosition.z >= minZ && childPosition.z <= maxZ) {
      if (isAvatar) {
        child.setAttribute("position", {
          x: childPosition.x + direction.x,
          y: parentPosition.y + window.APP.utils.getCurrentPlayerHeight() / 2,
          z: childPosition.z + direction.z
        });
      } else {
        child.setAttribute("position", {
          x: childPosition.x + direction.x,
          y: childPosition.y + direction.y,
          z: childPosition.z + direction.z
        });
      }

      return true;
    }

    return false;
  }

  AFRAME.registerComponent("socialvr-barge", {
    schema: {
      speed: { type: "number", default: 1 },
      moving: { type: "boolean", default: false },
      targetKey: { type: "number", default: 0 }
    },

    init() {
      const scene = document.querySelector("a-scene");

      this.direction = new window.APP.utils.THREE.Vector3();

      // Reset Button
      const buttonResetEl = document.createElement("a-entity");
      buttonResetEl.setAttribute("socialvr-barge-button", "text: Reset; eventName: resetBargeEvent; radius: 0.15; color: #3B56DC");
      buttonResetEl.setAttribute("position", {
        x: this.el.object3D.position.x + (2 - 0.2),
        y: this.el.object3D.position.y + 1,
        z: this.el.object3D.position.z
      });

      // Start Button
      const buttonGoEl = document.createElement("a-entity");
      buttonGoEl.setAttribute("socialvr-barge-button", "text: Go; eventName: startBargeEvent; radius: 0.15; color: #32CD32");
      buttonGoEl.setAttribute("position", {
        x: this.el.object3D.position.x + (2 - 0.2),
        y: this.el.object3D.position.y + 1,
        z: this.el.object3D.position.z + 1 // Right
      });
      
      // Stop Button
      const buttonStopEl = document.createElement("a-entity");
      buttonStopEl.setAttribute("socialvr-barge-button", "text: Stop; eventName: stopBargeEvent; radius: 0.15; color: #FF0000");
      buttonStopEl.setAttribute("position", {
        x: this.el.object3D.position.x + (2 - 0.2),
        y: this.el.object3D.position.y + 1,
        z: this.el.object3D.position.z - 1 // Left
      });
      
      scene.appendChild(buttonResetEl);
      scene.appendChild(buttonGoEl);
      scene.appendChild(buttonStopEl);

      // Client
      scene.addEventListener("startBargeEvent", this.startBarge.bind(this));
      scene.addEventListener("stopBargeEvent", this.stopBarge.bind(this));
      scene.addEventListener("resetBargeEvent", this.resetBarge.bind(this));

      // Broadcast Event
      NAF.connection.subscribeToDataChannel("startBarge", this._startBarge.bind(this));
      NAF.connection.subscribeToDataChannel("stopBarge", this._stopBarge.bind(this));
      NAF.connection.subscribeToDataChannel("resetBarge", this._resetBarge.bind(this));

      this.system.register(this.el);
    },

    remove() {
      const scene = document.querySelector("a-scene");

      scene.removeEventListener("startBargeEvent", this.startBarge.bind(this));
      scene.removeEventListener("stopBargeEvent", this.stopBarge.bind(this));
      scene.removeEventListener("resetBargeEvent", this.resetBarge.bind(this));

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

      shouldAvatarBeInBargeMode = false;
      const position = this.el.object3D.position;

      if (this.data.moving) {
        const targetPosition = positions[this.data.targetKey];
        const direction = this.direction;

        if (!targetPosition) {
          this.data.moving = false;
          return;
        }

        direction.copy(targetPosition).sub(position);
        if (position.distanceToSquared(targetPosition) >= 1) {
          // Barge movement
          const factor = this.data.speed / direction.length();
          direction.multiplyScalar(factor * (dt / 1000));

          // Mesh movement
          this.el.setAttribute("position", {
            x: position.x + direction.x,
            y: position.y + direction.y,
            z: position.z + direction.z
          });

          // Child Movement
          const children = document.querySelectorAll('[socialvr-barge-child=""]');

          children.forEach((child) => {
            moveWithBox(this.el, child, direction, false);
          });

          // Floaty Movement
          const floaties = document.querySelectorAll('[floaty-object=""]');

          floaties.forEach((floaty) => {
            moveWithBox(this.el, floaty, direction, false);
          });

          // Interactable Movement
          const interactables = document.querySelectorAll('[interactable=""]');

          interactables.forEach((interactable) => {
            moveWithBox(this.el, interactable, direction, false);
          });

          // Avatar Movement
          shouldAvatarBeInBargeMode = moveWithBox(this.el, window.APP.componentRegistry["player-info"][0].el, direction, true);
        } else {
          // NaN check
          if (isNaN(lastKeyChange) || t >= lastKeyChange) {
            lastKeyChange = t + 100;
            this.data.targetKey = this.data.targetKey + 1;
          }

          // console.log(t);
          // console.log(this.data.targetKey);
        }
      }

      this.el.sceneEl.systems["hubs-systems"].characterController.fly = shouldAvatarBeInBargeMode;
    },

    _startBarge(senderId, dataType, data, targetId) {
      positions = [];

      for (let i = 0; i < 100; i++) {
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
      avatar.el.setAttribute("position", new window.APP.utils.THREE.Vector3(0, 0, 0));
      shouldAvatarBeInBargeMode = false;
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

  // responsible for barge creation and advancing phase

  AFRAME.registerSystem("socialvr-barge", {
    init: function () {
      console.log("[Social VR] Barge System - Initialized");

      this.barge = null;
      this.phase = 0;
    },

    register: function (el) {
      if (this.barge != null) {
        this.el.removeChild(this.barge);
      }

      this.barge = el;
    },

    unregister: function () {
      this.barge = null;
    },
  });

  function LoadAndAttach(data, barge) {
    let transform = data.components.find(el => el.name === "transform");
    // let visible = data.components.find(el => el.name === "visible");

    if (transform) {
      let gltf = data.components.find(el => el.name === "gltf-model");
      let spawner = data.components.find(el => el.name === "spawner");

      let position = new window.APP.utils.THREE.Vector3(transform.props.position.x, transform.props.position.y, transform.props.position.z);
      let rotation = new window.APP.utils.THREE.Euler(transform.props.rotation.x, transform.props.rotation.y, transform.props.rotation.z, "XYZ");
      let scale = new window.APP.utils.THREE.Vector3(transform.props.scale.x, transform.props.scale.y, transform.props.scale.z);

      // GLTF
      if (gltf) {
        if (data.name === "barge-model") {
          barge.object3D.position.copy(position);
          barge.object3D.rotation.copy(rotation);
          barge.object3D.scale.copy(scale);
          barge.object3D.matrixNeedsUpdate = true;
    
          window.APP.utils.GLTFModelPlus
          .loadModel(gltf.props.src)
          .then((model) => {
            barge.setObject3D("mesh", window.APP.utils.threeUtils.cloneObject3D(model.scene, false));
          })
          .catch((e) => {
            console.error(e);
          });
        } else {
          const { entity } = window.APP.utils.addMedia(gltf.props.src, "#static-media");

          entity.setAttribute("socialvr-barge-child", "");
          entity.object3D.position.copy(position);
          entity.object3D.rotation.copy(rotation);
          entity.object3D.scale.copy(scale);
          entity.object3D.matrixNeedsUpdate = true;

          // Phase Index
          const phaseIndex = data.name.search(/phase/i);

          if (phaseIndex >= 0) {
            const phase = data.name.slice(phaseIndex).split(" ")[0].trim().toLowerCase();
        
            if (phase === "phase1" || phase === "phase2" || phase === "phase3") {
              console.log(`Added ${data.name} to ${phase}.`);
              entity.classList.add(`${phase}`);
            }
          }

          // Phase Buttons
          if (data.name === "startButton") {
            const button = document.createElement("a-entity");
            const scene = document.querySelector("a-scene");

            button.setAttribute("socialvr-barge-button", "text: Begin; radius: 0.4; color: #C576F6; phaseID: 1");
            button.setAttribute("position", position.add(new window.APP.utils.THREE.Vector3(0, 1, 0)));
            scene.appendChild(button);
          }
        }
      }

      // Spawners
      if (spawner) {
        const { entity } = window.APP.utils.addMedia(spawner.props.src, "#interactable-media");
        entity.object3D.position.copy(position);
        entity.object3D.rotation.copy(rotation);
        entity.object3D.scale.copy(scale);
        entity.object3D.matrixNeedsUpdate = true;

        // Phase Index
        const phaseIndex = data.name.search(/phase/i);

        if (phaseIndex >= 0) {
          const phase = data.name.slice(phaseIndex).split(" ")[0].trim().toLowerCase();
      
          if (phase === "phase1" || phase === "phase2" || phase === "phase3") {
            console.log(`Added ${data.name} to ${phase}.`);
            entity.classList.add(`${phase}`);
          }
        }
      }
    }
  }

  // toggle: true/false
  function ChangePhase(senderId, dataType, data, targetId) {
    // console.log("Phase: " + data.index);

    const phase1 = document.querySelectorAll(".phase1");
    const phase2 = document.querySelectorAll(".phase2");
    const phase3 = document.querySelectorAll(".phase3");

    // Index 0: Initial phase, nothing visible.
    if (data.index <= 0) {
      phase1.forEach(el => {
        el.setAttribute("visible", false);
      });

      phase2.forEach(el => {
        el.setAttribute("visible", false);
      });

      phase3.forEach(el => {
        el.setAttribute("visible", false);
      });
    }

    // Index 1: Phase 1 visible ONLY.
    if (data.index == 1) {
      phase1.forEach(el => {
        el.setAttribute("visible", true);
      });

      phase2.forEach(el => {
        el.setAttribute("visible", false);
      });

      phase3.forEach(el => {
        el.setAttribute("visible", false);
      });
    }
  }

  function CreateBarge() {
    // Barge: invisible, paused
    const barge = document.createElement("a-entity");
    barge.setAttribute("socialvr-barge", "");
    barge.setAttribute("visible", true);

    // toolbox button
    const bargeToolboxButton = document.createElement("a-sphere");
    bargeToolboxButton.setAttribute("socialvr-toolbox-button", "Barge");
    bargeToolboxButton.setAttribute("radius", "0.3");
    bargeToolboxButton.setAttribute("material", "color: pink");
    bargeToolboxButton.setAttribute("tags", "singleActionButton: true");
    bargeToolboxButton.setAttribute("css-class", "interactable");
    bargeToolboxButton.setAttribute("position", {
      x: 5,
      y: 2,
      z: 3
    });

    fetch("https://statuesque-rugelach-4185bd.netlify.app/assets/barge-master-for-export-5-2-22.spoke")
      .then(response => {
        return response.json();
      })
      .then((data) => {
        for (var item in data.entities) {
          // console.log(data.entities[item]);
          LoadAndAttach(data.entities[item], barge);
        }
      })
      .then(() => {
        // Broadcast Event
        NAF.connection.subscribeToDataChannel("changePhase", ChangePhase);

        ChangePhase(null, null, {index: 0});
        NAF.connection.broadcastData("changePhase", {
          index: 0
        });
      })
      .catch((e) => {
        console.error(e);
      });

    return [barge, bargeToolboxButton];
  }

  AFRAME.registerComponent("socialvr-barge-button", {
    dependencies: ["is-remote-hover-target", "hoverable-visuals"],
    
    // start, stop, reset
    schema: {
      text: {
        type: "string", 
        default: "start"
      },
      eventName: {
        type: "string",
        default: ""
      },
      phaseID: {
        type: "number",
        default: -1
      },
      radius: {
        type: "number",
        default: 0.2
      },
      color: {
        type: "color",
        default: "#FFF"
      }
    },

    init: function() {
      var data = this.data;
      var el = this.el;

      // Geometry
      this.geometry = new THREE.SphereGeometry(data.radius, 16, 8);
      this.material = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.5,
      });
      this.mesh = new THREE.Mesh(this.geometry, this.material);

      el.setObject3D('mesh', this.mesh);
      el.setAttribute("tags", "singleActionButton: true");
      el.setAttribute("css-class", "interactable");
      el.setAttribute("socialvr-barge-child", "");

      // Text
      this.text = document.createElement("a-entity");
      this.text.setAttribute("text", `value: ${this.data.text}; align: center; side: double; width: 2;`);
      this.text.setAttribute("rotation", "0 0 0");
      this.text.setAttribute("position", `0 ${this.data.radius + 0.2} 0`);
      el.appendChild(this.text);
      
      this.onClick = this.onClick.bind(this);
      this.el.object3D.addEventListener("interact", this.onClick);
    },

    tick: function (time, timeDelta) {
      this.text.setAttribute("rotation", `0 ${time * 0.1} 0`);
    },

    remove: function() {
      this.el.object3D.removeEventListener("interact", this.onClick);
    },

    onClick: function() {
      const scene = document.querySelector("a-scene");

      this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
        11,
        this.el.object3D
      );

      if (this.data.phaseID >= 0) {
        // Phase Button
        ChangePhase(null, null, {index: this.data.phaseID});
        NAF.connection.broadcastData("changePhase", {
          index: this.data.phaseID
        });

        // Phase 1 - Go
        if (this.data.phaseID === 1) ;
      } else {
        // Generic Button
        scene.emit(this.data.eventName);
      }
    }
  });

  const scene = document.querySelector("a-scene");
  scene.addEventListener("environment-scene-loaded", () => {
    console.log("[Social VR] Barge - Create Barge");

    const [barge, bargeToolboxButton] = CreateBarge();
    scene.appendChild(barge);
    // scene.appendChild(bargeToolboxButton);

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

    disableFloatyPhysics();
  }, { once: true });

})();
//# sourceMappingURL=development.js.map
