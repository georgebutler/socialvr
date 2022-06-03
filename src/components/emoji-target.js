AFRAME.registerComponent("socialvr-emoji-target", {
  dependencies: ["is-remote-hover-target"],

  schema: {
    name: { default: "" }
  },

  init: function() {
    console.log("[Social VR] Emoji Target - Initialized");

    this.el.setAttribute("tags", "singleActionButton: true");
    this.el.setAttribute("css-class", "interactable");

    // hover state visual
    let hoverVisModel = window.APP.utils.emojis[0].model;
    this.hoverVis = window.APP.utils.addMedia(hoverVisModel, "#static-media", null, null, false, false, false, {}, false, this.el).entity;
    this.hoverVis.object3D.position.y += 2;
    this.hoverVis.object3D.scale.copy(new THREE.Vector3(0.5, 0.5, 0.5));
    this.hoverVis.object3D.visible = false;
  
    this.el.addEventListener("hover", this.onHover.bind(this));
    this.el.addEventListener("unhover", this.onUnhover.bind(this));
    this.el.object3D.addEventListener("interact", this.onClick.bind(this));
  },
  
  remove: function() {
    this.el.removeEventListener("hover", this.onHover.bind(this));
    this.el.removeEventListener("unhover", this.onUnhover.bind(this));
    this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
  },

  tick: function() {
    // update hover state visual to face this player
    this.hoverVis.object3D.lookAt(this.system.head.object3D.getWorldPosition(new THREE.Vector3()));
  },

  onHover: function() {
    this.hoverVis.object3D.visible = true;
  },

  onUnhover: function() {
    this.hoverVis.object3D.visible = false;
  },

  onClick: function() {
    if (!this.system.hudAnchor.querySelector(".socialvr-emoji-button")) {
      const hudScale = (this.system.VR) ? 0.2 : 0.5;
      const hudX = (this.system.VR) ? -0.6 : -1.5;
      const hudY = (this.system.VR) ? 1.4 : -0.5;
      const hudZ = (this.system.VR) ? -1 : -1.5;
      const hudSpacing = (this.system.VR) ? 0.2 : 0.5;

      let x = hudX;
      window.APP.utils.emojis.forEach(({ model, particleEmitterConfig }) => {
        const emoji = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;

        emoji.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));
        emoji.object3D.position.copy(new THREE.Vector3(x, hudY, hudZ));
        x += hudSpacing;

        particleEmitterConfig.startVelocity.y = 0;
        particleEmitterConfig.endVelocity.y = -2;
        particleEmitterConfig.particleCount = 20;

        emoji.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
        emoji.className = "socialvr-emoji-button";
      });

      const cancelButton = document.createElement("a-entity");
      cancelButton.setAttribute("socialvr-emoji-cancel-button", "");
      this.system.hudAnchor.appendChild(cancelButton);
      cancelButton.object3D.position.copy(new THREE.Vector3(0, hudY - 0.3, hudZ));
      this.el.sceneEl.systems["socialvr-emoji-button"].registerCancel(cancelButton);
    }
  }
});