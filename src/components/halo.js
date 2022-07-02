AFRAME.registerComponent("socialvr-halo", {
    init: function () {
        this.geometry = new THREE.TorusGeometry(0.05, 0.01, 8, 16);
        this.material = new THREE.MeshStandardMaterial({ color: "#FF6782" });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotateX(THREE.Math.degToRad(90));

        this.el.setObject3D("mesh", this.mesh);
    },

    tock: function(time, delta) {
        /** 
        if (!this.data.target) { return; }
        if (!NAF.utils.isMine(this.el)) { return; }

        const scale = 0.1 * (delta / 1000);

        this.mesh.scale.addScalar(scale);
        this.mesh.scale.set(this.mesh.scale.x, this.mesh.scale.y, 1);
        this.mesh.matrixAutoUpdate = true;
        */
    }
});