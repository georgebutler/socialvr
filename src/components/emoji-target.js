import {sendEmoji} from "../hubs/emoji"

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
    sendEmoji(window.APP.utils.emojis[0], this.el);
  }
});