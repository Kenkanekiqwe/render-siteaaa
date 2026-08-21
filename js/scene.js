(() => {
  const canvas = document.getElementById('scene');
  if (!canvas || !window.THREE) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.15, 6.8);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const group = new THREE.Group(); scene.add(group);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55,5), new THREE.MeshStandardMaterial({color:0x9c98ff,metalness:.95,roughness:.18,emissive:0x29254f,emissiveIntensity:.45})); group.add(core);
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7,2), new THREE.MeshBasicMaterial({color:0xdad8ff,wireframe:true,transparent:true,opacity:.18})); group.add(shell);
  [2.05,2.35,2.7].forEach((radius,i)=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,i===1?.012:.018,8,180),new THREE.MeshBasicMaterial({color:[0xaaa5ff,0x6f69bb,0xe4e2ff][i],transparent:true,opacity:.25-i*.045}));ring.rotation.set(.8+i*.35,.35+i*.55,i*.7);ring.userData.speed=(i%2?-1:1)*(.00035+i*.00012);group.add(ring)});
  const count=innerWidth<700?550:1000, positions=new Float32Array(count*3);
  for(let i=0;i<count;i++){const r=4+Math.random()*5,a=Math.random()*Math.PI*2;positions[i*3]=Math.cos(a)*r;positions[i*3+1]=Math.sin(a)*r;positions[i*3+2]=(Math.random()-.5)*9}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const particles=new THREE.Points(geo,new THREE.PointsMaterial({color:0xc5c2ff,size:.018,transparent:true,opacity:.5,depthWrite:false}));scene.add(particles);
  scene.add(new THREE.AmbientLight(0x6f6b9f,1.2));const key=new THREE.PointLight(0xdcd9ff,35,14);key.position.set(3,3,4);scene.add(key);const rim=new THREE.PointLight(0x6057ff,28,12);rim.position.set(-4,-2,2);scene.add(rim);
  let targetX=0,targetY=0,mouseX=0,mouseY=0;addEventListener('pointermove',e=>{targetX=(e.clientX/innerWidth-.5)*.8;targetY=(e.clientY/innerHeight-.5)*.55},{passive:true});
  function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setSize(innerWidth,innerHeight)}addEventListener('resize',resize);
  let time=0;function animate(){requestAnimationFrame(animate);time+=.008;mouseX+=(targetX-mouseX)*.035;mouseY+=(targetY-mouseY)*.035;group.rotation.y+=.0018+mouseX*.0008;group.rotation.x+=.00045+mouseY*.0005;core.rotation.y=time*.16;core.rotation.z=time*.08;shell.rotation.y=-time*.09;group.position.x+=(mouseX*.28-group.position.x)*.025;group.position.y+=(-mouseY*.22-group.position.y)*.025;particles.rotation.y+=.00012;particles.rotation.x=Math.sin(time*.22)*.035;group.children.forEach(o=>{if(o.userData.speed)o.rotation.z+=o.userData.speed});renderer.render(scene,camera)}animate();
})();
