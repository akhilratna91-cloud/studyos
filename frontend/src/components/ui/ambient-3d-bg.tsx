"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export function Ambient3DBackground() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Create 3D Particle Constellation (Emerald & Purple)
    const count = 90;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    const color1 = new THREE.Color(0x10b981); // Emerald
    const color2 = new THREE.Color(0xa855f7); // Purple
    const color3 = new THREE.Color(0x00ff9d); // Glow Green

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

      velocities.push({
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.01,
      });

      const mixed = new THREE.Color();
      const r = Math.random();
      if (r < 0.4) mixed.copy(color1);
      else if (r < 0.8) mixed.copy(color2);
      else mixed.copy(color3);

      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animation Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const posArr = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        posArr[i * 3] += velocities[i].x;
        posArr[i * 3 + 1] += velocities[i].y;
        posArr[i * 3 + 2] += velocities[i].z;

        // Boundary wrapping
        if (Math.abs(posArr[i * 3]) > 18) velocities[i].x *= -1;
        if (Math.abs(posArr[i * 3 + 1]) > 18) velocities[i].y *= -1;
        if (Math.abs(posArr[i * 3 + 2]) > 10) velocities[i].z *= -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen overflow-hidden opacity-80"
    />
  );
}
