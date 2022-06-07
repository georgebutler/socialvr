// button for turning specified social VR systems on and off

AFRAME.registerComponent("socailvr-toolbox-button", {
  schema: {type: "string", default: "Barge"},

  init: function() {
    // button text
    const textEl = document.createElement("a-entity");
    textEl.setAttribute("text", `value: ${this.data.toUpperCase()}; align: center; color: black`);
    textEl.setAttribute("rotation", "0 270 0");
    textEl.setAttribute("position", "0 0.4 0");
    this.el.appendChild(textEl);

    this.onClick = this.onClick.bind(this);
    this.el.object3D.addEventListener("interact", this.onClick);

    // precondition: barge already in the scene
    this.barge = this.el.sceneEl.systems["socialvr-barge"].barge;
    
    NAF.connection.subscribeToDataChannel("createBarge", this.createBarge.bind(this));
    NAF.connection.subscribeToDataChannel("removeBarge", this.removeBarge.bind(this));
  },

  remove: function() {
    this.el.object3D.removeEventListener("interact", this.onClick);
    NAF.connection.unsubscribeToDataChannel("createBarge");
    NAF.connection.unsubscribeToDataChannel("removeBarge");
  },

  onClick: function() {
    this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
      11,
      this.el.object3D
    );

    switch (this.data) {
      case "Barge":
        if (this.barge.getAttribute("visible")) {
          this.removeBarge();
          NAF.connection.broadcastData("removeBarge", {});
        } else {
          this.createBarge();
          NAF.connection.broadcastData("createBarge", {});          
        }

      default:
        console.log(`Invalid social VR system ${this.data}`);
    }
  },

  createBarge() {
    this.barge.setAttribute("visible", true);
    this.barge.play();
  },

  removeBarge() {
    this.barge.emit("resetBargeEvent");   // current behavior: onboard passengers teleport back to spawn
    this.barge.setAttribute("visible", false);
    this.barge.pause();
  }
});