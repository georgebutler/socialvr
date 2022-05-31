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

      let headHasEmojis = false;
      Array.from(head.children).forEach(child => {
        if (child.getAttribute("socialvr-emoji-button") != null) {
          headHasEmojis = true;
        }
      });

      if (!headHasEmojis) {
        let x = -1.5;
        window.APP.utils.emojis.forEach(({ model, particleEmitterConfig }) => {
          const emoji = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, head).entity;
          emoji.object3D.scale.copy(new THREE.Vector3(0.5, 0.5, 0.5));
          emoji.object3D.position.copy(new THREE.Vector3(x, -0.5, -1.5));
          x += 0.5;

          particleEmitterConfig.startVelocity.y = -1;
          particleEmitterConfig.endVelocity.y = -0.25;
          particleEmitterConfig.lifetime = 10;
          particleEmitterConfig.particleCount = 20;

          emoji.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
        });

        const cancelButton = document.createElement("a-entity");
        cancelButton.setAttribute("socialvr-emoji-cancel-button", "");
        head.appendChild(cancelButton);
        cancelButton.object3D.position.copy(new THREE.Vector3(0, -0.8, -1.5));

        this.el.sceneEl.systems["socialvr-emoji-button"].registerCancel(cancelButton);
      }
    }
  });

  const SPEED = 0.005;      // units per frame
  const ARC = 2;            // higher = more parabolic
  const AUDIO_THRESH = 10;  // distance to target to play audio cue

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

      this.targetInitPos = this.data.target.object3D.position.clone();

      let emojiPos = this.el.object3D.position;
      let targetPos = this.data.target.object3D.position.clone();
      targetPos.y += 2;

      let pt1 = new THREE.Vector3().lerpVectors(emojiPos, targetPos, 0.33);
      pt1.y += ARC;
      let pt2 = new THREE.Vector3().lerpVectors(emojiPos, targetPos, 0.66);
      pt2.y += ARC;
      this.curve = new THREE.CubicBezierCurve3(emojiPos, pt1, pt2, targetPos);

      this.timeElapsed = 0;
      this.soundPlayed = false;
      this.audio = null;
    },

    play() {
      const mediaLoader = this.el.components["media-loader"];
      if (window.APP.utils.emojis.find(emoji => emoji.model !== mediaLoader.data.src) === -1) {
        this.el.parentNode.removeChild(this.el);
        return;
      }

      this.particleEmitter = this.el.querySelector(".particle-emitter");
    },

    update() {
      if (!this.particleConfig && this.data.particleEmitterConfig) {
        this.particleConfig = Object.assign({}, this.data.particleEmitterConfig);
        this.originalParticleCount = this.particleConfig.particleCount;
      }
    },

    tick(t, dt) {
      let totalTime = this.curve.getLength() / SPEED;
      let progress = this.timeElapsed / totalTime;

      let emojiPos = this.el.object3D.position;
      let targetPos = this.data.target.object3D.position.clone();

      // audio cue
      let dist = emojiPos.distanceTo(targetPos);
      if (!this.soundPlayed && dist < AUDIO_THRESH) {
        this.audio = this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundFollowing(
          15,
          this.el.object3D,
          true
        );
        
        this.soundPlayed = true;
      }

      // movement
      if (progress >= 1) {
        // reached target
        targetPos.y += 2;
        emojiPos.copy(targetPos);

        this.el.setAttribute("owned-object-cleanup-timeout", "ttl", 2);

        if (this.audio != null) {
          this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.stopPositionalAudio(this.audio);
        }
      } else {
        // en route to target
        emojiPos.copy(this.curve.getPointAt(progress));

        let targetMovement = targetPos.sub(this.targetInitPos);
        emojiPos.add(targetMovement);
      }

      this.timeElapsed += dt;

      // Hubs code
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
      console.log("[Social VR] Emoji Button Component - Initialized");

      this.el.setAttribute("tags", "singleActionButton: true");
      this.el.setAttribute("css-class", "interactable");
      this.el.object3D.addEventListener("interact", this.onClick.bind(this));
    
      this.system.registerEmoji(this.el);
    },
    
    remove: function() {
      this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
    },

    onClick: function() {
      sendEmoji(this.data.model, this.data.particleEmitterConfig, this.data.target);
    
      this.el.sceneEl.systems["socialvr-emoji-button"].unregister();
    }
  });

  AFRAME.registerComponent("socialvr-emoji-cancel-button", {
    dependencies: ["is-remote-hover-target"],

    init: function() {
      console.log("[Social VR] Emoji Cancel Button Component - Initialized");

      this.el.setAttribute("geometry", "primitive:plane; height:0.1; width:0.3");
      const text = document.createElement("a-entity");
      text.setAttribute("text", "value:CANCEL; align:center; color:black");
      this.el.appendChild(text);
      text.object3D.position.copy(new THREE.Vector3(0, 0.05, 0.1));

      this.el.setAttribute("tags", "singleActionButton: true");
      this.el.setAttribute("css-class", "interactable");
      this.el.object3D.addEventListener("interact", this.onClick.bind(this));
    },

    remove: function() {
      this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
    },

    onClick: function() {
      this.el.sceneEl.systems["socialvr-emoji-button"].unregister();
    }
  });

  AFRAME.registerSystem("socialvr-emoji-button", {
    init: function() {
      console.log("[Social VR] Emoji Button System - Initialized");
      this.emojiButtons = [];
      this.cancelButton = null;
    },

    // register single emoji button
    registerEmoji: function(emojiButton) {
      this.emojiButtons.push(emojiButton);
    },

    registerCancel: function(cancelButton) {
      this.cancelButton = cancelButton;
    },

    // unregister all emoji buttons
    unregister: function() {
      while (this.emojiButtons.length > 0) {
        this.emojiButtons[0].parentEl.removeChild(this.emojiButtons[0]);
        this.emojiButtons.shift();
      }

      this.cancelButton.parentEl.removeChild(this.cancelButton);
      this.cancelButton = null;
    }
  });

  // import "./components/toolbox-button";

  const scene = document.querySelector("a-scene");

  const dummy = document.createElement("a-box");
  dummy.setAttribute("socialvr-emoji-target", "");
  scene.appendChild(dummy);

})();
//# sourceMappingURL=development.js.map
