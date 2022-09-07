const COLOR_ON = 0x03b300;
const COLOR_OFF = 0xff0000;

const COLOR_HOVER_ON_OFF = 0xff9999;
const COLOR_HOVER_SELECTED = 0x9bff99;

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
                color: "#6BDE18",
                emissiveColor: "#FF4444",
                icon: "../assets/images/1F4AC_color.png",
                enabled: false,
                showButton: true,
                button_positon: new THREE.Vector3(-11.01, 1.2, 2.25),
                elements: []
            },
            EMOJI: {
                name: "emoji",
                color: "#6BDE18",
                emissiveColor: "#FF4444",
                icon: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/icons/toggle.png",
                enabled: false,
                showButton: true,
                button_positon: new THREE.Vector3(-8.43, 1.2, -7.565),
                elements: []
            },
            BUILDINGKIT: {
                name: "buildingkit",
                color: "#6BDE18",
                emissiveColor: "#FF4444",
                icon: "../assets/images/1F48C_color.png",
                enabled: false,
                showButton: false,
                button_positon: new THREE.Vector3(-11.01, -2.25, 1.17),
                elements: []
            },
            BARGE: {
                name: "barge",
                color: "#6BDE18",
                emissiveColor: "#FF4444",
                icon: "../assets/images/26F5_color.png",
                enabled: false,
                showButton: false,
                button_positon: new THREE.Vector3(-11.01, -2.25, 1.17),
                elements: []
            },
            HALO: {
                name: "halo",
                color: "#6BDE18",
                emissiveColor: "#FF4444",
                icon: "../assets/images/1F607_color.png",
                enabled: false,
                showButton: false,
                button_positon: new THREE.Vector3(-11.01, -2.25, 1.17),
                elements: []
            }
        }

        this.el.sceneEl.addEventListener("enableFeatureEmoji", (e) => { this._enableFeatureEmoji.call(this) });
        NAF.connection.subscribeToDataChannel("enableFeatureEmoji", this.enableFeatureEmoji.bind(this));

        this.el.sceneEl.addEventListener("disableFeatureEmoji", (e) => { this._disableFeatureEmoji.call(this) });
        NAF.connection.subscribeToDataChannel("disableFeatureEmoji", this.disableFeatureEmoji.bind(this));

        this.el.sceneEl.addEventListener("enableFeatureHalo", (e) => { this._enableFeatureHalo.call(this) });
        NAF.connection.subscribeToDataChannel("enableFeatureHalo", this.enableFeatureHalo.bind(this));

        this.el.sceneEl.addEventListener("enableFeatureCB", (e) => { this._enableFeatureCB.call(this) });
        NAF.connection.subscribeToDataChannel("enableFeatureCB", this.enableFeatureCB.bind(this));

        this.el.sceneEl.addEventListener("disableFeatureCB", (e) => { this._disableFeatureCB.call(this) });
        NAF.connection.subscribeToDataChannel("disableFeatureCB", this.disableFeatureCB.bind(this));

        this.createButtons();
    },

    createButtons: function () {
        Object.keys(this.features).forEach(key => {
            let feature = this.features[key];

            if (feature.showButton) {
                let button = document.createElement("a-entity");

                button.setAttribute("socialvr-toolbox-dashboard-button", `icon: ${feature.icon}; radius: 0.1; color: ${feature.color}; emissiveColor: ${feature.emissiveColor}; featureName: ${feature.name};`);
                button.setAttribute("position", feature.button_positon);
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
                emojiTarget.setAttribute("socialvr-emoji-target", "");

                playerInfo.el.querySelector(".Spine").appendChild(emojiTarget);
                playerInfo.socialVREmoji = true;

                this.features.EMOJI.elements.push(emojiTarget);
            }
        });
    },

    initHalos: function () {
        APP.componentRegistry["player-info"].forEach((playerInfo) => {
            if (!playerInfo.socialVRHalo) {
                const halo = document.createElement("a-entity");
                halo.setAttribute("socialvr-halo", "");
                halo.setAttribute("position", "0 1.75 0");

                playerInfo.el.appendChild(halo);
                playerInfo.socialVRHalo = true;

                this.features.HALO.elements.push(halo);
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
        cb.setAttribute("socialvr-speech", "");
        cb.setAttribute("position", "-12.9 1.2 2.2");
        cb.object3D.position.set(-12.9, 1.2, 2.2);
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
    },

    enableFeatureHalo: function () {
        this.features.HALO.enabled = true;
        this.initHalos();
        console.log("[SocialVR]: Halos Enabled");
    },

    _enableFeatureHalo: function () {
        this.enableFeatureHalo(null, null, {});
        NAF.connection.broadcastDataGuaranteed("enableFeatureHalo", {});
    }
});