(() => {
  const canvas = document.getElementById('scene');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050509, 0.028);
  const camera = new THREE.PerspectiveCamera(43, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8.4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const world = new THREE.Group();
  scene.add(world);

  scene.add(new THREE.HemisphereLight(0xaaa5ff, 0x050507, 1.25));
  const key = new THREE.PointLight(0x877dff, 38, 15);
  key.position.set(3, 2.5, 4);
  scene.add(key);
  const cyan = new THREE.PointLight(0x5cdcff, 20, 14);
  cyan.position.set(-4, -1.5, 1);
  scene.add(cyan);

  const orb = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.72, 6),
    new THREE.MeshPhysicalMaterial({
      color: 0x7770ad,
      metalness: 0.86,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      transmission: 0.08,
      thickness: 1.4,
      emissive: 0x1b1738,
      emissiveIntensity: 0.75
    })
  );
  world.add(orb);

  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.93, 3),
    new THREE.MeshBasicMaterial({ color: 0xd7d3ff, wireframe: true, transparent: true, opacity: 0.13 })
  );
  world.add(shell);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(2.5, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x7169ff, transparent: true, opacity: 0.035, side: THREE.BackSide })
  );
  world.add(glow);

  const rings = [];
  [2.15, 2.52, 2.9, 3.25].forEach((radius, i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, i === 1 ? 0.008 : 0.012, 8, 240),
      new THREE.MeshBasicMaterial({ color: i % 2 ? 0x65d9ff : 0x958aff, transparent: true, opacity: 0.22 - i * 0.025 })
    );
    ring.rotation.set(0.55 + i * 0.31, 0.25 + i * 0.43, i * 0.7);
    ring.userData.speed = (i % 2 ? -1 : 1) * (0.00045 + i * 0.00012);
    world.add(ring);
    rings.push(ring);
  });

  const count = innerWidth < 700 ? 650 : 1300;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const radius = 4.5 + Math.random() * 10;
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(b) * Math.cos(a);
    positions[i * 3 + 1] = radius * Math.cos(b) * 0.7;
    positions[i * 3 + 2] = radius * Math.sin(b) * Math.sin(a);
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({ color: 0xd5d2ff, size: 0.016, transparent: true, opacity: 0.42, depthWrite: false })
  );
  scene.add(particles);

  const pointer = new THREE.Vector2();
  const smooth = new THREE.Vector2();
  addEventListener('pointermove', e => {
    pointer.x = (e.clientX / innerWidth - 0.5) * 1.15;
    pointer.y = (e.clientY / innerHeight - 0.5) * 0.8;
  }, { passive: true });

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
    renderer.setSize(innerWidth, innerHeight);
  });

  let t = 0;
  function frame() {
    requestAnimationFrame(frame);
    t += 0.006;
    smooth.lerp(pointer, 0.022);

    orb.rotation.x += 0.0011;
    orb.rotation.y += 0.0022;
    orb.rotation.z = Math.sin(t * 0.4) * 0.08 + smooth.x * -0.06;
    shell.rotation.y -= 0.0014;
    shell.rotation.x += 0.0006;
    glow.scale.setScalar(1 + Math.sin(t * 1.7) * 0.035);

    world.rotation.y += 0.0008;
    world.position.x += (smooth.x * 0.34 - world.position.x) * 0.028;
    world.position.y += (-smooth.y * 0.25 - world.position.y) * 0.028;
    world.rotation.z += (smooth.x * 0.018 - world.rotation.z) * 0.018;

    rings.forEach(r => { r.rotation.z += r.userData.speed; r.rotation.x += 0.00035; });
    particles.rotation.y = t * 0.012;
    particles.rotation.x = Math.sin(t * 0.25) * 0.025;

    camera.position.x += (smooth.x * 0.32 - camera.position.x) * 0.018;
    camera.position.y += (-smooth.y * 0.2 - camera.position.y) * 0.018;
    camera.lookAt(0, 0, 0);

    key.position.x = 3 + smooth.x * 2;
    key.position.y = 2.5 - smooth.y * 1.5;
    renderer.render(scene, camera);
  }
  frame();
})();
