// responsible for barge creation and advancing phase

AFRAME.registerSystem("socialvr-barge", {
  init: function() {
    console.log("[Social VR] Barge System - Initialized");
    this.tool = null;
  },

  register: function(el) {
    if (this.tool != null) {
      this.el.removeChild(this.tool);
    }
    
    console.log("[Social VR] Barge Component - Registered");
    this.tool = el;
  },

  unregister: function() {
    this.tool = null;
  },
});

export function CreateBarge() {
  // Barge: invisible, paused
  const barge =  document.createElement("a-entity");
  barge.setAttribute("socialvr-barge", "");
  barge.setAttribute("visible", false);
  
  // toolbox button
  const bargeToolboxButton = document.createElement("a-entity");
  bargeToolboxButton.setAttribute("socailvr-toolbox-button", "barge");
  bargeToolboxButton.setAttribute("position", { x: 0, y: 2, z: 0 });
  
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
