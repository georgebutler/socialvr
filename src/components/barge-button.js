//import "./systems/sound-effects-system";

AFRAME.registerComponent("socialvr-barge-button", {
  dependencies: ["is-remote-hover-target", "hoverable-visuals"],
  
  // start, stop, reset
  schema: {type: "string", default: "start"},

  init: function() {
    // button text
    const textEl = document.createElement("a-entity");
    textEl.setAttribute("text", `value: ${this.data.toUpperCase()}; align: center;`);
    textEl.setAttribute("rotation", "0 270 0");
    textEl.setAttribute("position", "0 0.2 0");
    this.el.appendChild(textEl);
    
    this.onClick = this.onClick.bind(this);
    this.el.object3D.addEventListener("interact", this.onClick);
  },

  remove: function() {
    this.el.object3D.removeEventListener("interact", this.onClick);
  },

  onClick: function() {
    this.el.emit(`${this.data}BargeEvent`);
    this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
      SOUND_SNAP_ROTATE,
      this.el.object3D
    );
  }
});