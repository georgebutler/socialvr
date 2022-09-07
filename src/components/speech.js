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

AFRAME.registerComponent("socialvr-speech", {
  init: function () {
    this.localAudioAnalyser = this.el.sceneEl.systems["local-audio-analyser"];
    this.playerInfo = APP.componentRegistry["player-info"][0];

    this.activeSpeechOrbs = {};
    this.continuousSpeechTime = 0;
    this.continuousSpeechLeniencyTime = 0;

    // Mesh
    //this.geometry = new THREE.SphereGeometry(0.05, 16, 8);
    //this.material = new THREE.MeshStandardMaterial({ color: "#FF6782" });
    //this.mesh = new THREE.Mesh(this.geometry, this.material);
    //this.el.setObject3D("mesh", this.mesh);

    // Client
    this.el.addEventListener("clearSpeechEvent", this.clearSpeech.bind(this));

    // Broadcast Event
    NAF.connection.subscribeToDataChannel("startSpeech", this._startSpeech.bind(this));
    NAF.connection.subscribeToDataChannel("stopSpeech", this._stopSpeech.bind(this));
    NAF.connection.subscribeToDataChannel("clearSpeech", this._clearSpeech.bind(this));

    console.log("[Social VR] Speech System - Initialized");
    this.system.register(this.el);
  },

  remove: function () {
    this.el.removeEventListener("clearSpeechEvent", this.clearSpeech.bind(this));

    NAF.connection.unsubscribeToDataChannel("startSpeech");
    NAF.connection.unsubscribeToDataChannel("stopSpeech");
    NAF.connection.unsubscribeToDataChannel("clearSpeech");

    this.system.unregister();
  },

  tick: function (t, dt) {
    // TODO: more elegant solution?
    if (this.el.getAttribute("visible")) {
      this.el.play();
    } else {
      this.el.pause();
    }

    const muted = this.playerInfo.data.muted;
    const speaking = !muted && this.localAudioAnalyser.volume > MIC_PRESENCE_VOLUME_THRESHOLD;

    // maintain speech event state of local user, send events as needed
    if (speaking) {
      if (this.continuousSpeechTime === 0) {
        // speech event started
        const eventData = { speaker: this.playerInfo.playerSessionId, speakerName: this.playerInfo.displayName };
        this._startSpeech(null, null, eventData, null); // local
        NAF.connection.broadcastData("startSpeech", eventData); // networked
      }
      this.continuousSpeechTime += SPEECH_TIME_PER_TICK;
      this.continuousSpeechLeniencyTime = CONTINUOUS_SPEECH_LENIENCY_TIME;
      // if this is a single really long speech event, break it off and start a new one
      if (this.continuousSpeechTime >= MAX_SPEECH_TIME_FOR_EVENT) {
        this.doStopSpeech(this.continuousSpeechTime);
        this.continuousSpeechTime = 0;
      }
    } else {
      if (this.continuousSpeechLeniencyTime > 0) {
        this.continuousSpeechLeniencyTime -= SPEECH_TIME_PER_TICK;
      }
      if (this.continuousSpeechLeniencyTime <= 0 && this.continuousSpeechTime >= MIN_SPEECH_TIME_FOR_EVENT) {
        // speech event ended
        this.doStopSpeech(this.continuousSpeechTime);
        this.continuousSpeechTime = 0;
      }
    }

    // update speech orb sizes and positions
    for (const finishedOrb of document.querySelectorAll(".speechOrb.finished")) {
      const pos = finishedOrb.getAttribute("position");
      pos.y += ORB_GROWTH_PER_TICK; // synchronize movement speed with orb growth rate
      finishedOrb.setAttribute("position", pos);
    }

    for (const activeOrb of Object.values(this.activeSpeechOrbs)) {
      // grow each active speech orb by ORB_GROWTH_PER_TICK
      activeOrb.object3D.scale.add(new THREE.Vector3(0, ORB_GROWTH_PER_TICK * 10, 0));
      activeOrb.matrixNeedsUpdate = true;

      // move its center upward by half of the growth amount,
      // to keep the bottom position fixed at the "now" plane
      const pos = activeOrb.getAttribute("position");
      pos.y += ORB_GROWTH_PER_TICK / 2;
      activeOrb.setAttribute("position", pos);
    }
  },

  _startSpeech: function (senderId, dataType, data, targetId) {
    // if no already-active speech orb for this speaker, spawn one
    const activeOrb = this.activeSpeechOrbs[data.speaker];
    if (activeOrb) {
      activeOrb.classList.add("finished"); // FIXME replace w/ stopSpeech call for consistency?
    }
    const speakerInfo = this.getPlayerInfo(data.speaker);
    const newOrb = this.spawnOrb(MIN_ORB_SIZE, this.playerInfoToColor(speakerInfo));
    this.activeSpeechOrbs[data.speaker] = newOrb;

    // position the orb relative to the player and the center of the scene
    const centerObj = this.el;
    const centerPos = centerObj ? new THREE.Vector3() : new THREE.Vector3(...ORB_CONTAINER_POS);
    //centerPos.y = 1.5;
    centerPos.y = 0.5;
    const playerPos = speakerInfo.el.object3D.position.clone();
    //playerPos.y = 1.5;
    playerPos.y = 0.5;
    const offset = new THREE.Vector3().subVectors(playerPos, this.el.object3D.position).normalize();
    const orbPos = new THREE.Vector3().addVectors(centerPos, offset);

    newOrb.object3D.position.copy(orbPos);
  },

  doStopSpeech: function (speechTime) {
    const orbSize = this.scale(speechTime, MIN_SPEECH_TIME_FOR_EVENT, MAX_SPEECH_TIME_FOR_EVENT, MIN_ORB_SIZE, MAX_ORB_SIZE);
    const eventData = {
      size: orbSize,
      speaker: this.playerInfo.playerSessionId,
      speakerName: this.playerInfo.displayName
    };
    this._stopSpeech(null, null, eventData, null); // local
    NAF.connection.broadcastData("stopSpeech", eventData); // networked
  },

  _stopSpeech: function (senderId, dataType, data, targetId) {
    const activeOrb = this.activeSpeechOrbs[data.speaker];
    if (activeOrb) {
      activeOrb.classList.add("finished");
      activeOrb.setAttribute("radius", 0.1);
      activeOrb.setAttribute("height", data.size);

      delete this.activeSpeechOrbs[data.speaker];
    }
  },

  scale: function (num, oldLower, oldUpper, newLower, newUpper) {
    const oldRange = oldUpper - oldLower;
    const newRange = newUpper - newLower;
    return ((num - oldLower) / oldRange) * newRange + newLower;
  },

  getPlayerInfo: function (sessionID) {
    const playerInfos = APP.componentRegistry["player-info"];
    return playerInfos.find(pi => pi.playerSessionId === sessionID);
  },

  sessionIDToColor: function (sessionID) {
    return "#" + sessionID.substring(0, 6); // just use first 6 chars lol
  },

  // keys are "Avatar listing sid"s from Approved Avatars admin tab
  playerInfoToColor: function (playerInfo) {
    const colorsByAvatar = {
      "4rtlr6I": 0x1da8ff,
      WPYjPmv: 0xff2190,
      "1S9JzDB": 0xff0000,
      jZWyDGm: 0x00e000,
      II9rXJD: 0xfce903,
      HrP4pCf: 0x5a005a,
      sEj4i7J: 0xfc9303,
      vm3cTy7: 0x020894,
      Mih5HF7: 0x222222,
      U2E2EZi: 0x7700f4,
      xb4PVBE: 0xffff00,
      Mqpw3tx: 0xf30000,
      RczWQgy: 0x000000,
      bs7pLac: 0x010188,
      "4r1KpVk": 0xff5c00
    };

    const avatarURL = playerInfo.data.avatarSrc;

    for (const avatarSID of Object.keys(colorsByAvatar)) {
      if (avatarURL.includes(avatarSID)) {
        return colorsByAvatar[avatarSID];
      }
    }

    return this.sessionIDToColor(playerInfo.playerSessionId);
  },

  spawnOrb: function (size, in_color) {
    const geometry = new THREE.CylinderGeometry(0.1, 0.1, size);
    const material = new THREE.MeshBasicMaterial({
      color: in_color || 0xffffff
    });

    // create, color, position, and scale the orb
    const orb = document.createElement("a-entity");
    orb.classList.add("speechOrb");
    orb.setObject3D("mesh", new THREE.Mesh(geometry, material));

    // add the orb to the scene
    this.el.appendChild(orb);

    // queue the orb for deletion later
    setTimeout(() => orb.remove(), SPEECH_ORB_LIFETIME);

    return orb;
  },

  _clearSpeech: function (senderId, dataType, data, targetId) {
    for (const finishedOrb of document.querySelectorAll(".speechOrb.finished")) {
      finishedOrb.parentNode.removeChild(finishedOrb);
    }
  },

  clearSpeech: function () {
    this._clearSpeech(null, null, {}, null);
    NAF.connection.broadcastData("clearSpeech", {});
  }
});