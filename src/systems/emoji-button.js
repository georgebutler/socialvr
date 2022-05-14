AFRAME.registerSystem("socialvr-emoji-button", {
  init: function() {
    console.log("[Social VR] Emoji Button System - Initialized");
    this.emojiButtons = [];
  },

  // register single emoji button
  register: function(emojiButton) {
    this.emojiButtons.push(emojiButton);
  },

  // unregister all emoji buttons
  unregister: function() {
    while (this.emojiButtons.length > 0) {
      this.emojiButtons[0].parentEl.removeChild(this.emojiButtons[0]);
      this.emojiButtons.shift();
    }
  }
});
