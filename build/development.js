(function () {
  'use strict';

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

  function sendEmoji(model, particleEmitterConfig, target) {
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

  AFRAME.registerComponent("socialvr-emoji-target", {
    dependencies: ["is-remote-hover-target"],

    schema: {
      name: { default: "" }
    },

    init: function() {
      console.log("[Social VR] Emoji Target - Initialized");

      this.el.setAttribute("tags", "singleActionButton: true");
      this.el.setAttribute("css-class", "interactable");

      // hover state visual
      let hoverVisModel = window.APP.utils.emojis[0].model;
      this.hoverVis = window.APP.utils.addMedia(hoverVisModel, "#static-media", null, null, false, false, false, {}, false, this.el).entity;
      this.hoverVis.object3D.position.y += 2;
      this.hoverVis.object3D.scale.copy(new THREE.Vector3(0.5, 0.5, 0.5));
      this.hoverVis.object3D.visible = false;
    
      this.el.addEventListener("hover", this.onHover.bind(this));
      this.el.addEventListener("unhover", this.onUnhover.bind(this));
      this.el.object3D.addEventListener("interact", this.onClick.bind(this));
    },
    
    remove: function() {
      this.el.removeEventListener("hover", this.onHover.bind(this));
      this.el.removeEventListener("unhover", this.onUnhover.bind(this));
      this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
    },

    tick: function() {
      // update hover state visual to face this player
      this.hoverVis.object3D.lookAt(this.system.head.object3D.getWorldPosition(new THREE.Vector3()));
    },

    onHover: function() {
      this.hoverVis.object3D.visible = true;
    },

    onUnhover: function() {
      this.hoverVis.object3D.visible = false;
    },

    onClick: function() {
      if (!this.system.hudAnchor.querySelector(".socialvr-emoji-button")) {
        const hudScale = (this.system.VR) ? 0.2 : 0.5;
        const hudX = (this.system.VR) ? -0.6 : -1.5;
        const hudY = (this.system.VR) ? 1.4 : -0.5;
        const hudZ = (this.system.VR) ? -1 : -1.5;
        const hudSpacing = (this.system.VR) ? 0.2 : 0.5;

        let x = hudX;
        window.APP.utils.emojis.forEach(({ model, particleEmitterConfig }) => {
          const emoji = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;

          emoji.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));
          emoji.object3D.position.copy(new THREE.Vector3(x, hudY, hudZ));
          x += hudSpacing;

          particleEmitterConfig.startVelocity.y = 0;
          particleEmitterConfig.endVelocity.y = -2;

          emoji.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
          emoji.className = "socialvr-emoji-button";
        });

        const cancelButton = document.createElement("a-entity");
        cancelButton.setAttribute("socialvr-emoji-cancel-button", "");
        this.system.hudAnchor.appendChild(cancelButton);
        cancelButton.object3D.position.copy(new THREE.Vector3(0, hudY - 0.3, hudZ));
        this.el.sceneEl.systems["socialvr-emoji-button"].registerCancel(cancelButton);

        // custom model, local: change url for each ngrok session, remote: change url to netlify
        // TODO: do this from Spoke instead
        const url = "https://2dd6-2601-645-c000-8880-98b5-5952-f39f-7a22.ngrok.io";
        const modelURL = url + "/assets/rubber_duck.glb";
        const particleURL = url + "/assets/rubber_duck.png";
        const model = new URL(modelURL, window.location).href;
        const particleEmitterConfig = {
          src: new URL(particleURL, window.location).href,
          resolve: false,
          particleCount: 20,
          startSize: 0.01,
          endSize: 0.2,
          sizeRandomness: 0.05,
          lifetime: 1,
          lifetimeRandomness: 0.2,
          ageRandomness: 1,
          startVelocity: { x: 0, y: 0, z: 0 },
          endVelocity: { x: 0, y: -2, z: 0 },
          startOpacity: 1,
          middleOpacity: 1,
          endOpacity: 0
        };

        const button = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;
        const buttonY = (this.system.VR) ? hudY + 0.2 : hudY + 0.4;
        button.object3D.position.copy(new THREE.Vector3(0, buttonY, hudZ));
        button.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));

        button.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
        button.className = "socialvr-emoji-button";
      }
    }
  });

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

      this.el.setAttribute("geometry", "primitive:plane; height:0.1; width:0.2");
      this.el.setAttribute("text", "value:CANCEL; align:center; color:black; height:0.2; width:0.6");

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

  AFRAME.registerComponent("socialvr-emoji-audio", {
    init: function() {
      console.log("[Social VR] Emoji Manager Component - Initialized");
    
      this.emojiAudio = {};

      NAF.connection.subscribeToDataChannel("playSound", this.playSound.bind(this));
      NAF.connection.subscribeToDataChannel("stopSound", this.stopSound.bind(this));
    },

    tick: function() {
      // have to do this here cus displayName only applies once in room
      this.name = window.APP.componentRegistry["player-info"][0].displayName;    
    },
    
    remove: function() {
      NAF.connection.unsubscribeToDataChannel("playSound");
      NAF.connection.unsubscribeToDataChannel("stopSound");
    },

    playSound: function(senderId, dataType, data, targetId) {
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

    stopSound: function(senderId, dataType, data, targetId) {
      if (data.targetName == this.name) {
        let audio = this.emojiAudio[data.emojiID];

        this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.stopPositionalAudio(audio);
      }  
    },
  });

  AFRAME.registerSystem("socialvr-emoji-target", {
    init: function() {
      this.VR = false;
      this.head = window.APP.componentRegistry["player-info"][0].el.querySelector("#avatar-pov-node"); 
      this.hudAnchor = this.head;
      
      this.hoverEl = null;

      this.el.addEventListener("enter-vr", this.enterVR.bind(this));
      this.el.addEventListener("exit-vr", this.exitVR.bind(this));
    },

    remove: function() {
      this.el.removeEventListener("enter-vr", this.enterVR.bind(this));
      this.el.removeEventListener("exit-vr", this.exitVR.bind(this));
    },

    enterVR: function() {
      this.VR = true;
      this.hudAnchor = window.APP.componentRegistry["player-info"][0].el.querySelector(".model");
    },

    exitVR: function() {
      this.VR = false;
      this.hudAnchor = this.head;
    },

    tick: function() {
      // TODO: dont do this in tick, do it as players join instead
      window.APP.componentRegistry["player-info"].forEach(player => {
        player.el.setAttribute("socialvr-emoji-target", "name", player.displayName);
      });

      // hover state visual
      let hudOpen = this.hudAnchor.querySelector(".socialvr-emoji-button");
      let currHoverEl = this.el.systems.interaction.state.rightRemote.hovered;

      if (!hudOpen && currHoverEl && currHoverEl.getAttribute("socialvr-emoji-target")) {
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

  const emojiAudio = document.createElement("a-entity");
  emojiAudio.setAttribute("socialvr-emoji-audio", "");
  scene.appendChild(emojiAudio);

  const dummy = document.createElement("a-box");
  dummy.setAttribute("socialvr-emoji-target", "");
  scene.appendChild(dummy);

})();
//# sourceMappingURL=development.js.map
