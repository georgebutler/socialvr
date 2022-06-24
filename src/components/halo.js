if (!document.querySelector("#socialvr-halo")) {
    const template = document.createElement("template");
    const htmlString = `<a-entity socialvr-halo=""></a-entity>`

    template.id = "socialvr-halo"
    template.innerHTML = htmlString.trim();

    document.querySelector("a-assets").appendChild(template);
}

NAF.schemas.getComponentsOriginal = NAF.schemas.getComponents;
NAF.schemas.getComponents = (template) => {
    if (!NAF.schemas.hasTemplate("#socialvr-halo")) {
        NAF.schemas.add({
            template: "#socialvr-halo",
            components: [
                "position",
                "rotation",
                "scale"
            ]
        });
    }

    const components = NAF.schemas.getComponentsOriginal(template);
    return components;
}

AFRAME.registerComponent("socialvr-halo", {
    schema: {
        target: { type: "selector", default: "#avatar-rig", },
        offset: { type: "vec3", default: { x: 0, y: 0.5, z: 0 } }
    },

    init: function () {
        this.target = new THREE.Vector3(0, 0, 0);
        this.delta = new THREE.Vector3(0, 0, 0);

        this.geometry = new THREE.TorusGeometry(2, 0.5, 16, 32);
        this.material = new THREE.MeshStandardMaterial({ color: "#FF6782", side: "both" });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotateX(THREE.Math.degToRad(90));
        this.mesh.scale.set(0.1, 0.1, 0.1);

        this.el.setObject3D("mesh", this.mesh);
        this.el.setAttribute("networked", { template: "#socialvr-halo" });
    },

    tock: function (time, delta) {
        if (!this.data.target) {
            return;
        }

        if (!NAF.utils.isMine(this.el)) {
            return;
        }

        const scale = 0.1 * (delta / 1000);

        this.mesh.scale.addScalar(scale);
        this.mesh.scale.set(this.mesh.scale.x, this.mesh.scale.y, 1);
        this.mesh.matrixAutoUpdate = true;
    }
});