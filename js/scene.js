(() => {
  const canvas = document.getElementById('scene');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 140);
  camera.position.set(0, 0, 10);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  scene.add(new THREE.AmbientLight(0x777777, 0.28));
  const sun = new THREE.PointLight(0xffffff, 95, 34);
  sun.position.set(-4, 3, 7);
  scene.add(sun);
  const cool = new THREE.PointLight(0x8585ff, 42, 24);
  cool.position.set(5, -3, 4);
  scene.add(cool);

  // Deep space: several layers move at different speeds to create real depth.
  const starLayers = [];
  const layerConfig = innerWidth < 700
    ? [{ count: 420, size: 0.024, opacity: 0.48, depth: 0.35 }, { count: 260, size: 0.035, opacity: 0.32, depth: 0.8 }]
    : [{ count: 900, size: 0.018, opacity: 0.55, depth: 0.25 }, { count: 550, size: 0.028, opacity: 0.38, depth: 0.65 }, { count: 260, size: 0.042, opacity: 0.28, depth: 1.15 }];

  layerConfig.forEach((cfg, layerIndex) => {
    const positions = new Float32Array(cfg.count * 3);
    for (let i = 0; i < cfg.count; i++) {
      const r = 9 + Math.random() * 48;
      const a = Math.random() * Math.PI * 2;
      const b = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = Math.sin(b) * Math.cos(a) * r;
      positions[i * 3 + 1] = Math.cos(b) * r * 0.72;
      positions[i * 3 + 2] = Math.sin(b) * Math.sin(a) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xf2f2ff, size: cfg.size, transparent: true, opacity: cfg.opacity, depthWrite: false, sizeAttenuation: true });
    const points = new THREE.Points(geo, mat);
    points.userData.depth = cfg.depth;
    points.userData.phase = layerIndex * 1.7;
    scene.add(points);
    starLayers.push(points);
  });

  // A soft distant nebula made from translucent spheres, not a flat image.
  const nebula = new THREE.Group();
  scene.add(nebula);
  const nebulaData = [
    [-5.5, 2.7, -8, 2.8, 0x50508a, 0.025],
    [5.8, -2.2, -10, 3.5, 0x5a3f72, 0.018],
    [0.8, 4.5, -14, 4.2, 0x364d72, 0.014]
  ];
  nebulaData.forEach(([x, y, z, r, color, opacity]) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(r, 32, 32),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.BackSide, depthWrite: false })
    );
    mesh.position.set(x, y, z);
    nebula.add(mesh);
  });

  function planet(radius, position, color, glowColor) {
    const group = new THREE.Group();
    group.position.set(...position);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 48, 48),
      new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.04 })
    );
    group.add(sphere);
    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 1.2, 32, 32),
      new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: 0.045, side: THREE.BackSide, depthWrite: false })
    );
    group.add(aura);
    scene.add(group);
    return group;
  }

  const planets = [
    planet(1.18, [-5.4, 2.25, -3.2], 0x252535, 0x7777bb),
    planet(0.66, [5.25, 1.35, -2.1], 0x343445, 0x8888cc),
    planet(0.38, [-4.45, -2.45, -1.0], 0x45455a, 0x6666aa),
    planet(0.22, [3.9, -2.5, -1.5], 0x626276, 0x9999cc)
  ];

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.48, 1.66, 96),
    new THREE.MeshBasicMaterial({ color: 0xb5b5d5, transparent: true, opacity: 0.09, side: THREE.DoubleSide, depthWrite: false })
  );
  ring.position.set(-5.4, 2.25, -3.2);
  ring.rotation.set(0.85, 0.25, 0.25);
  scene.add(ring);

  // Slow-moving orbital dust around the scene.
  const dustCount = innerWidth < 700 ? 180 : 360;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const radius = 3.5 + Math.random() * 8;
    dustPositions[i * 3] = Math.cos(a) * radius;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    dustPositions[i * 3 + 2] = Math.sin(a) * radius - 2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xb6b6d8, size: 0.025, transparent: true, opacity: 0.18, depthWrite: false }));
  scene.add(dust);

  const pointer = new THREE.Vector2();
  const smooth = new THREE.Vector2();
  addEventListener('pointermove', e => {
    pointer.x = (e.clientX / innerWidth - 0.5) * 1.4;
    pointer.y = (e.clientY / innerHeight - 0.5) * 1.0;
  }, { passive: true });

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setSize(innerWidth, innerHeight);
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.0032;
    smooth.lerp(pointer, 0.025);

    // Continuous camera drift: the whole universe slowly floats even when idle.
    const driftX = Math.sin(t * 0.42) * 0.12;
    const driftY = Math.cos(t * 0.31) * 0.08;
    camera.position.x += (smooth.x * 0.34 + driftX - camera.position.x) * 0.018;
    camera.position.y += (-smooth.y * 0.25 + driftY - camera.position.y) * 0.018;
    camera.position.z = 10 + Math.sin(t * 0.22) * 0.22;
    camera.lookAt(0, 0, 0);

    starLayers.forEach((stars, i) => {
      const depth = stars.userData.depth;
      stars.rotation.y = t * (0.006 + i * 0.003);
      stars.rotation.x = Math.sin(t * 0.17 + stars.userData.phase) * 0.018;
      stars.position.x += (smooth.x * depth * 0.38 + Math.sin(t * 0.25 + i) * 0.05 - stars.position.x) * 0.012;
      stars.position.y += (-smooth.y * depth * 0.24 + Math.cos(t * 0.21 + i) * 0.035 - stars.position.y) * 0.012;
    });

    nebula.rotation.y = t * 0.004;
    nebula.position.x = smooth.x * 0.12;
    nebula.position.y = -smooth.y * 0.08;

    planets.forEach((p, i) => {
      p.rotation.y += 0.00028 + i * 0.00007;
      p.rotation.x += 0.00006;
      p.position.x += Math.sin(t * (0.15 + i * 0.025) + i) * 0.00045;
      p.position.y += Math.cos(t * (0.12 + i * 0.018) + i) * 0.00035;
    });

    ring.rotation.z += 0.0002;
    dust.rotation.y = t * 0.018;
    dust.rotation.x = Math.sin(t * 0.13) * 0.035;
    dust.position.x = smooth.x * 0.3;
    dust.position.y = -smooth.y * 0.18;

    sun.position.x = -4 + smooth.x * 2.2;
    sun.position.y = 3 - smooth.y * 1.4;
    cool.position.x = 5 - smooth.x * 1.4;

    renderer.render(scene, camera);
  }
  animate();
})();
