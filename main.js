import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createScene } from './scene.js';
import { WeatherSystem } from './weather.js';
import { EntityManager } from './entities.js';

// Initialize core components
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Initial sky color
scene.fog = new THREE.FogExp2(0x87CEEB, 0.002);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(50, 100, 50);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 50;
dirLight.shadow.camera.bottom = -50;
dirLight.shadow.camera.left = -50;
dirLight.shadow.camera.right = 50;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

// Modules
const sceneObjects = createScene(scene);
const weatherSystem = new WeatherSystem(scene);
const entityManager = new EntityManager(scene);

// UI Logic
const slider = document.getElementById('intensity-slider');
const valueDisplay = document.getElementById('intensity-value');
const titleDisplay = document.getElementById('intensity-title');
const descDisplay = document.getElementById('intensity-desc');

const intensityData = [
    { max: 0.1, title: "Summer Mist (< 0.1 mm)", desc: "Small like a cooling mist in a summer amusement park." },
    { max: 0.2, title: "Drizzle (< 0.2 mm)", desc: "Bearable drizzle, no umbrella needed." },
    { max: 1, title: "Light Rain (0.2 ~ 1 mm)", desc: "Need an umbrella." },
    { max: 10, title: "Moderate Rain (1 ~ 10 mm)", desc: "Puddles start forming on the ground." },
    { max: 20, title: "Heavy Rain (10 ~ 20 mm)", desc: "Rain sound is obvious, hard to hear speaking. Feet get wet even with an umbrella." },
    { max: 30, title: "Pouring Rain (20 ~ 30 mm)", desc: "Visibility poor even with fast wipers. Body gets wet with umbrella. Low areas start to flood." },
    { max: 50, title: "Intense Rain (30 ~ 50 mm)", desc: "Like pouring a bucket. Obvious large-scale water accumulation on roads." },
    { max: 80, title: "Torrential Rain (50 ~ 80 mm)", desc: "Like a waterfall. Umbrella useless. Driving visibility very poor. Exceeds city drainage capacity." },
    { max: 999, title: "Extreme Rain (> 80 mm)", desc: "Oppressive and suffocating. Sky feels like it's falling. High risk of flooding and landslides." }
];

function updateUI(intensity) {
    valueDisplay.textContent = `${intensity} mm`;
    
    const data = intensityData.find(d => intensity <= d.max) || intensityData[intensityData.length - 1];
    titleDisplay.textContent = data.title;
    descDisplay.textContent = data.desc;

    weatherSystem.setIntensity(intensity);
}

slider.addEventListener('input', (e) => {
    updateUI(parseFloat(e.target.value));
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    controls.update();
    weatherSystem.update(delta);
    entityManager.update(delta);
    
    renderer.render(scene, camera);
}

// Initial call
updateUI(0);
animate();

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
