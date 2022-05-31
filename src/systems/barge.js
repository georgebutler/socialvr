// responsible for barge creation and advancing phase

AFRAME.registerSystem("socialvr-barge", {
  init: function () {
    console.log("[Social VR] Barge System - Initialized")

    this.barge = null;
    this.phase = 0;
  },

  register: function (el) {
    if (this.barge != null) {
      this.el.removeChild(this.barge);
    }

    this.barge = el;
  },

  unregister: function () {
    this.barge = null;
  },
});

function LoadAndAttach(data, barge, spokeSerial) {
  let transform = data.components.find(el => el.name === "transform");
  // let visible = data.components.find(el => el.name === "visible");

  if (transform) {
    let gltf = data.components.find(el => el.name === "gltf-model");
    let spawner = data.components.find(el => el.name === "spawner");
    let image = data.components.find(el => el.name === "image");

    let position = new window.APP.utils.THREE.Vector3(transform.props.position.x, transform.props.position.y, transform.props.position.z);
    let rotation = new window.APP.utils.THREE.Euler(transform.props.rotation.x, transform.props.rotation.y, transform.props.rotation.z, "XYZ");
    let scale = new window.APP.utils.THREE.Vector3(transform.props.scale.x, transform.props.scale.y, transform.props.scale.z);

    // GLTF
    if (gltf) {
      if (data.name === "barge-model") {
        barge.object3D.position.copy(position);
        barge.object3D.rotation.copy(rotation);
        barge.object3D.scale.copy(scale);
        barge.object3D.matrixNeedsUpdate = true;

        window.APP.utils.GLTFModelPlus
          .loadModel(gltf.props.src)
          .then((model) => {
            barge.setObject3D("mesh", window.APP.utils.threeUtils.cloneObject3D(model.scene, false));
            barge.setAttribute("matrix-auto-update", "");
          })
          .catch((e) => {
            console.error(e);
          });
      }
      else if (data.name === "clock-placeholder") {
        const clock = document.createElement("a-entity");
        const scene = document.querySelector("a-scene");

        clock.setAttribute("socialvr-barge-clock", "");
        clock.setAttribute("position", position.add(new window.APP.utils.THREE.Vector3(0, 2, 0)));
        scene.appendChild(clock);
      }
      else {
        const { entity } = window.APP.utils.addMedia(gltf.props.src, "#static-media", 1, null, false, false, true, {}, false);

        entity.setAttribute("socialvr-barge-child", "");
        entity.setAttribute("set-unowned-body-kinematic", "");
        entity.setAttribute("body-helper", "type: dynamic; mass: 1; collisionFilterGroup: 1; collisionFilterMask: 15;");
        entity.setAttribute("matrix-auto-update", "");
        entity.object3D.position.copy(position);
        entity.object3D.rotation.copy(rotation);
        entity.object3D.scale.copy(scale);

        // Phase Index
        const phaseIndex = data.name.search(/phase/i);

        if (phaseIndex >= 0) {
          const phase = data.name.slice(phaseIndex).split(" ")[0].trim().toLowerCase();

          if (phase === "phase1" || phase === "phase2" || phase === "phase3" || phase === "phase4") {
            console.log(`Added ${data.name} to ${phase}`);
            entity.classList.add(`${phase}`);
          }
        }

        // Phase Buttons
        if (data.name === "startButton") {
          const button = document.createElement("a-entity");
          const scene = document.querySelector("a-scene");

          button.setAttribute("socialvr-barge-button", "text: Start; radius: 0.3; color: #C576F6; phaseID: 1");
          button.setAttribute("position", position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0)));
          scene.appendChild(button);
        } else if (data.name === "phase1CompleteButton phase1") {
          const button = document.createElement("a-entity");
          const scene = document.querySelector("a-scene");

          button.classList.add("phase1");
          button.setAttribute("socialvr-barge-button", "text: Done; radius: 0.3; color: #C576F6; phaseID: 2");
          button.setAttribute("position", position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0)));
          scene.appendChild(button);
        } else if (data.name === "phase2CompleteButton phase2") {
          const button = document.createElement("a-entity");
          const scene = document.querySelector("a-scene");

          button.classList.add("phase2");
          button.setAttribute("socialvr-barge-button", "text: Done; radius: 0.3; color: #C576F6; phaseID: 3");
          button.setAttribute("position", position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0)));
          scene.appendChild(button);
        } else if (data.name === "phase3CompleteButton phase3") {
          const button = document.createElement("a-entity");
          const scene = document.querySelector("a-scene");

          button.classList.add("phase3");
          button.setAttribute("socialvr-barge-button", "text: Done; radius: 0.3; color: #C576F6; phaseID: 4");
          button.setAttribute("position", position.add(new window.APP.utils.THREE.Vector3(0, 0.5, 0)));
          scene.appendChild(button);
        }
      }
    }

    // Spawners
    if (spawner) {
      //const players = document.querySelectorAll("a-entity[player-info]");
      //const num = players.length;

      //if (num == 1) {
        const { entity } = window.APP.utils.addMedia(spawner.props.src, "#interactable-media", 1, null, false, false, true, {}, false);

        entity.object3D.position.copy(position);
        entity.object3D.rotation.copy(rotation);
        entity.object3D.scale.copy(scale);
        entity.object3D.matrixNeedsUpdate = true;

        entity.classList.add("interactable");
        entity.setAttribute("is-remote-hover-target", "");
        entity.setAttribute("hoverable-visuals", "");
        entity.setAttribute("floaty-object", "modifyGravityOnRelease: true; autoLockOnLoad: true; autoLockOnRelease: true;");
        entity.setAttribute("set-unowned-body-kinematic", "");
        entity.setAttribute("body-helper", "type: dynamic; mass: 1; collisionFilterGroup: 1; collisionFilterMask: 15;");
        entity.setAttribute("matrix-auto-update", "");
        entity.setAttribute("tags", "isHandCollisionTarget: true; isHoldable: true; offersHandConstraint: true; offersRemoteConstraint: true; inspectable: true;");
        entity.setAttribute("networked", "template: #interactable-media");

        // Phase Index
        const phaseIndex = data.name.search(/phase/i);

        if (phaseIndex >= 0) {
          const phase = data.name.slice(phaseIndex).split(" ")[0].trim().toLowerCase();

          if (phase === "phase1" || phase === "phase2" || phase === "phase3" || phase === "phase4") {
            console.log(`Added ${data.name} to ${phase}.`);
            entity.classList.add(`${phase}`);
          } else {
            console.warn(`Unknown phase: "${phase}"`);
          }
        }
      //}
    }

    // Images
    if (image) {
      const { entity } = window.APP.utils.addMedia(image.props.src, "#static-media", 1, null, false, false, true, {}, false);

      entity.object3D.position.copy(position);
      entity.object3D.rotation.copy(rotation);
      entity.object3D.scale.copy(scale);
      entity.object3D.matrixNeedsUpdate = true;
      entity.classList.add("interactable");

      // Phase Index
      const phaseIndex = data.name.search(/phase/i);

      if (phaseIndex >= 0) {
        const phase = data.name.slice(phaseIndex).split(" ")[0].trim().toLowerCase();

        if (phase === "phase1" || phase === "phase2" || phase === "phase3" || phase === "phase4") {
          console.log(`Added ${data.name} to ${phase}.`);
          entity.classList.add(`${phase}`);
        }
      }
    }
  }
}

// toggle: true/false
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

  const bargeButtons = document.querySelectorAll('[socialvr-barge-button=""]');

  bargeButtons.forEach((button) => {
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

export function CreateBarge() {
  // Barge: invisible, paused
  const barge = document.createElement("a-entity");
  barge.setAttribute("socialvr-barge", "");
  barge.setAttribute("visible", true);

  // toolbox button
  const bargeToolboxButton = document.createElement("a-sphere");
  bargeToolboxButton.setAttribute("socialvr-toolbox-button", "Barge");
  bargeToolboxButton.setAttribute("radius", "0.3");
  bargeToolboxButton.setAttribute("material", "color: pink");
  bargeToolboxButton.setAttribute("tags", "singleActionButton: true");
  bargeToolboxButton.setAttribute("css-class", "interactable");
  bargeToolboxButton.setAttribute("position", {
    x: 5,
    y: 2,
    z: 3
  });

  fetch("https://statuesque-rugelach-4185bd.netlify.app/assets/barge-master-for-export-5-2-22.spoke")
    .then(response => {
      return response.json();
    })
    .then((data) => {
      for (const [key, entity] of Object.entries(data.entities)) {
        LoadAndAttach(entity, barge, encodeURIComponent(key));
      }
    })
    .then(() => {
      // Broadcast Event
      NAF.connection.subscribeToDataChannel("changePhase", ChangePhase);

      ChangePhase(null, null, { index: 0 });
      NAF.connection.broadcastData("changePhase", {
        index: 0
      });
    })
    .catch((e) => {
      console.error(e);
    });

  return [barge, bargeToolboxButton];
}