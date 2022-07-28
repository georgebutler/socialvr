(function () {
    'use strict';

    AFRAME.registerComponent("socialvr-proxvis", {
        init: function () {

            this.start = Date.now();
            this.current = Date.now();

            this.geometry = new THREE.RingGeometry( 1.2, 1.8, 16, 10, 3);
            this.ringMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uTime: {value: 0.0}
                },
                vertexShader: `varying vec3 vPosition;
                            uniform float uTime;
                            void main() {
                                
                                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                                vec4 viewPosition = viewMatrix * modelPosition;
                                vec4 projectedPosition = projectionMatrix * viewPosition;
                                gl_Position = projectedPosition;
                                vPosition = position;
                            }`,
                fragmentShader: 
                `
                varying vec3 vPosition;
                uniform float uTime;

                void main() {
                    vec3 color = vec3(1.0);

                    gl_FragColor = vec4(color,0.5 + sin(vPosition.x * 4.0 + uTime) / 2.0 );
                }
            `,
                transparent: true,
            });
            // this.material = new THREE.MeshStandardMaterial({ color: "blue" , side: THREE.DoubleSide});

            this.mesh = new THREE.Mesh(this.geometry, this.ringMaterial);
            this.mesh.rotateX(THREE.Math.degToRad(-90));
            this.mesh.position.z -= 0.5;

            this.el.setObject3D("mesh", this.mesh);
        },
        tick: function(time, delta){
            const currentTime = Date.now();
            this.current = currentTime;
            this.elapsed = this.current - this.start;
            this.ringMaterial.uniforms.uTime.value = this.elapsed;
            //
            // APP.componentRegistry["player-info"]
        },

        tock: function(time, delta) {
            
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

    // import "./components/barge-button";

    // // Barge
    // window.APP.scene.addEventListener("environment-scene-loaded", () => {

    //   if (FEATURE_BARGE) {
    //     // Button
    //     let button = document.createElement("a-entity");
    //     let position = document.querySelector(".startButton").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

    //     button.setAttribute("socialvr-barge-button", "text: Start; radius: 0.3; color: #C576F6; phaseID: 1");
    //     button.setAttribute("position", position);
    //     window.APP.scene.appendChild(button);

    //     // Button
    //     button = document.createElement("a-entity");
    //     position = document.querySelector(".CompleteButton_phase1").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

    //     button.setAttribute("socialvr-barge-button", "text: Next Task; radius: 0.3; color: #C576F6; phaseID: 2");
    //     button.setAttribute("position", position);
    //     window.APP.scene.appendChild(button);

    //     // Button
    //     button = document.createElement("a-entity");
    //     position = document.querySelector(".CompleteButton_phase2").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

    //     button.setAttribute("socialvr-barge-button", "text: Next Task; radius: 0.3; color: #C576F6; phaseID: 3");
    //     button.setAttribute("position", position);
    //     window.APP.scene.appendChild(button);

    //     // Button
    //     button = document.createElement("a-entity");
    //     position = document.querySelector(".CompleteButton_phase3").object3D.position.add(new THREE.Vector3(0, 0.5, 0))

    //     button.setAttribute("socialvr-barge-button", "text: Complete; radius: 0.3; color: #C576F6; phaseID: 4");
    //     button.setAttribute("position", position);
    //     window.APP.scene.appendChild(button);

    //     // Clock
    //     const clock = document.createElement("a-entity");
    //     clock.setAttribute("radius", 0.1);
    //     clock.setAttribute("socialvr-barge-clock", "");
    //     clock.setAttribute("position", document.querySelector(".clock-placeholder").object3D.position);
    //     window.APP.scene.appendChild(clock);

    //     // Ranking Slots
    //     for (let index = 1; index <= 3; index++) {
    //       const slot = document.createElement("a-entity");
    //       slot.setAttribute("position", { x: 0, y: -1 + (0.4 * index), z: 0 });
    //       slot.setAttribute("socialvr-barge-slot", `type: knowledge; rank: ${4 - index}`);
    //       document.querySelector(".knowledgeFrame_phase1").appendChild(slot);
    //     }

    //     for (let index = 1; index <= 3; index++) {
    //       const slot = document.createElement("a-entity");
    //       slot.setAttribute("position", { x: 0, y: -1 + (0.4 * index), z: 0 });
    //       slot.setAttribute("socialvr-barge-slot", `type: abilities; rank: ${4 - index}`);
    //       document.querySelector(".KSA_ranking_frameglb_1_phase1").appendChild(slot);
    //     }

    //     for (let index = 1; index <= 3; index++) {
    //       const slot = document.createElement("a-entity");
    //       slot.setAttribute("position", { x: 0, y: -1 + (0.4 * index), z: 0 });
    //       slot.setAttribute("socialvr-barge-slot", `type: skills; rank: ${4 - index}`);
    //       document.querySelector(".KSA_ranking_frameglb_phase1").appendChild(slot);
    //     }

    //     // Canidate Slot
    //     const slot = document.createElement("a-entity");
    //     slot.setAttribute("socialvr-barge-slot", `type: canidate; rank: 1; width: 0.5; height: 1; depth: 1;`);
    //     document.querySelector(".candidate_frameglb_phase3").appendChild(slot);

    //     // World Mover
    //     const worldMover = document.createElement("a-entity");
    //     worldMover.setAttribute("socialvr-world-mover", "");
    //     window.APP.scene.appendChild(worldMover);

    //     // Data Logger
    //     const dataLogger = document.createElement("a-entity");
    //     dataLogger.setAttribute("socialvr-barge-data", "");
    //     window.APP.scene.appendChild(dataLogger);

    //     // Changes camera inspection system to show background, regardless of user preferences.
    //     const cameraSystem = window.APP.scene.systems["hubs-systems"].cameraSystem;
    //     cameraSystem.lightsEnabled = true;

    //     // Disable floaty physics
    //     window.APP.scene.addEventListener("object_spawned", (e) => {
    //       const floaties = document.querySelectorAll("[floaty-object]");

    //       floaties.forEach((floaty) => {
    //         floaty.setAttribute("floaty-object", {
    //           reduceAngularFloat: true,
    //           autoLockOnRelease: true,
    //           gravitySpeedLimit: 0
    //         });
    //       });
    //     });
    //   }
    // }, { once: true });

    // Halo
    window.APP.hubChannel.presence.onJoin(() => {
      {
        console.log('proxvis activated !');
        APP.componentRegistry["player-info"].forEach((playerInfo) => {
          if (!playerInfo.socialVRProxvis) {
            const proxvis = document.createElement("a-entity");
            proxvis.setAttribute('socialvr-proxvis',"");
            //checks if social VR Proxvis has already been activated
            playerInfo.socialVRProxvis = true;
            playerInfo.el.appendChild(proxvis);
          }
        });
      }
    });

})();
//# sourceMappingURL=development.js.map
