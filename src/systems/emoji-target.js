AFRAME.registerSystem("socialvr-emoji-target", {
  init: function() {
    // TODO: determine if player in VR or on Desktop
    this.VR = true;
    this.head = window.APP.componentRegistry["player-info"][0].el.querySelector("#avatar-pov-node"); 
    this.hudAnchor = (this.VR) ? window.APP.componentRegistry["player-info"][0].el.querySelector(".model") : this.head;
    
    this.hoverEl = null;
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