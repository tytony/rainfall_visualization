import * as THREE from 'three';

export class WeatherSystem {
    constructor(scene) {
        this.scene = scene;
        this.intensity = 0;
        this.maxParticles = 100000;
        this.particles = null;
        this.positions = null;
        this.velocities = null;
        this.waterMeshes = null;
        this.streetLights = null;

        this.initRainSystem();
        this.initFog();
    }

    setWaterMeshes(meshes) {
        this.waterMeshes = meshes;
    }

    setStreetLights(lights) {
        this.streetLights = lights;
    }

    initRainSystem() {
        const geometry = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.maxParticles * 3);
        this.velocities = new Float32Array(this.maxParticles);

        for (let i = 0; i < this.maxParticles; i++) {
            this.positions[i * 3] = (Math.random() - 0.5) * 100; // x
            this.positions[i * 3 + 1] = Math.random() * 60;      // y
            this.positions[i * 3 + 2] = (Math.random() - 0.5) * 100; // z
            this.velocities[i] = 0;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.1,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        this.particles.visible = false;
        this.scene.add(this.particles);
    }

    initFog() {
        // Initial fog state
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.002);
    }

    setIntensity(val) {
        this.intensity = val;

        // Update Fog
        let fogDensity = 0.002;
        let skyColor = new THREE.Color(0x87CEEB); // Clear sky blue

        if (val > 0) {
            // Darken sky as rain increases
            const darkness = Math.min(val / 100, 0.7);
            skyColor.lerp(new THREE.Color(0x222222), darkness);

            // Increase fog density
            if (val < 0.2) {
                fogDensity = 0.02; // Misty
            } else if (val < 15) {
                fogDensity = 0.005 + (val / 100) * 0.01;
            } else {
                fogDensity = 0.005 + (val / 100) * 0.02;
            }
        }

        this.scene.background = skyColor;
        this.scene.fog.color = skyColor;
        this.scene.fog.density = fogDensity;

        // Update Rain Particles
        this.particles.visible = val > 0;

        // Adjust particle count based on intensity
        const countRatio = Math.min(val / 80, 1);
        this.particles.geometry.setDrawRange(0, Math.floor(this.maxParticles * countRatio));

        this.particles.material.opacity = Math.min(0.3 + (val / 100) * 0.35, 0.8);
        this.particles.material.size = Math.max(0.1, Math.min(0.1 + (val / 100) * 0.15, 0.3));

        // Update Water Levels
        if (this.waterMeshes) {
            // River rises with intensity, but only starts rising at 20mm
            if (val < 20) {
                // Keep at initial low level
                this.waterMeshes.river.position.y = -3.5;
            } else {
                // Start rising from -3.5 at 20mm, reach ground level (0) around 80mm
                const riverLevel = -3.5 + ((val - 20) / 60) * 3.5;
                this.waterMeshes.river.position.y = riverLevel;
            }

            // Flooding
            if (val > 70) {
                this.waterMeshes.flood.material.opacity = 0.8;
                // Rise from 0.05 to 0.5 (knee deep)
                const floodLevel = 0.05 + ((val - 70) / 50) * 0.5;
                this.waterMeshes.flood.position.y = floodLevel;
            } else {
                this.waterMeshes.flood.material.opacity = 0.0;
                this.waterMeshes.flood.position.y = 0.05;
            }
        }

        // Update Street Lights - turn on when rainfall > 40mm
        if (this.streetLights) {
            const lightsOn = val > 40;
            const targetIntensity = lightsOn ? 1.5 : 0;
            const targetEmissive = lightsOn ? 0.8 : 0;

            this.streetLights.forEach(light => {
                // Smoothly transition light intensity
                light.pointLight.intensity = targetIntensity;
                light.lampHead.material.emissiveIntensity = targetEmissive;
            });
        }
    }

    update(delta) {
        if (this.intensity <= 0) return;

        const positions = this.particles.geometry.attributes.position.array;
        const count = this.particles.geometry.drawRange.count;

        // Base speed based on intensity
        const baseSpeed = 20 + (this.intensity / 100) * 30;

        for (let i = 0; i < count; i++) {
            // Update Y position
            positions[i * 3 + 1] -= baseSpeed * delta;

            // Reset if below ground
            if (positions[i * 3 + 1] < 0) {
                positions[i * 3 + 1] = 60;
                positions[i * 3] = (Math.random() - 0.5) * 100; // Randomize X
                positions[i * 3 + 2] = (Math.random() - 0.5) * 100; // Randomize Z
            }
        }

        this.particles.geometry.attributes.position.needsUpdate = true;
    }
}




