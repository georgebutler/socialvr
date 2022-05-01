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
    },
    radius: {
      type: "number",
      default: 0.2
    },
    color: {
      type: "color",
      default: "#FFF"
    }
  },

  init: function() {
    var data = this.data;
    var el = this.el;

    // Geometry
    this.geometry = new THREE.SphereGeometry(data.radius, 32, 16);
    this.material = new THREE.MeshStandardMaterial({color: data.color});
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    el.setObject3D('mesh', this.mesh);
    el.setAttribute("tags", "singleActionButton: true");
    el.setAttribute("css-class", "interactable");
    el.setAttribute("socialvr-barge-child", "");

    // Text
    const text = document.createElement("a-entity");

    text.setAttribute("text", `value: ${this.data.text.toUpperCase()}; align: center;`);
    text.setAttribute("rotation", "0 270 0");
    text.setAttribute("position", `0 ${this.data.radius + 0.2} 0`);
    el.appendChild(text);
    
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
      10,
      this.el.object3D
    );
  }
});