const SPEED = 0.005;      // units per frame
const ARC = 2;            // higher = more parabolic
const AUDIO_THRESH = 10;  // distance to target to play audio cue
const SOUND = 15;         // sound effect choice
const DURATION = 3;       // duration over target before disappearing

AFRAME.registerComponent("socialvr-emoji", {
  schema: {
    target: { default: null }
  },

  init() {
    // prevent auto remove
    this.el.removeAttribute("owned-object-cleanup-timeout");

    // initial position of target
    this.targetInitPos = this.data.target.object3D.position.clone();
    this.targetInitPos.y += 2;

    // parabolic path
    let emojiPos = this.el.object3D.position;
    let pt1 = new THREE.Vector3().lerpVectors(emojiPos, this.targetInitPos, 0.33);
    pt1.y += ARC;
    let pt2 = new THREE.Vector3().lerpVectors(emojiPos, this.targetInitPos, 0.66);
    pt2.y += ARC;
    this.curve = new THREE.CubicBezierCurve3(emojiPos, pt1, pt2, this.targetInitPos);
    this.timeElapsed = 0;

    // audio cue
    this.soundPlayed = false;
    this.audio = this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
      SOUND,
      this.el.object3D,
      true
    );
    this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.stopPositionalAudio(this.audio);
  },

  tick(t, dt) {
    let totalTime = this.curve.getLength() / SPEED;
    let progress = this.timeElapsed / totalTime;

    let emojiPos = this.el.object3D.position;
    let targetPos = this.data.target.object3D.position.clone();
    targetPos.y += 2;

    // audio cue
    const targetName = this.data.target.getAttribute("socialvr-emoji-target").name;
    console.log(targetName);
    let dist = emojiPos.distanceTo(targetPos);
    if (!this.soundPlayed && dist < AUDIO_THRESH) {
      NAF.connection.broadcastData("playSound", { sound: SOUND, emojiID: this.el.id, targetName: targetName });
      this.soundPlayed = true;
    }

    // movement
    if (progress >= 1) {
      // reached target
      emojiPos.copy(targetPos);

      this.el.setAttribute("owned-object-cleanup-timeout", "ttl", DURATION);

      NAF.connection.broadcastData("stopSound", { emojiID: this.el.id, targetName: targetName });
    } else {
      // en route to target
      emojiPos.copy(this.curve.getPointAt(progress));

      let targetMovement = targetPos.sub(this.targetInitPos);
      emojiPos.add(targetMovement);
    }

    this.timeElapsed += dt;
  }
});

export function sendEmoji(model, particleEmitterConfig, target) {
  const emoji = window.APP.utils.addMedia(model, "#interactable-emoji").entity;
  emoji.setAttribute("offset-relative-to", {
    target: "#avatar-pov-node",
    offset: { x: 0, y: 0, z: -1.5 }
  });
  emoji.addEventListener("model-loaded", () => {
    let particleEmitter = emoji.querySelector(".particle-emitter");
    particleEmitter.setAttribute("particle-emitter", particleEmitterConfig);

    emoji.setAttribute("socialvr-emoji", "target", target );
  });
}
