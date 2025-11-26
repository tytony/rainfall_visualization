import * as THREE from 'three';

export function createScene(scene) {
    const objects = [];
    const waterMeshes = {};

    // Ground (Split into two parts for the river)
    // River is at x = -60, width 20. Gap from -70 to -50.

    // Left Ground
    const groundLeftGeo = new THREE.PlaneGeometry(30, 200);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x4caf50, roughness: 1.0 });
    const groundLeft = new THREE.Mesh(groundLeftGeo, groundMat);
    groundLeft.rotation.x = -Math.PI / 2;
    groundLeft.position.set(-85, 0, 0);
    groundLeft.receiveShadow = true;
    scene.add(groundLeft);
    objects.push(groundLeft);

    // Right Ground
    const groundRightGeo = new THREE.PlaneGeometry(150, 200);
    const groundRight = new THREE.Mesh(groundRightGeo, groundMat);
    groundRight.rotation.x = -Math.PI / 2;
    groundRight.position.set(25, 0, 0);
    groundRight.receiveShadow = true;
    scene.add(groundRight);
    objects.push(groundRight);

    // River Channel Walls (Visual)
    const wallGeo = new THREE.PlaneGeometry(200, 4); // Depth 4
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 });

    const leftWall = new THREE.Mesh(wallGeo, wallMat);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-70, -2, 0);
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(wallGeo, wallMat);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(-50, -2, 0);
    scene.add(rightWall);

    // River Channel (Visual only, simple depression simulation by placing water lower)
    // We'll make a "river bed" by just having a gap or a lower plane if we were doing terrain,
    // but for simplicity, we'll place a blue plane that rises.
    // Let's make a river running parallel to one road, say at x = -60

    // River Bed
    const riverBedGeo = new THREE.PlaneGeometry(20, 200);
    const riverBedMat = new THREE.MeshStandardMaterial({ color: 0x3e2723 });
    const riverBed = new THREE.Mesh(riverBedGeo, riverBedMat);
    riverBed.rotation.x = -Math.PI / 2;
    riverBed.position.set(-60, -4, 0); // Deep river bed
    scene.add(riverBed);

    // River Water
    const riverGeo = new THREE.PlaneGeometry(20, 200);
    const riverMat = new THREE.MeshStandardMaterial({
        color: 0x2196f3,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
        metalness: 0.8,
        side: THREE.DoubleSide // Fix visibility from all angles
    });
    const riverWater = new THREE.Mesh(riverGeo, riverMat);
    riverWater.rotation.x = -Math.PI / 2;
    riverWater.position.set(-60, -3.5, 0); // Lower initial water level
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

    // Roads & Sidewalks
    // Road Width: 14 (2 lanes), Sidewalk Width: 3 each. Total 20.
    const roadWidth = 14;
    const sidewalkWidth = 3;
    const totalWidth = roadWidth + 2 * sidewalkWidth;

    const roadGeo = new THREE.PlaneGeometry(roadWidth, 200);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6 });

    const sidewalkGeo = new THREE.PlaneGeometry(sidewalkWidth, 200);
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0x9e9e9e, roughness: 0.9 });

    const lineGeo = new THREE.PlaneGeometry(0.5, 200);
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

    function createRoad(x, z, rotationY) {
        const group = new THREE.Group();
        group.position.set(x, 0.02, z);
        group.rotation.y = rotationY;

        // Asphalt
        const road = new THREE.Mesh(roadGeo, roadMat);
        road.rotation.x = -Math.PI / 2;
        road.receiveShadow = true;
        group.add(road);
        objects.push(road);

        // Sidewalks - split into segments to avoid intersection
        // Intersection zone is approximately -10 to +10 in local coordinates
        const intersectionHalfSize = 10;

        // Create sidewalk segments before and after intersection
        const segmentGeo1 = new THREE.PlaneGeometry(sidewalkWidth, 90); // -100 to -10
        const segmentGeo2 = new THREE.PlaneGeometry(sidewalkWidth, 90); // +10 to +100

        // Left sidewalk - before intersection
        const sw1a = new THREE.Mesh(segmentGeo1, sidewalkMat);
        sw1a.rotation.x = -Math.PI / 2;
        sw1a.position.x = -roadWidth / 2 - sidewalkWidth / 2;
        sw1a.position.z = -55; // Center at -55 (from -100 to -10)
        sw1a.receiveShadow = true;
        group.add(sw1a);

        // Left sidewalk - after intersection
        const sw1b = new THREE.Mesh(segmentGeo2, sidewalkMat);
        sw1b.rotation.x = -Math.PI / 2;
        sw1b.position.x = -roadWidth / 2 - sidewalkWidth / 2;
        sw1b.position.z = 55; // Center at 55 (from +10 to +100)
        sw1b.receiveShadow = true;
        group.add(sw1b);

        // Right sidewalk - before intersection
        const sw2a = new THREE.Mesh(segmentGeo1, sidewalkMat);
        sw2a.rotation.x = -Math.PI / 2;
        sw2a.position.x = roadWidth / 2 + sidewalkWidth / 2;
        sw2a.position.z = -55;
        sw2a.receiveShadow = true;
        group.add(sw2a);

        // Right sidewalk - after intersection
        const sw2b = new THREE.Mesh(segmentGeo2, sidewalkMat);
        sw2b.rotation.x = -Math.PI / 2;
        sw2b.position.x = roadWidth / 2 + sidewalkWidth / 2;
        sw2b.position.z = 55;
        sw2b.receiveShadow = true;
        group.add(sw2b);

        // Center Line
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.y = 0.01;
        group.add(line);

        scene.add(group);
    }

    // Road 1 (Z-axis)
    createRoad(0, 0, 0);

    // Road 2 (X-axis) - Crosses River at x = -60
    createRoad(0, 0, Math.PI / 2);

    // Bridge Structure at River Crossing (x = -60)
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(-60, 0, 0);
    scene.add(bridgeGroup);

    // Pillars
    const pillarGeo = new THREE.BoxGeometry(2, 6, 2); // Height 6 to reach from 0 to -6 (river bed is -4)
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x757575 });

    const p1 = new THREE.Mesh(pillarGeo, pillarMat);
    p1.position.set(-8, -3, 5); // Left bank side, z=5
    bridgeGroup.add(p1);

    const p2 = new THREE.Mesh(pillarGeo, pillarMat);
    p2.position.set(-8, -3, -5); // Left bank side, z=-5
    bridgeGroup.add(p2);

    const p3 = new THREE.Mesh(pillarGeo, pillarMat);
    p3.position.set(8, -3, 5); // Right bank side
    bridgeGroup.add(p3);

    const p4 = new THREE.Mesh(pillarGeo, pillarMat);
    p4.position.set(8, -3, -5);
    bridgeGroup.add(p4);

    // Railings (Visuals along the bridge section)
    // Bridge section is approx from x=-70 to x=-50 (width 20)
    const railGeo = new THREE.BoxGeometry(20, 1.2, 0.5);
    const railMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });

    const r1 = new THREE.Mesh(railGeo, railMat);
    r1.position.set(0, 1, -totalWidth / 2 + 0.25);
    bridgeGroup.add(r1);

    const r2 = new THREE.Mesh(railGeo, railMat);
    r2.position.set(0, 1, totalWidth / 2 - 0.25);
    bridgeGroup.add(r2);
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
            // Don't place trees on the river (x from -70 to -50)
            if (i < -70 || i > -50) {
                createTree(i, 12);
                createTree(i, -12);
            }
            createTree(12, i);
            createTree(-12, i);
        }
    }

    // Street Lights
    const streetLights = [];
    const lampPostGeo = new THREE.CylinderGeometry(0.1, 0.1, 5);
    const lampPostMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const lampArmGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5);
    const lampHeadGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const lampHeadMat = new THREE.MeshStandardMaterial({
        color: 0xffff99,
        emissive: 0xffff99,
        emissiveIntensity: 0 // Initially off
    });

    function createStreetLight(x, z) {
        const group = new THREE.Group();

        // Post
        const post = new THREE.Mesh(lampPostGeo, lampPostMat);
        post.position.y = 2.5;
        post.castShadow = true;
        group.add(post);

        // Arm (horizontal)
        const arm = new THREE.Mesh(lampArmGeo, lampPostMat);
        arm.rotation.z = Math.PI / 2;
        arm.position.set(0.75, 5, 0);
        arm.castShadow = true;
        group.add(arm);

        // Lamp head
        const lampHead = new THREE.Mesh(lampHeadGeo, lampHeadMat.clone());
        lampHead.position.set(1.5, 5, 0);
        group.add(lampHead);

        // Point light (initially off)
        const pointLight = new THREE.PointLight(0xffaa55, 0, 15); // intensity 0 = off
        pointLight.position.set(1.5, 5, 0);
        // Don't cast shadows to avoid exceeding texture unit limits
        group.add(pointLight);

        group.position.set(x, 0, z);
        scene.add(group);

        // Store references for later control
        streetLights.push({
            group: group,
            lampHead: lampHead,
            pointLight: pointLight
        });
    }

    // Place street lights along roads
    for (let i = -90; i <= 90; i += 30) {
        if (Math.abs(i) > 15) { // Skip intersection
            // Along Z-axis road
            createStreetLight(11, i);
            createStreetLight(-11, i);

            // Along X-axis road (skip river area)
            if (i < -70 || i > -50) {
                createStreetLight(i, 11);
                createStreetLight(i, -11);
            }
        }
    }

    return { objects, waterMeshes, streetLights };
}
