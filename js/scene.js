(() => {
  const canvas=document.getElementById('scene');
  if(!canvas||!window.THREE)return;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,100);
  camera.position.set(0,0,8);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;
  const world=new THREE.Group();scene.add(world);
  const material=new THREE.MeshPhysicalMaterial({color:0x8e86ff,metalness:.72,roughness:.13,transmission:.16,thickness:1.6,clearcoat:1,clearcoatRoughness:.08,emissive:0x201b50,emissiveIntensity:.5});
  const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(1.48,5),material);world.add(orb);
  const shell=new THREE.Mesh(new THREE.IcosahedronGeometry(1.7,2),new THREE.MeshBasicMaterial({color:0xd9d5ff,wireframe:true,transparent:true,opacity:.16}));world.add(shell);
  const rings=[];[2,2.45,2.9].forEach((r,i)=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(r,i===1?.012:.018,8,200),new THREE.MeshBasicMaterial({color:[0xb1aaff,0x6259c5,0xe7e4ff][i],transparent:true,opacity:.24-i*.04}));ring.rotation.set(.7+i*.42,.25+i*.55,i*.8);ring.userData.speed=(i===1?-1:1)*(.0005+i*.00012);world.add(ring);rings.push(ring)});
  const count=innerWidth<700?520:950,pos=new Float32Array(count*3);
  for(let i=0;i<count;i++){const r=4+Math.random()*6,a=Math.random()*Math.PI*2,b=Math.acos(2*Math.random()-1);pos[i*3]=r*Math.sin(b)*Math.cos(a);pos[i*3+1]=r*Math.cos(b);pos[i*3+2]=r*Math.sin(b)*Math.sin(a)}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));scene.add(new THREE.Points(pg,new THREE.PointsMaterial({color:0xc9c5ff,size:.018,transparent:true,opacity:.5,depthWrite:false})));
  scene.add(new THREE.AmbientLight(0x575170,1.5));const key=new THREE.PointLight(0xe0ddff,34,17);key.position.set(3,3,4);scene.add(key);const fill=new THREE.PointLight(0x675bff,25,14);fill.position.set(-4,-2,2);scene.add(fill);
  let tx=0,ty=0,mx=0,my=0;addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*1.1;ty=(e.clientY/innerHeight-.5)*.75},{passive:true});
  addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight)});
  let t=0;function frame(){requestAnimationFrame(frame);t+=.008;mx+=(tx-mx)*.025;my+=(ty-my)*.025;orb.rotation.x=t*.12+my*.2;orb.rotation.y=t*.2+mx*.24;orb.rotation.z=Math.sin(t*.35)*.08;shell.rotation.y=-t*.12;world.position.x+=(mx*.3-world.position.x)*.035;world.position.y+=(-my*.22-world.position.y)*.035;world.rotation.z+=(mx*.025-world.rotation.z)*.02;rings.forEach(r=>r.rotation.z+=r.userData.speed);camera.position.x+=(mx*.25-camera.position.x)*.02;camera.position.y+=(-my*.16-camera.position.y)*.02;camera.lookAt(0,0,0);renderer.render(scene,camera)}frame();
})();