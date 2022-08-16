AFRAME.registerSystem("socialvr-speech", {
    init: function () {
        console.log("[Social VR] Speech System - Initialized");
        this.tool = null;
    },

    register: function (el) {
        if (this.tool != null) {
            this.el.removeChild(this.tool);
        }

        console.log("[Social VR] Speech Component - Registered");
        this.tool = el;
    },

    unregister: function () {
        this.tool = null;
    },
});