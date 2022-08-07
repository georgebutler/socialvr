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

    init: function () {
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

    remove: function () {
      this.el.object3D.removeEventListener("interact", this.onClick);
    },

    onClick: function () {
      if (this.data.phaseID >= 0) {
        this.el.sceneEl.emit("logPhaseEvent", { detail: this.data.phaseID });

        if (this.data.phaseID === 1) {
          this.el.sceneEl.emit("startMovingWorld");
        } else if (this.data.phaseID === 4) {
          this.el.sceneEl.emit("stopMovingWorld");
          this.el.sceneEl.emit("generateDataEvent");
        }
      } else {
        this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(18);
        this.el.sceneEl.emit(this.data.eventName);
      }
    }
  });

  AFRAME.registerComponent("socialvr-barge-clock", {
    init: function () {
      this.geometry = new THREE.SphereGeometry(2, 16, 8);
      this.material = new THREE.MeshBasicMaterial({
        alphaTest: 0, 
        visible: false
      });

      this.mesh = new THREE.Mesh(this.geometry, this.material);
      this.el.setObject3D("mesh", this.mesh);

      this.text = document.createElement("a-entity");
      this.text.setAttribute("text", "value: Time; align: center; width: 4;");
      this.text.setAttribute("rotation", "0, 0, 0");
      this.text.setAttribute("geometry", "primitive: plane; height: auto; width: 1;");
      this.text.setAttribute("material", "color: #807e7e;");

      this.text2 = document.createElement("a-entity");
      this.text2.setAttribute("text", "value: Time; align: center; width: 4;");
      this.text2.setAttribute("rotation", "0, 180, 0");
      this.text2.setAttribute("geometry", "primitive: plane; height: auto; width: 1;");
      this.text2.setAttribute("material", "color: #807e7e;");

      this.el.appendChild(this.text);
      this.el.appendChild(this.text2);
      this.el.setAttribute("animation", "property: rotation; to: 0 -360 0; easing: linear; loop: true; dur: 100000;");
    },

    tick: function () {
      let time = new Date();
      let hours = time.getHours() % 12;
      let minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();
      let ampm = time.getHours() >= 12 ? "PM" : "AM";

      hours = hours ? hours : 12;

      this.text.setAttribute("text", `value: ${hours}:${minutes} ${ampm}; align: center; width: 4;`);
      this.text2.setAttribute("text", `value: ${hours}:${minutes} ${ampm}; align: center; width: 4;`);
    }
  });

  AFRAME.registerComponent("socialvr-barge-slot", {
      schema: {
          type: {
              type: "string",
              default: "knowledge"
          },
          rank: {
              type: "number",
              default: 1
          },
          consumed: {
              type: "boolean",
              default: false
          },
          width: {
              type: "number",
              default: 0.5
          },
          height: {
              type: "number",
              default: 0.25
          },
          depth: {
              type: "number",
              default: 1
          }
      },

      init: function () {
          this.geometry = new THREE.BoxGeometry(this.data.width, this.data.height, this.data.depth);
          this.material = new THREE.MeshStandardMaterial({
              color: "#FF0000",
              transparent: true,
              opacity: 0.5
          });

          this.mesh = new THREE.Mesh(this.geometry, this.material);
          this.el.setObject3D("mesh", this.mesh);
          this.el.getObject3D("mesh").visible = false;
      }
  });

  AFRAME.registerComponent("socialvr-barge-data", {
      init: function () {
          this.started = -1;
          this.phaseEvents = [];
          this.clockEvents = [];
          this.knowledge_ranks = [];
          this.skills_ranks = [];
          this.abilities_ranks = [];
          this.selected_canidate = "";

          this.pov_raycaster = new THREE.Raycaster();
          this.last_clock_time = -1;

          this.knowledge_blocks = [
              {
                  name: "Transportation",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/16cf08c7-315e-41fb-a2b1-08602faef8d4.glb",
              },
              {
                  name: "Customer Service",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/1c852441-a9a5-468b-b567-65a9b3f80006.glb",
              },
              {
                  name: "Geography",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/ae06eebb-9fc4-4310-a4dd-5286ebcb3ffd.glb",
              },
              {
                  name: "Public Safety",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/5b19b8ed-32f7-4669-b42c-0b871659bb97.glb",
              }
          ];

          this.skills_blocks = [
              {
                  name: "Troubleshooting",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/13c0b66c-f392-4d2e-bc83-0001c8f12caf.glb"
              },
              {
                  name: "Time Management",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/db4a4fbf-7ccf-483a-afe2-380cee5e24d9.glb"
              },
              {
                  name: "Operations",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/a64ad1c3-dc8a-45f4-9b04-0217c0594c05.glb"
              },
              {
                  name: "Oral & Written Communication",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/a64ad1c3-dc8a-45f4-9b04-0217c0594c05.glb"
              },
              {
                  name: "Coordination",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/760aa9ae-5622-4fa7-8972-0dc251bea580.glb"
              },
              {
                  name: "Critical Decision Making",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/f730c483-084e-4d72-896c-9beee800e0da.glb"
              },
              {
                  name: "Systems Analysis",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/2ad03466-e33b-48cd-80eb-342f212be870.glb"
              }
          ];

          this.abilities_blocks = [
              {
                  name: "Auditory Attention",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/1a2ed09b-f5c7-4945-8d1a-a1413cb3394a.glb"
              },
              {
                  name: "Physical Dexterity",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/baa69f70-0418-4175-a160-507e4bdc8443.glb"
              },
              {
                  name: "Visual Attention",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/9e44c094-6cee-4cd4-be42-129e873e4408.glb"
              },
              {
                  name: "Problem Sensitivity",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/6841869e-9cac-4cb0-9b3d-af04f316880a.glb"
              },
              {
                  name: "Concentration",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/7b4d91c6-faa3-454a-8681-c07f8fce9966.glb"
              },
              {
                  name: "Mental Reasoning",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/62ff8ac3-c2d0-4e9e-9440-c1f0c8c6c77f.glb"
              }
          ];

          this.canidate_blocks = [
              {
                  name: "Zoya A. Chopra",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/dec43ec6-a9a3-4400-b3db-6adc3cce4666.glb",
              },
              {
                  name: "Robert P. Johnson",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/a135ec4e-615c-455b-9a58-7412403a522b.glb",
              },
              {
                  name: "William K. Bevins",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/62f03c4b-3bb5-4998-8bd6-2fdbe6b9fd6b.glb",
              },
              {
                  name: "Kathy L. Stromm",
                  model: "https://hubscloud-assets.socialsuperpowers.net/files/d3a50b69-9340-4eab-b8f0-bb8eac5b2080.glb",
              },
          ];

          this.knowledge_blocks.forEach((item) => { item.distance = 9999; });
          this.skills_blocks.forEach((item) => { item.distance = 9999; });
          this.abilities_blocks.forEach((item) => { item.distance = 9999; });
          this.canidate_blocks.forEach((item) => { item.distance = 9999; });

          this.el.sceneEl.addEventListener("logPhaseEvent", (e) => { this._logPhaseEvent.call(this, e.detail); });
          NAF.connection.subscribeToDataChannel("logPhaseEvent", this.logPhaseEvent.bind(this));

          this.el.sceneEl.addEventListener("logClockEvent", (e) => { this._logClockEvent.call(this, e.detail); });
          NAF.connection.subscribeToDataChannel("logClockEvent", this.logClockEvent.bind(this));

          this.el.sceneEl.addEventListener("generateDataEvent", this._generateData.bind(this));
          NAF.connection.subscribeToDataChannel("generateDataEvent", this.generateData.bind(this));
      },

      tock: function () {
          if (this.started >= 0) {
              this.pov_raycaster.setFromCamera(new THREE.Vector2(), document.getElementById("viewing-camera").object3DMap.camera);
              const time = Date.now();

              if (this.last_clock_time + 1000 <= time) {
                  this.last_clock_time = time;

                  const clock = document.querySelector("[socialvr-barge-clock]");
                  const playerInfo = document.querySelectorAll("[player-info]")[0].components["player-info"];
                  const intersected = this.pov_raycaster.intersectObject(clock.object3D);

                  if (intersected.length >= 1) {
                      this.el.sceneEl.emit("logClockEvent", { 
                          detail: {
                              displayName: playerInfo.displayName,
                              playerSessionId: playerInfo.playerSessionId
                          }
                      });
                  }
              }
          }
      },

      generate() {
          let slotPosition = new THREE.Vector3();

          document.querySelectorAll('[socialvr-barge-slot=""]').forEach((slot) => {
              slot.object3D.getWorldPosition(slotPosition);

              if (slot.components["socialvr-barge-slot"].data.type === "knowledge") {
                  document.querySelectorAll('.interactable:not([super-spawner=""])').forEach((interactable) => {
                      if (interactable.components["gltf-model-plus"]) {
                          if (interactable.components["gltf-model-plus"].data.src === knowledge_blocks[0].model) {
                              this.knowledge_blocks[0].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                          else if (interactable.components["gltf-model-plus"].data.src === knowledge_blocks[1].model) {
                              this.knowledge_blocks[1].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                          else if (interactable.components["gltf-model-plus"].data.src === knowledge_blocks[2].model) {
                              this.knowledge_blocks[2].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                          else if (interactable.components["gltf-model-plus"].data.src === knowledge_blocks[3].model) {
                              this.knowledge_blocks[3].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                      }
                  });
              }
              else if (slot.components["socialvr-barge-slot"].data.type === "skills") {
                  document.querySelectorAll('.interactable:not([super-spawner=""])').forEach((interactable) => {
                      if (interactable.components["gltf-model-plus"]) {
                          if (interactable.components["gltf-model-plus"].data.src === skills_blocks[0].model) {
                              this.skills_blocks[0].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                          else if (interactable.components["gltf-model-plus"].data.src === skills_blocks[1].model) {
                              this.skills_blocks[1].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                          else if (interactable.components["gltf-model-plus"].data.src === skills_blocks[2].model) {
                              this.skills_blocks[2].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                          else if (interactable.components["gltf-model-plus"].data.src === skills_blocks[3].model) {
                              this.skills_blocks[3].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                      }
                  });
              }
              else if (slot.components["socialvr-barge-slot"].data.type === "abilities") {
                  document.querySelectorAll('.interactable:not([super-spawner=""])').forEach((interactable) => {
                      if (interactable.components["gltf-model-plus"]) {
                          if (interactable.components["gltf-model-plus"].data.src === abilities_blocks[0].model) {
                              this.abilities_blocks[0].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                          else if (interactable.components["gltf-model-plus"].data.src === abilities_blocks[1].model) {
                              this.abilities_blocks[1].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                          else if (interactable.components["gltf-model-plus"].data.src === abilities_blocks[2].model) {
                              this.abilities_blocks[2].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                          else if (interactable.components["gltf-model-plus"].data.src === abilities_blocks[3].model) {
                              this.abilities_blocks[3].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                      }
                  });
              }
              else if (slot.components["socialvr-barge-slot"].data.type === "canidate") {
                  document.querySelectorAll('.interactable:not([super-spawner=""])').forEach((interactable) => {
                      if (interactable.components["gltf-model-plus"]) {
                          if (interactable.components["gltf-model-plus"].data.src === canidate_blocks[0].model) {
                              this.canidate_blocks[0].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                          else if (interactable.components["gltf-model-plus"].data.src === canidate_blocks[1].model) {
                              this.canidate_blocks[1].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                          else if (interactable.components["gltf-model-plus"].data.src === canidate_blocks[2].model) {
                              this.canidate_blocks[2].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                          else if (interactable.components["gltf-model-plus"].data.src === canidate_blocks[3].model) {
                              this.canidate_blocks[3].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                          }
                      }
                  });

                  this.canidate_blocks.sort(function (a, b) {
                      return a.distance - b.distance
                  });

                  this.selected_canidate = this.canidate_blocks[0].name;
              }
          });

          this.knowledge_blocks.sort(function (a, b) {
              return a.distance - b.distance
          });

          this.skills_blocks.sort(function (a, b) {
              return a.distance - b.distance
          });

          this.abilities_blocks.sort(function (a, b) {
              return a.distance - b.distance
          });

          this.knowledge_ranks[0] = this.knowledge_blocks[0].name;
          this.knowledge_ranks[1] = this.knowledge_blocks[1].name;
          this.knowledge_ranks[2] = this.knowledge_blocks[2].name;

          this.skills_ranks[0] = this.skills_blocks[0].name;
          this.skills_ranks[1] = this.skills_blocks[1].name;
          this.skills_ranks[2] = this.skills_blocks[2].name;

          this.abilities_ranks[0] = this.abilities_blocks[0].name;
          this.abilities_ranks[1] = this.abilities_blocks[1].name;
          this.abilities_ranks[2] = this.abilities_blocks[2].name;

          const data = {
              started_at: this.started,
              completed_at: Date.now(),
              knowledge: this.knowledge_ranks,
              skills: this.skills_ranks,
              abilities: this.abilities_ranks,
              canidate: this.selected_canidate,
              phase_events: this.phaseEvents,
              clock_events: this.clockEvents
          };

          //console.clear();
          console.log(JSON.stringify(data));
      },

      generateData: function () {
          this.generate();
      },

      _generateData: function () {
          this.generateData(null, null, {});
          NAF.connection.broadcastDataGuaranteed("generateDataEvent", {});
      },

      logPhaseEvent: function (senderId, dataType, data) {
          if (data.phase === 1) {
              this.started = Date.now();
          }

          this.phaseEvents[data.phase - 1] = {
              timestamp: Date.now(),
              phase: `${data.phase}`
          };

          // Remove clicked phase buttons on all clients
          document.querySelectorAll("[socialvr-barge-button]").forEach((element) => {
              if (element.components["socialvr-barge-button"].data.phaseID === data.phase) {
                  this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(18);
                  element.parentNode.removeChild(element);
              }
          });
      },

      _logPhaseEvent: function (e) {
          this.logPhaseEvent(null, null, { phase: e.detail });
          NAF.connection.broadcastDataGuaranteed("logPhaseEvent", { phase: e.detail });
      },

      logClockEvent: function (senderId, dataType, data) {
          this.clockEvents.push({
              timestamp: Date.now(),
              sessionID: data.playerSessionId,
              displayName: data.displayName
          });
      },

      _logClockEvent: function (e) {
          this.logClockEvent(null, null, { ...e.detail });
          NAF.connection.broadcastDataGuaranteed("logClockEvent", { ...e.detail });
      },
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

              this.destinations.push(new THREE.Vector3(10, 0, 0).negate());
              this.destinations.push(new THREE.Vector3(10, 0, 20).negate());
              this.destinations.push(new THREE.Vector3(-10, 10, 20).negate());
              this.destinations.push(new THREE.Vector3(-10, 20, 30).negate());
          }

          // Networked Events
          this.el.sceneEl.addEventListener("startMovingWorld", this._start.bind(this));
          this.el.sceneEl.addEventListener("stopMovingWorld", this._stop.bind(this));

          NAF.connection.subscribeToDataChannel("startMovingWorld", this.start.bind(this));
          NAF.connection.subscribeToDataChannel("stopMovingWorld", this.stop.bind(this));

          // Load environment
          window.APP.utils.GLTFModelPlus
              .loadModel("https://statuesque-rugelach-4185bd.netlify.app/assets/moving-world-5.glb")
              .then((model) => {
                  this.el.setObject3D("mesh", window.APP.utils.threeUtils.cloneObject3D(model.scene, true));
                  this.el.setAttribute("matrix-auto-update", "");
              })
              .finally(() => {
                  // Disable original sky
                  const skybox = document.querySelector('[skybox=""]');

                  if (skybox) {
                      skybox.removeObject3D("mesh");
                  }

                  // Create sky
                  const sky = document.createElement("a-entity");
                  const geometry = new THREE.SphereGeometry(8192, 8, 8);
                  const material = new THREE.ShaderMaterial({
                      side: THREE.BackSide,
                      transparent: false,
                      fog: false,
                      uniforms: {
                          color1: {
                              value: new THREE.Color(0x87CEEB)
                          },
                          color2: {
                              value: new THREE.Color(0xF0FFFF)
                          }
                      },
                      vertexShader: `
                        varying vec2 vUv;
                    
                        void main() {
                          vUv = uv;
                          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                        }
                      `,
                      fragmentShader: `
                        uniform vec3 color1;
                        uniform vec3 color2;
                      
                        varying vec2 vUv;
                        
                        void main() {
                          
                          gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
                        }
                      `
                  });

                  sky.setObject3D("mesh", new THREE.Mesh(geometry, material));
                  this.el.sceneEl.appendChild(sky);
              })
              .catch((e) => {
                  console.error(e);
              });
      },

      remove: function () {
          this.el.sceneEl.removeEventListener("startMovingWorld", this._start.bind(this));
          this.el.sceneEl.removeEventListener("stopMovingWorld", this._stop.bind(this));
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
              "https://hubscloud-assets.socialsuperpowers.net/files/40fb41d1-c6cd-4541-88f2-7386076b01ae.jpg",
              "https://hubscloud-assets.socialsuperpowers.net/files/5a57b59f-e76d-42ae-b01e-371673cf3624.png",
              "https://hubscloud-assets.socialsuperpowers.net/files/4878ef88-4761-485f-bfce-f40bbf577457.png",
              "https://hubscloud-assets.socialsuperpowers.net/files/0a65963c-8957-43c0-916d-da283efa5bf8.png",
              "https://hubscloud-assets.socialsuperpowers.net/files/95c62972-9d00-4e1c-ac42-f003d764c751.png"
          ];

          document.querySelectorAll("[media-image]").forEach((element) => {
              if (removeImages.includes(element.components["media-image"].data.src)) {
                  element.parentNode.removeChild(element);
              }
          });

          const removeClasses = [
              ".tutorialblock1",
              ".tutorialblock2",
              ".tutorialblock3"
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
          NAF.connection.broadcastDataGuaranteed("startMovingWorld", {});
      },

      _stop: function () {
          this.stop(null, null, {});
          NAF.connection.broadcastDataGuaranteed("stopMovingWorld", {});
      }
  });

  const MIC_PRESENCE_VOLUME_THRESHOLD = 0.00001;

  const SPEECH_TIME_PER_TICK = 10; // every speech tick = 10ms of realtime
  const MIN_SPEECH_TIME_FOR_EVENT = 100; // 0.1s realtime
  const MAX_SPEECH_TIME_FOR_EVENT = 5000; // 5s realtime
  const CONTINUOUS_SPEECH_LENIENCY_TIME = 100; // 0.1s realtime

  AFRAME.registerComponent("socialvr-halo", {
      init: function () {
          this.geometry = new THREE.TorusGeometry(0.05, 0.01, 8, 16);
          this.material = new THREE.MeshStandardMaterial({ color: "#FF6782" });

          this.mesh = new THREE.Mesh(this.geometry, this.material);
          this.mesh.rotateX(THREE.Math.degToRad(90));

          this.el.setObject3D("mesh", this.mesh);

          // Audio
          this.localAudioAnalyser = this.el.sceneEl.systems["local-audio-analyser"];
          this.playerInfo = APP.componentRegistry["player-info"][0];

          this.continuousSpeechTime = 0;
          this.continuousSpeechLeniencyTime = 0;
      },

      tock: function (time, delta) {
          const muted = this.playerInfo.data.muted;
          const speaking = !muted && this.localAudioAnalyser.volume > MIC_PRESENCE_VOLUME_THRESHOLD;

          if (speaking) {
              if (this.continuousSpeechTime === 0) ;

              this.continuousSpeechTime += SPEECH_TIME_PER_TICK;
              this.continuousSpeechLeniencyTime = CONTINUOUS_SPEECH_LENIENCY_TIME;

              if (this.continuousSpeechTime <= MAX_SPEECH_TIME_FOR_EVENT) {
                  // Size up
                  console.log("Size up");
              } else {
                  alert("limit reached");
              }
          } else {
              if (this.continuousSpeechLeniencyTime > 0) {
                  this.continuousSpeechLeniencyTime -= SPEECH_TIME_PER_TICK;
              }
              if (this.continuousSpeechLeniencyTime <= 0 && this.continuousSpeechTime >= MIN_SPEECH_TIME_FOR_EVENT) ;
          }

          /** 
          if (!this.data.target) { return; }
          if (!NAF.utils.isMine(this.el)) { return; }

          const scale = 0.1 * (delta / 1000);

          this.mesh.scale.addScalar(scale);
          this.mesh.scale.set(this.mesh.scale.x, this.mesh.scale.y, 1);
          this.mesh.matrixAutoUpdate = true;
          */
      }
  });

  AFRAME.registerComponent("socialvr-toolbox-dashboard", {
      init: function () {
          this.geometry = new THREE.SphereGeometry(0.02, 16, 8);
          this.material = new THREE.MeshStandardMaterial({ color: "#FF6782" });
          this.mesh = new THREE.Mesh(this.geometry, this.material);

          this.el.setObject3D("mesh", this.mesh);
          this.pos = new THREE.Vector3();

          this.features = {
              CONVERSATION_BALANCE: {
                  name: "cb",
                  color: "#fff182",
                  emissiveColor: "#807100",
                  icon: "../assets/images/1F4AC_color.png",
                  enabled: false,
                  showButton: true,
                  elements: []
              },
              EMOJI: {
                  name: "emoji",
                  color: "#c4a3e6",
                  emissiveColor: "#8000ff",
                  icon: "../assets/images/1F48C_color.png",
                  enabled: false,
                  showButton: true,
                  elements: []
              },
              BUILDINGKIT: {
                  name: "buildingkit",
                  color: "#91c7ff",
                  emissiveColor: "#002f61",
                  icon: "../assets/images/1F48C_color.png",
                  enabled: false,
                  showButton: false,
                  elements: []
              },
              BARGE: {
                  name: "barge",
                  color: "#FF0000",
                  icon: "../assets/images/26F5_color.png",
                  enabled: false,
                  showButton: false,
                  elements: []
              },
              HALO: {
                  name: "halo",
                  color: "#0000FF",
                  icon: "../assets/images/1F607_color.png",
                  enabled: false,
                  showButton: false,
                  elements: []
              }
          };

          window.APP.hubChannel.presence.onJoin(() => {
              if (this.features.HALO.enabled) {
                  this.createHalos();
              }
          });

          this.el.sceneEl.addEventListener("enableFeatureHalo", (e) => { this._enableFeatureHalo.call(this); });
          NAF.connection.subscribeToDataChannel("enableFeatureHalo", this.enableFeatureHalo.bind(this));

          this.createButtons();
      },

      createButtons: function () {
          let featureCount = 0;

          // TODO: Maybe use a filter to avoid another loop? Not sure if it matters.
          Object.keys(this.features).forEach(key => {
              let feature = this.features[key];

              if (feature.showButton) {
                  featureCount++;
              }
          });

          const r = 0.5;
          let step = Math.PI * 2 / featureCount;
          let angle = this.el.object3D.rotation.y;

          this.el.object3D.getWorldPosition(this.pos);

          Object.keys(this.features).forEach(key => {
              let feature = this.features[key];

              if (feature.showButton) {
                  let button = document.createElement("a-entity");
                  let position = new THREE.Vector3(this.pos.x + r * Math.sin(angle), this.pos.y, this.pos.z + r * Math.cos(angle));

                  button.setAttribute("socialvr-toolbox-dashboard-button", `icon: ${feature.icon}; radius: 0.1; color: ${feature.color}; emissiveColor: ${feature.emissiveColor}; featureName: ${feature.name};`);
                  button.setAttribute("position", position);
                  window.APP.scene.appendChild(button);

                  angle += step;
              }
          });
      },

      createHalos: function () {
          APP.componentRegistry["player-info"].forEach((playerInfo) => {
              if (!playerInfo.socialVRHalo) {
                  const halo = document.createElement("a-entity");

                  halo.setAttribute("socialvr-halo", "");
                  halo.setAttribute("position", "0 1.75 0");

                  // hack but it works.
                  playerInfo.el.appendChild(halo);
                  playerInfo.socialVRHalo = true;

                  this.features.HALO.elements.push(halo);
              }
          });
      },

      enableFeatureHalo: function () {
          this.features.HALO.enabled = true;
          this.createHalos();
          console.log("[SocialVR]: Halos Enabled");
      },

      _enableFeatureHalo: function () {
          this.enableFeatureHalo(null, null, {});
          NAF.connection.broadcastDataGuaranteed("enableFeatureHalo", {});
      },

      enableFeatureBarge: function () {
          // Button
          let button = document.createElement("a-entity");
          let position = document.querySelector(".startButton").object3D.position.add(new THREE.Vector3(0, 0.5, 0));

          button.setAttribute("socialvr-barge-button", "text: Start; radius: 0.3; color: #C576F6; phaseID: 1");
          button.setAttribute("position", position);
          window.APP.scene.appendChild(button);

          this.features.BARGE.elements.push(button);

          // Button
          button = document.createElement("a-entity");
          position = document.querySelector(".CompleteButton_phase1").object3D.position.add(new THREE.Vector3(0, 0.5, 0));

          button.setAttribute("socialvr-barge-button", "text: Next Task; radius: 0.3; color: #C576F6; phaseID: 2");
          button.setAttribute("position", position);
          window.APP.scene.appendChild(button);

          this.features.BARGE.elements.push(button);

          // Button
          button = document.createElement("a-entity");
          position = document.querySelector(".CompleteButton_phase2").object3D.position.add(new THREE.Vector3(0, 0.5, 0));

          button.setAttribute("socialvr-barge-button", "text: Next Task; radius: 0.3; color: #C576F6; phaseID: 3");
          button.setAttribute("position", position);
          window.APP.scene.appendChild(button);

          this.features.BARGE.elements.push(button);

          // Button
          button = document.createElement("a-entity");
          position = document.querySelector(".CompleteButton_phase3").object3D.position.add(new THREE.Vector3(0, 0.5, 0));

          button.setAttribute("socialvr-barge-button", "text: Complete; radius: 0.3; color: #C576F6; phaseID: 4");
          button.setAttribute("position", position);
          window.APP.scene.appendChild(button);

          this.features.BARGE.elements.push(button);

          // Clock
          const clock = document.createElement("a-entity");
          clock.setAttribute("radius", 0.1);
          clock.setAttribute("socialvr-barge-clock", "");
          clock.setAttribute("position", document.querySelector(".clock-placeholder").object3D.position);
          window.APP.scene.appendChild(clock);

          this.features.BARGE.elements.push(clock);

          // Ranking Slots
          for (let index = 1; index <= 3; index++) {
              const slot = document.createElement("a-entity");
              slot.setAttribute("position", { x: 0, y: -1 + (0.4 * index), z: 0 });
              slot.setAttribute("socialvr-barge-slot", `type: knowledge; rank: ${4 - index}`);
              document.querySelector(".knowledgeFrame_phase1").appendChild(slot);

              this.features.BARGE.elements.push(slot);
          }

          for (let index = 1; index <= 3; index++) {
              const slot = document.createElement("a-entity");
              slot.setAttribute("position", { x: 0, y: -1 + (0.4 * index), z: 0 });
              slot.setAttribute("socialvr-barge-slot", `type: abilities; rank: ${4 - index}`);
              document.querySelector(".KSA_ranking_frameglb_1_phase1").appendChild(slot);

              this.features.BARGE.elements.push(slot);
          }

          for (let index = 1; index <= 3; index++) {
              const slot = document.createElement("a-entity");
              slot.setAttribute("position", { x: 0, y: -1 + (0.4 * index), z: 0 });
              slot.setAttribute("socialvr-barge-slot", `type: skills; rank: ${4 - index}`);
              document.querySelector(".KSA_ranking_frameglb_phase1").appendChild(slot);

              this.features.BARGE.elements.push(slot);
          }

          // Canidate Slot
          const slot = document.createElement("a-entity");
          slot.setAttribute("socialvr-barge-slot", `type: canidate; rank: 1; width: 0.5; height: 1; depth: 1;`);
          document.querySelector(".candidate_frameglb_phase3").appendChild(slot);

          this.features.BARGE.elements.push(slot);

          // World Mover
          const worldMover = document.createElement("a-entity");
          worldMover.setAttribute("socialvr-world-mover", "");
          window.APP.scene.appendChild(worldMover);

          this.features.BARGE.elements.push(worldMover);

          // Data Logger
          const dataLogger = document.createElement("a-entity");
          dataLogger.setAttribute("socialvr-barge-data", "");
          window.APP.scene.appendChild(dataLogger);

          this.features.BARGE.elements.push(dataLogger);
      }
  });

  AFRAME.registerComponent("socialvr-toolbox-dashboard-button", {
      schema: {
          icon: {
              type: "string",
              default: ""
          },
          featureName: {
              type: "string",
              default: ""
          },
          radius: {
              type: "number",
              default: 0.1
          },
          color: {
              type: "color",
              default: "#FFF"
          },
          emissiveColor: {
              type: "color",
              default: "#000"
          }
      },

      init: function () {
          this.geometry = new THREE.SphereGeometry(this.data.radius, 16, 8);
          this.material = new THREE.MeshStandardMaterial({
              color: this.data.color,
              emissive: this.data.emissiveColor,
              roughness: 1,
          });

          this.mesh = new THREE.Mesh(this.geometry, this.material);

          this.el.setObject3D("mesh", this.mesh);
          this.el.setAttribute("tags", "singleActionButton: true");
          this.el.setAttribute("is-remote-hover-target", "");
          this.el.setAttribute("hoverable-visuals", "");
          this.el.setAttribute("billboard", "onlyY: true;");
          this.el.classList.add("interactable");

          this.image = document.createElement("a-image");
          this.image.setAttribute("position", `0 ${this.data.radius + 0.01} 0`);
          this.image.setAttribute("rotation", "90 180 0");
          this.image.setAttribute("height", `${this.data.radius}`);
          this.image.setAttribute("width", `${this.data.radius}`);
          this.image.setAttribute("src", `${this.data.icon}`);
          this.el.appendChild(this.image);

          this.onClick = this.onClick.bind(this);
          this.el.object3D.addEventListener("interact", this.onClick);
      },

      remove: function () {
          this.el.object3D.removeEventListener("interact", this.onClick);
      },

      onClick: function () {
          this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(18);

          if (this.data.featureName === "halo") {
              this.el.sceneEl.emit("enableFeatureHalo", {});
          }
      }
  });

  const SPEED = 0.005;      // units per frame
  const ARC = 2;            // higher = more parabolic
  const AUDIO_THRESH = 10;  // distance to target to play audio cue
  const SOUND = 15;         // sound effect choice
  const DURATION = 3;       // duration over target before disappearing

  AFRAME.registerComponent("socialvr-emoji", {
    schema: {
      target: { default: null }
    },

    init() {
      // prevent auto remove
      this.el.removeAttribute("owned-object-cleanup-timeout");

      // initial position of target
      this.targetInitPos = this.data.target.object3D.position.clone();
      this.targetInitPos.y += 2;

      // parabolic path
      let emojiPos = this.el.object3D.position;
      let pt1 = new THREE.Vector3().lerpVectors(emojiPos, this.targetInitPos, 0.33);
      pt1.y += ARC;
      let pt2 = new THREE.Vector3().lerpVectors(emojiPos, this.targetInitPos, 0.66);
      pt2.y += ARC;
      this.curve = new THREE.CubicBezierCurve3(emojiPos, pt1, pt2, this.targetInitPos);
      this.timeElapsed = 0;

      // audio cue
      this.soundPlayed = false;
      this.audio = this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
        SOUND,
        this.el.object3D,
        true
      );
      this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.stopPositionalAudio(this.audio);
    },

    tick(t, dt) {
      let totalTime = this.curve.getLength() / SPEED;
      let progress = this.timeElapsed / totalTime;

      let emojiPos = this.el.object3D.position;
      let targetPos = this.data.target.object3D.position.clone();
      targetPos.y += 2;

      // audio cue
      const targetName = this.data.target.getAttribute("socialvr-emoji-target").name;
      console.log(targetName);
      let dist = emojiPos.distanceTo(targetPos);
      if (!this.soundPlayed && dist < AUDIO_THRESH) {
        NAF.connection.broadcastData("playSound", { sound: SOUND, emojiID: this.el.id, targetName: targetName });
        this.soundPlayed = true;
      }

      // movement
      if (progress >= 1) {
        // reached target
        emojiPos.copy(targetPos);

        this.el.setAttribute("owned-object-cleanup-timeout", "ttl", DURATION);

        NAF.connection.broadcastData("stopSound", { emojiID: this.el.id, targetName: targetName });
      } else {
        // en route to target
        emojiPos.copy(this.curve.getPointAt(progress));

        let targetMovement = targetPos.sub(this.targetInitPos);
        emojiPos.add(targetMovement);
      }

      this.timeElapsed += dt;
    }
  });

  function sendEmoji(model, particleEmitterConfig, target) {
    const emoji = window.APP.utils.addMedia(model, "#interactable-emoji").entity;
    emoji.setAttribute("offset-relative-to", {
      target: "#avatar-pov-node",
      offset: { x: 0, y: 0, z: -1.5 }
    });
    emoji.addEventListener("model-loaded", () => {
      let particleEmitter = emoji.querySelector(".particle-emitter");
      particleEmitter.setAttribute("particle-emitter", particleEmitterConfig);

      emoji.setAttribute("socialvr-emoji", "target", target );
    });
  }

  AFRAME.registerComponent("socialvr-emoji-target", {
      dependencies: ["is-remote-hover-target"],

      schema: {
          name: { default: "" }
      },

      init: function () {
          console.log("[Social VR] Emoji Target - Initialized");

          this.el.setAttribute("tags", "singleActionButton: true");
          this.el.setAttribute("css-class", "interactable");

          // hover state visual
          let hoverVisModel = window.APP.utils.emojis[0].model;
          this.hoverVis = window.APP.utils.addMedia(hoverVisModel, "#static-media", null, null, false, false, false, {}, false, this.el).entity;
          this.hoverVis.object3D.position.y += 2;
          this.hoverVis.object3D.scale.copy(new THREE.Vector3(0.5, 0.5, 0.5));
          this.hoverVis.object3D.visible = false;

          this.el.addEventListener("hover", this.onHover.bind(this));
          this.el.addEventListener("unhover", this.onUnhover.bind(this));
          this.el.object3D.addEventListener("interact", this.onClick.bind(this));
      },

      remove: function () {
          this.el.removeEventListener("hover", this.onHover.bind(this));
          this.el.removeEventListener("unhover", this.onUnhover.bind(this));
          this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
      },

      tick: function () {
          // update hover state visual to face this player
          this.hoverVis.object3D.lookAt(this.system.head.object3D.getWorldPosition(new THREE.Vector3()));
      },

      onHover: function () {
          this.hoverVis.object3D.visible = true;
      },

      onUnhover: function () {
          this.hoverVis.object3D.visible = false;
      },

      onClick: function () {
          if (!this.system.hudAnchor.querySelector(".socialvr-emoji-button")) {
              const hudScale = (this.system.VR) ? 0.2 : 0.5;
              const hudX = (this.system.VR) ? -0.6 : -1.5;
              const hudY = (this.system.VR) ? 1.4 : -0.5;
              const hudZ = (this.system.VR) ? -1 : -1.5;
              const hudSpacing = (this.system.VR) ? 0.2 : 0.5;

              let x = hudX;
              window.APP.utils.emojis.forEach(({ model, particleEmitterConfig }) => {
                  const emoji = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;

                  emoji.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));
                  emoji.object3D.position.copy(new THREE.Vector3(x, hudY, hudZ));
                  x += hudSpacing;

                  particleEmitterConfig.startVelocity.y = 0;
                  particleEmitterConfig.endVelocity.y = -2;

                  emoji.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
                  emoji.className = "socialvr-emoji-button";
              });

              const cancelButton = document.createElement("a-entity");
              cancelButton.setAttribute("socialvr-emoji-cancel-button", "");
              this.system.hudAnchor.appendChild(cancelButton);
              cancelButton.object3D.position.copy(new THREE.Vector3(0, hudY - 0.3, hudZ));
              this.el.sceneEl.systems["socialvr-emoji-button"].registerCancel(cancelButton);

              // // custom model, local: change url for each ngrok session, remote: change url to netlify
              // // TODO: do this from Spoke instead
              // const url = "https://6f50-2601-645-c000-8880-7411-5a9c-1946-ff10.ngrok.io";
              // const modelURL = url + "/assets/rubber_duck.glb";
              // const particleURL = url + "/assets/rubber_duck.png";
              // const model = new URL(modelURL, window.location).href;
              // const particleEmitterConfig = {
              //   src: new URL(particleURL, window.location).href,
              //   resolve: false,
              //   particleCount: 20,
              //   startSize: 0.01,
              //   endSize: 0.2,
              //   sizeRandomness: 0.05,
              //   lifetime: 1,
              //   lifetimeRandomness: 0.2,
              //   ageRandomness: 1,
              //   startVelocity: { x: 0, y: 0, z: 0 },
              //   endVelocity: { x: 0, y: -2, z: 0 },
              //   startOpacity: 1,
              //   middleOpacity: 1,
              //   endOpacity: 0
              // };

              // const button = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;
              // const buttonY = (this.system.VR) ? hudY + 0.2 : hudY + 0.4;
              // button.object3D.position.copy(new THREE.Vector3(0, buttonY, hudZ));
              // button.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));

              // button.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
              // button.className = "socialvr-emoji-button";
          }
      }
  });

  AFRAME.registerComponent("socialvr-emoji-button", {
      dependencies: ["is-remote-hover-target"],

      schema: {
          model: { default: null },
          particleEmitterConfig: {
              default: null,
              parse: v => (typeof v === "object" ? v : JSON.parse(v)),
              stringify: JSON.stringify
          },
          target: { default: null }
      },

      init: function () {
          console.log("[Social VR] Emoji Button Component - Initialized");

          this.el.setAttribute("tags", "singleActionButton: true");
          this.el.setAttribute("css-class", "interactable");
          this.el.object3D.addEventListener("interact", this.onClick.bind(this));

          this.system.registerEmoji(this.el);
      },

      remove: function () {
          this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
      },

      onClick: function () {
          sendEmoji(this.data.model, this.data.particleEmitterConfig, this.data.target);

          this.el.sceneEl.systems["socialvr-emoji-button"].unregister();
      }
  });

  AFRAME.registerComponent("socialvr-emoji-cancel-button", {
      dependencies: ["is-remote-hover-target"],

      init: function () {
          console.log("[Social VR] Emoji Cancel Button Component - Initialized");

          this.el.setAttribute("geometry", "primitive:plane; height:0.1; width:0.2");
          this.el.setAttribute("text", "value:CANCEL; align:center; color:black; height:0.2; width:0.6");

          this.el.setAttribute("tags", "singleActionButton: true");
          this.el.setAttribute("css-class", "interactable");
          this.el.object3D.addEventListener("interact", this.onClick.bind(this));
      },

      remove: function () {
          this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
      },

      onClick: function () {
          this.el.sceneEl.systems["socialvr-emoji-button"].unregister();
      }
  });

  AFRAME.registerComponent("socialvr-emoji-audio", {
      init: function () {
          console.log("[Social VR] Emoji Manager Component - Initialized");

          this.emojiAudio = {};

          NAF.connection.subscribeToDataChannel("playSound", this.playSound.bind(this));
          NAF.connection.subscribeToDataChannel("stopSound", this.stopSound.bind(this));
      },

      tick: function () {
          // have to do this here cus displayName only applies once in room
          this.name = window.APP.componentRegistry["player-info"][0].displayName;
      },

      remove: function () {
          NAF.connection.unsubscribeToDataChannel("playSound");
          NAF.connection.unsubscribeToDataChannel("stopSound");
      },

      playSound: function (senderId, dataType, data, targetId) {
          let emoji = document.getElementById(data.emojiID);

          console.log(data.targetName);
          console.log(this.name);

          if (data.targetName == this.name) {
              let audio = this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
                  data.sound,
                  emoji.object3D,
                  true
              );

              this.emojiAudio[data.emojiID] = audio;
          }
      },

      stopSound: function (senderId, dataType, data, targetId) {
          if (data.targetName == this.name) {
              let audio = this.emojiAudio[data.emojiID];

              this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.stopPositionalAudio(audio);
          }
      },
  });

  AFRAME.registerSystem("socialvr-emoji-target", {
    init: function () {
      this.VR = false;
      this.head = window.APP.componentRegistry["player-info"][0].el.querySelector("#avatar-pov-node");
      this.hudAnchor = this.head;

      this.hoverEl = null;

      this.el.addEventListener("enter-vr", this.enterVR.bind(this));
      this.el.addEventListener("exit-vr", this.exitVR.bind(this));
    },

    remove: function () {
      this.el.removeEventListener("enter-vr", this.enterVR.bind(this));
      this.el.removeEventListener("exit-vr", this.exitVR.bind(this));
    },

    enterVR: function () {
      this.VR = true;
      this.hudAnchor = window.APP.componentRegistry["player-info"][0].el.querySelector(".model");
    },

    exitVR: function () {
      this.VR = false;
      this.hudAnchor = this.head;
    },

    tick: function () {
      // TODO: dont do this in tick, do it as players join instead
      window.APP.componentRegistry["player-info"].forEach(player => {
        player.el.setAttribute("socialvr-emoji-target", "name", player.displayName);
      });

      // hover state visual
      let hudOpen = this.hudAnchor.querySelector(".socialvr-emoji-button");
      let currHoverEl = this.el.systems.interaction.state.rightRemote.hovered;

      if (!hudOpen && currHoverEl && currHoverEl.getAttribute("socialvr-emoji-target")) {
        if (!this.hoverEl) {
          currHoverEl.emit("hover");
          this.hoverEl = currHoverEl;
        }
      } else {
        if (this.hoverEl) {
          this.hoverEl.emit("unhover");
          this.hoverEl = null;
        }
      }
    }
  });

  AFRAME.registerSystem("socialvr-emoji-button", {
      init: function () {
          console.log("[Social VR] Emoji Button System - Initialized");
          this.emojiButtons = [];
          this.cancelButton = null;
      },

      // register single emoji button
      registerEmoji: function (emojiButton) {
          this.emojiButtons.push(emojiButton);
      },

      registerCancel: function (cancelButton) {
          this.cancelButton = cancelButton;
      },

      // unregister all emoji buttons
      unregister: function () {
          while (this.emojiButtons.length > 0) {
              this.emojiButtons[0].parentEl.removeChild(this.emojiButtons[0]);
              this.emojiButtons.shift();
          }

          this.cancelButton.parentEl.removeChild(this.cancelButton);
          this.cancelButton = null;
      }
  });

  window.APP.scene.addEventListener("environment-scene-loaded", () => {
    const dashboard = document.createElement("a-entity");

    dashboard.setAttribute("socialvr-toolbox-dashboard", "");
    dashboard.setAttribute("position", new THREE.Vector3(0, 1.2, 0));
    window.APP.scene.appendChild(dashboard);

    const emojiAudio = document.createElement("a-entity");
    emojiAudio.setAttribute("socialvr-emoji-audio", "");
    window.APP.scene.appendChild(emojiAudio);

    const dummy = document.createElement("a-entity");
    dummy.setAttribute("socialvr-emoji-target", "");
    window.APP.scene.appendChild(dummy);

    // Backup command
    window.logBargeData = () => {
      window.APP.scene.emit("generateDataEvent");
    };

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

})();
//# sourceMappingURL=development.js.map
