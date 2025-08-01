import * as THREE from 'three';

// Variáveis Globais
let scene, camera, renderer, particles;
let container = document.getElementById('three-particles-container');

// Interatividade do mouse
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
const tempParticle = new THREE.Vector3();

// Armazena velocidade de cada partícula
const particleData = [];

// Tamanho do volume onde partículas são geradas
const particleSpawnRangeX = 60;
const particleSpawnRangeY = 60;
const particleSpawnRangeZ = 60;

// Câmera com animação sutil
let cameraAmplitudeX = 0.6;
let cameraAmplitudeY = 0.4;
let cameraFrequencyX = 0.00004;
let cameraFrequencyY = 0.00002;

// Inicializa a cena
function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 25;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // --- Criação das partículas ---
    const particleCount = 300;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        // Posição aleatória
        positions[i] = (Math.random() - 0.5) * particleSpawnRangeX;
        positions[i + 1] = (Math.random() - 0.5) * particleSpawnRangeY;
        positions[i + 2] = (Math.random() - 0.5) * particleSpawnRangeZ;

        // Cor visível em fundo claro (azul acinzentado)
        colors[i] = 0.302;
        colors[i + 1] = 0.400;
        colors[i + 2] = 0.600;

        // Velocidade inicial
        particleData.push({
            vx: (Math.random() * 0.008 - 0.004) * 0.5,
            vy: (Math.random() * 0.008 - 0.004) * 0.5,
            vz: (Math.random() * 0.008 - 0.004) * 0.5,
        });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particlesGeometry.attributes.color.needsUpdate = true;

    const particlesMaterial = new THREE.PointsMaterial({
        vertexColors: true,
        size: 0.2,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.NormalBlending,
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Eventos
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('resize', onWindowResize, false);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);

    const positions = particles.geometry.attributes.position.array;
    const halfSpawnRangeX = particleSpawnRangeX / 2;
    const halfSpawnRangeY = particleSpawnRangeY / 2;
    const halfSpawnRangeZ = particleSpawnRangeZ / 2;

    // Animação da câmera
    camera.position.x = Math.sin(Date.now() * cameraFrequencyX) * cameraAmplitudeX;
    camera.position.y = Math.cos(Date.now() * cameraFrequencyY) * cameraAmplitudeY;

    // Atualização da posição das partículas
    for (let i = 0; i < positions.length; i += 3) {
        const pIndex = i / 3;

        positions[i] += particleData[pIndex].vx;
        positions[i + 1] += particleData[pIndex].vy;
        positions[i + 2] += particleData[pIndex].vz;

        particleData[pIndex].vx *= 0.99;
        particleData[pIndex].vy *= 0.99;
        particleData[pIndex].vz *= 0.99;

        // Reciclagem
        if (positions[i] > halfSpawnRangeX) positions[i] = -halfSpawnRangeX;
        else if (positions[i] < -halfSpawnRangeX) positions[i] = halfSpawnRangeX;

        if (positions[i + 1] > halfSpawnRangeY) positions[i + 1] = -halfSpawnRangeY;
        else if (positions[i + 1] < -halfSpawnRangeY) positions[i + 1] = halfSpawnRangeY;

        if (positions[i + 2] > halfSpawnRangeZ) positions[i + 2] = -halfSpawnRangeZ;
        else if (positions[i + 2] < -halfSpawnRangeZ) positions[i + 2] = halfSpawnRangeZ;
    }

    // Efeito de repulsão do mouse
    const repulseRadius = 7;
    const repulseStrength = 0.05;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(particles);

    if (intersects.length > 0) {
        const intersectPoint = intersects[0].point;

        for (let i = 0; i < positions.length; i += 3) {
            const pIndex = i / 3;
            tempParticle.set(positions[i], positions[i + 1], positions[i + 2]);
            const distance = tempParticle.distanceTo(intersectPoint);

            if (distance < repulseRadius) {
                const direction = new THREE.Vector3().subVectors(tempParticle, intersectPoint).normalize();
                const force = (1 - distance / repulseRadius) * repulseStrength;

                particleData[pIndex].vx += direction.x * force;
                particleData[pIndex].vy += direction.y * force;
                particleData[pIndex].vz += direction.z * force;
            }
        }
    }

    particles.geometry.attributes.position.needsUpdate = true;

    // Rotação sutil
    particles.rotation.y += 0.00005;
    particles.rotation.x += 0.00002;

    renderer.render(scene, camera);
}

// Inicia
init();
animate();
