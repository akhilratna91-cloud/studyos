"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeDModelProps {
  primaryColor?: string;
  secondaryColor?: string;
}

export function ThreeDModel({
  primaryColor = "#ec4899", // Default Pink & Green Blend
  secondaryColor = "#10b981",
}: ThreeDModelProps) {
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
    camera.position.z = 8.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Main Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const cPrimary = new THREE.Color(primaryColor);
    const cSecondary = new THREE.Color(secondaryColor);

    // 1. Inner Core Sphere (Hologram Wireframe using Primary Color)
    const sphereGeometry = new THREE.SphereGeometry(2.1, 36, 36);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: cPrimary,
      wireframe: true,
      transparent: true,
      opacity: 0.28,
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    mainGroup.add(sphereMesh);

    // 2. Glowing Inner Points (Secondary Color)
    const spherePointsMaterial = new THREE.PointsMaterial({
      color: cSecondary,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
    });
    const spherePoints = new THREE.Points(sphereGeometry, spherePointsMaterial);
    mainGroup.add(spherePoints);

    // 3. Orbiting Particles (Primary & Secondary Blend Cloud)
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const speeds: number[] = [];
    const radii: number[] = [];
    const angles: number[] = [];
    const inclinationY: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.5 + Math.random() * 2.2;
      radii.push(radius);

      speeds.push((0.004 + Math.random() * 0.008) * (Math.random() > 0.5 ? 1 : -1));
      angles.push(Math.random() * Math.PI * 2);
      inclinationY.push((Math.random() - 0.5) * 0.8);

      const x = radius * Math.cos(angles[i]);
      const y = radius * Math.sin(angles[i]) * Math.sin(inclinationY[i]);
      const z = radius * Math.sin(angles[i]) * Math.cos(inclinationY[i]);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const mixedColor = new THREE.Color();
      const rand = Math.random();
      if (rand < 0.5) {
        mixedColor.copy(cPrimary);
      } else {
        mixedColor.copy(cSecondary);
      }

      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.075,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(particles);

    // 4. Dual Orbiting Rings
    const ring1Geometry = new THREE.RingGeometry(3.1, 3.13, 64);
    const ring1Material = new THREE.MeshBasicMaterial({
      color: cSecondary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geometry, ring1Material);
    ring1Mesh.rotation.x = Math.PI / 3;
    mainGroup.add(ring1Mesh);

    const ring2Geometry = new THREE.RingGeometry(2.8, 2.83, 64);
    const ring2Material = new THREE.MeshBasicMaterial({
      color: cPrimary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2Mesh.rotation.y = Math.PI / 4;
    mainGroup.add(ring2Mesh);

    // Mouse movement interactive 3D tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left - width / 2;
      const y = event.clientY - rect.top - height / 2;
      mouseX = (x / (width / 2)) * 0.6;
      mouseY = (y / (height / 2)) * 0.6;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation Loop (Adaptive 60Hz to 120Hz refresh rate delta engine)
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const fpsFactor = delta * 60; // Standardized multiplier for 60Hz to 120Hz

      sphereMesh.rotation.y += 0.0025 * fpsFactor;
      spherePoints.rotation.y += 0.0025 * fpsFactor;
      ring1Mesh.rotation.z += 0.003 * fpsFactor;
      ring2Mesh.rotation.z -= 0.002 * fpsFactor;

      const positionsArr = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        angles[i] += speeds[i] * fpsFactor;
        positionsArr[i * 3] = radii[i] * Math.cos(angles[i]);
        positionsArr[i * 3 + 1] = radii[i] * Math.sin(angles[i]) * Math.sin(inclinationY[i]);
        positionsArr[i * 3 + 2] = radii[i] * Math.sin(angles[i]) * Math.cos(inclinationY[i]);
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Mouse interactive tilt smoothing (60-120Hz lerp)
      targetX += (mouseX - targetX) * 0.05 * fpsFactor;
      targetY += (mouseY - targetY) * 0.05 * fpsFactor;
      mainGroup.rotation.y = targetX;
      mainGroup.rotation.x = -targetY;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      spherePointsMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      ring1Geometry.dispose();
      ring1Material.dispose();
      ring2Geometry.dispose();
      ring2Material.dispose();
      renderer.dispose();
    };
  }, [primaryColor, secondaryColor]);

  return (
    <div className="relative flex h-full min-h-[260px] w-full items-center justify-center">
      <div ref={mountRef} className="h-64 w-64 sm:h-72 sm:w-72" />
    </div>
  );
}
