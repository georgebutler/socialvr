const emojis = [
  {
    icon: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0000_Rainbow.png",
    model: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/rainbow.glb",
    id: "Rainbow"
  },
  {
    icon: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0001_Star.png",
    model: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/Star.glb",
    id: "Star"
  },
  {
    icon: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0006_Poop.png",
    model: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/poo.glb",
    id: "Poop"
  },
  {
    icon: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0003_Dartt.png",
    model: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/dart.glb",
    id: "Dart"
  },
  {
    icon: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0004_Flower.png",
    model: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/flower.glb",
    id: "Flower"
  },
  {
    icon: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0005_Alarm.png",
    model: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/alarmclock.glb",
    id: "Alarm"
  },
  {
    icon: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0007_Pizza.png",
    model: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/pizza.glb",
    id: "Pizza"
  },
  {
    icon: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0008_Wine.png",
    model: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/wine.glb",
    id: "Wine"
  },
  {
    icon: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0009_Coffee.png",
    model: "https://master--statuesque-rugelach-4185bd.netlify.app/assets/emoji/coffee.glb",
    id: "Coffee"
  },
];

const EMOJI_LIFETIME = 10;
const EMOJI_SPEED = 0.6;
const EMOJI_ARC = 0.2;

AFRAME.registerComponent("socialvr-emoji-target", {
  schema: {
    ownerID: {
      type: "string",
      default: ""
    }
  },

  init: function () {
    this.el.setAttribute("tags", "singleActionButton: true");
    this.el.setAttribute("is-remote-hover-target", "");
    // Required hack to make hover states work.
    this.el.classList.add("interactable", "teleport-waypoint-icon");
    this.el.setObject3D("mesh", new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.75, 0.25), new THREE.MeshBasicMaterial({ visible: false })));

    this.hoverVisual = document.createElement("a-entity");
    this.el.appendChild(this.hoverVisual);

    this.activeEmojis = [];

    // Hover Visual
    window.APP.utils.GLTFModelPlus
      .loadModel(window.APP.utils.emojis[0].model)
      .then((model) => {
        this.hoverVisual.setAttribute("billboard", { onlyY: true });
        this.hoverVisual.setObject3D("mesh", window.APP.utils.cloneObject3D(model.scene));
        this.hoverVisual.object3D.scale.set(0.25, 0.25, 0.25);
        this.hoverVisual.object3D.position.set(0, 0.6, 0);
        this.hoverVisual.object3D.visible = false;
        this.hoverVisual.object3D.matrixNeedsUpdate = true;

        this.el.object3D.addEventListener("hovered", this.onHover.bind(this));
        this.el.object3D.addEventListener("unhovered", this.onUnhover.bind(this));
        this.el.object3D.addEventListener("interact", this.onClick.bind(this));
      })
      .catch((e) => {
        console.error(e);
      });
  },

  remove: function () {
    this.activeEmoji?.remove();
    this.selectionPanel?.remove();

    this.activeEmoji = null;
    this.selectionPanel = null;
  },

  tick: function (time, dt) {
    this.activeEmojis.forEach((data, index, arr) => {
      if ((EMOJI_LIFETIME * 1000) >= performance.now() - data.timestamp) {
        const current = this.activeEmojis[index].entity.object3D.position;
        const destination = new THREE.Vector3();

        data.recipient.object3D.getWorldPosition(destination);
        destination.add(new THREE.Vector3(0, 1.75, 0));

        const pt1 = new THREE.Vector3().lerpVectors(current, destination, 0.25);
        pt1.y += EMOJI_ARC;
        const pt2 = new THREE.Vector3().lerpVectors(current, destination, 0.75);
        pt2.y += EMOJI_ARC;

        const curve = new THREE.CubicBezierCurve3(current, pt1, pt2, destination);
        const totalTime = (curve.getLength() * 10000) / EMOJI_SPEED;
        const progress = (performance.now() - data.timestamp) / totalTime;

        if (progress < 1) {
          this.activeEmojis[index].entity.setAttribute("position", curve.getPointAt(progress));
          this.activeEmojis[index].entity.object3D.matrixNeedsUpdate = true;
        } else {
          this.activeEmojis[index].entity.object3D.position.copy(destination);
          this.activeEmojis[index].entity.object3D.matrixNeedsUpdate = true;
          this.activeEmojis[index].reachedEnd = true;
        }
      } else {
        data.entity.remove();
        arr.splice(index, 1);
      }
    });
  },

  onHover: function () {
    this.hoverVisual.object3D.visible = true;
  },

  onUnhover: function () {
    this.hoverVisual.object3D.visible = false;
  },

  sendEmoji: function (emoji, sender, recipient, timestamp) {
    this.selectionPanel?.remove();
    this.selectionPanel = null;

    const { entity } = window.APP.utils.addMedia(new URL(emoji.model, window.location).href, "#sent-emoji");

    entity.addEventListener("media-loaded", () => {
      const particleEmitterConfig = {
        src: new URL(emoji.icon, window.location).href,
        resolve: false,
        particleCount: 20,
        startSize: 0.01,
        endSize: 0.2,
        sizeRandomness: 0.05,
        lifetime: 1,
        lifetimeRandomness: 0.2,
        ageRandomness: 1,
        startVelocity: { x: 0, y: 0, z: 0 },
        endVelocity: { x: 0, y: -1.87, z: 0 },
        startOpacity: 1,
        middleOpacity: 1,
        endOpacity: 0
      }

      entity.setAttribute("particle-emitter", particleEmitterConfig);
      this.activeEmojis.push({ entity, sender, recipient, timestamp });
      sendLog("emojiSent", { clientId: NAF.clientId, logSender: sender, logReceiver: this.data.ownerID, logEmojiType: emoji.id });
    }, { once: true });

    entity.setAttribute("billboard", { onlyY: true });
    entity.setAttribute("offset-relative-to", {
      target: "#avatar-pov-node",
      offset: { x: 0, y: 0, z: -0.5 },
      selfDestruct: true
    });
  },

  onClick: function () {
    this.selectionPanel?.remove();
    this.selectionPanel = null;

    this.selectionPanel = document.createElement("a-entity");
    this.selectionPanel.setObject3D("mesh", new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ visible: false })));
    this.selectionPanel.setAttribute("offset-relative-to", {
      target: "#avatar-pov-node",
      offset: { x: 0, y: -0.1, z: -0.5 }
    });

    this.el.sceneEl.appendChild(this.selectionPanel);

    emojis.forEach((emoji, index) => {
      window.APP.utils.GLTFModelPlus
        .loadModel(emoji.model)
        .then((model) => {
          if (this.selectionPanel) {
            const button = document.createElement("a-entity");
            button.setAttribute("billboard", "");
            button.setAttribute("tags", "singleActionButton: true");
            button.setAttribute("is-remote-hover-target", "");
            button.setAttribute("css-class", "interactable");
            button.setAttribute("hoverable-visuals", "");
            button.setObject3D("mesh", window.APP.utils.cloneObject3D(model.scene));
            button.object3D.scale.set(0.25, 0.25, 0.25);
            button.object3D.position.set((0.25 * index) - 0.25, 0, 0);
            button.object3D.matrixNeedsUpdate = true;
            button.object3D.addEventListener("interact", this.sendEmoji.bind(this, emoji, null, this.el, performance.now()));

            this.selectionPanel.appendChild(button);
            this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playPositionalSoundAt(19, button.object3D.position, false);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    });
  }
});