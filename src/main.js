// import "./components/toolbox-button";
// import "./components/barge";
// import "./components/barge-button";

// import "./systems/barge";
// import { CreateBarge } from "./systems/barge";

// const scene = document.querySelector("a-scene");

// console.log("[Social VR] Barge - Create Barge");
// const [barge, bargeToolboxButton] = CreateBarge();
// scene.appendChild(barge);
// scene.appendChild(bargeToolboxButton);

// window.startPhaseTesting = function() {
//   let phase = 1;
//   barge.emit("advancePhaseEvent");
//   console.log(`[Social VR] Barge - Current Phase: ${phase}`);
// };


// from https://github.com/mkremins/hubs/blob/hubs-cloud-barge/src/max-additions.js

/// utils

function createElement(htmlString) {
  const div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

function scale(num, oldLower, oldUpper, newLower, newUpper) {
  const oldRange = oldUpper - oldLower;
  const newRange = newUpper - newLower;
  return ((num - oldLower) / oldRange) * newRange + newLower;
}

function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // max exclusive, min inclusive
}

function retryUntilTruthy(fn, retryFrequencyMS) {
  const interval = setInterval(function() {
    const retVal = fn();
    if (retVal) {
      clearInterval(interval);
    }
  }, retryFrequencyMS);
}

/// constants

const MIC_PRESENCE_VOLUME_THRESHOLD = 0.00001;

const SPEECH_TIME_PER_TICK = 10; // every speech tick = 10ms of realtime
const MIN_SPEECH_TIME_FOR_EVENT = 100; // 0.1s realtime
const MAX_SPEECH_TIME_FOR_EVENT = 5000; // 5s realtime
const CONTINUOUS_SPEECH_LENIENCY_TIME = 100; // 0.1s realtime

const ORB_CONTAINER_POS = [0, 0, 0]; //[7,0,2]
const ORB_CONTAINER_SIZE = 1;
const ORB_CONTAINER_DEPTH = 4;

const MIN_ORB_SIZE = 0.05;
const MAX_ORB_SIZE = 0.9;
const SPEECH_ORB_LIFETIME = 1000 * 60 * 5; // 5mins realtime
const ORB_GROWTH_PER_TICK =
  (MAX_ORB_SIZE - MIN_ORB_SIZE) / ((MAX_SPEECH_TIME_FOR_EVENT - MIN_SPEECH_TIME_FOR_EVENT) / SPEECH_TIME_PER_TICK);

const DST_ITEM_NAMES = [
  "book",
  "jacket",
  "pills",
  "canteen",
  "flashlight",
  "compass",
  "knife",
  "mirror",
  "newspaper",
  "bottle",
  "medic",
  "map"
];

/// main code

const interval = setInterval(initMaxAdditions, 10);

let showConversationBalanceViz = true;

function initMaxAdditions(scene) {
  if (!window.APP || !window.APP.scene) return;
  clearInterval(interval);
  console.log("!!!initMaxAdditions!!!");

  // remove the barge from scenes where the barge isn't wanted
  retryUntilTruthy(function() {
    const sceneNameHolder = document.querySelector("#environment-scene > a-entity > a-entity");
    if (!sceneNameHolder) return;
    const sceneName = sceneNameHolder.className;
    console.log("sceneName", sceneName);
    if (sceneName.includes("DSTTable")) {
      console.log("Removing barge from scene due to sceneName:", sceneName);
      document.querySelector("[socialvr-barge]").remove();
    }
    if (sceneName.includes("BargeDemoWaypoints")) {
      console.log("Disabling conversation balance viz due to sceneName:", sceneName);
      showConversationBalanceViz = false;
    }
    return true;
  }, 100);

  // when we receive a speech event from another client, call the appropriate handler
  NAF.connection.subscribeToDataChannel("startSpeech", startSpeech);
  NAF.connection.subscribeToDataChannel("stopSpeech", stopSpeech);

  // periodically poll for voice input to spawn utterances for this client
  setInterval(speechTick, SPEECH_TIME_PER_TICK);

  /*
  // spawn orb container
  const radius = ORB_CONTAINER_SIZE;
  const center = ORB_CONTAINER_POS;
  center[1] = ORB_CONTAINER_DEPTH / 2;
  const wallPositions = [
    `${center[0] - radius} ${center[1]} ${center[2]}`,
    `${center[0]} ${center[1]} ${center[2] - radius}`,
    `${center[0] + radius} ${center[1]} ${center[2]}`,
    `${center[0]} ${center[1]} ${center[2] + radius}`
  ];
  const wallOrientations = ["vert", "horiz", "vert", "horiz"];
  for (let i = 0; i < 4; i++) {
    const isVert = wallOrientations[i] === "vert";
    const wall = document.createElement("a-entity");
    wall.setAttribute("geometry", {
      primitive: "box",
      width: isVert ? "0.1" : radius * 2,
      height: ORB_CONTAINER_DEPTH,
      depth: isVert ? radius * 2 : "0.1"
    });
    wall.setAttribute("material", "color:white;transparent:true;opacity:0.5");
    wall.setAttribute("position", wallPositions[i]);
    wall.setAttribute("body-helper", {type: TYPE.STATIC});
    wall.setAttribute("shape-helper", {type: SHAPE.BOX});
    APP.scene.appendChild(wall);
  }
  */

  /*
  // give unhatted avatars hats
  // FIXME: don't poll for this, do it once on new user entry event
  setInterval(function() {
    for (let playerInfo of APP.componentRegistry["player-info"]) {
      spawnHat(playerInfo);
    }
  }, 1000);
  */

  // suppress visibility of all DST spawners until a moderater calls beginDST()
  const suppressDSTInterval = setInterval(function() {
    const dstSpawners = DST_ITEM_NAMES.map(name => document.querySelector(`.${name}`));
    const cooldown = 1000 * 60 * 60 * 24 * 7; // one week is probably enough
    for (const spawner of dstSpawners) {
      if (!spawner) continue; // bail out early if no spawner found for this item name
      spawner.setAttribute("visible", false);
    }
  }, 1000);

  // selectively re-disable spawners when they're used
  function disableSpawner(senderId, dataType, data, targetId) {
    console.log("disableSpawner", data);
    const spawner = document.querySelector(`.${data.itemName}`);
    spawner.setAttribute("visible", false);
    spawner.object3D.position.y = -10; // do we have to hide it *both* ways? :(((
  }
  NAF.connection.subscribeToDataChannel("disableSpawner", disableSpawner);

  // code to enable DST spawners
  function enableDSTSpawners() {
    console.log("beginDST");
    clearInterval(suppressDSTInterval);
    const dstSpawners = DST_ITEM_NAMES.map(name => document.querySelector(`.${name}`));
    for (const spawner of dstSpawners) {
      if (!spawner) continue;
      spawner.setAttribute("visible", true);

      // attach a spawn event listener
      spawner.addEventListener("spawned-entity-created", function() {
        const itemName = spawner.classList[0];
        console.log("spawned-entity-created", itemName);
        const eventData = { itemName: itemName };
        disableSpawner(null, null, eventData);
        NAF.connection.broadcastData("disableSpawner", eventData);
      });
    }
  }
  window.beginDST = function() {
    enableDSTSpawners();
    NAF.connection.broadcastData("beginDST", {});
  };
  NAF.connection.subscribeToDataChannel("beginDST", enableDSTSpawners);

  // add a globally accessible event log to the window
  window.eventLog = [];

  // and a function for the moderator to log DST item positions
  window.logItemPositions = logItemPositions;

  // and a single "log everything" function
  window.logEverything = function() {
    logItemPositions();
    return JSON.stringify(window.eventLog, null, 2);
  };
}

function spawnHat(playerInfo) {
  // bail out early if session ID not yet assigned
  if (!playerInfo.playerSessionId) return;

  // bail out early if avatar not yet loaded, or hat already present
  const avatar = playerInfo.el;
  if (!avatar.querySelector(".Spine")) return;
  if (avatar.querySelector(".hat")) return;

  // create, color, position, and scale the hat
  const hat = document.createElement("a-entity");
  hat.classList.add("hat");
  hat.setAttribute("geometry", "primitive:cylinder;segmentsHeight:1;radius:0.16;height:0.25");
  const color = playerInfoToColor(playerInfo);
  hat.setAttribute("material", `color:${color};shader:flat`);
  hat.setAttribute("position", "0 0 0");

  // add the hat to the avatar
  avatar.querySelector(".Spine").appendChild(hat);

  // add "gloves" if hands present
  const leftHand = avatar.querySelector(".LeftHand");
  if (leftHand) {
    const leftGlove = document.createElement("a-entity");
    leftGlove.classList.add("glove");
    leftGlove.classList.add("leftGlove");
    leftGlove.setAttribute("geometry", "primitive:sphere;radius:0.1");
    leftGlove.setAttribute("material", `color:${color};shader:flat`);
    leftGlove.setAttribute("position", "0 0 0");
    leftHand.appendChild(leftGlove);
  }
  const rightHand = avatar.querySelector(".RightHand");
  if (rightHand) {
    const rightGlove = document.createElement("a-entity");
    rightGlove.classList.add("glove");
    rightGlove.classList.add("rightGlove");
    rightGlove.setAttribute("geometry", "primitive:sphere;radius:0.1");
    rightGlove.setAttribute("material", `color:${color};shader:flat`);
    rightGlove.setAttribute("position", "0 0 0");
    rightHand.appendChild(rightGlove);
  }

  return hat;
}

function sessionIDToColor(sessionID) {
  return "#" + sessionID.substring(0, 6); // just use first 6 chars lol
}

function playerInfoToColor(playerInfo) {
  // keys are "Avatar listing sid"s from Approved Avatars admin tab
  const colorsByAvatar = {
    WUvZgGK: "lightskyblue",
    qpOOt9I: "hotpink",
    "2s2UuzN": "red",
    wAUg76e: "limegreen",
    RczWQgy: "#222",
    xb4PVBE: "yellow",
    yw4c83R: "purple",
    "4r1KpVk": "orange",
    bs7pLac: "darkblue"
  };
  const avatarURL = playerInfo.data.avatarSrc;
  for (const avatarSID of Object.keys(colorsByAvatar)) {
    if (avatarURL.includes(avatarSID)) return colorsByAvatar[avatarSID];
  }
  return sessionIDToColor(playerInfo.playerSessionId);
}

function getPlayerInfo(sessionID) {
  const playerInfos = APP.componentRegistry["player-info"];
  return playerInfos.find(pi => pi.playerSessionId === sessionID);
}

function logEvent(eventType, event) {
  event.eventType = eventType;
  event.timestamp = Date.now();
  window.eventLog.push(event);
}

const activeSpeechOrbs = {};

function startSpeech(senderId, dataType, data, targetId) {
  console.log("startSpeech", senderId, dataType, data, targetId);
  logEvent("startSpeech", data);

  // bail out early if conversation balance viz disabled
  if (!showConversationBalanceViz) return;

  // if no already-active speech orb for this speaker, spawn one
  const activeOrb = activeSpeechOrbs[data.speaker];
  if (activeOrb) {
    activeOrb.classList.add("finished"); // FIXME replace w/ stopSpeech call for consistency?
  }
  const playerInfo = getPlayerInfo(data.speaker);
  const newOrb = spawnOrb(MIN_ORB_SIZE, playerInfoToColor(playerInfo));
  activeSpeechOrbs[data.speaker] = newOrb;

  // position the orb relative to the player and the center of the scene
  const centerObj = document.querySelector(".Table");
  const centerPos = centerObj ? centerObj.object3D.position.clone() : new THREE.Vector3(...ORB_CONTAINER_POS);
  centerPos.y = 1.5;
  const playerPos = playerInfo.el.object3D.position.clone();
  playerPos.y = 1.5;
  const offset = new THREE.Vector3().subVectors(playerPos, centerPos).normalize();
  const orbPos = new THREE.Vector3().addVectors(centerPos, offset);
  newOrb.setAttribute("position", orbPos);
}

function stopSpeech(senderId, dataType, data, targetId) {
  console.log("stopSpeech", senderId, dataType, data, targetId);
  logEvent("stopSpeech", data);
  const activeOrb = activeSpeechOrbs[data.speaker];
  if (activeOrb) {
    activeOrb.setAttribute("geometry", {
      primitive: "cylinder",
      segmentsHeight: 1,
      segmentsRadial: 6,
      radius: 0.1,
      height: data.size
    });
    activeOrb.classList.add("finished");
    delete activeSpeechOrbs[data.speaker];
  }
}

function spawnOrb(size, color) {
  color = color || "yellow";
  console.log("spawnOrb", size, color);

  // create, color, position, and scale the orb
  //const pos = ORB_CONTAINER_POS;
  const orb = document.createElement("a-entity");
  orb.classList.add("speechOrb");
  orb.setAttribute("geometry", {
    primitive: "cylinder",
    segmentsHeight: 1,
    segmentsRadial: 6,
    radius: 0.1,
    height: size
  });
  orb.setAttribute("material", `color:${color};shader:flat`);
  //orb.setAttribute("position", `${pos[0]} ${pos[1] + 5} ${pos[2]}`);

  /*
  // add physics and a collider
  orb.setAttribute("body-helper", {
    collisionFilterMask: COLLISION_LAYERS.ALL,
    gravity: {x: 0, y: -9.8, z: 0}
  });
  orb.setAttribute("shape-helper", {type: SHAPE.SPHERE});
  */

  // add the orb to the scene
  APP.scene.appendChild(orb);

  // queue the orb for deletion later
  setTimeout(() => orb.remove(), SPEECH_ORB_LIFETIME);

  return orb;
}

// track how much the local user is talking
let continuousSpeechTime = 0;
let continuousSpeechLeniencyTime = 0;

function doStopSpeech(speechTime) {
  const orbSize = scale(speechTime, MIN_SPEECH_TIME_FOR_EVENT, MAX_SPEECH_TIME_FOR_EVENT, MIN_ORB_SIZE, MAX_ORB_SIZE);
  const playerInfo = APP.componentRegistry["player-info"][0];
  const eventData = {
    size: orbSize,
    speaker: playerInfo.playerSessionId,
    speakerName: playerInfo.displayName
  };
  stopSpeech(null, null, eventData); // local
  NAF.connection.broadcastData("stopSpeech", eventData); // networked
}

function speechTick() {
  const playerInfo = APP.componentRegistry["player-info"][0];
  const muted = playerInfo.data.muted;
  const localAudioAnalyser = window.APP.scene.systems["local-audio-analyser"];
  const speaking = !muted && localAudioAnalyser.volume > MIC_PRESENCE_VOLUME_THRESHOLD;

  // maintain speech event state of local user, send events as needed
  if (speaking) {
    if (continuousSpeechTime === 0) {
      // speech event started
      const eventData = { speaker: playerInfo.playerSessionId, speakerName: playerInfo.displayName };
      startSpeech(null, null, eventData); // local
      NAF.connection.broadcastData("startSpeech", eventData); // networked
    }
    continuousSpeechTime += SPEECH_TIME_PER_TICK;
    continuousSpeechLeniencyTime = CONTINUOUS_SPEECH_LENIENCY_TIME;
    // if this is a single really long speech event, break it off and start a new one
    if (continuousSpeechTime >= MAX_SPEECH_TIME_FOR_EVENT) {
      doStopSpeech(continuousSpeechTime);
      continuousSpeechTime = 0;
    }
  } else {
    if (continuousSpeechLeniencyTime > 0) {
      continuousSpeechLeniencyTime -= SPEECH_TIME_PER_TICK;
    }
    if (continuousSpeechLeniencyTime <= 0 && continuousSpeechTime >= MIN_SPEECH_TIME_FOR_EVENT) {
      // speech event ended
      doStopSpeech(continuousSpeechTime);
      continuousSpeechTime = 0;
    }
  }

  // update speech orb sizes and positions
  for (const finishedOrb of document.querySelectorAll(".speechOrb.finished")) {
    const pos = finishedOrb.getAttribute("position");
    pos.y += ORB_GROWTH_PER_TICK; // synchronize movement speed with orb growth rate
    finishedOrb.setAttribute("position", pos);
  }
  for (const activeOrb of Object.values(activeSpeechOrbs)) {
    // grow each active speech orb by ORB_GROWTH_PER_TICK
    const size = activeOrb.getAttribute("geometry").height + ORB_GROWTH_PER_TICK;
    activeOrb.setAttribute("geometry", {
      primitive: "cylinder",
      segmentsHeight: 1,
      segmentsRadial: 6,
      radius: 0.1,
      height: size
    });

    // move its center upward by half of the growth amount,
    // to keep the bottom position fixed at the "now" plane
    const pos = activeOrb.getAttribute("position");
    pos.y += ORB_GROWTH_PER_TICK / 2;
    activeOrb.setAttribute("position", pos);
  }
}

/// log item positions

function makeItemNameTable() {
  const itemNamesByModelURL = {};
  for (const itemName of DST_ITEM_NAMES) {
    const dstSpawner = document.querySelector(`.${itemName}`);
    const modelURL = dstSpawner.components["gltf-model-plus"].data.src;
    itemNamesByModelURL[modelURL] = itemName;
  }
  return itemNamesByModelURL;
}

/*
function makeCells() {
  const table = document.querySelector(".Table");
  const tablePos = table.object3D.position;
  const cells = [];
  const rowSize = 0.2;
  const colSize = 0.2;
  for (let row = 2; row >= 0; row--) {
    for (let col = 0; col < 5; col++) {
      const cellNum = cells.length;
      const rowOffset = row - 1;
      const colOffset = col - 2;
      cells.push({
        x: tablePos.x + (rowOffset * rowSize),
        z: tablePos.z + (colOffset * colSize),
        cellNum
      });
    }
  }
  return cells;
}
*/

function makeCells() {
  // hardcoded based on DSTTable scene
  return [
    { x: 0, z: -0.85, cellNum: 1 },
    { x: 0, z: -0.71, cellNum: 2 },
    { x: 0, z: -0.575, cellNum: 3 },
    { x: 0, z: -0.45, cellNum: 4 },
    { x: 0, z: -0.31, cellNum: 5 },
    { x: 0, z: -0.17, cellNum: 6 },
    { x: 0, z: -0.04, cellNum: 7 },
    { x: 0, z: 0.09, cellNum: 8 },
    { x: 0, z: 0.23, cellNum: 9 },
    { x: 0, z: 0.365, cellNum: 10 },
    { x: 0, z: 0.5, cellNum: 11 },
    { x: 0, z: 0.635, cellNum: 12 }
  ];
}

function getClosestCell(pos) {
  const cells = makeCells();
  cells.sort((a, b) => {
    const aPos = new THREE.Vector3(a.x, 0, a.z);
    const bPos = new THREE.Vector3(b.x, 0, b.z);
    return pos.distanceToSquared(aPos) - pos.distanceToSquared(bPos);
  });
  return cells[0];
}

function logItemPositions() {
  const eventData = { itemRanks: {}, itemPositions: {} };
  const itemNameTable = makeItemNameTable();
  // get potential DST items, i.e., objects spawned from super-spawners
  const uiInteractables = [...document.querySelectorAll(".interactable > .ui.interactable-ui")];
  const items = uiInteractables.map(el => el.parentNode);
  for (const item of items) {
    const itemModel = item.components["gltf-model-plus"];
    if (!itemModel) continue;
    const itemName = itemNameTable[itemModel.data.src];
    if (!itemName) continue;
    const itemPos = item.object3D.position;
    const cell = getClosestCell(itemPos);
    eventData.itemRanks[itemName] = cell.cellNum;
    eventData.itemPositions[itemName] = { x: itemPos.x, z: itemPos.z };
  }
  logEvent("itemPositions", eventData);
  return eventData;
}