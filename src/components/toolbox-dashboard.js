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
                showButton: true,
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
                showButton: true,
                elements: []
            }
        }

        window.APP.hubChannel.presence.onJoin(() => {
            if (this.features.HALO.enabled) {
                this.createHalos();
            }
        });

        this.el.sceneEl.addEventListener("enableFeatureHalo", (e) => { this._enableFeatureHalo.call(this) });
        NAF.connection.subscribeToDataChannel("enableFeatureHalo", this.enableFeatureHalo.bind(this));

        this.createButtons();
    },

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
        })
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
        let position = document.querySelector(".startButton").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

        button.setAttribute("socialvr-barge-button", "text: Start; radius: 0.3; color: #C576F6; phaseID: 1");
        button.setAttribute("position", position);
        window.APP.scene.appendChild(button);

        this.features.BARGE.elements.push(button);

        // Button
        button = document.createElement("a-entity");
        position = document.querySelector(".CompleteButton_phase1").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

        button.setAttribute("socialvr-barge-button", "text: Next Task; radius: 0.3; color: #C576F6; phaseID: 2");
        button.setAttribute("position", position);
        window.APP.scene.appendChild(button);

        this.features.BARGE.elements.push(button);

        // Button
        button = document.createElement("a-entity");
        position = document.querySelector(".CompleteButton_phase2").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

        button.setAttribute("socialvr-barge-button", "text: Next Task; radius: 0.3; color: #C576F6; phaseID: 3");
        button.setAttribute("position", position);
        window.APP.scene.appendChild(button);

        this.features.BARGE.elements.push(button);

        // Button
        button = document.createElement("a-entity");
        position = document.querySelector(".CompleteButton_phase3").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

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