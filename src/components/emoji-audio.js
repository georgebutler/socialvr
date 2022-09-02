AFRAME.registerComponent("socialvr-emoji-audio", {
    init: function () {
        console.log("[Social VR] Emoji Manager Component - Initialized");

        this.emojiAudio = {};

        NAF.connection.subscribeToDataChannel("playSound", this.playSound.bind(this));
        NAF.connection.subscribeToDataChannel("stopSound", this.stopSound.bind(this));
    },

    tick: function () {
        // have to do this here cus displayName only applies once in room
        this.name = window.APP.componentRegistry["player-info"][0].displayName;
    },

    remove: function () {
        NAF.connection.unsubscribeToDataChannel("playSound");
        NAF.connection.unsubscribeToDataChannel("stopSound");
    },

    playSound: function (senderId, dataType, data, targetId) {
        let emoji = document.getElementById(data.emojiID);

        console.log(data.targetName);
        console.log(this.name);

        if (data.targetName == this.name) {
            let audio = this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
                data.sound,
                emoji.object3D,
                true
            );

            this.emojiAudio[data.emojiID] = audio;
        }
    },

    stopSound: function (senderId, dataType, data, targetId) {
        if (data.targetName == this.name) {
            let audio = this.emojiAudio[data.emojiID];

            this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.stopPositionalAudio(audio);
        }
    },
});