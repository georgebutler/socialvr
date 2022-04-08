const MIC_PRESENCE_VOLUME_THRESHOLD = 0.00001;

const SPEECH_TIME_PER_TICK = 10; // every speech tick = 10ms of realtime
const MIN_SPEECH_TIME_FOR_EVENT = 100; // 0.1s realtime
const MAX_SPEECH_TIME_FOR_EVENT = 5000; // 5s realtime
const CONTINUOUS_SPEECH_LENIENCY_TIME = 100; // 0.1s realtime

const ORB_CONTAINER_POS = [0, 0, 0]; // [7,0,2]
const ORB_CONTAINER_SIZE = 1;
const ORB_CONTAINER_DEPTH = 4;

const MIN_ORB_SIZE = 0.05;
const MAX_ORB_SIZE = 0.9;
const SPEECH_ORB_LIFETIME = 1000 * 60 * 5; // 5mins realtime
const ORB_GROWTH_PER_TICK = (MAX_ORB_SIZE - MIN_ORB_SIZE) / ((MAX_SPEECH_TIME_FOR_EVENT - MIN_SPEECH_TIME_FOR_EVENT) / SPEECH_TIME_PER_TICK);

AFRAME.registerSystem("socialvr-speech", {
  init() {
    this.activeOrbs = {};
    this.eventLog = [];

    // Client
    this.el.addEventListener("startSpeechEvent", this.startSpeech.bind(this));
    this.el.addEventListener("stopSpeechEvent", this.stopSpeech.bind(this));

    // Broadcast Event
    NAF.connection.subscribeToDataChannel("startSpeechEvent", this._startSpeech.bind(this));
    NAF.connection.subscribeToDataChannel("stopSpeechEvent", this._stopSpeech.bind(this));

    console.log("[Social VR] Speech System - Initialized");
  },

  sessionIDToColor(sessionID) {
    return "#" + sessionID.substring(0, 6);
  },

  getPlayerInfo(sessionID) {
    const playerInfos = APP.componentRegistry["player-info"];

    return playerInfos.find(info => info.playerSessionId === sessionID);
  },

  // keys are "Avatar listing sid"s from Approved Avatars admin tab
  playerInfoToColor(playerInfo) {
    const avatarURL = playerInfo.data.avatarSrc;
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

    for (const avatarSID of Object.keys(colorsByAvatar)) {
      if (avatarURL.includes(avatarSID)) {
        return colorsByAvatar[avatarSID];
      }
    }

    return sessionIDToColor(playerInfo.playerSessionId);
  },

  logEvent(eventType, e) {
    e.eventType = eventType;
    e.timestamp = Date.now();

    this.eventLog.push(e);
  },

  spawnOrb(size, color) {
    const orb = document.createElement("a-entity");

    orb.setAttribute("socialvr-speech", "");
    orb.setAttribute("height", size);

    setTimeout(() => orb.remove(), SPEECH_ORB_LIFETIME);
  },

  startSpeech() {
    this._startSpeech(null, null, {});
    NAF.connection.broadcastData("startSpeech", {});
  },

  stopSpeech(speechTime) {
    const orbSize = scale(speechTime, MIN_SPEECH_TIME_FOR_EVENT, MAX_SPEECH_TIME_FOR_EVENT, MIN_ORB_SIZE, MAX_ORB_SIZE);
    const playerInfo = APP.componentRegistry["player-info"][0];
    const eventData = {
      size: orbSize,
      speaker: playerInfo.playerSessionId,
      speakerName: playerInfo.displayName
    };

    this._stopSpeech(null, null, eventData);
    NAF.connection.broadcastData("stopSpeech", eventData);
  },

  _startSpeech(senderId, dataType, data, targetId) {
    logEvent("startSpeech", data);

    const activeOrb = activeOrbs[data.speaker];
    const playerInfo = getPlayerInfo(data.speaker);
    const newOrb = spawnOrb(MIN_ORB_SIZE, playerInfoToColor(playerInfo));

    if (activeOrb) {
      activeOrb.el.setAttribute("finished");
    }

    const centerObj = document.querySelector(".Table");
    const centerPos = centerObj ? centerObj.object3D.position.clone() : new THREE.Vector3(...ORB_CONTAINER_POS)
    centerPos.y = 1.5;

    const playerPos = playerInfo.el.object3D.position.clone();
    playerPos.y = 1.5;

    const offset = new THREE.Vector3().subVectors(playerPos, centerPos).normalize();
    const orbPos = new THREE.Vector3().addVectors(centerPos, offset);

    newOrb.setAttribute("position", orbPos);
    this.system.activeSpeechOrbs[data.speaker] = newOrb;
  },

  _stopSpeech(senderId, dataType, data, targetId) {
    logEvent("stopSpeech", data);

    const activeOrb = activeSpeechOrbs[data.speaker];

    if (activeOrb) {
      activeOrb.setAttribute("height", data.size);
      activeOrb.classList.add("finished");

      delete activeSpeechOrbs[data.speaker];
    }
  },
});