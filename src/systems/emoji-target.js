AFRAME.registerSystem("socialvr-emoji-target", {
  init: function() {
    this.VR = false;
    this.head = window.APP.componentRegistry["player-info"][0].el.querySelector("#avatar-pov-node"); 
    this.hudAnchor = this.head;
    
    this.hoverEl = null;

    this.el.addEventListener("enter-vr", this.enterVR.bind(this));
    this.el.addEventListener("exit-vr", this.exitVR.bind(this));
  },

  remove: function() {
    this.el.removeEventListener("enter-vr", this.enterVR.bind(this));
    this.el.removeEventListener("exit-vr", this.exitVR.bind(this));
  },

  enterVR: function() {
    this.VR = true;
    this.hudAnchor = window.APP.componentRegistry["player-info"][0].el.querySelector(".model");
  },

  exitVR: function() {
    this.VR = false;
    this.hudAnchor = this.head;
  },

  tick: function() {
    // TODO: dont do this in tick, do it as players join instead
    window.APP.componentRegistry["player-info"].forEach(player => {
      player.el.setAttribute("socialvr-emoji-target", "name", player.displayName);
    });

    // hover state visual
    let hudOpen = this.hudAnchor.querySelector(".socialvr-emoji-button");
    let currHoverEl = this.el.systems.interaction.state.rightRemote.hovered;

    if (!hudOpen && currHoverEl && currHoverEl.getAttribute("socialvr-emoji-target")) {
      if (!this.hoverEl) {
        currHoverEl.emit("hover");
        this.hoverEl = currHoverEl;
      }
    } else {
      if (this.hoverEl) {
        this.hoverEl.emit("unhover");
        this.hoverEl = null;
      }
    }
  }
});