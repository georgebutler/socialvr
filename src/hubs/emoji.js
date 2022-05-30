AFRAME.registerComponent("hubs-emoji", {
  schema: {
    emitDecayTime: { default: 1.5 },
    emitFadeTime: { default: 0.5 },
    emitEndTime: { default: 0 },
    particleEmitterConfig: {
      default: null,
      parse: v => (typeof v === "object" ? v : JSON.parse(v)),
      stringify: JSON.stringify
    },
    target: { default: null }
  },

  init() {
    this.data.emitEndTime = performance.now() + this.data.emitDecayTime * 1000;
    this.physicsSystem = this.el.sceneEl.systems["hubs-systems"].physicsSystem;

    // prevent auto remove
    this.el.removeAttribute("owned-object-cleanup-timeout");
  },

  play() {
    const mediaLoader = this.el.components["media-loader"];
    if (window.APP.utils.emojis.find(emoji => emoji.model !== mediaLoader.data.src) === -1) {
      this.el.parentNode.removeChild(this.el);
      return;
    }

    // this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
    //   SOUND_SPAWN_EMOJI,
    //   this.el.object3D
    // );
    this.particleEmitter = this.el.querySelector(".particle-emitter");
  },

  update() {
    if (!this.particleConfig && this.data.particleEmitterConfig) {
      this.particleConfig = Object.assign({}, this.data.particleEmitterConfig);
      this.originalParticleCount = this.particleConfig.particleCount;
    }
  },

  tick() {
    // send emoji start
    let emojiPos = this.el.object3D.position.clone();
    let targetPos = this.data.target.object3D.position.clone();
    targetPos.y += 1;

    if (emojiPos.distanceTo(targetPos) <= 0.1) {
      this.el.setAttribute("owned-object-cleanup-timeout", "ttl", 2);
    } else {
      let direction = targetPos.sub(emojiPos).normalize();
      this.el.object3D.position.copy(emojiPos.add(direction.multiplyScalar(0.1)));
    }
    // send emoji end

    const isMine = this.el.components.networked.initialized && this.el.components.networked.isMine();

    if (this.particleConfig && isMine) {
      const now = performance.now();

      const isHeld = this.el.sceneEl.systems.interaction.isHeld(this.el);

      if (isHeld) {
        this.data.emitEndTime = now + this.data.emitDecayTime * 1000;
      }

      const emitFadeTime = this.data.emitFadeTime * 1000;

      if (now < this.data.emitEndTime && this.particleConfig.startOpacity < 1) {
        this.particleConfig.particleCount = this.originalParticleCount;
        this.particleConfig.startOpacity = 1;
        this.particleConfig.middleOpacity = 1;
        this.particleEmitter.setAttribute("particle-emitter", this.particleConfig, true);
      } else if (now >= this.data.emitEndTime && this.particleConfig.startOpacity > 0.001) {
        const timeSinceStop = Math.min(now - this.data.emitEndTime, emitFadeTime);
        const opacity = 1 - timeSinceStop / emitFadeTime;
        const particleCount = opacity < 0.001 && this.particleConfig.particleCount > 0 ? 0 : this.originalParticleCount;
        this.particleConfig.particleCount = particleCount;
        this.particleConfig.startOpacity = opacity;
        this.particleConfig.middleOpacity = opacity;
        this.particleEmitter.setAttribute("particle-emitter", this.particleConfig, true);
      }
    }
  }
});

export function sendEmoji(model, particleEmitterConfig, target) {
  const { entity } = window.APP.utils.addMedia(model, "#interactable-emoji");
  entity.setAttribute("offset-relative-to", {
    target: "#avatar-pov-node",
    offset: { x: 0, y: 0, z: -1.5 }
  });
  entity.addEventListener("model-loaded", () => {
    let particleEmitter = entity.querySelector(".particle-emitter");
    particleEmitter.setAttribute("particle-emitter", particleEmitterConfig);

    entity.setAttribute("hubs-emoji", { particleEmitterConfig: particleEmitterConfig, target: target });
  });
}
