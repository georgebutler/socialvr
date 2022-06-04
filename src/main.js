import "./components/barge-button";
import "./components/world-mover";

const scene = document.querySelector("a-scene");

export function ChangePhase(senderId, dataType, data, targetId) {
  const phase1 = document.querySelectorAll(".phase1");
  const phase2 = document.querySelectorAll(".phase2");
  const phase3 = document.querySelectorAll(".phase3");
  const phase4 = document.querySelectorAll(".phase4");

  // Index 0: Initial phase, nothing visible.
  if (data.index <= 0) {
    phase1.forEach(el => {
      el.object3D.visible = false;
    });

    phase2.forEach(el => {
      el.object3D.visible = false;
    });

    phase3.forEach(el => {
      el.object3D.visible = false;
    });

    phase4.forEach(el => {
      el.object3D.visible = false;
    });
  }

  // Phase 1
  else if (data.index == 1) {
    console.log("Phase 1 Started");

    phase1.forEach(el => {
      el.object3D.visible = true;
    });
  }

  // Phase 2
  else if (data.index == 2) {
    console.log("Phase 2 Started");

    phase2.forEach(el => {
      el.object3D.visible = true;
    });
  }

  // Phase 3
  else if (data.index == 3) {
    console.log("Phase 3 Started");

    phase3.forEach(el => {
      el.object3D.visible = true;
    });
  }

  // Phase 4
  else if (data.index == 4) {
    console.log("Phase 4 Started");

    phase4.forEach(el => {
      el.object3D.visible = true;
    });
  }

  document.querySelectorAll('[socialvr-barge-button=""]').forEach((button) => {
    const d = button.components["socialvr-barge-button"].data

    if (d) {
      if (d.phaseID <= data.index) {
        button.object3D.visible = true;
        button.classList.remove("interactable");
        button.removeAttribute("animation__spawner-cooldown");
        button.setAttribute("animation__spawner-cooldown", {
          property: "scale",
          delay: 0,
          dur: 350,
          from: { x: 1, y: 1, z: 1 },
          to: { x: 0.001, y: 0.001, z: 0.001 },
          easing: "easeInElastic"
        });
      }
    }
  });
}

scene.addEventListener("environment-scene-loaded", () => {
  // Button - Phase 1
  let button = document.createElement("a-entity");
  let position = document.querySelector(".startButton").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0))

  button.setAttribute("socialvr-barge-button", "text: Start; radius: 0.3; color: #C576F6; phaseID: 1");
  button.setAttribute("position", position);
  scene.appendChild(button);

  // Button - Phase 2
  button = document.createElement("a-entity");
  position = document.querySelector(".phase1CompleteButton_phase1").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0))

  button.classList.add("phase1");
  button.setAttribute("socialvr-barge-button", "text: Done; radius: 0.3; color: #C576F6; phaseID: 2");
  button.setAttribute("position", position);
  scene.appendChild(button);

  // Button - Phase 3
  button = document.createElement("a-entity");
  position = document.querySelector(".phase2CompleteButton_phase2").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0))

  button.classList.add("phase2");
  button.setAttribute("socialvr-barge-button", "text: Done; radius: 0.3; color: #C576F6; phaseID: 3");
  button.setAttribute("position", position);
  scene.appendChild(button);

  // Button - Phase 4
  button = document.createElement("a-entity");
  position = document.querySelector(".phase3CompleteButton_phase3").object3D.position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0))

  button.classList.add("phase3");
  button.setAttribute("socialvr-barge-button", "text: Complete; radius: 0.3; color: #C576F6; phaseID: 4");
  button.setAttribute("position", position);
  scene.appendChild(button);

  // World Mover
  const worldMover = document.createElement("a-entity");
  worldMover.setAttribute("socialvr-world-mover", "");
  scene.appendChild(worldMover);

  window.APP.utils.GLTFModelPlus
    .loadModel("https://statuesque-rugelach-4185bd.netlify.app/assets/moving-world-2.glb")
    .then((model) => {
      worldMover.setObject3D("mesh", window.APP.utils.threeUtils.cloneObject3D(model.scene, true));
      worldMover.setAttribute("matrix-auto-update", "");
    })
    .catch((e) => {
      console.error(e);
    });

  // Phases
  for (let i = 0; i < document.getElementById("environment-scene").children[0].children[0].children.length; i++) {
    const child = document.getElementById("environment-scene").children[0].children[0].children[i];
    const phaseIndex = child.className.trim().toLowerCase().search(/phase/i);

    if (phaseIndex >= 0) {
      const phase = child.className.slice(phaseIndex).split(" ")[0].trim().toLowerCase();

      if (phase === "phase1" || phase === "phase2" || phase === "phase3" || phase === "phase4") {
        // console.log(`Added ${child} to ${phase}.`);
        child.classList.add(`${phase}`);
      }
    }
  }

  NAF.connection.subscribeToDataChannel("ChangePhase", ChangePhase);

  ChangePhase(null, null, { index: 0 });
  NAF.connection.broadcastData("ChangePhase", {
    index: 0
  });
}, { once: true })
