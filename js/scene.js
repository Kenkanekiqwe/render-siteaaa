(() => {
  const canvas = document.getElementById('scene');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  scene.add(new THREE.AmbientLight(0x777777, .32));
  const sun = new THREE.PointLight(0xffffff, 75, 28);
  sun.position.set(-3,2,6); scene.add(sun);
  const cool = new THREE.PointLight(0x8d8dff, 35, 18);
  cool.position.set(4,-2,3); scene.add(cool);

  // Deep star field — sparse and cinematic rather than a generic particle cloud.
  const starCount = innerWidth < 700 ? 700 : 1500;
  const starPositions = new Float32Array(starCount * 3);
  for(let i=0;i<starCount;i++){
    const r = 7 + Math.random()*24;
    const a = Math.random()*Math.PI*2;
    const b = Math.acos(2*Math.random()-1);
    starPositions[i*3] = Math.sin(b)*Math.cos(a)*r;
    starPositions[i*3+1] = Math.cos(b)*r*.72;
    starPositions[i*3+2] = Math.sin(b)*Math.sin(a)*r;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position',new THREE.BufferAttribute(starPositions,3));
  const stars = new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xf0f0f0,size:.018,transparent:true,opacity:.48,depthWrite:false}));
  scene.add(stars);

  function planet(radius, position, color, detail=4, glowColor=0x888888){
    const group = new THREE.Group();
    group.position.set(...position);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius,48,48),
      new THREE.MeshStandardMaterial({color,roughness:.82,metalness:.03})
    );
    group.add(sphere);
    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(radius*1.18,32,32),
      new THREE.MeshBasicMaterial({color:glowColor,transparent:true,opacity:.035,side:THREE.BackSide,depthWrite:false})
    );
    group.add(aura);
    scene.add(group);
    return {group,sphere};
  }

  const planets = [
    planet(1.22,[-5.2,2.25,-2.5],0x252525,5,0xbdbdbd),
    planet(.62,[5.1,1.55,-1.4],0x383838,4,0x999999),
    planet(.34,[-4.4,-2.15,-.6],0x4a4a4a,3,0x777777),
    planet(.19,[3.7,-2.35,-.8],0x6a6a6a,3,0xaaaaaa)
  ];

  // Subtle rings around distant planets.
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.55,1.72,96),
    new THREE.MeshBasicMaterial({color:0xaaaaaa,transparent:true,opacity:.08,side:THREE.DoubleSide,depthWrite:false})
  );
  ring.position.set(-5.2,2.25,-2.5); ring.rotation.set(.85,.25,.25); scene.add(ring);

  // Central abstract object: faint enough to preserve the typography-first composition.
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.42,5),
    new THREE.MeshPhysicalMaterial({color:0x242424,metalness:.82,roughness:.2,clearcoat:1,clearcoatRoughness:.15,emissive:0x090909,emissiveIntensity:.55,transparent:true,opacity:.52})
  );
  coreGroup.add(core);
  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.53,3),
    new THREE.MeshBasicMaterial({color:0xd8d8d8,wireframe:true,transparent:true,opacity:.065,depthWrite:false})
  );
  coreGroup.add(wire);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(2.05,48,48),
    new THREE.MeshBasicMaterial({color:0x777777,transparent:true,opacity:.025,side:THREE.BackSide,depthWrite:false})
  );
  coreGroup.add(halo);

  const pointer = new THREE.Vector2(), smooth = new THREE.Vector2();
  addEventListener('pointermove',e=>{pointer.x=(e.clientX/innerWidth-.5)*1.2;pointer.y=(e.clientY/innerHeight-.5)*.8},{passive:true});
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight)});

  let t=0;
  function animate(){
    requestAnimationFrame(animate); t+=.004; smooth.lerp(pointer,.025);
    stars.rotation.y=t*.008;
    stars.position.x += (smooth.x*.25-stars.position.x)*.01;
    stars.position.y += (-smooth.y*.18-stars.position.y)*.01;
    core.rotation.x+=.0009; core.rotation.y+=.0016; wire.rotation.y-=.001;
    coreGroup.position.x+=(smooth.x*.28-coreGroup.position.x)*.025;
    coreGroup.position.y+=(-smooth.y*.18-coreGroup.position.y)*.025;
    planets.forEach((p,i)=>{p.group.rotation.y+=.00035+i*.00008;p.group.rotation.x+=.00008;});
    ring.rotation.z+=.00025;
    camera.position.x+=(smooth.x*.22-camera.position.x)*.016;
    camera.position.y+=(-smooth.y*.16-camera.position.y)*.016;
    camera.lookAt(0,0,0);
    sun.position.x=-3+smooth.x*2; sun.position.y=2-smooth.y;
    renderer.render(scene,camera);
  }
  animate();
})();
