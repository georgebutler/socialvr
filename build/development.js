(function () {
  'use strict';

  AFRAME.registerComponent("socialvr-emoji-target", {
    dependencies: ["is-remote-hover-target"],

    init: function() {
      console.log("[Social VR] Emoji Target - Initialized");

      this.el.setAttribute("tags", "singleActionButton: true");
      this.el.setAttribute("css-class", "interactable");
      this.el.object3D.addEventListener("interact", this.onClick.bind(this));

      // window.APP.hubChannel.presence.onJoin((clientId) => {
      //   console.log("[SocialVR] Player Joined");
      // })
    },
    
    remove: function() {
      this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
    },

    tick: function() {
      // TODO: more efficient way to do this
      window.APP.componentRegistry["player-info"].forEach(player => {
        player.el.setAttribute("socialvr-emoji-target", "");
      });
    },

    onClick: function() {
      const head = window.APP.componentRegistry["player-info"][0].el.querySelector("#avatar-pov-node");  

      let x = -1.5;
      window.APP.utils.emojis.forEach(({ model, particleEmitterConfig }) => {
        const emoji = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, head).entity;
        emoji.object3D.scale.copy(new THREE.Vector3(0.5, 0.5, 0.5));
        emoji.object3D.position.copy(new THREE.Vector3(x, -1, -1.5));
        x += 0.5;

        emoji.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
      });
    }
  });

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

  function sendEmoji(model, particleEmitterConfig, target) {
    console.log(model);
    console.log(particleEmitterConfig);
    console.log(target);

    const { entity } = window.APP.utils.addMedia(model, "#interactable-emoji");
    entity.setAttribute("offset-relative-to", {
      target: "#avatar-pov-node",
      offset: { x: 0, y: 0, z: -1.5 }
    });
    entity.addEventListener("model-loaded", () => {
      entity.querySelector(".particle-emitter").setAttribute("particle-emitter", particleEmitterConfig);
      entity.setAttribute("hubs-emoji", { particleEmitterConfig: particleEmitterConfig, target: target });
    });
  }

  AFRAME.registerComponent("socialvr-emoji-button", {
      dependencies: ["is-remote-hover-target"],
    
      schema: {
        model: { default: null },
        particleEmitterConfig: {
          default: null,
          parse: v => (typeof v === "object" ? v : JSON.parse(v)),
          stringify: JSON.stringify
        },
        target: { default: null }
      },

      init: function() {
        console.log("[Social VR] Emoji Target - Initialized");
    
        this.el.setAttribute("tags", "singleActionButton: true");
        this.el.setAttribute("css-class", "interactable");
        this.el.object3D.addEventListener("interact", this.onClick.bind(this));
      },
      
      remove: function() {
        this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
      },
    
      onClick: function() {
        sendEmoji(this.data.model, this.data.particleEmitterConfig, this.data.target);
      }
    });

  // import "./components/toolbox-button";

  const scene = document.querySelector("a-scene");

  const dummy = document.createElement("a-box");
  dummy.setAttribute("socialvr-emoji-target", "");
  scene.appendChild(dummy);

})();
//# sourceMappingURL=development.js.map
