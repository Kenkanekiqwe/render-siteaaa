(() => {
  const player=document.getElementById('player'),button=document.getElementById('play-button'),timeEl=document.getElementById('time'),title=document.getElementById('track-title'),waveform=document.getElementById('waveform');
  if(!player||!button)return;
  for(let i=0;i<48;i++){const bar=document.createElement('i');bar.style.setProperty('--h',`${4+Math.random()*24}px`);bar.style.animationDelay=`${-Math.random()}.8s`;waveform.appendChild(bar)}
  let audioCtx=null,osc=null,gain=null,playing=false,start=0,elapsed=0,timer=null;
  function setup(){if(audioCtx)return;audioCtx=new(window.AudioContext||window.webkitAudioContext)();osc=audioCtx.createOscillator();gain=audioCtx.createGain();osc.type='sine';osc.frequency.value=196;gain.gain.value=0;osc.connect(gain).connect(audioCtx.destination);osc.start()}
  function setTime(sec){const s=Math.floor(sec)%60,m=Math.floor(sec/60);timeEl.textContent=`${m}:${String(s).padStart(2,'0')}`}
  function play(){setup();if(audioCtx.state==='suspended')audioCtx.resume();playing=true;gain.gain.cancelScheduledValues(audioCtx.currentTime);gain.gain.linearRampToValueAtTime(.035,audioCtx.currentTime+.12);start=performance.now()-elapsed*1000;player.classList.add('is-playing');button.textContent='Ⅱ';title.textContent='Now playing — A moment in motion';timer=requestAnimationFrame(tick)}
  function pause(){playing=false;elapsed=(performance.now()-start)/1000;gain.gain.cancelScheduledValues(audioCtx.currentTime);gain.gain.linearRampToValueAtTime(0,audioCtx.currentTime+.08);player.classList.remove('is-playing');button.textContent='▶';cancelAnimationFrame(timer)}
  function tick(){if(!playing)return;elapsed=(performance.now()-start)/1000;setTime(elapsed%180);osc.frequency.setTargetAtTime(196+Math.sin(elapsed*1.4)*28,audioCtx.currentTime,.04);timer=requestAnimationFrame(tick)}
  function toggle(){playing?pause():play()}
  button.addEventListener('click',toggle);document.querySelectorAll('[data-demo-play]').forEach(b=>b.addEventListener('click',toggle));window.renderPlayer={toggle,play,pause};
})();
