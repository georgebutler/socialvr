(function () {
  'use strict';

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

  // toggle: true/false
  function ChangePhase(senderId, dataType, data, targetId) {
    const phase1 = document.querySelectorAll(".phase1");
    const phase2 = document.querySelectorAll(".phase2");
    const phase3 = document.querySelectorAll(".phase3");
    const phase4 = document.querySelectorAll(".phase4");

    // Index 0: Initial phase, nothing visible.
    if (data.index <= 0) {
      phase1.forEach(el => {
        el.object3D.visible = false;
      });

      phase2.forEach(el => {
        el.object3D.visible = false;
      });

      phase3.forEach(el => {
        el.object3D.visible = false;
      });

      phase4.forEach(el => {
        el.object3D.visible = false;
      });
    }

    // Phase 1
    else if (data.index == 1) {
      console.log("Phase 1 Started");

      phase1.forEach(el => {
        el.object3D.visible = true;
      });
    }

    // Phase 2
    else if (data.index == 2) {
      console.log("Phase 2 Started");

      phase2.forEach(el => {
        el.object3D.visible = true;
      });
    }

    // Phase 3
    else if (data.index == 3) {
      console.log("Phase 3 Started");

      phase3.forEach(el => {
        el.object3D.visible = true;
      });
    }

    // Phase 4
    else if (data.index == 4) {
      console.log("Phase 4 Started");

      phase4.forEach(el => {
        el.object3D.visible = true;
      });
    }

    const bargeButtons = document.querySelectorAll('[socialvr-barge-button=""]');

    bargeButtons.forEach((button) => {
      const d = button.components["socialvr-barge-button"].data;

      if (d) {
        if (d.phaseID <= data.index) {
          button.object3D.visible = true;
          button.classList.remove("interactable");
          button.removeAttribute("animation__spawner-cooldown");
          button.setAttribute("animation__spawner-cooldown", {
            property: "scale",
            delay: 0,
            dur: 350,
            from: { x: 1, y: 1, z: 1 },
            to: { x: 0.001, y: 0.001, z: 0.001 },
            easing: "easeInElastic"
          });
        }
      }
    });
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
      el.setAttribute("socialvr-barge-child", "");
      el.classList.add("interactable");

      // Text
      this.text = document.createElement("a-entity");
      this.text.setAttribute("position", `0 ${this.data.radius + 0.2} 0`);
      this.text.setAttribute("text", `value: ${this.data.text}; align: center; side: double; width: 4;`);
      this.text.setAttribute("geometry", `primitive: plane; height: auto; width: 0.75;`);
      this.text.setAttribute("material", "color: #807e7e;");
      this.text.setAttribute("billboard", "onlyY: true;");
      el.appendChild(this.text);
      
      this.onClick = this.onClick.bind(this);
      this.el.object3D.addEventListener("interact", this.onClick);
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
        if (this.data.phaseID === 1) {
          scene.emit("startBargeEvent");
        }
      } else {
        // Generic Button
        scene.emit(this.data.eventName);
      }
    }
  });

  AFRAME.registerComponent("socialvr-world-mover", {
      init: function () {
          this.moving = false;
          this.destinations = [];
          this.currentDestination = -1;
          this.speed = 1;

          // Initialize Waypoints
          for (let i = 0; i <= 100; i++) {
              const waypoint = document.querySelector(".Waypoint_" + i);

              if (waypoint) {
                  this.destinations.push(waypoint.object3D.position);
              }
          }

          // Networked Events
          const scene = document.querySelector("a-scene");

          scene.addEventListener("startMovingWorld", this._start.bind(this));
          scene.addEventListener("stopMovingWorld", this._stop.bind(this));

          NAF.connection.subscribeToDataChannel("startMovingWorld", this.start.bind(this));
          NAF.connection.subscribeToDataChannel("stopMovingWorld", this.stop.bind(this));
      },

      remove: function () {
          const scene = document.querySelector("a-scene");

          scene.removeEventListener("startMovingWorld");
          scene.removeEventListener("stopMovingWorld");
      },

      tick: function (time, delta) {
          if (this.moving) {
              this.el.object3D.position.z += this.speed * (delta / 1000);
          }
      },

      start: function () {
          this.moving = true;
      },

      stop: function () {
          this.moving = false;
      },

      _start: function () {
          this.start(null, null, {});
          NAF.connection.broadcastData("startMovingWorld", {});
      },

      _stop: function () {
          this.stop(null, null, {});
          NAF.connection.broadcastData("stopMovingWorld", {});
      }
  });

  const scene = document.querySelector("a-scene");

  scene.addEventListener("environment-scene-loaded", () => {
    // Phases

    // Button - Phase 1
    let button = document.createElement("a-entity");
    let position = document.querySelector(".startButton").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0));

    button.setAttribute("socialvr-barge-button", "text: Start; radius: 0.3; color: #C576F6; phaseID: 1");
    button.setAttribute("position", position);
    scene.appendChild(button);

    // Button - Phase 2
    button = document.createElement("a-entity");
    position = document.querySelector(".phase1CompleteButton_phase1").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0));

    button.classList.add("phase1");
    button.setAttribute("socialvr-barge-button", "text: Done; radius: 0.3; color: #C576F6; phaseID: 2");
    button.setAttribute("position", position);
    scene.appendChild(button);

    // Button - Phase 3
    button = document.createElement("a-entity");
    position = document.querySelector(".phase2CompleteButton_phase2").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0));

    button.classList.add("phase2");
    button.setAttribute("socialvr-barge-button", "text: Done; radius: 0.3; color: #C576F6; phaseID: 3");
    button.setAttribute("position", position);
    scene.appendChild(button);

    // Button - Phase 4
    button = document.createElement("a-entity");
    position = document.querySelector(".phase3CompleteButton_phase3").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0));

    button.classList.add("phase3");
    button.setAttribute("socialvr-barge-button", "text: Complete; radius: 0.3; color: #C576F6; phaseID: 4");
    button.setAttribute("position", position);
    scene.appendChild(button);

    // World Mover
    const worldMover = document.createElement("a-entity");
    worldMover.setAttribute("socialvr-world-mover", "");
    scene.appendChild(worldMover);

    window.APP.utils.GLTFModelPlus
      .loadModel("https://statuesque-rugelach-4185bd.netlify.app/assets/moving-world.glb")
      .then((model) => {
        worldMover.setObject3D("mesh", window.APP.utils.threeUtils.cloneObject3D(model.scene, true));
        worldMover.setAttribute("matrix-auto-update", "");
      })
      .catch((e) => {
        console.error(e);
      });
  }, { once: true });

})();
//# sourceMappingURL=development.js.map
