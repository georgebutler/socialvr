AFRAME.registerComponent("socialvr-emoji-target", {
  init: function () {
    this.el.setAttribute("tags", "singleActionButton: true");
    this.el.setAttribute("is-remote-hover-target", "");
    // Required hack to make hover states work.
    this.el.classList.add("interactable", "teleport-waypoint-icon");
    this.el.setObject3D("mesh", new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.75, 0.25), new THREE.MeshBasicMaterial({ visible: false })));
    this.el.object3D.position.set(0, 1.75 / 2, 0);

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
        this.hoverVisual.object3D.visible = false;
      })
      .catch((e) => {
        console.error(e);
      });
  },

  onHover: function () {
    this.hoverVisual.object3D.scale.set(0.25, 0.25, 0.25);
    this.hoverVisual.object3D.visible = true;
  },

  onUnhover: function () {
    this.hoverVisual.object3D.visible = false;
  },

  onClick: function () {
    alert("Clicked!");
  }
});