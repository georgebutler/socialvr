// responsible for barge creation and advancing phase

AFRAME.registerSystem("socialvr-barge", {
  init: function () {
    console.log("[Social VR] Barge System - Initialized")

    this.barge = null;
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
          let phase = data.name.slice(phaseIndex1).split(" ")[0]
        }

        // Phase Buttons
        if (data.name === "startButton") {
          const button = document.createElement("a-entity");
          const scene = document.querySelector("a-scene");

          button.setAttribute("socialvr-barge-button", "text: Begin; eventName: startBargeEvent; radius: 0.4; color: #C576F6");
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

  fetch("https://statuesque-rugelach-4185bd.netlify.app/assets/barge-master-for-export-4-22-22.spoke")
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
      // hide phase 1 objects
      TogglePhase1(false);

      // Client
      const scene = document.querySelector("a-scene");

      scene.addEventListener("advancePhaseEvent", () => {
        TogglePhase1(true);
        NAF.connection.broadcastData("advancePhase", {});
      });

      // Broadcast Event
      NAF.connection.subscribeToDataChannel("advancePhase", () => {
        TogglePhase1(true);
      });
    })
    .catch((e) => {
      console.error(e);
    });

  return [barge, bargeToolboxButton];
}

// toggle: true/false
function TogglePhase1(toggle) {
  const phase1 = document.querySelectorAll(".phase1");

  if (phase1.length > 0) {
    console.log("[Social VR] Barge - Phase 1 Found");

    phase1.forEach(el => {
      el.setAttribute("visible", toggle);
    });
  } else {
    console.warn("[Social VR] Barge - Phase 1 Not Found");
  }
}
