AFRAME.registerComponent("socialvr-emoji-target", {
  dependencies: ["is-remote-hover-target"],

  init: function() {
    console.log("[Social VR] Emoji Target - Initialized");

    this.el.setAttribute("tags", "singleActionButton: true");
    this.el.setAttribute("css-class", "interactable");

    // hover state visual
    let hoverVisModel = window.APP.utils.emojis[0].model;
    this.hoverVis = window.APP.utils.addMedia(hoverVisModel, "#static-media", null, null, false, false, false, {}, false, this.el).entity;
    this.hoverVis.object3D.position.y += 2;
    this.hoverVis.object3D.scale.copy(new THREE.Vector3(0.25, 0.25, 0.25));
    this.hoverVis.object3D.visible = false;

    this.head = window.APP.componentRegistry["player-info"][0].el.querySelector("#avatar-pov-node");
  
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
    // TODO: dont do this in tick, do it as players join instead
    window.APP.componentRegistry["player-info"].forEach(player => {
      player.el.setAttribute("socialvr-emoji-target", "");
    });

    // update hover state visual to face this player
    this.hoverVis.object3D.lookAt(this.head.object3D.getWorldPosition(new THREE.Vector3()));
  },

  setComponentForAll: function() {
    window.APP.componentRegistry["player-info"].forEach(player => {
      player.el.setAttribute("socialvr-emoji-target", "");
    });
  },

  onHover: function() {
    this.hoverVis.object3D.visible = true;
  },

  onUnhover: function() {
    this.hoverVis.object3D.visible = false;
  },

  onClick: function() {
    let headHasEmojis = false;
    Array.from(this.head.children).forEach(child => {
      if (child.getAttribute("socialvr-emoji-button") != null) {
        headHasEmojis = true;
      }
    });

    if (!headHasEmojis) {
      let x = -1.5;
      window.APP.utils.emojis.forEach(({ model, particleEmitterConfig }) => {
        const emoji = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.head).entity;
        emoji.object3D.scale.copy(new THREE.Vector3(0.5, 0.5, 0.5));
        emoji.object3D.position.copy(new THREE.Vector3(x, -0.5, -1.5));
        x += 0.5;

        particleEmitterConfig.startVelocity.y = -1;
        particleEmitterConfig.endVelocity.y = -0.25;
        particleEmitterConfig.lifetime = 10;
        particleEmitterConfig.particleCount = 20;

        emoji.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
      });

      const cancelButton = document.createElement("a-entity");
      cancelButton.setAttribute("socialvr-emoji-cancel-button", "");
      this.head.appendChild(cancelButton);
      cancelButton.object3D.position.copy(new THREE.Vector3(0, -0.8, -1.5));

      this.el.sceneEl.systems["socialvr-emoji-button"].registerCancel(cancelButton);
    }
  }
});