AFRAME.registerSystem("socialvr-emoji-target", {
  init: function() {
    this.hoverEl = null;
  },

  tick: function() {
    // TODO: dont do this in tick, do it as players join instead
    window.APP.componentRegistry["player-info"].forEach(player => {
      player.el.setAttribute("socialvr-emoji-target", "name", player.displayName);
    });

    // hover state visual
    let currHoverEl = this.el.systems.interaction.state.rightRemote.hovered;

    if (currHoverEl && currHoverEl.getAttribute("socialvr-emoji-target")) {
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