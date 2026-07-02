"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeDModel() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group to hold all objects for rotation/tilting
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Core Sphere (Hologram Wireframe)
    const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1, // primary color (#6366F1)
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    mainGroup.add(sphereMesh);

    // 2. Glowing inner points
    const spherePointsMaterial = new THREE.PointsMaterial({
      color: 0x22d3ee, // cyan accent (#22D3EE)
      size: 0.04,
      transparent: true,
      opacity: 0.8,
    });
    const spherePoints = new THREE.Points(sphereGeometry, spherePointsMaterial);
    mainGroup.add(spherePoints);

    // 3. Orbiting Satellites/Debris Particles (Zajno Space Pollution vibe)
    const particleCount = 120;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const speeds: number[] = [];
    const radii: number[] = [];
    const angles: number[] = [];
    const inclinationY: number[] = [];
    const inclinationZ: number[] = [];

    const cyanColor = new THREE.Color(0x22d3ee);
    const magentaColor = new THREE.Color(0xec4899);
    const indigoColor = new THREE.Color(0x6366f1);

    for (let i = 0; i < particleCount; i++) {
      // Radii between 2.4 (just outside sphere) and 4.2
      const radius = 2.4 + Math.random() * 1.8;
      radii.push(radius);

      // Random speed and angle
      speeds.push((0.005 + Math.random() * 0.01) * (Math.random() > 0.5 ? 1 : -1));
      angles.push(Math.random() * Math.PI * 2);

      // Random orbital inclinations
      inclinationY.push((Math.random() - 0.5) * 0.6);
      inclinationZ.push((Math.random() - 0.5) * 0.6);

      // Calculate starting position
      const x = radius * Math.cos(angles[i]);
      const y = radius * Math.sin(angles[i]) * Math.sin(inclinationY[i]);
      const z = radius * Math.sin(angles[i]) * Math.cos(inclinationY[i]);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color mix (cyan, magenta, indigo)
      const mixedColor = new THREE.Color();
      const rand = Math.random();
      if (rand < 0.33) {
        mixedColor.copy(cyanColor);
      } else if (rand < 0.66) {
        mixedColor.copy(magentaColor);
      } else {
        mixedColor.copy(indigoColor);
      }

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particles);

    // 4. Subtle outer ring
    const ringGeometry = new THREE.RingGeometry(2.3, 2.32, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xec4899, // magenta accent (#EC4899)
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.rotation.x = Math.PI / 2;
    mainGroup.add(ringMesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Mouse movement variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left - width / 2;
      const y = event.clientY - rect.top - height / 2;
      mouseX = (x / (width / 2)) * 0.5;
      mouseY = (y / (height / 2)) * 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate globe
      sphereMesh.rotation.y += 0.002;
      spherePoints.rotation.y += 0.002;
      ringMesh.rotation.z -= 0.001;

      // Animate orbiting particles
      const positionsArr = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        angles[i] += speeds[i];

        positionsArr[i * 3] = radii[i] * Math.cos(angles[i]);
        positionsArr[i * 3 + 1] = radii[i] * Math.sin(angles[i]) * Math.sin(inclinationY[i]);
        positionsArr[i * 3 + 2] = radii[i] * Math.sin(angles[i]) * Math.cos(inclinationY[i]);
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Parallax hover effect (smooth interpolation)
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      mainGroup.rotation.y = targetX;
      mainGroup.rotation.x = targetY;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (container) {
        container.removeChild(renderer.domElement);
      }
      // dispose geometries/materials
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      spherePointsMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="relative flex h-full w-full items-center justify-center min-h-[300px]"
    />
  );
}
