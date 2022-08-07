AFRAME.registerSystem("socialvr-speech", {
    init: function () {
        console.log("[Social VR] Speech System - Initialized");
        this.tool = null;
    },

    register: function (el) {
        if (this.tool != null) {
            this.el.removeChild(this.tool);
        }

        console.log("[Social VR] Speech Component - Registered");
        this.tool = el;
    },

    unregister: function () {
        this.tool = null;
    },
});

export function CreateSpeech() {
    // use element with CSS tag SpeechVis as visualization object
    let speechVisEl = document.querySelector(".SpeechVis");

    // if no such CSS tag, use cylinder as visualization object
    if (speechVisEl == null) {
        speechVisEl = document.createElement("a-cylinder");
        speechVisEl.setAttribute("color", "cyan");
        speechVisEl.setAttribute("height", "0.2");
        speechVisEl.setAttribute("radius", "1");
    }

    speechVisEl.setAttribute("socialvr-speech", "");
    speechVisEl.setAttribute("visible", false); // invisible, paused

    // toolbox button
    const speechToolboxButton = document.createElement("a-entity");
    speechToolboxButton.setAttribute("socailvr-toolbox-button", "speech");
    speechToolboxButton.setAttribute("position", { x: 0, y: 2, z: 1 });

    return [speechVisEl, speechToolboxButton];
}