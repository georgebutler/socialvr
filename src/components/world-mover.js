AFRAME.registerComponent("socialvr-world-mover", {
    init: function() {
    },

    tick: function (time, delta) {
        this.el.object3D.position.z += 1 * (delta / 1000)
    }
})