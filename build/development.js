(function () {
  'use strict';

  AFRAME.registerComponent("socialvr-barge-button", {
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
      this.geometry = new THREE.SphereGeometry(this.data.radius, 16, 8);
      this.material = new THREE.MeshStandardMaterial({
        color: this.data.color,
        roughness: 0.5,
      });

      this.mesh = new THREE.Mesh(this.geometry, this.material);

      this.el.setObject3D("mesh", this.mesh);
      this.el.setAttribute("tags", "singleActionButton: true");
      this.el.setAttribute("is-remote-hover-target", "");
      this.el.setAttribute("hoverable-visuals", "");
      this.el.classList.add("interactable");

      // Text
      this.text = document.createElement("a-entity");
      this.text.setAttribute("position", `0 ${this.data.radius + 0.2} 0`);
      this.text.setAttribute("text", `value: ${this.data.text}; align: center; side: double; width: 4;`);
      this.text.setAttribute("geometry", `primitive: plane; height: auto; width: 0.75;`);
      this.text.setAttribute("material", "color: #807e7e;");
      this.text.setAttribute("billboard", "onlyY: true;");
      this.el.appendChild(this.text);
      
      this.onClick = this.onClick.bind(this);
      this.el.object3D.addEventListener("interact", this.onClick);
    },

    remove: function() {
      this.el.object3D.removeEventListener("interact", this.onClick);
    },

    onClick: function() {
      this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(11, this.el.object3D);

      if (this.data.phaseID >= 0) {
        // 1 -> Start, 2 -> Finish
        if (this.data.phaseID === 1) {        
          this.el.sceneEl.emit("startMovingWorld");
          this.el.parentNode.removeChild(this.el);
        } else if (this.data.phaseID === 2) {
          this.el.sceneEl.emit("stopMovingWorld");
          this.el.parentNode.removeChild(this.el);
        }
      } else {
        this.el.sceneEl.emit(this.data.eventName);
      }
    }
  });

  AFRAME.registerComponent("socialvr-world-mover", {
      init: function () {
          this.moving = false;
          this.destinations = [];
          this.currentDestination = 0;
          this.direction = new window.APP.utils.THREE.Vector3(0, 0, 0);
          this.speed = 1;
          this.lastCheck = 0;

          // Initialize Waypoints
          for (let i = 0; i <= 100; i++) {
              const waypoint = document.querySelector(".Waypoint_" + i);

              if (waypoint) {
                  this.destinations.push(waypoint.object3D.position.negate());

                  console.log(`Waypoint [${i}]: ${waypoint.object3D.position}`);
              }
          }

          if (this.destinations.length >= 1) {
              console.log(`Registered ${this.destinations.length} waypoints.`);
          } else {
              console.warn("No waypoints found!");
              console.warn("Registering default waypoints.");

              this.destinations.push(new window.APP.utils.THREE.Vector3(10, 0, 0).negate());
              this.destinations.push(new window.APP.utils.THREE.Vector3(10, 0, 20).negate());
              this.destinations.push(new window.APP.utils.THREE.Vector3(-10, 10, 20).negate());
              this.destinations.push(new window.APP.utils.THREE.Vector3(-10, 20, 30).negate());
          }

          // Networked Events
          this.el.sceneEl.addEventListener("startMovingWorld", this._start.bind(this));
          this.el.sceneEl.addEventListener("stopMovingWorld", this._stop.bind(this));

          NAF.connection.subscribeToDataChannel("startMovingWorld", this.start.bind(this));
          NAF.connection.subscribeToDataChannel("stopMovingWorld", this.stop.bind(this));

          // Load environment
          window.APP.utils.GLTFModelPlus
              .loadModel("https://statuesque-rugelach-4185bd.netlify.app/assets/moving-world-2.glb")
              .then((model) => {
                  this.el.setObject3D("mesh", window.APP.utils.threeUtils.cloneObject3D(model.scene, true));
                  this.el.setAttribute("matrix-auto-update", "");
              })
              .finally(() => {
                  // Disable skybox
                  document.querySelector("[skybox]").components["skybox"].remove();
              })
              .catch((e) => {
                  console.error(e);
              });
      },

      remove: function () {
          this.el.sceneEl.removeEventListener("startMovingWorld");
          this.el.sceneEl.removeEventListener("stopMovingWorld");
      },

      tick: function (time, delta) {
          if (this.moving) {
              const target = this.destinations[this.currentDestination];

              if (target) {
                  this.direction.copy(target).sub(this.el.object3D.position);

                  if (this.el.object3D.position.distanceToSquared(target) >= 1) {
                      this.direction.multiplyScalar(this.speed / this.direction.length() * (delta / 1000));

                      this.el.object3D.position.x += this.direction.x;
                      this.el.object3D.position.y += this.direction.y;
                      this.el.object3D.position.z += this.direction.z;
                  } else {
                      if (isNaN(this.lastCheck) || time >= this.lastCheck) {
                          this.lastCheck = time + 100;
                          this.currentDestination = this.currentDestination + 1;
                      }
                  }
              } else {
                  this.moving = false;
              }
          }
      },

      start: function () {
          this.moving = true;

          // Remove hangar objects
          const removeImages = [
              "https://hubscloud-assets.socialsuperpowers.net/files/04ff2033-e9f6-4f82-991a-0d7d530062f5.jpg",
              "https://hubscloud-assets.socialsuperpowers.net/files/40fb41d1-c6cd-4541-88f2-7386076b01ae.jpg"
          ];

          document.querySelectorAll("[media-image]").forEach((element) => {
              if (removeImages.includes(element.components["media-image"].data.src)) {
                  element.parentNode.removeChild(element);
              }
          });

          const removeClasses = [
              ".ReadMe__setInvisibleOnBargeMove",
              ".GrabMe__setInvisibleOnBargeMove"
          ];

          removeClasses.forEach((target) => {
              const element = document.querySelector(target);

              if (element) {
                  element.parentNode.removeChild(element);
              }
          });
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
    // Button
    let button = document.createElement("a-entity");
    let position = document.querySelector(".startButton").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0));

    button.setAttribute("socialvr-barge-button", "text: Start; radius: 0.3; color: #C576F6; phaseID: 1");
    button.setAttribute("position", position);
    scene.appendChild(button);

    // Button
    button = document.createElement("a-entity");
    position = document.querySelector(".CompleteButton_phase3").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0));

    button.setAttribute("socialvr-barge-button", "text: Complete; radius: 0.3; color: #C576F6; phaseID: 2");
    button.setAttribute("position", position);
    scene.appendChild(button);

    // World Mover
    const worldMover = document.createElement("a-entity");
    worldMover.setAttribute("socialvr-world-mover", "");
    scene.appendChild(worldMover);

    // Changes camera inspection system to show background, regardless of user preferences.
    const cameraSystem = scene.systems["hubs-systems"].cameraSystem;
    cameraSystem.lightsEnabled = true;

    // Disable floaty physics
    scene.addEventListener("object_spawned", (e) => {
      const floaties = document.querySelectorAll('[floaty-object=""]');

      floaties.forEach((floaty) => {
        floaty.setAttribute("floaty-object", { reduceAngularFloat: true, releaseGravity: -1 });
      });
    });
  }, { once: true });

})();
//# sourceMappingURL=development.js.map
