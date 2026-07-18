'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function GenomeHelix() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x06111f, 12, 32);

    const camera = new THREE.PerspectiveCamera(40, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x7dd3fc, 1.5);
    const directional = new THREE.DirectionalLight(0xffffff, 2.2);
    directional.position.set(6, 10, 12);
    scene.add(ambient, directional);

    const group = new THREE.Group();
    scene.add(group);

    const curvePoints: THREE.Vector3[] = [];
    const helixMaterial = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0c4a6e, roughness: 0.2, metalness: 0.15 });
    const partnerMaterial = new THREE.MeshStandardMaterial({ color: 0x34d399, emissive: 0x064e3b, roughness: 0.28, metalness: 0.18 });

    for (let index = 0; index <= 160; index += 1) {
      const progress = index / 160;
      const angle = progress * Math.PI * 12;
      const y = (progress - 0.5) * 11;
      const radius = 2.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      curvePoints.push(new THREE.Vector3(x, y, z));

      const pair = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 18), index % 2 === 0 ? helixMaterial : partnerMaterial);
      pair.position.set(x, y, z);
      group.add(pair);

      const opposite = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), index % 2 === 0 ? partnerMaterial : helixMaterial);
      opposite.position.set(-x, y, -z);
      group.add(opposite);
    }

    const backbone = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curvePoints), 260, 0.05, 14, false), new THREE.MeshStandardMaterial({ color: 0xa5f3fc, emissive: 0x164e63, transparent: true, opacity: 0.45 }));
    group.add(backbone);

    const pulse = new THREE.PointLight(0x22d3ee, 1.8, 35);
    pulse.position.set(0, 0, 8);
    scene.add(pulse);

    let frame = 0;
    const animate = () => {
      frame += 0.0035;
      group.rotation.y = frame * 1.25;
      group.rotation.x = Math.sin(frame * 0.8) * 0.12;
      pulse.position.x = Math.sin(frame * 2.1) * 5;
      pulse.position.z = Math.cos(frame * 1.7) * 7;
      renderer.render(scene, camera);
      requestId = window.requestAnimationFrame(animate);
    };

    let requestId = window.requestAnimationFrame(animate);

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.cancelAnimationFrame(requestId);
      window.removeEventListener('resize', handleResize);
      mount.removeChild(renderer.domElement);
      backbone.geometry.dispose();
      group.clear();
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="h-full min-h-[280px] w-full overflow-hidden rounded-[26px] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_55%),linear-gradient(180deg,rgba(6,11,22,0.7),rgba(9,14,28,0.95))]" />;
}
