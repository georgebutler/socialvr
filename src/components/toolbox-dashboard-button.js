import { STATE_OFF, STATE_ON, COLOR_ON, COLOR_OFF, COLOR_HOVER_ON_OFF, COLOR_HOVER_SELECTED } from "../config";

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

        this.el.sceneEl.addEventListener(`dashboardButtonStateChanged_${this.data.featureName}`, (e) => { this._changeState.call(this, e.detail) });
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

            if (this.data.featureName === "halo") {
                this.el.sceneEl.emit("enableFeatureHalo", {});
            }
            else if (this.data.featureName === "emoji") {
                this.el.sceneEl.emit("enableFeatureEmoji", {});
            }
            else if (this.data.featureName === "cb") {
                this.el.sceneEl.emit("enableFeatureCB", {});
            }
        }
        else if (this.state === STATE_ON) {
            this.state = STATE_OFF;
            this.el.setObject3D("mesh", new THREE.Mesh(this.geometry, this.material_off));
            this.text.setAttribute("text", { value: "Off", side: THREE.DoubleSide });

            if (this.data.featureName === "halo") {
                this.el.sceneEl.emit("disableFeatureHalo", {});
            }
            else if (this.data.featureName === "emoji") {
                this.el.sceneEl.emit("disableFeatureEmoji", {});
            }
            else if (this.data.featureName === "cb") {
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