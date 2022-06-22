const growthPerSecond = 0.1;

AFRAME.registerComponent("socialvr-halo", {
    init: function () {
        this.radius = 0;

        this.geometry = new THREE.TorusGeometry(this.radius, 0.1, 8, 6);
        this.material = new THREE.MeshStandardMaterial({
            color: "#FF6782",
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotateX(THREE.Math.degToRad(90));
        this.el.setObject3D("mesh", this.mesh);
    },

    tock: function (time, delta) {
        this.radius = this.radius + growthPerSecond * (delta / 1000);

        this.geometry = new THREE.TorusGeometry(this.radius, 0.1, 16, 24);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotateX(THREE.Math.degToRad(90));
        this.el.setObject3D("mesh", this.mesh);

        if (this.radius >= 5) {
            this.el.parentEl.removeChild(this.el);
        }
    }
});