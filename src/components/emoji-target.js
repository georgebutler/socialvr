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

const vectorRequiresUpdate = epsilon => {
  return () => {
    let prev = null;

    return curr => {
      if (prev === null) {
        prev = new THREE.Vector3(curr.x, curr.y, curr.z);
        return true;
      } else if (!NAF.utils.almostEqualVec3(prev, curr, epsilon)) {
        prev.copy(curr);
        return true;
      }

      return false;
    };
  };
};

APP.scene.addEventListener("environment-scene-loaded", () => {
  let assets = document.querySelector("a-assets");
	let newTemplate = document.createElement("template");
	newTemplate.id = "interactable-ball-media";

  // TODO: use this as reference
	let parent = document.createElement("a-entity");
  parent.setAttribute("set-xyz-order", "");
  parent.setAttribute("matrix-auto-update", "");

  let particles = document.createElement("a-entity");
  particles.classList.add("particle-emitter");
  particles.setAttribute("particle-emitter", "particleCount: 0");
  particles.setAttribute("scale", "0.25 0.25 0.25");
  particles.setAttribute("position", "0 0.25 -0.001");
  parent.appendChild(particles);

  newTemplate.content.appendChild(parent);
  assets.appendChild(newTemplate);

  NAF.schemas.add({
    template: "#interactable-ball-media",
    components: [
      {
        component: "position",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        component: "rotation",
        requiresNetworkUpdate: vectorRequiresUpdate(0.5)
      },
      {
        component: "scale",
        requiresNetworkUpdate: vectorRequiresUpdate(0.001)
      },
      {
        selector: ".particle-emitter",
        component: "particle-emitter"
      },
      "media-loader",
    ]
  });
}, { once: true });

AFRAME.registerComponent("socialvr-emoji-target", {
  init: function () {
    this.el.setAttribute("tags", "singleActionButton: true");
    this.el.setAttribute("is-remote-hover-target", "");
    // Required hack to make hover states work.
    this.el.classList.add("interactable", "teleport-waypoint-icon");
    this.el.setObject3D("mesh", new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.75, 0.25), new THREE.MeshBasicMaterial({ visible: false })));

    this.hoverVisual = document.createElement("a-entity");
    this.el.appendChild(this.hoverVisual);

    this.sentStartTime = performance.now();

    this.el.object3D.addEventListener("hovered", this.onHover.bind(this));
    this.el.object3D.addEventListener("unhovered", this.onUnhover.bind(this));
    this.el.object3D.addEventListener("interact", this.onClick.bind(this));
  },

  remove: function () {
    this.activeEmoji?.remove();
    this.selectionPanel?.remove();

    this.activeEmoji = null;
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

  tick: function (time, dt) {
    if (this.activeEmoji) {
      const SPEED = 1;
      const ARC = 1;

      // Current Position
      const current = this.activeEmoji.getAttribute("position");

      // Destination
      const destination = new THREE.Vector3();
      this.el.object3D.getWorldPosition(destination);
      destination.add(new THREE.Vector3(0, 1, 0));

      let pt1 = new THREE.Vector3().lerpVectors(current, destination, 1);
      pt1.y += ARC;
      let pt2 = new THREE.Vector3().lerpVectors(current, destination, 0.9);
      pt2.y += ARC;

      let curve = new THREE.CubicBezierCurve3(current, pt1, pt2, destination);
      let totalTime = curve.getLength() * 6000 * SPEED;
      let progress = (performance.now() - this.sentStartTime) / totalTime;

      this.activeEmoji.setAttribute("position", curve.getPointAt(progress));
    }
  },

  onHover: function () {
    this.hoverVisual.object3D.visible = true;
  },

  onUnhover: function () {
    this.hoverVisual.object3D.visible = false;
  },

  sendEmoji: function (emoji) {
    const { entity } = window.APP.utils.addMedia(new URL(emoji.model, window.location).href, "#interactable-ball-media");
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
      endVelocity: { x: 0, y: -2, z: 0 },
      startOpacity: 1,
      middleOpacity: 1,
      endOpacity: 0
    };

    entity.setAttribute("offset-relative-to", {
      target: "#avatar-pov-node",
      offset: { x: 0, y: 0, z: -0.5 },
      selfDestruct: true
    });

    entity.addEventListener("model-loaded", () => {
      entity.setAttribute("particle-emitter", particleEmitterConfig);
      entity.setAttribute("billboard", {
        onlyY: true
      });

      this.sentStartTime = performance.now();
      this.activeEmoji?.remove();
      this.activeEmoji = entity;
      this.selectionPanel?.remove();
      this.selectionPanel = null;
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