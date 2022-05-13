AFRAME.registerComponent("socialvr-emoji-target", {
  dependencies: ["is-remote-hover-target"],

  init: function() {
    console.log("[Social VR] Emoji Target - Initialized");

    this.el.setAttribute("tags", "singleActionButton: true");
    this.el.setAttribute("css-class", "interactable");
    this.el.object3D.addEventListener("interact", this.onClick.bind(this));

    // window.APP.hubChannel.presence.onJoin((clientId) => {
    //   console.log("[SocialVR] Player Joined");
    // })
  },
  
  remove: function() {
    this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
  },

  tick: function() {
    // TODO: more efficient way to do this
    window.APP.componentRegistry["player-info"].forEach(player => {
      player.el.setAttribute("socialvr-emoji-target", "");
    });
  },

  onClick: function() {
    const head = window.APP.componentRegistry["player-info"][0].el.querySelector("#avatar-pov-node");  

    let x = -1.5;
    window.APP.utils.emojis.forEach(({ model, particleEmitterConfig }) => {
      const emoji = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, head).entity;
      emoji.object3D.scale.copy(new THREE.Vector3(0.5, 0.5, 0.5));
      emoji.object3D.position.copy(new THREE.Vector3(x, -1, -1.5));
      x += 0.5;

      emoji.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
    });
  }
});