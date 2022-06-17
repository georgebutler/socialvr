AFRAME.registerComponent("socialvr-barge-clock", {
  init: function () {
    this.text = document.createElement("a-entity");
    this.text.setAttribute("text", "value: Time; align: center; width: 4;");
    this.text.setAttribute("rotation", "0, 0, 0");
    this.text.setAttribute("geometry", "primitive: plane; height: auto; width: 1;");
    this.text.setAttribute("material", "color: #807e7e;");

    this.text2 = document.createElement("a-entity");
    this.text2.setAttribute("text", "value: Time; align: center; width: 4;");
    this.text2.setAttribute("rotation", "0, 180, 0");
    this.text2.setAttribute("geometry", "primitive: plane; height: auto; width: 1;");
    this.text2.setAttribute("material", "color: #807e7e;");

    this.el.appendChild(this.text);
    this.el.appendChild(this.text2);
    this.el.setAttribute("animation", "property: rotation; to: 0 -360 0; easing: linear; loop: true; dur: 100000;");
  },

  tick: function () {
    let time = new Date()
    let hours = time.getHours() % 12;
    let minutes = time.getMinutes() < 10 ? `0${time.getMinutes()}` : time.getMinutes();
    let ampm = time.getHours() >= 12 ? "PM" : "AM";

    hours = hours ? hours : 12;

    this.text.setAttribute("text", `value: ${hours}:${minutes} ${ampm}; align: center; width: 4;`);
    this.text2.setAttribute("text", `value: ${hours}:${minutes} ${ampm}; align: center; width: 4;`);
  }
});