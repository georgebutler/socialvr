AFRAME.registerSystem("socialvr-emoji-target", {
  init: function() {
    this.hoverEl = null;
  },

  tick: function() {
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