AFRAME.registerSystem("socialvr-emoji-button", {
    init: function () {
        console.log("[Social VR] Emoji Button System - Initialized");
        this.emojiButtons = [];
        this.cancelButton = null;
    },

    // register single emoji button
    registerEmoji: function (emojiButton) {
        this.emojiButtons.push(emojiButton);
    },

    registerCancel: function (cancelButton) {
        this.cancelButton = cancelButton;
    },

    // unregister all emoji buttons
    unregister: function () {
        while (this.emojiButtons.length > 0) {
            this.emojiButtons[0].parentEl.removeChild(this.emojiButtons[0]);
            this.emojiButtons.shift();
        }

        this.cancelButton.parentEl.removeChild(this.cancelButton);
        this.cancelButton = null;
    }
});