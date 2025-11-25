import * as THREE from 'three';

export class EntityManager {
    constructor(scene) {
        this.scene = scene;
        this.cars = [];
        this.pedestrians = [];

        this.initCars();
        this.initPedestrians();
    }

    initCars() {
        const carGeometry = new THREE.BoxGeometry(2, 1, 4);
        const carMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });

        // Create a few cars
        for (let i = 0; i < 5; i++) {
            const car = new THREE.Mesh(carGeometry, carMaterial);
            car.castShadow = true;

            // Random start position on roads
            const isHorizontal = Math.random() > 0.5;
            if (isHorizontal) {
                car.position.set((Math.random() - 0.5) * 100, 0.7, (Math.random() > 0.5 ? 4 : -4));
                car.rotation.y = Math.random() > 0.5 ? 0 : Math.PI;
                car.userData = {
                    velocity: new THREE.Vector3(Math.random() > 0.5 ? 10 : -10, 0, 0),
                    axis: 'x'
                };
            } else {
                car.position.set((Math.random() > 0.5 ? 4 : -4), 0.7, (Math.random() - 0.5) * 100);
                car.rotation.y = Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
                car.userData = {
                    velocity: new THREE.Vector3(0, 0, Math.random() > 0.5 ? 10 : -10),
                    axis: 'z'
                };
            }

            // Random color
            car.material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });

            this.scene.add(car);
            this.cars.push(car);
        }
    }

    initPedestrians() {
        const pedGeometry = new THREE.CapsuleGeometry(0.3, 1, 4, 8);
        const pedMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });

        // Umbrella Geometry
        const umbrellaGeo = new THREE.ConeGeometry(0.6, 0.2, 8, 1, true);
        const umbrellaMat = new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.DoubleSide });

        for (let i = 0; i < 10; i++) {
            const group = new THREE.Group();

            const ped = new THREE.Mesh(pedGeometry, pedMaterial);
            ped.castShadow = true;
            ped.position.y = 0.8; // Center of capsule is at 0, so lift it up
            group.add(ped);

            const umbrella = new THREE.Mesh(umbrellaGeo, umbrellaMat);
            umbrella.position.y = 1.6;
            umbrella.visible = false; // Hidden by default
            group.add(umbrella);

            // Random position on sidewalks (approximate)
            group.position.x = (Math.random() - 0.5) * 40;
            group.position.z = (Math.random() - 0.5) * 40;

            // Avoid roads (simple check)
            if (Math.abs(group.position.x) < 6) group.position.x += 10;
            if (Math.abs(group.position.z) < 6) group.position.z += 10;

            group.userData = {
                velocity: new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2),
                umbrella: umbrella
            };

            this.scene.add(group);
            this.pedestrians.push(group);
        }
    }

    setIntensity(val) {
        const useUmbrella = val > 1;
        this.pedestrians.forEach(ped => {
            ped.userData.umbrella.visible = useUmbrella;
        });
    }

    update(delta) {
        // Update Cars
        this.cars.forEach(car => {
            car.position.addScaledVector(car.userData.velocity, delta);

            // Loop around
            if (car.userData.axis === 'x') {
                if (car.position.x > 100) car.position.x = -100;
                if (car.position.x < -100) car.position.x = 100;
            } else {
                if (car.position.z > 100) car.position.z = -100;
                if (car.position.z < -100) car.position.z = 100;
            }
        });

        // Update Pedestrians
        this.pedestrians.forEach(ped => {
            ped.position.addScaledVector(ped.userData.velocity, delta);

            // Simple bounds check
            if (Math.abs(ped.position.x) > 50 || Math.abs(ped.position.z) > 50) {
                ped.userData.velocity.negate();
            }
        });
    }
}
