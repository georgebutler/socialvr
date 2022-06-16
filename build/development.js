(function () {
    'use strict';

    let started = -1;

    function setStarted() {
        started = Date.now();
    }

    function process() {
        let knowledge_ranks = [];
        let skills_ranks = [];
        let abilities_ranks = [];
        let selected_canidate = "";

        let knowledge_blocks = [
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

        let skills_blocks = [
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

        let abilities_blocks = [
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

        let canidate_blocks = [
            {
                name: "Zoya A. Chopra",
                model: "https://hubscloud-assets.socialsuperpowers.net/files/eda91395-193b-44d5-af66-327159f80980.glb",
            },
            {
                name: "Robert P. Johnson",
                model: "https://hubscloud-assets.socialsuperpowers.net/files/0f59f587-f4a7-435a-af5d-f8c75a1f5ec6.glb",
            },
            {
                name: "William K. Bevins",
                model: "https://hubscloud-assets.socialsuperpowers.net/files/1e4396b3-3a06-40e8-b33a-811f6da19cd2.glb",
            },
            {
                name: "Kathy L. Stromm",
                model: "https://hubscloud-assets.socialsuperpowers.net/files/40a1d1a6-771d-4ec3-8e23-38e08dc35f91.glb",
            },
        ];

        knowledge_blocks.forEach((item) => {
            item.distance = 9999;
        });

        skills_blocks.forEach((item) => {
            item.distance = 9999;
        });

        abilities_blocks.forEach((item) => {
            item.distance = 9999;
        });

        canidate_blocks.forEach((item) => {
            item.distance = 9999;
        });

        let slotPosition = new THREE.Vector3();

        document.querySelectorAll('[socialvr-barge-slot=""]').forEach((slot) => {
            slot.object3D.getWorldPosition(slotPosition);

            if (slot.components["socialvr-barge-slot"].data.type === "knowledge") {
                document.querySelectorAll('.interactable:not([super-spawner=""])').forEach((interactable) => {
                    if (interactable.components["gltf-model-plus"]) {
                        if (interactable.components["gltf-model-plus"].data.src === knowledge_blocks[0].model) {
                            knowledge_blocks[0].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                        else if (interactable.components["gltf-model-plus"].data.src === knowledge_blocks[1].model) {
                            knowledge_blocks[1].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                        else if (interactable.components["gltf-model-plus"].data.src === knowledge_blocks[2].model) {
                            knowledge_blocks[2].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                        else if (interactable.components["gltf-model-plus"].data.src === knowledge_blocks[3].model) {
                            knowledge_blocks[3].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                    }
                });
            }
            else if (slot.components["socialvr-barge-slot"].data.type === "skills") {
                document.querySelectorAll('.interactable:not([super-spawner=""])').forEach((interactable) => {
                    if (interactable.components["gltf-model-plus"]) {
                        if (interactable.components["gltf-model-plus"].data.src === skills_blocks[0].model) {
                            skills_blocks[0].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                        else if (interactable.components["gltf-model-plus"].data.src === skills_blocks[1].model) {
                            skills_blocks[1].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                        else if (interactable.components["gltf-model-plus"].data.src === skills_blocks[2].model) {
                            skills_blocks[2].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                        else if (interactable.components["gltf-model-plus"].data.src === skills_blocks[3].model) {
                            skills_blocks[3].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                    }
                });
            }
            else if (slot.components["socialvr-barge-slot"].data.type === "abilities") {
                document.querySelectorAll('.interactable:not([super-spawner=""])').forEach((interactable) => {
                    if (interactable.components["gltf-model-plus"]) {
                        if (interactable.components["gltf-model-plus"].data.src === abilities_blocks[0].model) {
                            abilities_blocks[0].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                        else if (interactable.components["gltf-model-plus"].data.src === abilities_blocks[1].model) {
                            abilities_blocks[1].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                        else if (interactable.components["gltf-model-plus"].data.src === abilities_blocks[2].model) {
                            abilities_blocks[2].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                        else if (interactable.components["gltf-model-plus"].data.src === abilities_blocks[3].model) {
                            abilities_blocks[3].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                    }
                });
            }
            else if (slot.components["socialvr-barge-slot"].data.type === "canidate") {
                document.querySelectorAll('.interactable:not([super-spawner=""])').forEach((interactable) => {
                    if (interactable.components["gltf-model-plus"]) {
                        if (interactable.components["gltf-model-plus"].data.src === canidate_blocks[0].model) {
                            canidate_blocks[0].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                        else if (interactable.components["gltf-model-plus"].data.src === canidate_blocks[1].model) {
                            canidate_blocks[1].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                        else if (interactable.components["gltf-model-plus"].data.src === canidate_blocks[2].model) {
                            canidate_blocks[2].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                        else if (interactable.components["gltf-model-plus"].data.src === canidate_blocks[3].model) {
                            canidate_blocks[3].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                        }
                    }
                });

                canidate_blocks.sort(function (a, b) {
                    return a.distance - b.distance
                });

                selected_canidate = canidate_blocks[0].name;
            }
        });

        knowledge_blocks.sort(function (a, b) {
            return a.distance - b.distance
        });

        skills_blocks.sort(function (a, b) {
            return a.distance - b.distance
        });

        abilities_blocks.sort(function (a, b) {
            return a.distance - b.distance
        });

        knowledge_ranks[0] = knowledge_blocks[0].name;
        knowledge_ranks[1] = knowledge_blocks[1].name;
        knowledge_ranks[2] = knowledge_blocks[2].name;

        skills_ranks[0] = skills_blocks[0].name;
        skills_ranks[1] = skills_blocks[1].name;
        skills_ranks[2] = skills_blocks[2].name;

        abilities_ranks[0] = abilities_blocks[0].name;
        abilities_ranks[1] = abilities_blocks[1].name;
        abilities_ranks[2] = abilities_blocks[2].name;

        const data = {
            started_at: started,
            completed_at: Date.now(),
            knowledge: knowledge_ranks,
            skills: skills_ranks,
            abilities: abilities_ranks,
            canidate: selected_canidate
        };

        console.clear();
        console.log(JSON.stringify(data));
    }

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
        this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(11, this.el.object3D);

        if (this.data.phaseID >= 0) {
          // 1 -> Start, 2 -> Finish
          if (this.data.phaseID === 1) {
            setStarted();
            
            this.el.sceneEl.emit("startMovingWorld");
            this.el.parentNode.removeChild(this.el);
          } else if (this.data.phaseID === 2) {
            process();

            this.el.sceneEl.emit("stopMovingWorld");
            this.el.parentNode.removeChild(this.el);
          }
        } else {
          this.el.sceneEl.emit(this.data.eventName);
        }
      }
    });

    AFRAME.registerComponent("socialvr-barge-clock", {
      init: function () {
        this.text = document.createElement("a-entity");
        this.text.setAttribute("text", `value: Time; align: center; side: double; width: 4;`);
        this.text.setAttribute("geometry", `primitive: plane; height: auto; width: 1;`);
        this.text.setAttribute("material", "color: #807e7e; side: double;");
        this.text.setAttribute("animation", "property: rotation; to: 0 -360 0; easing: linear; loop: true; dur: 100000;");

        this.el.appendChild(this.text);
      },

      tick: function () {
        let time = new Date();
        let hours = time.getHours() % 12;
        let minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();
        let ampm = time.getHours() >= 12 ? "PM" : "AM";

        hours = hours ? hours : 12;
        this.text.setAttribute("text", `value: ${hours}:${minutes} ${ampm}; align: center; width: 4;`);
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
                .loadModel("https://statuesque-rugelach-4185bd.netlify.app/assets/moving-world-3.glb")
                .then((model) => {
                    this.el.setObject3D("mesh", window.APP.utils.threeUtils.cloneObject3D(model.scene, true));
                    this.el.setAttribute("matrix-auto-update", "");
                })
                .finally(() => {
                    const skysphere = document.createElement("a-entity");
                    
                    // Load skybox model
                    window.APP.utils.GLTFModelPlus
                    .loadModel("https://statuesque-rugelach-4185bd.netlify.app/assets/360sphere.glb")
                    .then((model) => {
                        // Set model
                        skysphere.setObject3D("mesh", window.APP.utils.threeUtils.cloneObject3D(model.scene, true));
                        skysphere.setAttribute("matrix-auto-update", "");

                        // Disable original sky
                        const skybox = document.querySelector('[skybox=""]');

                        if (skybox) {
                            skybox.removeObject3D("mesh");
                        }
                    });
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

      // Clock
      const clock = document.createElement("a-entity");
      clock.setAttribute("radius", 0.1);
      clock.setAttribute("socialvr-barge-clock", "");
      clock.setAttribute("position", document.querySelector(".clock-placeholder").object3D.position);
      scene.appendChild(clock);

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
      worldMover.setAttribute("socialvr-world-mover", "");
      scene.appendChild(worldMover);

      // Changes camera inspection system to show background, regardless of user preferences.
      const cameraSystem = scene.systems["hubs-systems"].cameraSystem;
      cameraSystem.lightsEnabled = true;

      // Disable floaty physics
      scene.addEventListener("object_spawned", (e) => {
        const floaties = document.querySelectorAll('[floaty-object=""]');

        floaties.forEach((floaty) => {
          floaty.setAttribute("floaty-object", { 
            reduceAngularFloat: true,
            autoLockOnRelease: true,
            gravitySpeedLimit: 0
          });
        });
      });
    }, { once: true });

})();
//# sourceMappingURL=development.js.map
