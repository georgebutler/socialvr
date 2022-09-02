AFRAME.registerComponent("socialvr-eye-laser", {
    init: function () {
        this.geometry = new THREE.CylinderGeometry(0.1, 0.1, 100, 3, 3);
        this.material = new THREE.MeshStandardMaterial({ color: "#FF6782" });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotateX(THREE.Math.degToRad(90));
        this.el.setObject3D("mesh", this.mesh);
    }
});