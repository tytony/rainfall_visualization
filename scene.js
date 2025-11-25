import * as THREE from 'three';

export function createScene(scene) {
    const objects = [];
    const waterMeshes = {};

    // Ground (Grass)
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 1.0 }); // Grass Green
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    objects.push(ground);

    // River Channel (Visual only, simple depression simulation by placing water lower)
    // We'll make a "river bed" by just having a gap or a lower plane if we were doing terrain,
    // but for simplicity, we'll place a blue plane that rises.
    // Let's make a river running parallel to one road, say at x = -60

    const riverBedGeo = new THREE.PlaneGeometry(20, 200);
    const riverBedMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 }); // Dark dirt
    const riverBed = new THREE.Mesh(riverBedGeo, riverBedMat);
    riverBed.rotation.x = -Math.PI / 2;
    riverBed.position.set(-60, 0.01, 0); // Slightly above ground to avoid z-fighting if we didn't cut a hole
    scene.add(riverBed);
    // Note: In a real engine we'd cut the terrain, here we just paint over it or assume it's lower.
    // To make it look like a river, we need the water to be "in" it.

    // River Water
    const riverGeo = new THREE.PlaneGeometry(18, 200);
    const riverMat = new THREE.MeshStandardMaterial({
        color: 0x2196f3,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
        metalness: 0.8
    });
    const riverWater = new THREE.Mesh(riverGeo, riverMat);
    riverWater.rotation.x = -Math.PI / 2;
    riverWater.position.set(-60, 0.2, 0); // Initial low level
    scene.add(riverWater);
    waterMeshes.river = riverWater;

    // Flood Water (Global)
    const floodGeo = new THREE.PlaneGeometry(200, 200);
    const floodMat = new THREE.MeshStandardMaterial({
        color: 0x5d4037, // Muddy flood water
        transparent: true,
        opacity: 0.0, // Invisible initially
        roughness: 0.2,
        metalness: 0.5
    });
    const floodWater = new THREE.Mesh(floodGeo, floodMat);
    floodWater.rotation.x = -Math.PI / 2;
    floodWater.position.y = 0.05; // Just above ground
    scene.add(floodWater);
    waterMeshes.flood = floodWater;

    // Roads
    const roadGeometry = new THREE.PlaneGeometry(20, 200);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });

    const road1 = new THREE.Mesh(roadGeometry, roadMaterial);
    road1.rotation.x = -Math.PI / 2;
    road1.position.y = 0.02; // Above ground/flood initially
    road1.receiveShadow = true;
    scene.add(road1);
    objects.push(road1);

    const road2 = new THREE.Mesh(roadGeometry, roadMaterial);
    road2.rotation.x = -Math.PI / 2;
    road2.rotation.z = Math.PI / 2;
    road2.position.y = 0.02;
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

    return { objects, waterMeshes };
}
