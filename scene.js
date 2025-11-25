import * as THREE from 'three';

export function createScene(scene) {
    const objects = [];

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    objects.push(ground);

    // Roads
    const roadGeometry = new THREE.PlaneGeometry(20, 200);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });

    const road1 = new THREE.Mesh(roadGeometry, roadMaterial);
    road1.rotation.x = -Math.PI / 2;
    road1.position.y = 0.01; // Slightly above ground
    road1.receiveShadow = true;
    scene.add(road1);
    objects.push(road1);

    const road2 = new THREE.Mesh(roadGeometry, roadMaterial);
    road2.rotation.x = -Math.PI / 2;
    road2.rotation.z = Math.PI / 2;
    road2.position.y = 0.01;
    road2.receiveShadow = true;
    scene.add(road2);
    objects.push(road2);

    // Buildings
    const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
    const buildingMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

    function createBuilding(x, z, width, depth, height) {
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, height / 2, z);
        building.scale.set(width, height, depth);
        building.castShadow = true;
        building.receiveShadow = true;
        scene.add(building);
        objects.push(building);
    }

    // City Block 1
    createBuilding(-20, -20, 15, 15, 20);
    createBuilding(-40, -20, 10, 15, 15);
    createBuilding(-20, -40, 15, 10, 25);

    // City Block 2
    createBuilding(20, -20, 15, 15, 30);
    createBuilding(40, -20, 10, 15, 10);
    createBuilding(20, -40, 15, 10, 15);

    // City Block 3
    createBuilding(-20, 20, 15, 15, 10);
    createBuilding(-40, 20, 10, 15, 20);
    createBuilding(-20, 40, 15, 10, 15);

    // City Block 4
    createBuilding(20, 20, 15, 15, 25);
    createBuilding(40, 20, 10, 15, 35);
    createBuilding(20, 40, 15, 10, 10);

    // Trees (Simple Cones)
    const treeGeo = new THREE.ConeGeometry(1, 4, 8);
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x2e7d32 });
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.2, 1);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5d4037 });

    function createTree(x, z) {
        const group = new THREE.Group();

        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.5;
        trunk.castShadow = true;
        group.add(trunk);

        const leaves = new THREE.Mesh(treeGeo, treeMat);
        leaves.position.y = 2.5;
        leaves.castShadow = true;
        group.add(leaves);

        group.position.set(x, 0, z);
        scene.add(group);
        objects.push(group);
    }

    // Add trees along roads
    for (let i = -90; i <= 90; i += 15) {
        if (Math.abs(i) > 15) { // Don't block intersection
            createTree(12, i);
            createTree(-12, i);
            createTree(i, 12);
            createTree(i, -12);
        }
    }

    return objects;
}
