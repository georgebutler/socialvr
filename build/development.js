(function () {
    'use strict';

    const vectorRequiresUpdate = (epsilon) => {
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
    };

    const sendLog = async (endpoint, obj) => {
        try {
            return await fetch(`https://log.socialsuperpowers.net/api/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(obj)
            })
        } catch (error) {
            console.error(`Log could not be sent: ${error}`);
        }
    };

    function initSchemas() {
        // NAF Template (Emoji)
        const assets = document.querySelector("a-assets");
        const newTemplate = document.createElement("template");
        newTemplate.id = "sent-emoji";

        newTemplate.content.appendChild(document.createElement("a-entity"));
        assets.appendChild(newTemplate);

        // NAF Schema (Emoji)
        const emojiSchema = { ...NAF.schemas.schemaDict["#static-media"] };
        emojiSchema.template = "#sent-emoji";
        emojiSchema.components.push({ component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001) });
        emojiSchema.components.push({ component: "rotation", requiresNetworkUpdate: vectorRequiresUpdate(0.5) });
        emojiSchema.components.push({ component: "scale", requiresNetworkUpdate: vectorRequiresUpdate(0.001) });
        emojiSchema.components.push({ component: "billboard", property: "onlyY" });
        emojiSchema.components.push({ component: "particle-emitter" });
        NAF.schemas.add(emojiSchema);

        // NAF Template (World Mover)
        /* 
        const assets = document.querySelector("a-assets");
        const newTemplate = document.createElement("template");
        newTemplate.id = "sent-emoji";
        */

        // NAF Schema (World Mover)
        /*   
        const worldMoverSchema = { ...NAF.schemas.schemaDict["#static-media"] }
        worldMoverSchema.template = "#moving-world";
        worldMoverSchema.components.push({ component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001) });
        worldMoverSchema.components.push({ component: "rotation", requiresNetworkUpdate: vectorRequiresUpdate(0.5) });
        worldMoverSchema.components.push({ component: "scale", requiresNetworkUpdate: vectorRequiresUpdate(0.001) });
        NAF.schemas.add(worldMoverSchema); 
        */
    }

    // Utils

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
        },
        hideOnTrigger: {
          type: "boolean",
          default: false
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
        this.text.setAttribute("text", `value: ${this.data.text}; side: double;`);
        this.text.setAttribute("geometry", `primitive: plane; height: auto; width: 0.75;`);
        this.text.setAttribute("material", "color: #807e7e;");
        this.text.setAttribute("billboard", "onlyY: true;");
        this.el.appendChild(this.text);

        this.onClick = this.onClick.bind(this);
        this.el.object3D.addEventListener("interact", this.onClick);
        this.el.object3D.addEventListener("hideBargeButton", (e) => {
          if (e.detail === this) {
            console.log("\n\n\n\n\nWorking");
          }
        });
      },

      remove: function () {
        this.el.object3D.removeEventListener("interact", this.onClick);
      },

      onClick: function () {
        if (this.data.phaseID >= 0) {
          this.el.sceneEl.emit("logPhaseEvent", { detail: this.data.phaseID });

          if (this.data.phaseID === 1) {
            this.el.sceneEl.emit("startMovingWorld");
            sendLog("flyingPlatform", {
              clientId: NAF.clientId,
              displayName: window.APP.store.state.profile.displayName,
              sceneName: window.APP.hub.name,
              toggle: true
            });
          } else if (this.data.phaseID === 4) {
            this.el.sceneEl.emit("stopMovingWorld");
            this.el.sceneEl.emit("generateDataEvent");
            sendLog("flyingPlatform", {
              clientId: NAF.clientId,
              displayName: window.APP.store.state.profile.displayName,
              sceneName: window.APP.hub.name,
              toggle: false
            });
          }
        } else {
          this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(18);
          this.el.sceneEl.emit(this.data.eventName);
        }

        if (this.data.hideOnTrigger) {
          this.el.sceneEl.emit("hideBargeButton", { detail: this });
        }
      }
    });

    AFRAME.registerComponent("socialvr-barge-clock", {
      init: function () {
        this.geometry = new THREE.SphereGeometry(3, 16, 8);
        this.material = new THREE.MeshBasicMaterial({ alphaTest: 0, visible: false });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.el.setObject3D("mesh", this.mesh);

        this.bg = document.createElement("a-entity");
        this.bg.setObject3D("mesh", new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 8), new THREE.MeshBasicMaterial({ 
          color: 0x3a3a3a,
          transparent: true,
          opacity: 0.3,
          side: THREE.BackSide
        })));

        this.text = document.createElement("a-entity");
        this.text.setAttribute("text", "value: Time;");
        this.text.setAttribute("rotation", "0, 0, 0");
        this.text.setAttribute("geometry", "primitive: plane; height: auto; width: 2;");
        this.text.setAttribute("material", { color: 0x807e7e });
        this.text.object3D.scale.set(2, 2, 2);
        this.text.object3D.matrixNeedsUpdate = true;

        this.text2 = document.createElement("a-entity");
        this.text2.setAttribute("text", "value: Time;");
        this.text2.setAttribute("rotation", "0, 180, 0");
        this.text2.setAttribute("geometry", "primitive: plane; height: auto; width: 2;");
        this.text2.setAttribute("material", { color: 0x807e7e });
        this.text2.object3D.scale.set(2, 2, 2);
        this.text2.object3D.matrixNeedsUpdate = true;

        this.el.appendChild(this.bg);
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

        this.text.setAttribute("text", `value: ${hours}:${minutes} ${ampm};`);
        this.text2.setAttribute("text", `value: ${hours}:${minutes} ${ampm};`);
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
                color: 0x5800FF,
                transparent: true,
                opacity: 0.5
            });

            this.mesh = new THREE.Mesh(this.geometry, this.material);
            this.el.setObject3D("mesh", this.mesh);
            this.el.getObject3D("mesh").visible = false;
        }
    });

    const COLOR_ON = 0x029200;
    const COLOR_OFF = 0xf30000;

    const STATE_OFF = 0;
    const STATE_ON = 1;

    const SELECTOR_BARGE = ".barge";
    const SELECTOR_BARGE_WORKSHOP = ".workshopbargeglb";

    const SPEECH_AVATAR_COLORS = {
        "4rtlr6I": 0x1da8ff,
        "WPYjPmv": 0xff2190,
        "1S9JzDB": 0xf30000,
        "jZWyDGm": 0x00e000,
        "II9rXJD": 0xffff00,
        "HrP4pCf": 0x7700f4,
        "sEj4i7J": 0xff2e00,
        "vm3cTy7": 0x010188,
        "Mih5HF7": 0x111111,
        "U2E2EZi": 0x7700f4,
        "xb4PVBE": 0xffff00,
        "Mqpw3tx": 0xf30000,
        "RczWQgy": 0x7700f4,
        "bs7pLac": 0x010188,
        "s8SKL4B": 0x1da8ff,
        "4r1KpVk": 0x7700f4,
        "ymrnPXW": 0x1da8ff,
    };

    const BARGE_DATA = {
        KNOWLEDGE_BLOCKS: [
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
                name: "Management",
                model: "https://hubscloud-assets.socialsuperpowers.net/files/6db5dc3d-c8d3-4eb8-8cd5-4dca0012de7f.glb"
            },
            {
                name: "Public Safety",
                model: "https://hubscloud-assets.socialsuperpowers.net/files/5b19b8ed-32f7-4669-b42c-0b871659bb97.glb",
            }
        ],
        SKILL_BLOCKS: [
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
                model: "https://hubscloud-assets.socialsuperpowers.net/files/5cc9e433-ec52-428d-b744-e5d40049e151.glb"
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
        ],
        ABILITY_BLOCKS: [
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
        ],
        CANIDATE_BLOCKS: [
            {
                name: "Zoya A. Chopra",
                model: "https://hubscloud-assets.socialsuperpowers.net/files/dec43ec6-a9a3-4400-b3db-6adc3cce4666.glb",
            },
            {
                name: "Robert P. Johnson",
                model: "https://hubscloud-assets.socialsuperpowers.net/files/52749588-bdaa-4317-8cc5-35aeea6845cf.glb",
            },
            {
                name: "William K. Bevins",
                model: "https://hubscloud-assets.socialsuperpowers.net/files/62f03c4b-3bb5-4998-8bd6-2fdbe6b9fd6b.glb",
            },
            {
                name: "Kathy L. Stromm",
                model: "https://hubscloud-assets.socialsuperpowers.net/files/b22f21b0-e117-43e3-a3ee-f36d43776504.glb",
            },
        ]
    };

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

            // Uses config file now.
            this.knowledge_blocks = [...BARGE_DATA.KNOWLEDGE_BLOCKS];
            this.skills_blocks = [...BARGE_DATA.SKILL_BLOCKS];
            this.abilities_blocks = [...BARGE_DATA.ABILITY_BLOCKS];
            this.canidate_blocks = [...BARGE_DATA.CANIDATE_BLOCKS];

            this.knowledge_blocks.forEach((item) => { item.distance = 9999; });
            this.skills_blocks.forEach((item) => { item.distance = 9999; });
            this.abilities_blocks.forEach((item) => { item.distance = 9999; });
            this.canidate_blocks.forEach((item) => { item.distance = 9999; });

            console.log(this.knowledge_blocks);
            console.log(this.skills_blocks);
            console.log(this.abilities_blocks);
            console.log(this.canidate_blocks);

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

                // Should just use a loop to compare at some point (if this is the cause of the mismatch)
                if (slot.components["socialvr-barge-slot"].data.type === "knowledge") {
                    document.querySelectorAll('.interactable:not([super-spawner=""])').forEach((interactable) => {
                        if (interactable.components["gltf-model-plus"]) {
                            if (interactable.components["gltf-model-plus"].data.src === this.knowledge_blocks[0].model) {
                                this.knowledge_blocks[0].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.knowledge_blocks[1].model) {
                                this.knowledge_blocks[1].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.knowledge_blocks[2].model) {
                                this.knowledge_blocks[2].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.knowledge_blocks[3].model) {
                                this.knowledge_blocks[3].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.knowledge_blocks[4].model) {
                                this.knowledge_blocks[4].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                        }
                    });
                }
                else if (slot.components["socialvr-barge-slot"].data.type === "skills") {
                    document.querySelectorAll('.interactable:not([super-spawner=""])').forEach((interactable) => {
                        if (interactable.components["gltf-model-plus"]) {
                            if (interactable.components["gltf-model-plus"].data.src === this.skills_blocks[0].model) {
                                this.skills_blocks[0].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.skills_blocks[1].model) {
                                this.skills_blocks[1].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.skills_blocks[2].model) {
                                this.skills_blocks[2].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.skills_blocks[3].model) {
                                this.skills_blocks[3].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.skills_blocks[4].model) {
                                this.skills_blocks[4].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.skills_blocks[5].model) {
                                this.skills_blocks[5].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.skills_blocks[6].model) {
                                this.skills_blocks[6].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                        }
                    });
                }
                else if (slot.components["socialvr-barge-slot"].data.type === "abilities") {
                    document.querySelectorAll('.interactable:not([super-spawner=""])').forEach((interactable) => {
                        if (interactable.components["gltf-model-plus"]) {
                            if (interactable.components["gltf-model-plus"].data.src === this.abilities_blocks[0].model) {
                                this.abilities_blocks[0].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.abilities_blocks[1].model) {
                                this.abilities_blocks[1].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.abilities_blocks[2].model) {
                                this.abilities_blocks[2].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.abilities_blocks[3].model) {
                                this.abilities_blocks[3].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.abilities_blocks[4].model) {
                                this.abilities_blocks[4].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.abilities_blocks[5].model) {
                                this.abilities_blocks[5].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                        }
                    });
                }
                else if (slot.components["socialvr-barge-slot"].data.type === "canidate") {
                    document.querySelectorAll('.interactable:not([super-spawner=""])').forEach((interactable) => {
                        if (interactable.components["gltf-model-plus"]) {
                            if (interactable.components["gltf-model-plus"].data.src === this.canidate_blocks[0].model) {
                                this.canidate_blocks[0].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.canidate_blocks[1].model) {
                                this.canidate_blocks[1].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.canidate_blocks[2].model) {
                                this.canidate_blocks[2].distance = slotPosition.distanceToSquared(interactable.object3D.getWorldPosition(new THREE.Vector3()));
                            }
                            else if (interactable.components["gltf-model-plus"].data.src === this.canidate_blocks[3].model) {
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
        schema: {
            overrideSky: {
                type: 'boolean',
                default: false
            },
            modelURL: {
                type: 'string',
                default: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/moving-world-8.glb"
            }
        },

        init: function () {
            this.moving = false;
            this.destinations = [];
            this.currentDestination = 0;
            this.direction = new THREE.Vector3(0, 0, 0);
            this.speed = 1;
            this.lastCheck = 0;

            // Initialize Waypoints
            for (let i = 0; i <= 100; i++) {
                const waypoint = document.querySelector(".Waypoint_" + i);

                if (waypoint) {
                    this.destinations.push(waypoint.object3D.position.negate());

                    console.log(`Waypoint [${i}]`);
                    console.log(waypoint.object3D.position);
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
                .loadModel(this.data.modelURL)
                .then((model) => {
                    this.el.setObject3D("mesh", window.APP.utils.cloneObject3D(model.scene));
                })
                .finally(() => {
                    if (this.data.overrideSky) {
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
                    }
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

                        this.el.setAttribute("position", {
                            x: this.el.object3D.position.x + this.direction.x,
                            y: this.el.object3D.position.y + this.direction.y,
                            z: this.el.object3D.position.z + this.direction.z,
                        });
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

    const emojis = [
      {
        icon: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0000_Rainbow.png",
        model: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/rainbow.glb",
        id: "Rainbow"
      },
      {
        icon: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0001_Star.png",
        model: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/Star.glb",
        id: "Star"
      },
      {
        icon: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0006_Poop.png",
        model: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/poo.glb",
        id: "Poop"
      },
      {
        icon: window.APP.utils.emojis[0].particleEmitterConfig.src,
        model: window.APP.utils.emojis[0].model,
        id: window.APP.utils.emojis[0].id
      },
      {
        icon: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0004_Flower.png",
        model: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/flower.glb",
        id: "Flower"
      },
      {
        icon: window.APP.utils.emojis[1].particleEmitterConfig.src,
        model: window.APP.utils.emojis[1].model,
        id: window.APP.utils.emojis[1].id
      },
      {
        icon: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0007_Pizza.png",
        model: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/pizza.glb",
        id: "Pizza"
      },
      {
        icon: window.APP.utils.emojis[3].particleEmitterConfig.src,
        model: window.APP.utils.emojis[3].model,
        id: window.APP.utils.emojis[3].id
      },
      {
        icon: window.APP.utils.emojis[2].particleEmitterConfig.src,
        model: window.APP.utils.emojis[2].model,
        id: window.APP.utils.emojis[2].id
      },
    ];

    const EMOJI_LIFETIME = 10;
    const EMOJI_SPEED = 0.6;
    const EMOJI_ARC = 0.2;

    AFRAME.registerComponent("socialvr-emoji-target", {
      schema: {
        ownerID: {
          type: "string",
          default: ""
        }
      },

      init: function () {
        this.el.setAttribute("tags", "singleActionButton: true");
        this.el.setAttribute("is-remote-hover-target", "");
        // Required hack to make hover states work.
        this.el.classList.add("interactable", "teleport-waypoint-icon");
        this.el.setObject3D("mesh", new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.75, 0.35), new THREE.MeshBasicMaterial({ visible: false })));

        this.hoverVisual = document.createElement("a-entity");
        this.el.appendChild(this.hoverVisual);

        this.activeEmojis = [];

        // Hover Visual
        window.APP.utils.GLTFModelPlus
          .loadModel(window.APP.utils.emojis[0].model)
          .then((model) => {
            this.hoverVisual.setAttribute("billboard", { onlyY: true });
            this.hoverVisual.setObject3D("mesh", window.APP.utils.cloneObject3D(model.scene));
            this.hoverVisual.object3D.scale.set(0.25, 0.25, 0.25);
            this.hoverVisual.object3D.position.set(0, 0.6, 0);
            this.hoverVisual.object3D.visible = false;
            this.hoverVisual.object3D.matrixNeedsUpdate = true;

            this.el.object3D.addEventListener("hovered", this.onHover.bind(this));
            this.el.object3D.addEventListener("unhovered", this.onUnhover.bind(this));
            this.el.object3D.addEventListener("interact", this.onClick.bind(this));
          })
          .catch((e) => {
            console.error(e);
          });
      },

      remove: function () {
        this.activeEmoji?.remove();
        this.selectionPanel?.remove();

        this.activeEmoji = null;
        this.selectionPanel = null;
      },

      tick: function (time, dt) {
        this.activeEmojis.forEach((data, index, arr) => {
          if ((EMOJI_LIFETIME * 1000) >= performance.now() - data.timestamp) {
            const current = this.activeEmojis[index].entity.object3D.position;
            const destination = new THREE.Vector3();

            data.recipient.object3D.getWorldPosition(destination);
            destination.add(new THREE.Vector3(0, 1.75, 0));

            const pt1 = new THREE.Vector3().lerpVectors(current, destination, 0.25);
            pt1.y += EMOJI_ARC;
            const pt2 = new THREE.Vector3().lerpVectors(current, destination, 0.75);
            pt2.y += EMOJI_ARC;

            const curve = new THREE.CubicBezierCurve3(current, pt1, pt2, destination);
            const totalTime = (curve.getLength() * 10000) / EMOJI_SPEED;
            const progress = (performance.now() - data.timestamp) / totalTime;

            if (progress < 1) {
              this.activeEmojis[index].entity.setAttribute("position", curve.getPointAt(progress));
              this.activeEmojis[index].entity.object3D.matrixNeedsUpdate = true;
            } else {
              this.activeEmojis[index].entity.object3D.position.copy(destination);
              this.activeEmojis[index].entity.object3D.matrixNeedsUpdate = true;
              this.activeEmojis[index].reachedEnd = true;
            }
          } else {
            data.entity.remove();
            arr.splice(index, 1);
          }
        });
      },

      onHover: function () {
        this.hoverVisual.object3D.visible = true;
      },

      onUnhover: function () {
        this.hoverVisual.object3D.visible = false;
      },

      sendEmoji: function (emoji, sender, recipient, timestamp) {
        this.selectionPanel?.remove();
        this.selectionPanel = null;

        const { entity } = window.APP.utils.addMedia(new URL(emoji.model, window.location).href, "#sent-emoji");

        entity.addEventListener("media-loaded", () => {
          const particleEmitterConfig = {
            src: new URL(emoji.icon, window.location).href,
            resolve: false,
            particleCount: 20,
            startSize: 0.01,
            endSize: 0.2,
            sizeRandomness: 0.05,
            lifetime: 1,
            lifetimeRandomness: 0.2,
            ageRandomness: 1,
            startVelocity: { x: 0, y: 0, z: 0 },
            endVelocity: { x: 0, y: -1.87, z: 0 },
            startOpacity: 1,
            middleOpacity: 1,
            endOpacity: 0
          };

          entity.setAttribute("particle-emitter", particleEmitterConfig);
          this.activeEmojis.push({ entity, sender, recipient, timestamp });
          sendLog("emojiSent", { clientId: NAF.clientId, displayName: window.APP.store.state.profile.displayName, logSender: sender, logReceiver: this.data.ownerID, logEmojiType: emoji.id });
        }, { once: true });

        entity.setAttribute("billboard", { onlyY: true });
        entity.setAttribute("offset-relative-to", {
          target: "#avatar-pov-node",
          offset: { x: 0, y: 0, z: -0.6 },
          selfDestruct: true
        });
      },

      onClick: function () {
        this.selectionPanel?.remove();
        this.selectionPanel = null;

        this.selectionPanel = document.createElement("a-entity");
        this.selectionPanel.setObject3D("mesh", new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ visible: false })));
        this.selectionPanel.setAttribute("offset-relative-to", {
          target: "#avatar-pov-node",
          offset: { x: -0.45, y: -0.1, z: -0.6 }
        });

        this.el.sceneEl.appendChild(this.selectionPanel);

        emojis.forEach((emoji, index) => {
          window.APP.utils.GLTFModelPlus
            .loadModel(emoji.model)
            .then((model) => {
              if (this.selectionPanel) {
                const button = document.createElement("a-entity");
                button.setAttribute("billboard", "");
                button.setAttribute("tags", "singleActionButton: true");
                button.setAttribute("is-remote-hover-target", "");
                button.setAttribute("css-class", "interactable");
                button.setAttribute("hoverable-visuals", "");
                button.setObject3D("mesh", window.APP.utils.cloneObject3D(model.scene));
                button.object3D.scale.set(0.25, 0.25, 0.25);
                button.object3D.position.set((0.25 * index) - 0.25, 0, 0);
                button.object3D.matrixNeedsUpdate = true;
                button.object3D.addEventListener("interact", this.sendEmoji.bind(this, emoji, null, this.el, performance.now()));

                this.selectionPanel.appendChild(button);
                this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundAt(19, button.object3D.position, false);
              }
            })
            .catch((e) => {
              console.error(e);
            });
        });
      }
    });

    const MIC_PRESENCE_VOLUME_THRESHOLD = 0.00001;

    const SPEECH_TIME_PER_TICK = 10; // every speech tick = 10ms of realtime
    const MIN_SPEECH_TIME_FOR_EVENT = 100; // 0.1s realtime
    const MAX_SPEECH_TIME_FOR_EVENT = 5000; // 5s realtime
    const CONTINUOUS_SPEECH_LENIENCY_TIME = 250; // 0.1s realtime

    const ORB_CONTAINER_POS = [0, 0, 0]; // [7,0,2]

    const MIN_ORB_SIZE = 0.05;
    const MAX_ORB_SIZE = 0.9;
    const SPEECH_ORB_LIFETIME = 1000 * 60 * 5; // 5mins realtime
    const ORB_GROWTH_PER_TICK = (MAX_ORB_SIZE - MIN_ORB_SIZE) / ((MAX_SPEECH_TIME_FOR_EVENT - MIN_SPEECH_TIME_FOR_EVENT) / SPEECH_TIME_PER_TICK);

    AFRAME.registerComponent("socialvr-speech", {
      init: function () {
        this.localAudioAnalyser = this.el.sceneEl.systems["local-audio-analyser"];
        this.playerInfo = APP.componentRegistry["player-info"][0];

        this.activeSpeechOrbs = {};
        this.continuousSpeechTime = 0;
        this.continuousSpeechLeniencyTime = 0;

        // Mesh
        //this.geometry = new THREE.SphereGeometry(0.05, 16, 8);
        //this.material = new THREE.MeshStandardMaterial({ color: "#FF6782" });
        //this.mesh = new THREE.Mesh(this.geometry, this.material);
        //this.el.setObject3D("mesh", this.mesh);

        // Client
        this.el.addEventListener("clearSpeechEvent", this.clearSpeech.bind(this));

        // Broadcast Event
        NAF.connection.subscribeToDataChannel("startSpeech", this._startSpeech.bind(this));
        NAF.connection.subscribeToDataChannel("stopSpeech", this._stopSpeech.bind(this));
        NAF.connection.subscribeToDataChannel("clearSpeech", this._clearSpeech.bind(this));

        console.log("[Social VR] Speech System - Initialized");
        this.system.register(this.el);
      },

      remove: function () {
        this.el.removeEventListener("clearSpeechEvent", this.clearSpeech.bind(this));

        NAF.connection.unsubscribeToDataChannel("startSpeech");
        NAF.connection.unsubscribeToDataChannel("stopSpeech");
        NAF.connection.unsubscribeToDataChannel("clearSpeech");

        this.system.unregister();
      },

      tick: function (t, dt) {
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
            NAF.connection.broadcastDataGuaranteed("startSpeech", eventData); // networked
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
          pos.y += finishedOrb.object3D.scale.y / 2; // synchronize movement speed with orb growth rate
          finishedOrb.setAttribute("position", pos);
        }

        for (const activeOrb of Object.values(this.activeSpeechOrbs)) {
          // grow each active speech orb by ORB_GROWTH_PER_TICK
          activeOrb.object3D.scale.add(new THREE.Vector3(0, ORB_GROWTH_PER_TICK * 5, 0));
          activeOrb.matrixNeedsUpdate = true;

          // move its center upward by half of the growth amount,
          // to keep the bottom position fixed at the "now" plane
          const pos = activeOrb.getAttribute("position");
          pos.y += activeOrb.object3D.scale.y / 2;
          activeOrb.setAttribute("position", pos);
        }
      },

      _startSpeech: function (senderId, dataType, data, targetId) {
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
        const centerPos = centerObj ? new THREE.Vector3() : new THREE.Vector3(...ORB_CONTAINER_POS);
        //centerPos.y = 1.5;
        centerPos.y = 0.5;
        const playerPos = speakerInfo.el.object3D.position.clone();
        //playerPos.y = 1.5;
        playerPos.y = 0.5;
        const offset = new THREE.Vector3().subVectors(playerPos, this.el.object3D.position).normalize();
        const orbPos = new THREE.Vector3().addVectors(centerPos, offset);

        newOrb.object3D.position.copy(orbPos);
      },

      doStopSpeech: function (speechTime) {
        const orbSize = this.scale(speechTime, MIN_SPEECH_TIME_FOR_EVENT, MAX_SPEECH_TIME_FOR_EVENT, MIN_ORB_SIZE, MAX_ORB_SIZE);
        const eventData = {
          size: orbSize,
          speaker: this.playerInfo.playerSessionId,
          speakerName: this.playerInfo.displayName
        };
        this._stopSpeech(null, null, eventData, null); // local
        NAF.connection.broadcastDataGuaranteed("stopSpeech", eventData); // networked
      },

      _stopSpeech: function (senderId, dataType, data, targetId) {
        const activeOrb = this.activeSpeechOrbs[data.speaker];
        if (activeOrb) {
          activeOrb.classList.add("finished");
          activeOrb.setAttribute("radius", 0.1);
          activeOrb.setAttribute("height", data.size);

          delete this.activeSpeechOrbs[data.speaker];
        }
      },

      scale: function (num, oldLower, oldUpper, newLower, newUpper) {
        const oldRange = oldUpper - oldLower;
        const newRange = newUpper - newLower;
        return ((num - oldLower) / oldRange) * newRange + newLower;
      },

      getPlayerInfo: function (sessionID) {
        const playerInfos = APP.componentRegistry["player-info"];
        return playerInfos.find(pi => pi.playerSessionId === sessionID);
      },

      sessionIDToColor: function (sessionID) {
        return "#" + sessionID.substring(0, 6); // just use first 6 chars lol
      },

      // keys are "Avatar listing sid"s from Approved Avatars admin tab
      playerInfoToColor: function (playerInfo) {
        const avatarURL = playerInfo.data.avatarSrc;

        for (const avatarSID of Object.keys(SPEECH_AVATAR_COLORS)) {
          if (avatarURL.includes(avatarSID)) {
            return SPEECH_AVATAR_COLORS[avatarSID];
          }
        }

        return 0xffffff;
        //return this.sessionIDToColor(playerInfo.playerSessionId);
      },

      spawnOrb: function (size, in_color) {
        const geometry = new THREE.CylinderGeometry(0.09, 0.09, size);
        const material = new THREE.MeshBasicMaterial({
          color: in_color
        });

        // create, color, position, and scale the orb
        const orb = document.createElement("a-entity");
        orb.classList.add("speechOrb");
        orb.setObject3D("mesh", new THREE.Mesh(geometry, material));

        // add the orb to the scene
        this.el.appendChild(orb);

        // queue the orb for deletion later
        setTimeout(() => orb.remove(), SPEECH_ORB_LIFETIME);

        return orb;
      },

      _clearSpeech: function (senderId, dataType, data, targetId) {
        for (const finishedOrb of document.querySelectorAll(".speechOrb.finished")) {
          finishedOrb.parentNode.removeChild(finishedOrb);
        }
      },

      clearSpeech: function () {
        this._clearSpeech(null, null, {}, null);
        NAF.connection.broadcastDataGuaranteed("clearSpeech", {});
      }
    });

    AFRAME.registerSystem("socialvr-speech", {
        init: function () {
            console.log("[Social VR] Speech System - Initialized");
            this.tool = null;
        },

        register: function (el) {
            if (this.tool != null) {
                this.el.removeChild(this.tool);
            }

            console.log("[Social VR] Speech Component - Registered");
            this.tool = el;
        },

        unregister: function () {
            this.tool = null;
        },
    });

    AFRAME.registerComponent("socialvr-toolbox-dashboard", {
        init: function () {
            this.geometry = new THREE.SphereGeometry(0.02, 16, 8);
            this.material = new THREE.MeshStandardMaterial({ color: 0xff6782 });
            this.mesh = new THREE.Mesh(this.geometry, this.material);

            this.el.setObject3D("mesh", this.mesh);
            this.pos = new THREE.Vector3();

            this.features = {
                CONVERSATION_BALANCE: {
                    name: "cb",
                    icon: "../assets/images/1F4AC_color.png",
                    enabled: false,
                    showButton: true,
                    selector: ".conversation-vis-button",
                    elements: []
                },
                EMOJI: {
                    name: "emoji",
                    icon: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/icons/toggle.png",
                    enabled: false,
                    showButton: true,
                    selector: ".emoji-sending-button",
                    elements: []
                }
            };

            this.el.sceneEl.addEventListener("enableFeatureEmoji", (e) => { this._enableFeatureEmoji.call(this); });
            NAF.connection.subscribeToDataChannel("enableFeatureEmoji", this.enableFeatureEmoji.bind(this));

            this.el.sceneEl.addEventListener("disableFeatureEmoji", (e) => { this._disableFeatureEmoji.call(this); });
            NAF.connection.subscribeToDataChannel("disableFeatureEmoji", this.disableFeatureEmoji.bind(this));

            this.el.sceneEl.addEventListener("enableFeatureCB", (e) => { this._enableFeatureCB.call(this); });
            NAF.connection.subscribeToDataChannel("enableFeatureCB", this.enableFeatureCB.bind(this));

            this.el.sceneEl.addEventListener("disableFeatureCB", (e) => { this._disableFeatureCB.call(this); });
            NAF.connection.subscribeToDataChannel("disableFeatureCB", this.disableFeatureCB.bind(this));

            this.createButtons();
        },

        createButtons: function () {
            Object.keys(this.features).forEach(key => {
                let feature = this.features[key];

                if (feature.showButton) {
                    let button = document.createElement("a-entity");
                    let position = document.querySelector(`${this.features[key].selector}`).object3D.position;

                    button.setAttribute("socialvr-toolbox-dashboard-button", `icon: ${feature.icon}; radius: 0.1; featureName: ${feature.name};`);
                    button.setAttribute("position", position);
                    window.APP.scene.appendChild(button);
                }
            });
        },

        /*
        createButtons: function () {
            let featureCount = 0;

            // TODO: Maybe use a filter to avoid another loop? Not sure if it matters.
            Object.keys(this.features).forEach(key => {
                let feature = this.features[key];

                if (feature.showButton) {
                    featureCount++
                }
            })

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
        */

        initEmoji: function () {
            APP.componentRegistry["player-info"].forEach((playerInfo) => {
                if (!playerInfo.socialVREmoji) {
                    const emojiTarget = document.createElement("a-entity");
                    emojiTarget.setAttribute("socialvr-emoji-target", { ownerID: playerInfo.playerSessionId });

                    playerInfo.el.querySelector(".Spine").appendChild(emojiTarget);
                    playerInfo.socialVREmoji = true;

                    this.features.EMOJI.elements.push(emojiTarget);
                }
            });
        },

        enableFeatureEmoji: function () {
            this.features.EMOJI.enabled = true;
            this.initEmoji();
            console.log("[SocialVR]: Emoji Enabled");
        },

        _enableFeatureEmoji: function () {
            this.enableFeatureEmoji(null, null, {});
            NAF.connection.broadcastDataGuaranteed("enableFeatureEmoji", {});
        },

        disableFeatureEmoji: function () {
            document.querySelectorAll("[emoji]").forEach((element) => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });

            APP.componentRegistry["player-info"].forEach((playerInfo) => {
                playerInfo.socialVREmoji = false;
            });

            this.features.EMOJI.elements.forEach((element) => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });

            this.features.EMOJI.enabled = false;
        },

        _disableFeatureEmoji: function () {
            this.disableFeatureEmoji(null, null, {});
            NAF.connection.broadcastDataGuaranteed("disableFeatureEmoji", {});
        },

        enableFeatureCB: function () {
            this.features.CONVERSATION_BALANCE.enabled = true;

            const cb = document.createElement("a-entity");
            const position = document.querySelector(".conversation-vis-table").object3D.position;

            cb.setAttribute("socialvr-speech", "");
            cb.setAttribute("position", `${position.x}, ${position.y}, ${position.z}`);
            cb.object3D.position.copy(position);
            APP.scene.appendChild(cb);

            this.features.CONVERSATION_BALANCE.elements.push(cb);
            console.log("[SocialVR]: Coversation Balance Enabled");
        },

        _enableFeatureCB: function () {
            this.enableFeatureCB(null, null, {});
            NAF.connection.broadcastDataGuaranteed("enableFeatureCB", {});
        },

        disableFeatureCB: function () {
            this.features.CONVERSATION_BALANCE.enabled = false;

            this.features.CONVERSATION_BALANCE.elements.forEach((element) => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
        },

        _disableFeatureCB: function () {
            this.disableFeatureCB(null, null, {});
            NAF.connection.broadcastDataGuaranteed("disableFeatureCB", {});
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
            }
        },

        init: function () {
            this.geometry = new THREE.SphereGeometry(this.data.radius, 16, 8);
            this.material_off = new THREE.MeshStandardMaterial({ color: COLOR_OFF, roughness: 0.5 });
            this.material_on = new THREE.MeshStandardMaterial({ color: COLOR_ON, roughness: 0.5 });
            this.state = STATE_OFF;

            this.el.setObject3D("mesh", new THREE.Mesh(this.geometry, this.material_off));
            this.el.setAttribute("tags", "singleActionButton: true");
            this.el.setAttribute("is-remote-hover-target", "");
            this.el.setAttribute("css-class", "interactable");
            this.el.setAttribute("hoverable-visuals", "");
            this.el.setAttribute("billboard", "onlyY: true;");

            // Text
            this.text = document.createElement("a-entity");
            this.text.setAttribute("position", `0 ${this.data.radius + 0.1} 0`);
            this.text.setAttribute("text", { value: "Off", side: THREE.DoubleSide });
            this.text.setAttribute("geometry", `primitive: plane; height: auto; width: 0.75;`);
            this.text.setAttribute("material", { color: 0x807e7e });
            this.text.setAttribute("billboard", "onlyY: true;");
            this.el.appendChild(this.text);

            //this.icon_image = document.createElement("a-image");
            //this.icon_image.setAttribute("position", `0 ${this.data.radius + 0.01} 0`);
            //this.icon_image.setAttribute("rotation", "90 180 0");
            //this.icon_image.setAttribute("height", `${this.data.radius}`);
            //this.icon_image.setAttribute("width", `${this.data.radius}`);
            //this.icon_image.setAttribute("src", `${this.data.icon}`);
            //this.el.appendChild(this.icon_image);

            this.onClick = this.onClick.bind(this);
            this.el.object3D.addEventListener("interact", this.onClick);

            this.el.sceneEl.addEventListener(`dashboardButtonStateChanged_${this.data.featureName}`, (e) => { this._changeState.call(this, e.detail); });
            NAF.connection.subscribeToDataChannel(`dashboardButtonStateChanged_${this.data.featureName}`, this.changeState.bind(this));
        },

        remove: function () {
            this.el.object3D.removeEventListener("interact", this.onClick);
        },

        changeState: function () {
            this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundAt(19, this.el.object3D.position, false);

            if (this.state === STATE_OFF) {
                this.state = STATE_ON;
                this.el.setObject3D("mesh", new THREE.Mesh(this.geometry, this.material_on));
                this.text.setAttribute("text", { value: "On", side: THREE.DoubleSide });

                if (this.data.featureName === "emoji") {
                    sendLog("emojiToggle", { clientId: NAF.clientId, displayName: window.APP.store.state.profile.displayName, toggle: true });
                    this.el.sceneEl.emit("enableFeatureEmoji", {});
                }
                else if (this.data.featureName === "cb") {
                    sendLog("conversationVisualization", { clientId: NAF.clientId, displayName: window.APP.store.state.profile.displayName, toggle: true });
                    this.el.sceneEl.emit("enableFeatureCB", {});
                }
            }
            else if (this.state === STATE_ON) {
                this.state = STATE_OFF;
                this.el.setObject3D("mesh", new THREE.Mesh(this.geometry, this.material_off));
                this.text.setAttribute("text", { value: "Off", side: THREE.DoubleSide });

                if (this.data.featureName === "emoji") {
                    sendLog("emojiToggle", { clientId: NAF.clientId, displayName: window.APP.store.state.profile.displayName, toggle: false });
                    this.el.sceneEl.emit("disableFeatureEmoji", {});
                }
                else if (this.data.featureName === "cb") {
                    sendLog("conversationVisualization", { clientId: NAF.clientId, displayName: window.APP.store.state.profile.displayName, toggle: false });
                    this.el.sceneEl.emit("disableFeatureCB", {});
                }
            }

            console.log(`My state is: ${this.state}`);
            console.log(`My feature is: ${this.data.featureName}`);
        },

        _changeState: function () {
            this.changeState(null, null, {});
            NAF.connection.broadcastDataGuaranteed(`dashboardButtonStateChanged_${this.data.featureName}`, {
                detail: {
                    state: this.state
                }
            });
        },

        onClick: function () {
            this.el.sceneEl.emit(`dashboardButtonStateChanged_${this.data.featureName}`, {
                detail: {
                    state: this.state
                }
            });
        }
    });

    // Barge

    APP.scene.addEventListener("environment-scene-loaded", () => {
      initSchemas();

      if (document.querySelector(SELECTOR_BARGE)) {
        // Button
        let button = document.createElement("a-entity");
        let position = document.querySelector(".startButton").object3D.position.add(new THREE.Vector3(0, 0.5, 0));

        button.setAttribute("socialvr-barge-button", "text: Start; radius: 0.3; color: #C576F6; phaseID: 1");
        button.setAttribute("position", position);
        window.APP.scene.appendChild(button);

        // Button
        button = document.createElement("a-entity");
        position = document.querySelector(".CompleteButton_phase1").object3D.position.add(new THREE.Vector3(0, 0.5, 0));

        button.setAttribute("socialvr-barge-button", "text: Next Task; radius: 0.3; color: #C576F6; phaseID: 2");
        button.setAttribute("position", position);
        window.APP.scene.appendChild(button);

        // Button
        button = document.createElement("a-entity");
        position = document.querySelector(".CompleteButton_phase2").object3D.position.add(new THREE.Vector3(0, 0.5, 0));

        button.setAttribute("socialvr-barge-button", "text: Next Task; radius: 0.3; color: #C576F6; phaseID: 3");
        button.setAttribute("position", position);
        window.APP.scene.appendChild(button);

        // Button
        button = document.createElement("a-entity");
        position = document.querySelector(".CompleteButton_phase3").object3D.position.add(new THREE.Vector3(0, 0.5, 0));

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
        };

        // Changes camera inspection system to show background, regardless of user preferences.
        window.APP.scene.systems["hubs-systems"].cameraSystem.lightsEnabled = true;
      }
      else if (document.querySelector(SELECTOR_BARGE_WORKSHOP)) {
        const button = document.createElement("a-entity");
        button.setAttribute("position", new THREE.Vector3(0, 0.65, 0));
        button.setAttribute("socialvr-barge-button", { text: "Start", radius: 0.1, color: COLOR_OFF, phaseID: 1 });
        window.APP.scene.appendChild(button);

        const worldMover = document.createElement("a-entity");
        worldMover.setAttribute("socialvr-world-mover", { modelURL: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/meeting-hall-6.glb" });
        window.APP.scene.appendChild(worldMover);
      }
      else {
        const dashboard = document.createElement("a-entity");
        dashboard.setAttribute("socialvr-toolbox-dashboard", "");
        APP.scene.appendChild(dashboard);
      }
    }, { once: true });

    APP.scene.addEventListener("avatar_updated", (e) => {
      sendLog("avatarChange", { clientId: NAF.clientId, displayName: "unknown", playerSessionId: "unknown", avatar: "unknown" });
    });

    APP.scene.addEventListener("object_spawned", (e) => {
      sendLog("spaceMakingKit", { clientId: NAF.clientId, objectID: e.detail.objectType, timestamp: Date.now() });

      document.querySelectorAll("[floaty-object]").forEach((floaty) => {
        floaty.setAttribute("floaty-object", {
          unthrowable: true
        });
      });
    });

    document.body.addEventListener("clientConnected", (e) => {
      const dashboard = document.querySelector('[socialvr-toolbox-dashboard=""]');

      if (dashboard && dashboard.components["socialvr-toolbox-dashboard"].features.EMOJI.enabled) {
        dashboard.components["socialvr-toolbox-dashboard"].initEmoji();
      }

      sendLog("joined", { clientId: NAF.clientId, clientName: APP.store.state.profile.displayName, joinedClientId: e.detail.clientId, joinedOrLeft: "joined" });
    });

    document.body.addEventListener("clientDisconnected", (e) => {
      sendLog("joined", { clientId: NAF.clientId, joinedClientId: e.detail.clientId, joinedOrLeft: "left" });
    });

})();
//# sourceMappingURL=development.js.map
