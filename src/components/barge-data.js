import { BARGE_DATA } from "../config";

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