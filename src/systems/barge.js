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

function LoadAndAttach(data, barge) {
  let transform = data.components.find(el => el.name === "transform");
  // let visible = data.components.find(el => el.name === "visible");

  if (transform) {
    let gltf = data.components.find(el => el.name === "gltf-model");
    let spawner = data.components.find(el => el.name === "spawner");

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
        })
        .catch((e) => {
          console.error(e);
        });
      } else {
        const { entity } = window.APP.utils.addMedia(gltf.props.src, "#static-media");

        entity.setAttribute("socialvr-barge-child", "");
        entity.object3D.position.copy(position);
        entity.object3D.rotation.copy(rotation);
        entity.object3D.scale.copy(scale);
        entity.object3D.matrixNeedsUpdate = true;

        // Phase Index
        let phaseIndex1 = data.name.search(/phase/i);

        if (phaseIndex1 >= 0) {
          let phase = data.name.slice(phaseIndex1).split(" ")[0].trim().toLowerCase();

          if (phase === "phase1" || phase === "phase2" || phase === "phase3") {
            console.log(`Added ${data.name} to ${phase}.`);
            entity.classList.add(`${phase}`);
          }
        }

        // Phase Buttons
        if (data.name === "startButton") {
          const button = document.createElement("a-entity");
          const scene = document.querySelector("a-scene");

          button.setAttribute("socialvr-barge-button", "text: Begin; radius: 0.4; color: #C576F6; phaseID: 1");
          button.setAttribute("position", position.add(new window.APP.utils.THREE.Vector3(0, 1, 0)));
          scene.appendChild(button);
        }
      }
    }

    // Spawners
    if (spawner) {
      const { entity } = window.APP.utils.addMedia(spawner.props.src, "#interactable-media");
      entity.object3D.position.copy(position);
      entity.object3D.rotation.copy(rotation);
      entity.object3D.scale.copy(scale);
      entity.object3D.matrixNeedsUpdate = true;
    }
  }
}

// toggle: true/false
export function ChangePhase(senderId, dataType, data, targetId) {
  // console.log("Phase: " + data.index);

  const phase1 = document.querySelectorAll(".phase1");
  const phase2 = document.querySelectorAll(".phase2");
  const phase3 = document.querySelectorAll(".phase3");

  // Index 0: Initial phase, nothing visible.
  if (data.index <= 0) {
    phase1.forEach(el => {
      el.setAttribute("visible", false);
    });

    phase2.forEach(el => {
      el.setAttribute("visible", false);
    });

    phase3.forEach(el => {
      el.setAttribute("visible", false);
    });
  }

  // Index 1: Phase 1 visible ONLY.
  if (data.index == 1) {
    phase1.forEach(el => {
      el.setAttribute("visible", true);
    });

    phase2.forEach(el => {
      el.setAttribute("visible", false);
    });

    phase3.forEach(el => {
      el.setAttribute("visible", false);
    });
  }
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
      for (var item in data.entities) {
        // console.log(data.entities[item]);
        LoadAndAttach(data.entities[item], barge);
      }
    })
    .then(() => {
      // Broadcast Event
      NAF.connection.subscribeToDataChannel("changePhase", ChangePhase);

      ChangePhase(null, null, {index: 0});
      NAF.connection.broadcastData("changePhase", {
        index: 0
      });
    })
    .catch((e) => {
      console.error(e);
    });

  return [barge, bargeToolboxButton];
}