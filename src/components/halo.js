const growthPerSecond = 0.1;

AFRAME.registerComponent("socialvr-halo", {
    init: function () {
        this.geometry = new THREE.TorusGeometry(1, 0.1, 16, 24);
        this.material = new THREE.MeshStandardMaterial({
            color: "#FF6782",
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.el.setObject3D("mesh", this.mesh);
        
        this.mesh.rotateX(THREE.Math.degToRad(90));
    },

    tock: function (time, delta) {
        const scale = growthPerSecond * (delta / 1000);

        this.mesh.scale.addScalar(scale);
        this.mesh.matrixAutoUpdate = true;
    }
});