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