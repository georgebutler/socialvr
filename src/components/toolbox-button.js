// button for turning specified social VR systems on and off

AFRAME.registerComponent("socailvr-toolbox-button", {
  dependencies: ["is-remote-hover-target", "hoverable-visuals"],

  schema: {type: "string", default: "barge"},

  init: function() {
    // TODO: auto position toolbox button based on existing buttons

    // TODO: custom apearances
    this.el.setAttribute("geometry", "primitive:sphere; radius:0.3");
    this.el.setAttribute("material", "color: pink");
    this.el.setAttribute("tags", "singleActionButton:true");
    this.el.setAttribute("css-class", "interactable");

    // button text
    const textEl = document.createElement("a-entity");
    textEl.setAttribute("text", `value: ${this.data.toUpperCase()}; align: center; color: black`);
    textEl.setAttribute("rotation", "0 270 0");
    textEl.setAttribute("position", "0 0.4 0");
    this.el.appendChild(textEl);

    this.onClick = this.onClick.bind(this);
    this.el.object3D.addEventListener("interact", this.onClick);

    NAF.connection.subscribeToDataChannel("buttonClicked", this.handleClick.bind(this));
  },

  remove: function() {
    this.el.object3D.removeEventListener("interact", this.onClick);
    NAF.connection.unsubscribeToDataChannel("buttonClicked");
  },

  onClick: function() {
    this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
      11,
      this.el.object3D
    );

    this.handleClick();
    NAF.connection.broadcastData("buttonClicked", {});
  },

  handleClick(senderId, dataType, data, targetId) {
    const tool = this.el.sceneEl.systems[`socialvr-${this.data.toLowerCase()}`].tool;

    if (tool.getAttribute("visible")) {
      // REMOVE

      // handle reset events
      tool.emit("resetBargeEvent");

      tool.setAttribute("visible", false);
      tool.pause();
    } else {
      // CREATE
      tool.setAttribute("visible", true);
      tool.play();
    }
  }
});