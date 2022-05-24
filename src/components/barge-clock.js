AFRAME.registerComponent("socialvr-barge-clock", {
  init: function() {
    this.el.setAttribute("socialvr-barge-child", "");

    this.text = document.createElement("a-entity");
    this.text.setAttribute("position", `0 0 0`);
    this.text.setAttribute("text", `value: ; align: center; side: double; width: 4;`);
    this.text.setAttribute("geometry", `primitive: plane; height: auto; width: 1;`);
    this.text.setAttribute("material", "color: #807e7e;");
    this.text.setAttribute("animation", "property: rotation; to: 0 -360 0; easing: linear; loop: true; dur: 100000;");
    this.el.appendChild(this.text);
  },

  tick: function() {
    let time = new Date()
    let hours = time.getHours( ) % 12;
    let ampm = time.getHours() >= 12 ? "PM" : "AM";

    hours = hours ? hours : 12;
    this.text.setAttribute("text", `value: ${hours}:${time.getMinutes()} ${ampm}; align: center; width: 4;`);
  }
});