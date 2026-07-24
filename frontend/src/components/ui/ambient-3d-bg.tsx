"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Ambient3DBackgroundProps {
  primaryColor?: string;
  secondaryColor?: string;
}

export function Ambient3DBackground({
  primaryColor = "#10b981",
  secondaryColor = "#a855f7",
}: Ambient3DBackgroundProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create 3D Particle Constellation
    const count = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities: { x: number; y: number; z: number }[] = [];

    const c1 = new THREE.Color(primaryColor);
    const c2 = new THREE.Color(secondaryColor);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;

      velocities.push({
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.01,
      });

      const mixed = new THREE.Color();
      const r = Math.random();
      if (r < 0.5) mixed.copy(c1);
      else mixed.copy(c2);

      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
    });

    const particles = new THREE.Points(geometry, material);
    particlesRef.current = particles;
    scene.add(particles);

    // Animation Loop (Adaptive 60Hz to 120Hz refresh rate delta engine)
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const fpsFactor = delta * 60; // Standardized multiplier for 60Hz to 120Hz

      const posArr = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        posArr[i * 3] += velocities[i].x * fpsFactor;
        posArr[i * 3 + 1] += velocities[i].y * fpsFactor;
        posArr[i * 3 + 2] += velocities[i].z * fpsFactor;

        // Boundary wrapping
        if (Math.abs(posArr[i * 3]) > 18) velocities[i].x *= -1;
        if (Math.abs(posArr[i * 3 + 1]) > 18) velocities[i].y *= -1;
        if (Math.abs(posArr[i * 3 + 2]) > 10) velocities[i].z *= -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.0005 * fpsFactor;

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
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smoothly update particle colors when route theme changes
  useEffect(() => {
    if (!particlesRef.current) return;
    const geometry = particlesRef.current.geometry;
    const colorAttr = geometry.attributes.color as THREE.BufferAttribute;
    const colorsArr = colorAttr.array as Float32Array;
    const count = colorsArr.length / 3;

    const c1 = new THREE.Color(primaryColor);
    const c2 = new THREE.Color(secondaryColor);

    for (let i = 0; i < count; i++) {
      const mixed = new THREE.Color();
      const r = Math.random();
      if (r < 0.5) mixed.copy(c1);
      else mixed.copy(c2);

      colorsArr[i * 3] = mixed.r;
      colorsArr[i * 3 + 1] = mixed.g;
      colorsArr[i * 3 + 2] = mixed.b;
    }
    colorAttr.needsUpdate = true;
  }, [primaryColor, secondaryColor]);

  return <div ref={mountRef} className="pointer-events-none fixed inset-0 z-0" />;
}
