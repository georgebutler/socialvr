AFRAME.registerComponent("socialvr-barge-button", {
  dependencies: ["is-remote-hover-target", "hoverable-visuals"],
  
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
    this.geometry = new THREE.SphereGeometry(this.data.radius, 16, 8);
    this.material = new THREE.MeshStandardMaterial({
      color: this.data.color,
      roughness: 0.5,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.el.setObject3D('mesh', this.mesh);
    this.el.setAttribute("tags", "singleActionButton: true");
    this.el.setAttribute("socialvr-barge-child", "");
    this.el.classList.add("interactable");

    // Text
    this.text = document.createElement("a-entity");
    this.text.setAttribute("position", `0 ${this.data.radius + 0.2} 0`);
    this.text.setAttribute("text", `value: ${this.data.text}; align: center; side: double; width: 4;`);
    this.text.setAttribute("geometry", `primitive: plane; height: auto; width: 0.75;`);
    this.text.setAttribute("material", "color: #807e7e;");
    this.text.setAttribute("billboard", "onlyY: true;");
    this.el.appendChild(this.text);
    
    this.onClick = this.onClick.bind(this);
    this.el.object3D.addEventListener("interact", this.onClick);
  },

  remove: function() {
    this.el.object3D.removeEventListener("interact", this.onClick);
  },

  onClick: function() {
    this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(11, this.el.object3D);

    if (this.data.phaseID >= 0) {
      if (this.data.phaseID === 1) {
        // Remove hangar objects
        const removeImages = [
          "https://hubscloud-assets.socialsuperpowers.net/files/04ff2033-e9f6-4f82-991a-0d7d530062f5.jpg",
          "https://hubscloud-assets.socialsuperpowers.net/files/40fb41d1-c6cd-4541-88f2-7386076b01ae.jpg"
        ];

        document.querySelectorAll("[media-image]").forEach((element) => {
          if (removeImages.includes(element.components["media-image"].data.src)) {
            element.parentNode.removeChild(element);
          }
        });

        const removeClasses = [
          ".ReadMe__setInvisibleOnBargeMove",
          ".GrabMe__setInvisibleOnBargeMove"
        ];

        removeClasses.forEach((cls) => {
          const element = document.querySelector(cls);

          if (element) {
            element.parentNode.removeChild(element);
          }
        });
        
        // Start moving
        this.el.sceneEl.emit("startMovingWorld");
      }
    } else {
      this.el.sceneEl.emit(this.data.eventName);
    }
  }
});