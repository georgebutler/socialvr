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

const EMOJI_LIFETIME = 10;

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
}

AFRAME.registerComponent("socialvr-emoji-target", {
  init: function () {
    this.el.setAttribute("tags", "singleActionButton: true");
    this.el.setAttribute("is-remote-hover-target", "");
    // Required hack to make hover states work.
    this.el.classList.add("interactable", "teleport-waypoint-icon");
    this.el.setObject3D("mesh", new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.75, 0.25), new THREE.MeshBasicMaterial({ visible: false })));

    this.hoverVisual = document.createElement("a-entity");
    this.el.appendChild(this.hoverVisual);

    this.activeEmojis = [];

    // NAF Template
    const assets = document.querySelector("a-assets");
    const newTemplate = document.createElement("template");
    newTemplate.id = "sent-emoji";

    const newEntity = document.createElement("a-entity");
    newEntity.setAttribute("body-helper", { type: "dynamic", mass: 1, collisionFilterGroup: 1, collisionFilterMask: 15 });

    newTemplate.content.appendChild(newEntity);
    assets.appendChild(newTemplate);

    // NAF Schema
    const schema = { ...NAF.schemas.schemaDict["#static-media"] }
    schema.template = "#sent-emoji";
    schema.components.push({ component: "position", requiresNetworkUpdate: vectorRequiresUpdate(0.001) });
    schema.components.push({ component: "rotation", requiresNetworkUpdate: vectorRequiresUpdate(0.5) });
    NAF.schemas.add(schema);

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
        data.recipient.object3D.getWorldPosition(this.activeEmojis[index].entity.object3D.position);
        this.activeEmojis[index].entity.object3D.matrixNeedsUpdate = true;
      } else {
        console.log("Removing emoji");
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

    const { entity } = window.APP.utils.addMedia(new URL(emoji.model, window.location).href, "#static-media");

    this.activeEmojis.push({
      entity,
      sender,
      recipient,
      timestamp
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
          button.object3D.addEventListener("interact", this.sendEmoji.bind(this, emoji, null, this.el, performance.now()));

          this.selectionPanel.appendChild(button);
        })
        .catch((e) => {
          console.error(e);
        });
    });
  }
});