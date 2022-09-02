import { sendEmoji } from "./emoji"

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

        window.APP.utils.GLTFModelPlus
            .loadModel(this.data.model)
            .then((model) => {
                this.geometry = new THREE.CircleGeometry(0.4, 16);
                this.material = new THREE.MeshStandardMaterial({
                    color: 0x333333,
                    toneMapped: false,
                    depthTest: false,
                    depthWrite: false
                });

                this.bg = new THREE.Mesh(this.geometry, this.material);
                this.el.setObject3D("background", this.bg);

                const mesh = window.APP.utils.cloneObject3D(model.scene);
                mesh.scale.set(1, 1, 1);
                mesh.matrixNeedsUpdate = true;
                this.el.setObject3D("mesh", mesh);
                this.el.object3D.traverse(x => {
                    if (x.material) {
                        x.material.depthTest = false;
                        x.material.depthWrite = false;
                    }
                });

                this.el.setAttribute("tags", "singleActionButton: true");
                this.el.setAttribute("is-remote-hover-target", "");
                this.el.setAttribute("css-class", "interactable");
                this.el.setAttribute("hoverable-visuals", "");

                this.el.object3D.addEventListener("interact", this.onClick.bind(this));
                this.system.registerEmoji(this.el);
            })
            .catch((e) => {
                console.error(e);
            });
    },

    remove: function () {
        this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
    },

    onClick: function () {
        sendEmoji(this.data.model, this.data.particleEmitterConfig, this.data.target);
        this.el.sceneEl.systems["socialvr-emoji-button"].unregister();
    }
});