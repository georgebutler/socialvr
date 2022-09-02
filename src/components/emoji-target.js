AFRAME.registerComponent("socialvr-emoji-target", {
    dependencies: ["is-remote-hover-target"],

    schema: {
        name: { default: "" }
    },

    init: function () {
        console.log("[Social VR] Emoji Target - Initialized");

        this.el.setAttribute("tags", "singleActionButton: true");
        this.el.setAttribute("is-remote-hover-target", "");
        this.el.setAttribute("css-class", "interactable");
        this.el.setAttribute("hoverable-visuals", "");

        // hover state visual
        let hoverVisModel = window.APP.utils.emojis[0].model;
        this.hoverVis = window.APP.utils.addMedia(hoverVisModel, "#static-media", null, null, false, false, false, {}, false, this.el).entity;
        this.hoverVis.object3D.position.y += 2;
        this.hoverVis.object3D.scale.copy(new THREE.Vector3(0.5, 0.5, 0.5));
        this.hoverVis.object3D.visible = false;

        this.el.addEventListener("hover", this.onHover.bind(this));
        this.el.addEventListener("unhover", this.onUnhover.bind(this));
        this.el.object3D.addEventListener("interact", this.onClick.bind(this));
    },

    remove: function () {
        this.el.removeEventListener("hover", this.onHover.bind(this));
        this.el.removeEventListener("unhover", this.onUnhover.bind(this));
        this.el.object3D.removeEventListener("interact", this.onClick.bind(this));
    },

    tick: function () {
        // update hover state visual to face this player
        this.hoverVis.object3D.lookAt(this.system.head.object3D.getWorldPosition(new THREE.Vector3()));
    },

    onHover: function () {
        this.hoverVis.object3D.visible = true;
    },

    onUnhover: function () {
        this.hoverVis.object3D.visible = false;
    },

    onClick: function () {
        if (!this.system.hudAnchor.querySelector(".socialvr-emoji-button")) {
            const hudScale = (this.system.VR) ? 0.2 : 0.5;
            const hudX = (this.system.VR) ? -0.6 : -1.5;
            const hudY = (this.system.VR) ? 1.4 : -0.5;
            const hudZ = (this.system.VR) ? -1 : -1.5;
            const hudSpacing = (this.system.VR) ? 0.2 : 0.5;

            let x = hudX;
            /*
            window.APP.utils.emojis.forEach(({ model, particleEmitterConfig }) => {
                const emoji = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;

                emoji.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));
                emoji.object3D.position.copy(new THREE.Vector3(x, hudY, hudZ));
                x += hudSpacing;

                particleEmitterConfig.startVelocity.y = 0;
                particleEmitterConfig.endVelocity.y = -2;

                emoji.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
                emoji.className = "socialvr-emoji-button";
            });
            */

            const cancelButton = document.createElement("a-entity");
            cancelButton.setAttribute("socialvr-emoji-cancel-button", "");
            this.system.hudAnchor.appendChild(cancelButton);
            cancelButton.object3D.position.copy(new THREE.Vector3(0, hudY - 0.3, hudZ));
            this.el.sceneEl.systems["socialvr-emoji-button"].registerCancel(cancelButton);

            const buttonY = (this.system.VR) ? hudY + 0.2 : hudY + 0.4;

            // Rainbow

            let model = new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/rainbow.glb", window.location).href;
            let particleEmitterConfig = {
              src: new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0000_Rainbow.png", window.location).href,
              resolve: false,
              particleCount: 20,
              startSize: 0.01,
              endSize: 0.2,
              sizeRandomness: 0.05,
              lifetime: 1,
              lifetimeRandomness: 0.2,
              ageRandomness: 1,
              startVelocity: { x: 0, y: 0, z: 0 },
              endVelocity: { x: 0, y: -2, z: 0 },
              startOpacity: 1,
              middleOpacity: 1,
              endOpacity: 0
            };

            /*
            let button = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;
            button.object3D.position.copy(new THREE.Vector3(x, buttonY, hudZ));
            button.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));
            button.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
            button.className = "socialvr-emoji-button";
            */

            let button = document.createElement("a-entity");
            button.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
            button.object3D.position.copy(new THREE.Vector3(x, buttonY, hudZ));
            button.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));
            this.system.hudAnchor.appendChild(button);

            x += hudSpacing;

            // Star

            model = new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/Star.glb", window.location).href;
            particleEmitterConfig = {
              src: new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0001_Star.png", window.location).href,
              resolve: false,
              particleCount: 20,
              startSize: 0.01,
              endSize: 0.2,
              sizeRandomness: 0.05,
              lifetime: 1,
              lifetimeRandomness: 0.2,
              ageRandomness: 1,
              startVelocity: { x: 0, y: 0, z: 0 },
              endVelocity: { x: 0, y: -2, z: 0 },
              startOpacity: 1,
              middleOpacity: 1,
              endOpacity: 0
            };

            button = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;
            button.object3D.position.copy(new THREE.Vector3(x, buttonY, hudZ));
            button.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));
            button.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
            button.className = "socialvr-emoji-button";

            x += hudSpacing;

            // Poop

            model = new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/poo.glb", window.location).href;
            particleEmitterConfig = {
              src: new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0006_Poop.png", window.location).href,
              resolve: false,
              particleCount: 20,
              startSize: 0.01,
              endSize: 0.2,
              sizeRandomness: 0.05,
              lifetime: 1,
              lifetimeRandomness: 0.2,
              ageRandomness: 1,
              startVelocity: { x: 0, y: 0, z: 0 },
              endVelocity: { x: 0, y: -2, z: 0 },
              startOpacity: 1,
              middleOpacity: 1,
              endOpacity: 0
            };

            button = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;
            button.object3D.position.copy(new THREE.Vector3(x, buttonY, hudZ));
            button.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));
            button.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
            button.className = "socialvr-emoji-button";

            x += hudSpacing;

            // Dart

            model = new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/dart.glb", window.location).href;
            particleEmitterConfig = {
              src: new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0003_Dartt.png", window.location).href,
              resolve: false,
              particleCount: 20,
              startSize: 0.01,
              endSize: 0.2,
              sizeRandomness: 0.05,
              lifetime: 1,
              lifetimeRandomness: 0.2,
              ageRandomness: 1,
              startVelocity: { x: 0, y: 0, z: 0 },
              endVelocity: { x: 0, y: -2, z: 0 },
              startOpacity: 1,
              middleOpacity: 1,
              endOpacity: 0
            };

            button = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;
            button.object3D.position.copy(new THREE.Vector3(x, buttonY, hudZ));
            button.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));
            button.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
            button.className = "socialvr-emoji-button";

            x += hudSpacing;

            // Flower

            model = new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/flower.glb", window.location).href;
            particleEmitterConfig = {
              src: new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0004_Flower.png", window.location).href,
              resolve: false,
              particleCount: 20,
              startSize: 0.01,
              endSize: 0.2,
              sizeRandomness: 0.05,
              lifetime: 1,
              lifetimeRandomness: 0.2,
              ageRandomness: 1,
              startVelocity: { x: 0, y: 0, z: 0 },
              endVelocity: { x: 0, y: -2, z: 0 },
              startOpacity: 1,
              middleOpacity: 1,
              endOpacity: 0
            };

            button = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;
            button.object3D.position.copy(new THREE.Vector3(x, buttonY, hudZ));
            button.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));
            button.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
            button.className = "socialvr-emoji-button";

            x += hudSpacing;

            // Alarm

            model = new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/alarmclock.glb", window.location).href;
            particleEmitterConfig = {
              src: new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0005_Alarm.png", window.location).href,
              resolve: false,
              particleCount: 20,
              startSize: 0.01,
              endSize: 0.2,
              sizeRandomness: 0.05,
              lifetime: 1,
              lifetimeRandomness: 0.2,
              ageRandomness: 1,
              startVelocity: { x: 0, y: 0, z: 0 },
              endVelocity: { x: 0, y: -2, z: 0 },
              startOpacity: 1,
              middleOpacity: 1,
              endOpacity: 0
            };

            button = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;
            button.object3D.position.copy(new THREE.Vector3(x, buttonY, hudZ));
            button.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));
            button.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
            button.className = "socialvr-emoji-button";

            x += hudSpacing;

            // Pizza

            model = new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/pizza.glb", window.location).href;
            particleEmitterConfig = {
              src: new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0007_Pizza.png", window.location).href,
              resolve: false,
              particleCount: 20,
              startSize: 0.01,
              endSize: 0.2,
              sizeRandomness: 0.05,
              lifetime: 1,
              lifetimeRandomness: 0.2,
              ageRandomness: 1,
              startVelocity: { x: 0, y: 0, z: 0 },
              endVelocity: { x: 0, y: -2, z: 0 },
              startOpacity: 1,
              middleOpacity: 1,
              endOpacity: 0
            };

            button = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;
            button.object3D.position.copy(new THREE.Vector3(x, buttonY, hudZ));
            button.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));
            button.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
            button.className = "socialvr-emoji-button";

            x += hudSpacing;

            // Wine

            model = new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/wine.glb", window.location).href;
            particleEmitterConfig = {
              src: new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0008_Wine.png", window.location).href,
              resolve: false,
              particleCount: 20,
              startSize: 0.01,
              endSize: 0.2,
              sizeRandomness: 0.05,
              lifetime: 1,
              lifetimeRandomness: 0.2,
              ageRandomness: 1,
              startVelocity: { x: 0, y: 0, z: 0 },
              endVelocity: { x: 0, y: -2, z: 0 },
              startOpacity: 1,
              middleOpacity: 1,
              endOpacity: 0
            };

            button = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;
            button.object3D.position.copy(new THREE.Vector3(x, buttonY, hudZ));
            button.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));
            button.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
            button.className = "socialvr-emoji-button";

            x += hudSpacing;

            // Coffee

            model = new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/coffee.glb", window.location).href;
            particleEmitterConfig = {
              src: new URL("https://statuesque-rugelach-4185bd.netlify.app/assets/emoji/particles/Emojis_0009_Coffee.png", window.location).href,
              resolve: false,
              particleCount: 20,
              startSize: 0.01,
              endSize: 0.2,
              sizeRandomness: 0.05,
              lifetime: 1,
              lifetimeRandomness: 0.2,
              ageRandomness: 1,
              startVelocity: { x: 0, y: 0, z: 0 },
              endVelocity: { x: 0, y: -2, z: 0 },
              startOpacity: 1,
              middleOpacity: 1,
              endOpacity: 0
            };

            button = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;
            button.object3D.position.copy(new THREE.Vector3(x, buttonY, hudZ));
            button.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));
            button.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
            button.className = "socialvr-emoji-button";

            x += hudSpacing;

            // // custom model, local: change url for each ngrok session, remote: change url to netlify
            // // TODO: do this from Spoke instead
            // const url = "https://6f50-2601-645-c000-8880-7411-5a9c-1946-ff10.ngrok.io";
            // const modelURL = url + "/assets/rubber_duck.glb";
            // const particleURL = url + "/assets/rubber_duck.png";
            // const model = new URL(modelURL, window.location).href;
            // const particleEmitterConfig = {
            //   src: new URL(particleURL, window.location).href,
            //   resolve: false,
            //   particleCount: 20,
            //   startSize: 0.01,
            //   endSize: 0.2,
            //   sizeRandomness: 0.05,
            //   lifetime: 1,
            //   lifetimeRandomness: 0.2,
            //   ageRandomness: 1,
            //   startVelocity: { x: 0, y: 0, z: 0 },
            //   endVelocity: { x: 0, y: -2, z: 0 },
            //   startOpacity: 1,
            //   middleOpacity: 1,
            //   endOpacity: 0
            // };

            // const button = window.APP.utils.addMedia(model, "#static-media", null, null, false, false, false, {}, false, this.system.hudAnchor).entity;
            // const buttonY = (this.system.VR) ? hudY + 0.2 : hudY + 0.4;
            // button.object3D.position.copy(new THREE.Vector3(0, buttonY, hudZ));
            // button.object3D.scale.copy(new THREE.Vector3(hudScale, hudScale, hudScale));

            // button.setAttribute("socialvr-emoji-button", { model: model, particleEmitterConfig: particleEmitterConfig, target: this.el });
            // button.className = "socialvr-emoji-button";
        }
    }
});