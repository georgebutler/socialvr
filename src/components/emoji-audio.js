AFRAME.registerComponent("socialvr-emoji-audio", {
  init: function() {
    console.log("[Social VR] Emoji Manager Component - Initialized");

    NAF.connection.subscribeToDataChannel("playSound", this.playSound.bind(this));
    NAF.connection.subscribeToDataChannel("stopSound", this.stopSound.bind(this));
  
    this.emojiAudio = {};
},
  
  remove: function() {
    NAF.connection.unsubscribeToDataChannel("playSound");
    NAF.connection.unsubscribeToDataChannel("stopSound");
  },

  playSound: function(senderId, dataType, data, targetId) {
    let emoji = document.getElementById(data.emojiID);

    //if (data.targetID == this player id) {
    if (true) {
      let audio = this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
        data.sound,
        emoji.object3D,
        true
      );

      this.emojiAudio[data.emojiID] = audio;
    }
  },

  stopSound: function(senderId, dataType, data, targetId) {
    //if (data.targetID == this player id) {
    if (true) {
      let audio = this.emojiAudio[data.emojiID];

      this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.stopPositionalAudio(audio);
    }  
  },
});