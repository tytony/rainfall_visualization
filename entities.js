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
        const carGeometry = new THREE.BoxGeometry(2, 1, 4); // Long axis is Z (length 4)
        // Note: When we rotate the car, the local Z becomes the movement axis.

        // Create a few cars
        for (let i = 0; i < 10; i++) {
            const car = new THREE.Mesh(carGeometry, new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }));
            car.castShadow = true;

            // Random start position on roads
            const isHorizontal = Math.random() > 0.5;
            const speed = 10 + Math.random() * 5;

            // Lane offset: Road width 14, lanes at +/- 3.5
            const laneOffset = 3.5;

            if (isHorizontal) {
                // X-axis road (Road 2)
                // Right hand traffic:
                // Moving +X -> z = -3.5
                // Moving -X -> z = +3.5
                const movingPositive = Math.random() > 0.5;
                const zPos = movingPositive ? -laneOffset : laneOffset;

                car.position.set((Math.random() - 0.5) * 180, 0.7, zPos);
                car.rotation.y = movingPositive ? Math.PI / 2 : -Math.PI / 2;

                car.userData = {
                    velocity: new THREE.Vector3(movingPositive ? speed : -speed, 0, 0),
                    axis: 'x'
                };
            } else {
                // Z-axis road (Road 1)
                // Right hand traffic:
                // Moving +Z -> x = -3.5 (Wait, if facing +Z, Right is -X) -> No, if facing +Z (South), Right is West (-X). Correct.
                // Moving -Z -> x = +3.5
                const movingPositive = Math.random() > 0.5;
                const xPos = movingPositive ? -laneOffset : laneOffset;

                car.position.set(xPos, 0.7, (Math.random() - 0.5) * 180);
                car.rotation.y = movingPositive ? 0 : Math.PI;

                car.userData = {
                    velocity: new THREE.Vector3(0, 0, movingPositive ? speed : -speed),
                    axis: 'z'
                };
            }

            this.scene.add(car);
            this.cars.push(car);
        }
    }

    initPedestrians() {
        // Head geometry (sphere)
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        // Skin color
        const skinColor = 0xffdbac;

        // Body geometry (capsule)
        const bodyGeometry = new THREE.CapsuleGeometry(0.25, 0.8, 4, 8);

        // Umbrella Geometry
        const umbrellaGeo = new THREE.ConeGeometry(0.6, 0.2, 8, 1, true);

        for (let i = 0; i < 20; i++) {
            const group = new THREE.Group();

            // Random body color
            const bodyColor = Math.random() * 0xffffff;

            // Body
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: bodyColor });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.castShadow = true;
            body.position.y = 0.6; // Body center height
            group.add(body);

            // Head
            const headMaterial = new THREE.MeshStandardMaterial({ color: skinColor });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.castShadow = true;
            head.position.y = 1.25; // Head on top of body
            group.add(head);

            // Umbrella with random color
            const umbrellaColor = Math.random() * 0xffffff;
            const umbrellaMat = new THREE.MeshStandardMaterial({ color: umbrellaColor, side: THREE.DoubleSide });
            const umbrella = new THREE.Mesh(umbrellaGeo, umbrellaMat);
            umbrella.position.y = 1.6;
            umbrella.visible = false;
            group.add(umbrella);

            // Spawn on sidewalks
            // Sidewalks are at +/- 8.5 from center of roads.
            const isHorizontal = Math.random() > 0.5;
            const side = Math.random() > 0.5 ? 1 : -1;
            const offset = 8.5 * side;

            if (isHorizontal) {
                // Walking along X-axis road
                group.position.set((Math.random() - 0.5) * 180, 0, offset);
                // Random direction
                const speed = 1 + Math.random();
                const dir = Math.random() > 0.5 ? 1 : -1;
                group.userData = {
                    velocity: new THREE.Vector3(dir * speed, 0, 0),
                    umbrella: umbrella,
                    axis: 'x',
                    limit: 100
                };
                group.lookAt(group.position.clone().add(group.userData.velocity));
            } else {
                // Walking along Z-axis road
                group.position.set(offset, 0, (Math.random() - 0.5) * 180);
                const speed = 1 + Math.random();
                const dir = Math.random() > 0.5 ? 1 : -1;
                group.userData = {
                    velocity: new THREE.Vector3(0, 0, dir * speed),
                    umbrella: umbrella,
                    axis: 'z',
                    limit: 100
                };
                group.lookAt(group.position.clone().add(group.userData.velocity));
            }

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
            const limit = 100;
            if (car.userData.axis === 'x') {
                if (car.position.x > limit) car.position.x = -limit;
                if (car.position.x < -limit) car.position.x = limit;
            } else {
                if (car.position.z > limit) car.position.z = -limit;
                if (car.position.z < -limit) car.position.z = limit;
            }
        });

        // Update Pedestrians
        this.pedestrians.forEach(ped => {
            ped.position.addScaledVector(ped.userData.velocity, delta);

            // Simple bounds check
            const limit = ped.userData.limit || 50;
            if (ped.userData.axis === 'x') {
                if (Math.abs(ped.position.x) > limit) {
                    ped.userData.velocity.x *= -1; // Turn around
                    ped.lookAt(ped.position.clone().add(ped.userData.velocity));
                }
            } else {
                if (Math.abs(ped.position.z) > limit) {
                    ped.userData.velocity.z *= -1; // Turn around
                    ped.lookAt(ped.position.clone().add(ped.userData.velocity));
                }
            }
        });
    }
}
