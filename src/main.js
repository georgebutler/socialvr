import "./components/world-mover";

APP.scene.addEventListener("environment-scene-loaded", () => {
  const world = document.createElement("a-entity");

  world.setAttribute("socialvr-world-mover", {
    modelURL: "https://alex-leeds--statuesque-rugelach-4185bd.netlify.app/assets/environment-11.8.glb"
  });

  world.object3D.scale.set(0.1, 0.1, 0.1);
  //world.object3D.scale.set(0.01, 0.01, 0.01);
  window.APP.scene.appendChild(world);
}, { once: true });