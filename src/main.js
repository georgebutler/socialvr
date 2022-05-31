//import "./components/toolbox-button";
//import "./components/barge";
//import "./components/barge-button";
//import "./components/barge-clock";

//import "./systems/barge";
//import { CreateBarge } from "./systems/barge";
import { InitWorldMover } from "./world-mover";

const scene = document.querySelector("a-scene");
scene.addEventListener("environment-scene-loaded", () => {
  //console.log("[Social VR] Barge - Create Barge");

  //const [barge, bargeToolboxButton] = CreateBarge();
  //scene.appendChild(barge);
  // scene.appendChild(bargeToolboxButton);

  // Changes camera inspection system to show background, regardless of user preferences.
  //const cameraSystem = scene.systems["hubs-systems"].cameraSystem;
  //cameraSystem.lightsEnabled = true;

  // Floaty gravity change.
  //function disableFloatyPhysics() {
    //const floaties = document.querySelectorAll('[floaty-object=""]');

    //floaties.forEach((floaty) => {
      //floaty.setAttribute("floaty-object", { reduceAngularFloat: true, releaseGravity: 0, gravitySpeedLimit: 0 });
    //});
  //}

  //scene.addEventListener("object_spawned", (e) => {
    //disableFloatyPhysics();
  //});

  //disableFloatyPhysics();
  InitWorldMover();
}, { once: true })
