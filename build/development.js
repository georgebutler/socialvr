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
          this.geometry = new THREE.SphereGeometry(0.5, 16, 8);
          this.material = new THREE.MeshStandardMaterial({ color: "#FF6782" });
          this.mesh = new THREE.Mesh(this.geometry, this.material);

          this.el.setObject3D("mesh", this.mesh);
          this.pos = new THREE.Vector3();

          this.createButtons();
      },

      createButtons: function() {
          const num = 6;
          const r = 4.0;
  		let step = Math.PI * 2 / num;
          let angle = this.el.object3D.rotation.y;

          this.el.object3D.getWorldPosition(this.pos);

          for (let i = 0; i <= num; i++) {
              let button = document.createElement("a-entity");
              let position = new THREE.Vector3(this.pos.x + r * Math.sin(angle), this.pos.y, this.pos.z + r * Math.cos(angle));
          
              button.setAttribute("socialvr-barge-button", "text: Toggle; radius: 0.3; color: #C576F6; phaseID: 1");
              button.setAttribute("position", position);
              window.APP.scene.appendChild(button);

              angle += step;
          }

          window.APP.hubChannel.sendMessage("Test message", "chat");
      }
  });

  window.APP.scene.addEventListener("environment-scene-loaded", () => {

    // Dashboard
    {
      let dashboard = document.createElement("a-entity");

      dashboard.setAttribute("socialvr-toolbox-dashboard", "");
      dashboard.setAttribute("position", new THREE.Vector3(0, 3, 0));
      window.APP.scene.appendChild(dashboard);
    }
  }, { once: true });

  // Halo
  window.APP.hubChannel.presence.onJoin(() => {
  });

})();
//# sourceMappingURL=development.js.map
