const STATE_OFF = 0
const STATE_ON = 1

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

        this.state = STATE_OFF
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

        this.el.sceneEl.addEventListener("dashboardButtonStateChanged", (e) => { this._changeState.call(this, e.detail) });
        NAF.connection.subscribeToDataChannel("dashboardButtonStateChanged", (e) => { this.changeState.bind(this, e.detail) });
    },

    remove: function () {
        this.el.object3D.removeEventListener("interact", this.onClick);
    },

    changeState: function () {
        this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(18);

        if (this.state === STATE_OFF) {
            this.state = STATE_ON

            if (this.data.featureName === "halo") {
                this.el.sceneEl.emit("enableFeatureHalo", {});
            }
            else if (this.data.featureName === "emoji") {
                this.el.sceneEl.emit("enableFeatureEmoji", {});
            }
        }
        else if (this.state === STATE_ON) {
            this.state = STATE_OFF

            if (this.data.featureName === "halo") {
                this.el.sceneEl.emit("disableFeatureHalo", {});
            }
            else if (this.data.featureName === "emoji") {
                this.el.sceneEl.emit("disableFeatureEmoji", {});
            }
        }

        console.log(`My state is: ${this.state}`);
    },

    _changeState: function () {
        this.changeState(null, null, {});
        NAF.connection.broadcastDataGuaranteed("dashboardButtonStateChanged", {
            detail: {
                state: this.state
            }
        });
    },

    onClick: function () {
        this.el.sceneEl.emit("dashboardButtonStateChanged", {
            detail: {
                state: this.state
            }
        });
    }
});