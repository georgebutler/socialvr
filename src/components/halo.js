const growSpeed = 0.1;

AFRAME.registerComponent("socialvr-halo", {
    init: function () {
        this.geometry = new THREE.TorusGeometry(0.5, 0.1, 16, 12);
        this.material = new THREE.MeshStandardMaterial({
            color: "#FF6782",
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.el.setObject3D("mesh", this.mesh);
        
        this.mesh.rotateX(THREE.Math.degToRad(90));
    },

    tick: function (time, delta) {
        this.mesh.scale.set(1, 1, 1);
    }
});