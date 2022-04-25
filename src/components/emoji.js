AFRAME.registerComponent("socialvr-emoji", {
  dependencies: ["is-remote-hover-target"],

  init: function() {
    console.log("[Social VR] Emoji System - Initialized");

    this.el.setAttribute("tags", "singleActionButton: true");
    this.el.setAttribute("css-class", "interactable");

    this.el.object3D.addEventListener("interact", this.onClick.bind(this));
    NAF.connection.subscribeToDataChannel("hub:join", this.onJoin.bind(this));
  },
  
  remove: function() {
    this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
    NAF.connection.unsubscribeToDataChannel("hub:join");
  },

  onClick: function() {
    window.APP.utils.spawnEmojiInFrontOfUser(window.APP.utils.emojis[0]);
  },

  onJoin: function() {
    console.log("[SOCIAL VR] PLAYER JOINED");
  }
});