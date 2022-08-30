AFRAME.registerComponent("socialvr-emoji-cancel-button", {
    dependencies: ["is-remote-hover-target"],

    init: function () {
        console.log("[Social VR] Emoji Cancel Button Component - Initialized");

        this.el.setAttribute("geometry", "primitive:plane; height:0.1; width:0.2");
        this.el.setAttribute("text", "value:CANCEL; align:center; color:black; height:0.2; width:0.6");

        this.el.setAttribute("tags", "singleActionButton: true");
        this.el.setAttribute("is-remote-hover-target", "");
        this.el.setAttribute("css-class", "interactable");
        this.el.setAttribute("hoverable-visuals", "");
        
        this.el.object3D.addEventListener("interact", this.onClick.bind(this));
    },

    remove: function () {
        this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
    },

    onClick: function () {
        this.el.sceneEl.systems["socialvr-emoji-button"].unregister();
    }
});