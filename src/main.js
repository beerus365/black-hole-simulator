import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  physicsConfig,
  calculateGravitationalForce,
  updateVelocityVector,
} from "./physics.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  alpha: true,
});
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

renderer.render(scene, camera);

const blackHoleGeometry = new THREE.SphereGeometry(4, 32, 32);
const blackHoleMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500, wireframe: true });
const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
blackHole.position.set(0, 0, 0);
scene.add(blackHole);

const physics = physicsConfig();
physics.G = 5;
physics.M = 2000;
physics.timeStep = 0.02;

const stars = [];

const addStar = () => {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const starMesh = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  starMesh.position.set(x, y, z);
  scene.add(starMesh);

  const radius = starMesh.position.length();
  const speed = Math.sqrt((physics.G * physics.M) / Math.max(radius, 1));
  const velocity = new THREE.Vector3(-y, x, 0).normalize().multiplyScalar(speed * 0.4);
  const mass = 1 + Math.random() * 2;

  stars.push({ mesh: starMesh, velocity, mass });
};

Array(200).fill().forEach(addStar);

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

const controls = new OrbitControls(camera, renderer.domElement); 

function animate() {
  requestAnimationFrame(animate);

  stars.forEach((star) => {
    const distance = star.mesh.position.distanceTo(blackHole.position);
    physics.r = distance;
    physics.m = star.mass;
    physics.F = calculateGravitationalForce(physics);

    const direction = blackHole.position.clone().sub(star.mesh.position).normalize();
    star.velocity = updateVelocityVector(physics, star.velocity, direction);
    star.mesh.position.add(star.velocity.clone().multiplyScalar(physics.timeStep));
  });

  controls.update();

  renderer.render(scene, camera);
}

animate();

const sliders = [
  { id: "G-slider",  valId: "G-val",  key: "G",        decimals: 1 },
  { id: "M-slider",  valId: "M-val",  key: "M",        decimals: 0 },
  { id: "ts-slider", valId: "ts-val", key: "timeStep",  decimals: 3 },
];

sliders.forEach(({ id, valId, key, decimals }) => {
  const slider = document.getElementById(id);
  const display = document.getElementById(valId);

  slider.addEventListener("input", () => {
    const val = parseFloat(slider.value);
    physics[key] = val;
    display.textContent = val.toFixed(decimals);

    if (key === "G" || key === "M") {
      stars.forEach((star) => {
        const radius = star.mesh.position.length();
        const speed = Math.sqrt((physics.G * physics.M) / Math.max(radius, 1));
        const { x, y } = star.mesh.position;
        star.velocity = new THREE.Vector3(-y, x, 0)
          .normalize()
          .multiplyScalar(speed * 0.4);
      });
    }
  });
});
