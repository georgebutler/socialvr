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

        this.knowledge_blocks.forEach((item) => { item.distance = 9999; });
        this.skills_blocks.forEach((item) => { item.distance = 9999; });
        this.abilities_blocks.forEach((item) => { item.distance = 9999; });
        this.canidate_blocks.forEach((item) => { item.distance = 9999; });

        this.el.sceneEl.addEventListener("logPhaseEvent", (e) => { this._logPhaseEvent.call(this, e.detail) });
        NAF.connection.subscribeToDataChannel("logPhaseEvent", this.logPhaseEvent.bind(this));

        this.el.sceneEl.addEventListener("logClockEvent", (e) => { this._logClockEvent.call(this, e.detail) });
        NAF.connection.subscribeToDataChannel("logClockEvent", this.logClockEvent.bind(this));

        this.el.sceneEl.addEventListener("generateDataEvent", this._generateData.bind(this));
        NAF.connection.subscribeToDataChannel("generateDataEvent", this.generateData.bind(this));
    },

    tock: function () {
        if (this.started >= 0) {
            this.pov_raycaster.setFromCamera(new THREE.Vector2(), document.getElementById("viewing-camera").object3DMap.camera);
            const time = Date.now();

            if (this.last_clock_time + 6000 <= time) {
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

        console.clear();
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
            this.started = Date.now()
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