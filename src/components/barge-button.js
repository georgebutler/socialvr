//import "./systems/sound-effects-system";

AFRAME.registerComponent("socialvr-barge-button", {
  dependencies: ["is-remote-hover-target", "hoverable-visuals"],
  
  // start, stop, reset
  schema: {
    text: {
      type: "string", 
      default: "start"
    },
    eventName: {
      type: "string",
      default: ""
    }
  },

  init: function() {
    // Button
    this.el.setAttribute("socialvr-barge-child", "");
    this.el.setAttribute("tags", "singleActionButton: true");
    this.el.setAttribute("css-class", "interactable");

    // Text
    const textEl = document.createElement("a-entity");
    textEl.setAttribute("text", `value: ${this.data.text.toUpperCase()}; align: center;`);
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
    const scene = document.querySelector("a-scene");

    scene.emit(this.data.eventName);
    console.log(this.data.eventName)
    this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
      11,
      this.el.object3D
    );
  }
});