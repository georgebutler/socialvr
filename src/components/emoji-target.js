const emojis = [
  { icon: "", model: window.APP.utils.emojis[0].model, display_name: "Smile" },
  { icon: "", model: window.APP.utils.emojis[1].model, display_name: "Laugh" },
  { icon: "", model: window.APP.utils.emojis[2].model, display_name: "Clap" },
  { icon: "", model: window.APP.utils.emojis[3].model, display_name: "Heart" },
  { icon: "", model: window.APP.utils.emojis[4].model, display_name: "Wave" }
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

  onHover: function () {
    this.hoverVisual.object3D.visible = true;
  },

  onUnhover: function () {
    this.hoverVisual.object3D.visible = false;
  },

  sendEmoji: function (emoji) {
    alert(emoji.display_name);
    this.selectionPanel.parentEl.removeChild(this.selectionPanel);
  },

  onClick: function () {
    this.selectionPanel?.parentEl.removeChild(this.selectionPanel);

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
          button.object3D.addEventListener("interact", this.sendEmoji.bind(this, emoji));

          this.selectionPanel.appendChild(button);
        })
        .catch((e) => {
          console.error(e);
        });
    });
  }
});