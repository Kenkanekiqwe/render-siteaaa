(() => {
  const canvas = document.getElementById('scene');
  if (!canvas || !window.THREE) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7.5);

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const world = new THREE.Group();
  scene.add(world);

  // A soft, glass-like sculpture rather than a generic sphere.
  const material = new THREE.MeshPhysicalMaterial({
    color:0x9d96ff, metalness:.55, roughness:.12, transmission:.18,
    thickness:1.8, clearcoat:1, clearcoatRoughness:.08,
    emissive:0x241e55, emissiveIntensity:.55
  });
  const sculpture = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35,5), material);
  world.add(sculpture);

  const inner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05,3),
    new THREE.MeshBasicMaterial({color:0xd9d5ff,wireframe:true,transparent:true,opacity:.2})
  );
  world.add(inner);

  const rings = [];
  [1.8,2.15,2.55].forEach((radius,index)=>{
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, index === 1 ? .009 : .014, 8, 180),
      new THREE.MeshBasicMaterial({color:[0xaaa2ff,0x6259c5,0xdad6ff][index],transparent:true,opacity:.25-index*.05})
    );
    ring.rotation.set(.8+index*.37,.25+index*.5,index*.8);
    ring.userData.speed=(index===1?-1:1)*(.00045+index*.00013);
    rings.push(ring); world.add(ring);
  });

  const count = innerWidth < 700 ? 420 : 760;
  const positions = new Float32Array(count*3);
  const sizes = new Float32Array(count);
  for(let i=0;i<count;i++){
    const radius=3.7+Math.random()*5.5;
    const theta=Math.random()*Math.PI*2;
    const phi=Math.acos(2*Math.random()-1);
    positions[i*3]=radius*Math.sin(phi)*Math.cos(theta);
    positions[i*3+1]=radius*Math.cos(phi);
    positions[i*3+2]=radius*Math.sin(phi)*Math.sin(theta);
    sizes[i]=.012+Math.random()*.028;
  }
  const particleGeometry=new THREE.BufferGeometry();
  particleGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  particleGeometry.setAttribute('size',new THREE.BufferAttribute(sizes,1));
  const particles=new THREE.Points(particleGeometry,new THREE.PointsMaterial({color:0xc7c2ff,size:.018,transparent:true,opacity:.46,depthWrite:false}));
  scene.add(particles);

  scene.add(new THREE.AmbientLight(0x55506f,1.4));
  const key=new THREE.PointLight(0xdedaff,32,16); key.position.set(3,3,4); scene.add(key);
  const fill=new THREE.PointLight(0x6659ff,25,14); fill.position.set(-4,-2,2); scene.add(fill);

  let targetX=0,targetY=0,mouseX=0,mouseY=0;
  addEventListener('pointermove',e=>{
    targetX=(e.clientX/innerWidth-.5)*1.1;
    targetY=(e.clientY/innerHeight-.5)*.75;
  },{passive:true});

  function resize(){
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    renderer.setSize(innerWidth,innerHeight);
  }
  addEventListener('resize',resize);

  let time=0;
  function animate(){
    requestAnimationFrame(animate);
    time+=.008;
    mouseX+=(targetX-mouseX)*.025;
    mouseY+=(targetY-mouseY)*.025;

    sculpture.rotation.x=time*.12+mouseY*.18;
    sculpture.rotation.y=time*.18+mouseX*.22;
    sculpture.rotation.z=Math.sin(time*.35)*.08;
    inner.rotation.x=-time*.08;
    inner.rotation.y=-time*.14;
    world.position.x+=(mouseX*.28-world.position.x)*.035;
    world.position.y+=(-mouseY*.2-world.position.y)*.035;
    world.rotation.z+=((mouseX*.025)-world.rotation.z)*.02;
    particles.rotation.y+=.00018;
    particles.rotation.x=Math.sin(time*.2)*.035;
    rings.forEach(r=>r.rotation.z+=r.userData.speed);
    camera.position.x+=(mouseX*.22-camera.position.x)*.018;
    camera.position.y+=(-mouseY*.15-camera.position.y)*.018;
    camera.lookAt(0,0,0);
    renderer.render(scene,camera);
  }
  animate();
})();
