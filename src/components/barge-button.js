import { ChangePhase } from "../systems/barge";

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
    phaseID: {
      type: "number",
      default: -1
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
    this.geometry = new THREE.SphereGeometry(data.radius, 16, 8);
    this.material = new THREE.MeshStandardMaterial({
      color: data.color,
      roughness: 0.5,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    el.setObject3D('mesh', this.mesh);
    el.setAttribute("tags", "singleActionButton: true");
    el.setAttribute("css-class", "interactable");
    el.setAttribute("socialvr-barge-child", "");

    // Text
    this.text = document.createElement("a-entity");
    this.text.setAttribute("text", `value: ${this.data.text}; align: center; side: double; width: 2;`);
    this.text.setAttribute("rotation", "0 0 0");
    this.text.setAttribute("position", `0 ${this.data.radius + 0.2} 0`);
    el.appendChild(this.text);
    
    this.onClick = this.onClick.bind(this);
    this.el.object3D.addEventListener("interact", this.onClick);
  },

  tick: function (time, timeDelta) {
    this.text.setAttribute("rotation", `0 ${time * 0.1} 0`);
  },

  remove: function() {
    this.el.object3D.removeEventListener("interact", this.onClick);
  },

  onClick: function() {
    const scene = document.querySelector("a-scene");

    this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
      11,
      this.el.object3D
    );

    if (this.data.phaseID >= 0) {
      // Phase Button
      ChangePhase(null, null, {index: this.data.phaseID});
      NAF.connection.broadcastData("changePhase", {
        index: this.data.phaseID
      });

      // Phase 1 - Go
      if (this.data.phaseID === 1) {

      }
    } else {
      // Generic Button
      scene.emit(this.data.eventName);
    }
  }
});