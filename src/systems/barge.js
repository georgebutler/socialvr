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

export function CreateBarge() {
  // Barge: invisible, paused
  const barge =  document.createElement("a-entity");
  barge.setAttribute("socialvr-barge", "");
  barge.setAttribute("visible", false);
  
  // toolbox button
  const bargeToolboxButton = document.createElement("a-sphere");
  bargeToolboxButton.setAttribute("socailvr-toolbox-button", "Barge");
  bargeToolboxButton.setAttribute("radius", "0.3");
  bargeToolboxButton.setAttribute("material", "color: pink");
  bargeToolboxButton.setAttribute("tags", "singleActionButton: true");
  bargeToolboxButton.setAttribute("css-class", "interactable");
  bargeToolboxButton.setAttribute("position", {
    x: 5,
    y: 2,
    z: 3
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

  const phase1 = document.querySelector(".phase-1");

  if (phase1) {
    console.log("[Social VR] Barge - Phase 1 Found");

    phase1.children.forEach(child => {
      child.setAttribute("visible", toggle);
    });
  } else {
    console.warn("[Social VR] Barge - Phase 1 Not Found");
  }
}
