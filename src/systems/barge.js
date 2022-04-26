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
  let gltf = data.components.find(el => el.name === "gltf-model");
  let transform = data.components.find(el => el.name === "transform");
  let visible = data.components.find(el => el.name === "visible");

  if (gltf && transform) {
    let position = new window.APP.utils.THREE.Vector3(transform.props.position.x, transform.props.position.y, transform.props.position.z);
    let rotation = new window.APP.utils.THREE.Euler(transform.props.rotation.x, transform.props.rotation.y, transform.props.rotation.z, "XYZ");
    let scale = new window.APP.utils.THREE.Vector3(transform.props.scale.x, transform.props.scale.y, transform.props.scale.z);

    if (data.name === "barge-model") {
      barge.object3D.position.copy(position);
      barge.object3D.rotation.copy(rotation);
      barge.object3D.scale.copy(scale);
      barge.object3D.matrixNeedsUpdate = true;

      window.APP.utils.GLTFModelPlus
      .loadModel(gltf.props.src)
      .then((model) => {
        const mesh = window.APP.utils.threeUtils.cloneObject3D(model.scene, false);

        barge.setObject3D("mesh", mesh);
      })
      .catch((e) => {
        console.error(e);
      });
    } else {
      const obj = document.createElement("a-entity");

      const classes = data.name.split(" ");
      obj.classList.add("socialvr-barge-child");
      classes.forEach((c) => {
        obj.classList.add(c);
      });

      obj.object3D.position.copy(position);
      obj.object3D.rotation.copy(rotation);
      obj.object3D.scale.copy(scale);

      document.querySelector("a-scene").appendChild(obj);
      obj.object3D.updateMatrixWorld();

      window.APP.utils.GLTFModelPlus
      .loadModel(gltf.props.src)
      .then((model) => {
        const mesh = window.APP.utils.threeUtils.cloneObject3D(model.scene, false);

        obj.setObject3D("mesh", mesh);
      })
      .catch((e) => {
        console.error(e);
      });
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
      barge.addEventListener("advancePhaseEvent", function () {
        TogglePhase1(true);
        NAF.connection.broadcastData("advancePhase", {});
      });

      // Broadcast Event
      NAF.connection.subscribeToDataChannel("advancePhase", TogglePhase1(true));  // TODO: arrow function?
    })
    .catch((e) => {
      console.error(e);
    });

  return [barge, bargeToolboxButton];
}

// toggle: true/false
function TogglePhase1(toggle) {
  // TODO: add phase index parameter

  console.log("[Social VR] Barge - Phase Initialized");

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
