import { Vector3 } from "three";

AFRAME.registerComponent("socialvr-speech", {
    schema: {
        height: { type: "number", default: 0.5 }
    },

    init() {
        this.geometry = new THREE.CylinderGeometry(0.1, 0.1, this.data.height, 6, 1);
        this.material = new THREE.MeshStandardMaterial({ color: "#AAA" });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.el.setObject3D("mesh", this.mesh);
    },

    remove() {
        this.el.removeObject3D("mesh");
    },

    tick(t, dt) {
    }
})