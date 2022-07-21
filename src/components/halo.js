const MIC_PRESENCE_VOLUME_THRESHOLD = 0.00001;

const SPEECH_TIME_PER_TICK = 10; // every speech tick = 10ms of realtime
const MIN_SPEECH_TIME_FOR_EVENT = 100; // 0.1s realtime
const MAX_SPEECH_TIME_FOR_EVENT = 5000; // 5s realtime
const CONTINUOUS_SPEECH_LENIENCY_TIME = 100; // 0.1s realtime

AFRAME.registerComponent("socialvr-halo", {
    init: function () {
        this.geometry = new THREE.TorusGeometry(0.05, 0.01, 8, 16);
        this.material = new THREE.MeshStandardMaterial({ color: "#FF6782" });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.rotateX(THREE.Math.degToRad(90));

        this.el.setObject3D("mesh", this.mesh);

        // Audio
        this.localAudioAnalyser = this.el.sceneEl.systems["local-audio-analyser"];
        this.playerInfo = APP.componentRegistry["player-info"][0];

        this.continuousSpeechTime = 0;
        this.continuousSpeechLeniencyTime = 0;
    },

    tock: function (time, delta) {
        const muted = this.playerInfo.data.muted;
        const speaking = !muted && this.localAudioAnalyser.volume > MIC_PRESENCE_VOLUME_THRESHOLD;

        if (speaking) {
            if (this.continuousSpeechTime === 0) {
                // Just started talking
            }

            this.continuousSpeechTime += SPEECH_TIME_PER_TICK;
            this.continuousSpeechLeniencyTime = CONTINUOUS_SPEECH_LENIENCY_TIME;

            if (this.continuousSpeechTime <= MAX_SPEECH_TIME_FOR_EVENT) {
                // Size up
                console.log("Size up")
            } else {
                alert("limit reached")
            }
        } else {
            if (this.continuousSpeechLeniencyTime > 0) {
                this.continuousSpeechLeniencyTime -= SPEECH_TIME_PER_TICK;
            }
            if (this.continuousSpeechLeniencyTime <= 0 && this.continuousSpeechTime >= MIN_SPEECH_TIME_FOR_EVENT) {
                // Just stopped talking
            }
        }

        /** 
        if (!this.data.target) { return; }
        if (!NAF.utils.isMine(this.el)) { return; }

        const scale = 0.1 * (delta / 1000);

        this.mesh.scale.addScalar(scale);
        this.mesh.scale.set(this.mesh.scale.x, this.mesh.scale.y, 1);
        this.mesh.matrixAutoUpdate = true;
        */
    }
});