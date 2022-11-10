AFRAME.registerComponent("leeds-world-mover", {
  init: function () {
    window.APP.utils.GLTFModelPlus
      .loadModel("https://alex-leeds--statuesque-rugelach-4185bd.netlify.app/assets/environment-11.8.glb")
      .then((model) => {
        this.el.setObject3D("mesh", window.APP.utils.cloneObject3D(model.scene));
      })
      .catch((e) => {
        console.error(e);
      });
  },

  play: function () {
    this.el.object3D.scale.set(0.1, 0.1, 0.1);
    //this.el.object3D.position.set(-50, 0, 20);
  }
});

APP.scene.addEventListener("environment-scene-loaded", () => {
  const world = document.createElement("a-entity");

  world.setAttribute("leeds-world-mover", "");
  world.setAttribute("animation", {
    property: "scale",
    from: "0.01 0.01 0.01",
    to: "0.2 0.2 0.2",
    easing: "easeInQuad",
    dur: 10000,
    autoplay: false
  })

  window.APP.scene.appendChild(world);
}, { once: true });