const emojis = [
  {
    icon: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0000_Rainbow.png",
    model: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/rainbow.glb",
    id: "Rainbow"
  },
  {
    icon: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0001_Star.png",
    model: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/Star.glb",
    id: "Star"
  },
  {
    icon: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0006_Poop.png",
    model: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/poo.glb",
    id: "Poop"
  },
  {
    icon: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0003_Dartt.png",
    model: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/dart.glb",
    id: "Dart"
  },
  {
    icon: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0004_Flower.png",
    model: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/flower.glb",
    id: "Flower"
  },
  {
    icon: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0005_Alarm.png",
    model: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/alarmclock.glb",
    id: "Alarm"
  },
  {
    icon: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0007_Pizza.png",
    model: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/pizza.glb",
    id: "Pizza"
  },
  {
    icon: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0008_Wine.png",
    model: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/wine.glb",
    id: "Wine"
  },
  {
    icon: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0009_Coffee.png",
    model: "https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/coffee.glb",
    id: "Coffee"
  },
];

AFRAME.registerComponent("socialvr-emoji-target", {
  init: function () {
    NAF.utils.getNetworkedEntity(this.el).then(networkedEl => {
      this.owner = networkedEl.components.networked.data.owner;
    });

    this.el.setAttribute("tags", "singleActionButton: true");
    this.el.setAttribute("is-remote-hover-target", "");
    // Required hack to make hover states work.
    this.el.classList.add("interactable", "teleport-waypoint-icon");
    this.el.setObject3D("mesh", new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.75, 0.25), new THREE.MeshBasicMaterial({ visible: false })));

    this.hoverVisual = document.createElement("a-entity");
    this.el.appendChild(this.hoverVisual);

    this.el.object3D.addEventListener("hovered", this.onHover.bind(this));
    this.el.object3D.addEventListener("unhovered", this.onUnhover.bind(this));
    this.el.object3D.addEventListener("interact", this.onClick.bind(this));
  },

  remove: function () {
    this.activeEmoji?.remove();
    this.selectionPanel?.remove();
    this.selectionPanel = null;
  },

  play: function () {
    window.APP.utils.GLTFModelPlus
      .loadModel(window.APP.utils.emojis[0].model)
      .then((model) => {
        this.hoverVisual.setAttribute("billboard", { onlyY: true });
        this.hoverVisual.setObject3D("mesh", window.APP.utils.cloneObject3D(model.scene));
        this.hoverVisual.object3D.scale.set(0.25, 0.25, 0.25);
        this.hoverVisual.object3D.position.set(0, 0.6, 0);
        this.hoverVisual.object3D.visible = false;
        this.hoverVisual.object3D.matrixNeedsUpdate = true;
      })
      .catch((e) => {
        console.error(e);
      });
  },

  tick: function(t, dt) {
    if (this.activeEmoji) {
      this.activeEmoji.object3D.position.set(0, 4, 0);
    }
  },

  onHover: function () {
    this.hoverVisual.object3D.visible = true;
  },

  onUnhover: function () {
    this.hoverVisual.object3D.visible = false;
  },

  sendEmoji: function (emoji) {
    const { entity } = window.APP.utils.addMedia(new URL(emoji.model, window.location).href, "#interactable-emoji");
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
      startVelocity: { x: 0, y: 1, z: 0 },
      endVelocity: { x: 0, y: -2, z: 0 },
      startOpacity: 1,
      middleOpacity: 1,
      endOpacity: 0
    };

    entity.setAttribute("offset-relative-to", {
      target: "#avatar-pov-node",
      offset: { x: 0, y: 0, z: -1.5 }
    });

    entity.addEventListener("model-loaded", () => {
      entity.querySelector(".particle-emitter").setAttribute("particle-emitter", particleEmitterConfig);
      entity.setAttribute("emoji", { particleEmitterConfig: particleEmitterConfig });
      entity.removeAttribute("owned-object-cleanup-timeout");
    });

    this.activeEmoji = entity;
    this.selectionPanel?.remove();
    this.selectionPanel = null;
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
        .loadModel(new URL(emoji.model, window.location).href)
        .then((model) => {
          const button = document.createElement("a-entity");
          button.setAttribute("billboard", "");
          button.setAttribute("tags", "singleActionButton: true");
          button.setAttribute("is-remote-hover-target", "");
          button.setAttribute("css-class", "interactable");
          button.setAttribute("hoverable-visuals", "");
          button.setObject3D("mesh", window.APP.utils.cloneObject3D(model.scene));
          button.object3D.scale.set(0.25, 0.25, 0.25);
          button.object3D.position.set((0.25 * index) - (((1 / emojis.length) * emojis.length) / 2), 0, 0);
          button.object3D.matrixNeedsUpdate = true;
          button.object3D.addEventListener("interact", this.sendEmoji.bind(this, emoji));

          this.selectionPanel.appendChild(button);
        })
        .catch((e) => {
          console.error(e);
        });
    });
  }
});