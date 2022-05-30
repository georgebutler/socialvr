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