(function () {
  'use strict';

  AFRAME.registerComponent("socialvr-emoji", {
    dependencies: ["is-remote-hover-target"],

    init: function() {
      console.log("[Social VR] Emoji System - Initialized");

      this.el.setAttribute("tags", "singleActionButton: true");
      this.el.setAttribute("css-class", "interactable");

      this.el.object3D.addEventListener("interact", this.onClick.bind(this));
    },
    
    remove: function() {
      this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
    },

    onClick: function() {
      window.APP.utils.spawnEmojiInFrontOfUser(window.APP.utils.emojis[0]);
    }
  });

  // modified https://github.com/mozilla/hubs/blob/hubs-cloud/src/components/emoji.js

  AFRAME.registerComponent("hubs-emoji", {
    schema: {
      emitDecayTime: { default: 1.5 },
      emitFadeTime: { default: 0.5 },
      emitEndTime: { default: 0 },
      particleEmitterConfig: {
        default: null,
        parse: v => (typeof v === "object" ? v : JSON.parse(v)),
        stringify: JSON.stringify
      }
    },

    init() {
      this.data.emitEndTime = performance.now() + this.data.emitDecayTime * 1000;
      this.physicsSystem = this.el.sceneEl.systems["hubs-systems"].physicsSystem;
    },

    play() {
      const mediaLoader = this.el.components["media-loader"];
      if (window.APP.utils.emojis.find(emoji => emoji.model !== mediaLoader.data.src) === -1) {
        this.el.parentNode.removeChild(this.el);
        return;
      }

      this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
        SOUND_SPAWN_EMOJI,
        this.el.object3D
      );
      this.particleEmitter = this.el.querySelector(".particle-emitter");
    },

    update() {
      if (!this.particleConfig && this.data.particleEmitterConfig) {
        this.particleConfig = Object.assign({}, this.data.particleEmitterConfig);
        this.originalParticleCount = this.particleConfig.particleCount;
      }
    },

    tick() {
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

  // import "./components/toolbox-button";

  const scene = document.querySelector("a-scene");

  const dummy = document.createElement("a-box");
  dummy.setAttribute("socialvr-emoji", "");
  scene.appendChild(dummy);

  //console.log(window.APP.utils.emojis);

})();
//# sourceMappingURL=development.js.map
