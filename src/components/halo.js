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
    init: function () {
        this.geometry = new THREE.TorusGeometry(1, 0.1, 8, 6);
        this.material = new THREE.MeshStandardMaterial({
            color: "#FF6782",
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotateX(THREE.Math.degToRad(90));
        this.el.setObject3D("mesh", this.mesh);
        this.el.setAttribute("networked", { template: "#socialvr-halo" });
    },

    tock: function (time, delta) {
        if (!NAF.utils.isMine(this.el)) {
            return;
        }

        const scale = 0.1 * (delta / 1000);

        this.mesh.scale.addScalar(scale);
        this.mesh.matrixAutoUpdate = true;
    }
});