AFRAME.registerComponent("socialvr-toolbox-dashboard", {
    init: function () {
        this.geometry = new THREE.SphereGeometry(0.5, 16, 8);
        this.material = new THREE.MeshStandardMaterial({ color: "#FF6782" });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.el.setObject3D("mesh", this.mesh);
        this.pos = new THREE.Vector3();

        this.createButtons();
    },

    createButtons: function() {
        const num = 6;
        const r = 4.0;
		let step = Math.PI * 2 / num;
        let angle = this.el.object3D.rotation.y;

        this.el.object3D.getWorldPosition(this.pos);

        for (let i = 0; i <= num; i++) {
            let button = document.createElement("a-entity");
            let position = new THREE.Vector3(this.pos.x + r * Math.sin(angle), this.pos.y, this.pos.z + r * Math.cos(angle));
        
            button.setAttribute("socialvr-barge-button", "text: Toggle; radius: 0.3; color: #C576F6; phaseID: 1");
            button.setAttribute("position", position);
            window.APP.scene.appendChild(button);

            angle += step;
        }

        window.APP.hubChannel.sendMessage("Test message", "chat");
    }
});