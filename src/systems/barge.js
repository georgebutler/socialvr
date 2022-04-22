// responsible for barge creation and advancing phase

AFRAME.registerSystem("socialvr-barge", {
  init: function() {
    console.log("[Social VR] Barge System - Initialized")
    
    this.barge = null;
  },

  register: function(el) {
    if (this.barge != null) {
      this.el.removeChild(this.barge);
    }
    
    this.barge = el;
  },

  unregister: function() {
    this.barge = null;
  },
});

function LoadAndAttachMesh(data, barge) {
  let gltf = data.components.find(el => el.name === "gltf-model");
  let transform = data.components.find(el => el.name === "transform");

  if (gltf && transform) {
    let visible = data.components.find(el => el.name === "visible");

    window.APP.utils.GLTFModelPlus
    .loadModel(gltf.props.src)
    .then((model) => {
      const mesh = window.APP.utils.threeUtils.cloneObject3D(model.scene);
      const obj = document.createElement("a-entity");

      obj.setObject3D("mesh", mesh);
      obj.setAttribute("position", transform.props.position);
      obj.setAttribute("rotation", transform.props.rotation);
      obj.setAttribute("scale", transform.props.scale);
      obj.object3D.matrixNeedsUpdate = true;
      obj.object3D.visible = visible.props.visible;

      barge.object3D.attach(obj.object3D);
      barge.appendChild(obj);
    })
    .catch((e) => {
      console.error(e);
    })
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
      LoadAndAttachMesh(data.entities[item], barge);
    }
  })
  .catch((e) => {
    console.error(e);
  });
  
  // hide phase 1 objects
  TogglePhase1(false);

  // Client
  barge.addEventListener("advancePhaseEvent", function() {
    TogglePhase1(true);
    NAF.connection.broadcastData("advancePhase", {});
  });

  // Broadcast Event
  NAF.connection.subscribeToDataChannel("advancePhase", TogglePhase1(true));  // TODO: arrow function?

  return [barge, bargeToolboxButton];
}

// toggle: true/false
function TogglePhase1(toggle) {
  
  // TODO: add phase index parameter

  console.log("[Social VR] Barge - Phase Initialized");

  const phase1 = document.querySelectorAll(".phase-1");

  if (phase1.length > 0) {
    console.log("[Social VR] Barge - Phase 1 Found");

    phase1.forEach(el => {
      el.setAttribute("visible", toggle);
    });
  } else {
    console.warn("[Social VR] Barge - Phase 1 Not Found");
  }
}
