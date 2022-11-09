import "./components/world-mover";

APP.scene.addEventListener("environment-scene-loaded", () => {
  const worldMover = document.createElement("a-entity");

  worldMover.setAttribute("socialvr-world-mover", {
    modelURL: "https://alex-leeds--statuesque-rugelach-4185bd.netlify.app/assets/environment-11.8.glb"
  });

  window.APP.scene.appendChild(worldMover);
}, { once: true });