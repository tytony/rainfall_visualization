import * as THREE from 'three';

export class WeatherSystem {
    constructor(scene) {
        this.scene = scene;
        this.intensity = 0;
        this.maxParticles = 150000;
        this.particles = null;
        this.positions = null;
        this.velocities = null;

        this.initRainSystem();
        this.initFog();
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
            opacity: 0.6,
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
            const darkness = Math.min(val / 100, 0.8);
            skyColor.lerp(new THREE.Color(0x222222), darkness);

            // Increase fog density
            if (val < 0.2) {
                fogDensity = 0.02; // Misty
            } else if (val < 10) {
                fogDensity = 0.005 + (val / 100) * 0.01;
            } else {
                fogDensity = 0.01 + (val / 100) * 0.04;
            }
        }

        this.scene.background = skyColor;
        this.scene.fog.color = skyColor;
        this.scene.fog.density = fogDensity;

        // Update Rain Particles
        this.particles.visible = val > 0;

        // Adjust particle count based on intensity
        // Map 0-100mm to 0-maxParticles
        // Non-linear mapping for better visual effect
        const countRatio = Math.min(val / 80, 1);
        this.particles.geometry.setDrawRange(0, Math.floor(this.maxParticles * countRatio));

        // Adjust rain speed/size visual (simulated by opacity and size in shader if we had one, here just basic material)
        this.particles.material.opacity = Math.min(0.3 + (val / 100) * 0.5, 0.8);
        this.particles.material.size = Math.max(0.1, Math.min(0.1 + (val / 100) * 0.2, 0.3));
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
