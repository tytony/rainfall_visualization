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

        for (let i = 0; i < 10; i++) {
            const ped = new THREE.Mesh(pedGeometry, pedMaterial);
            ped.castShadow = true;
            ped.position.y = 0.8;

            // Random position on sidewalks (approximate)
            ped.position.x = (Math.random() - 0.5) * 40;
            ped.position.z = (Math.random() - 0.5) * 40;

            // Avoid roads (simple check)
            if (Math.abs(ped.position.x) < 6) ped.position.x += 10;
            if (Math.abs(ped.position.z) < 6) ped.position.z += 10;

            ped.userData = {
                velocity: new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2)
            };

            this.scene.add(ped);
            this.pedestrians.push(ped);
        }
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
