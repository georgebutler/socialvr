import { sendEmoji } from "../hubs/emoji"

AFRAME.registerComponent("socialvr-emoji-button", {
    dependencies: ["is-remote-hover-target"],
  
    schema: {
      model: { default: null },
      particleEmitterConfig: {
        default: null,
        parse: v => (typeof v === "object" ? v : JSON.parse(v)),
        stringify: JSON.stringify
      },
      target: { default: null }
    },

    init: function() {
      console.log("[Social VR] Emoji Target - Initialized");
  
      this.el.setAttribute("tags", "singleActionButton: true");
      this.el.setAttribute("css-class", "interactable");
      this.el.object3D.addEventListener("interact", this.onClick.bind(this));
    },
    
    remove: function() {
      this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
    },
  
    onClick: function() {
      sendEmoji(this.data.model, this.data.particleEmitterConfig, this.data.target);
    }
  });