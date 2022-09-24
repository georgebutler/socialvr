// Utils
import { sendLog } from "../utils";

AFRAME.registerComponent("socialvr-barge-button", {
  schema: {
    text: {
      type: "string",
      default: "start"
    },
    eventName: {
      type: "string",
      default: ""
    },
    phaseID: {
      type: "number",
      default: -1
    },
    radius: {
      type: "number",
      default: 0.2
    },
    color: {
      type: "color",
      default: "#FFF"
    }
  },

  init: function () {
    this.geometry = new THREE.SphereGeometry(this.data.radius, 16, 8);
    this.material = new THREE.MeshStandardMaterial({
      color: this.data.color,
      roughness: 0.5,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.el.setObject3D("mesh", this.mesh);
    this.el.setAttribute("tags", "singleActionButton: true");
    this.el.setAttribute("is-remote-hover-target", "");
    this.el.setAttribute("hoverable-visuals", "");
    this.el.classList.add("interactable");

    // Text
    this.text = document.createElement("a-entity");
    this.text.setAttribute("position", `0 ${this.data.radius + 0.2} 0`);
    this.text.setAttribute("text", `value: ${this.data.text}; side: double;`);
    this.text.setAttribute("geometry", `primitive: plane; height: auto; width: 0.75;`);
    this.text.setAttribute("material", "color: #807e7e;");
    this.text.setAttribute("billboard", "onlyY: true;");
    this.el.appendChild(this.text);

    this.onClick = this.onClick.bind(this);
    this.el.object3D.addEventListener("interact", this.onClick);
  },

  remove: function () {
    this.el.object3D.removeEventListener("interact", this.onClick);
  },

  onClick: function () {
    if (this.data.phaseID >= 0) {
      this.el.sceneEl.emit("logPhaseEvent", { detail: this.data.phaseID });

      if (this.data.phaseID === 1) {
        this.el.sceneEl.emit("startMovingWorld");
        sendLog("flyingPlatform", { clientId: NAF.clientId, displayName: window.APP.store.state.profile.displayName, toggle: true });
      } else if (this.data.phaseID === 4) {
        this.el.sceneEl.emit("stopMovingWorld");
        this.el.sceneEl.emit("generateDataEvent");
        sendLog("flyingPlatform", { clientId: NAF.clientId, displayName: window.APP.store.state.profile.displayName, toggle: false });
      }
    } else {
      this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(18);
      this.el.sceneEl.emit(this.data.eventName);
    }
  }
});