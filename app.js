import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';

const stage = document.querySelector('#stage');
const loading = document.querySelector('#loading');
const errorBox = document.querySelector('#modelError');
const muscleList = document.querySelector('#muscleList');
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const scene = new THREE.Scene();
scene.background = new THREE.Color('#151f2e');
scene.fog = new THREE.Fog('#151f2e', 8, 18);

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0, 1.3, 8.7);
const renderer = new THREE.WebGLRenderer({antialias:true, alpha:false});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.domElement.setAttribute('aria-label','Interactive 3D stylized muscular anatomy. Drag to rotate and scroll to zoom.');
stage.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xddeaff, 0x3b2630, 2.1));
const keyLight = new THREE.DirectionalLight(0xffe5d8, 3.2); keyLight.position.set(3,5,6); scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0x8ab9ff, 1.8); fillLight.position.set(-4,1,2); scene.add(fillLight);
const rimLight = new THREE.DirectionalLight(0x7de0c3, 2.4); rimLight.position.set(0,3,-5); scene.add(rimLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.3, 0);
controls.enableDamping = true; controls.dampingFactor = 0.06;
controls.minDistance = 4.7; controls.maxDistance = 13;
controls.maxPolarAngle = Math.PI * 0.92;
controls.update();

const colors = { chest:0xc86d68, abs:0xb95e5c, arm:0xb96361, forearm:0xa95858, quad:0xc87470, shin:0x9f666b, shoulder:0xd17b72, back:0xa95e61, glute:0xb45c5d, calf:0xc16b68, neck:0xc17870 };
const highlightColor = 0x7de0c3;
const muscleData = [
 {id:'pec',name:'Pectoralis major',region:'Thorax',group:'chest',desc:'A large, fan-shaped muscle of the anterior chest that contributes to shoulder adduction and medial rotation.',parts:[]},
 {id:'deltoid',name:'Deltoid',region:'Shoulder',group:'shoulder',desc:'The shoulder cap muscle; its different fibres contribute to arm abduction, flexion, extension and rotation.',parts:[]},
 {id:'biceps',name:'Biceps brachii',region:'Upper arm',group:'arm',desc:'A two-headed muscle that helps flex the elbow and supinate the forearm.',parts:[]},
 {id:'forearm',name:'Forearm flexors',region:'Forearm',group:'forearm',desc:'A simplified representation of the anterior forearm muscle group, involved in wrist and finger flexion.',parts:[]},
 {id:'rectus',name:'Rectus abdominis',region:'Abdomen',group:'abs',desc:'A paired anterior abdominal muscle that contributes to trunk flexion and abdominal wall function.',parts:[]},
 {id:'oblique',name:'External obliques',region:'Abdomen',group:'abs',desc:'Lateral abdominal muscles that assist trunk rotation, lateral flexion and abdominal compression.',parts:[]},
 {id:'quad',name:'Quadriceps femoris',region:'Thigh',group:'quad',desc:'The anterior thigh muscle group responsible for knee extension; the rectus femoris also assists hip flexion.',parts:[]},
 {id:'calf',name:'Gastrocnemius',region:'Lower leg',group:'calf',desc:'A superficial calf muscle that contributes to ankle plantar flexion and can assist knee flexion.',parts:[]},
 {id:'tibialis',name:'Tibialis anterior',region:'Lower leg',group:'shin',desc:'An anterior lower-leg muscle that dorsiflexes the ankle and helps control foot positioning.',parts:[]},
 {id:'triceps',name:'Triceps brachii',region:'Upper arm',group:'back',desc:'A posterior upper-arm muscle that is the primary extensor of the elbow.',parts:[]},
 {id:'glute',name:'Gluteus maximus',region:'Hip',group:'glute',desc:'A large hip extensor that contributes to external rotation and force production during locomotion.',parts:[]},
 {id:'hamstrings',name:'Hamstrings',region:'Thigh',group:'back',desc:'A posterior thigh muscle group involved in knee flexion and hip extension.',parts:[]}
];
const materialByGroup = {};
Object.entries(colors).forEach(([key,color]) => materialByGroup[key] = new THREE.MeshStandardMaterial({color, roughness:.68, metalness:.02}));
const selectedMaterial = new THREE.MeshStandardMaterial({color:highlightColor, roughness:.48, emissive:0x17483d, emissiveIntensity:.18});
const bodyMaterial = new THREE.MeshStandardMaterial({color:0xd9a18b, roughness:.88, transparent:true, opacity:.16, depthWrite:false});
const boneMaterial = new THREE.MeshStandardMaterial({color:0xd8d0bb, roughness:.82, transparent:true, opacity:.16, depthWrite:false});
const root = new THREE.Group(); scene.add(root);
const body = new THREE.Group(); root.add(body);
const pickables = [];
let selected = 'pec', isolateMode = false, showAnatomyColors = true, transparencyMode = false, opacity = 1;
const meshRecords = [];

function ellipsoid(parent, name, id, pos, scale, material, rot=[0,0,0], pickable=true) {
 const mesh = new THREE.Mesh(new THREE.SphereGeometry(1,24,18), material);
 mesh.name = name; mesh.userData.muscleId = id || null;
 mesh.position.set(...pos); mesh.scale.set(...scale); mesh.rotation.set(...rot);
 parent.add(mesh);
 if(id && pickable){ const record={mesh,id,group:muscleData.find(m=>m.id===id)?.group,baseMaterial:material}; meshRecords.push(record); pickables.push(mesh); muscleData.find(m=>m.id===id)?.parts.push(mesh); }
 return mesh;
}
function capsule(parent,name,id,a,b,radius,material,radial=12) {
 const start=new THREE.Vector3(...a), end=new THREE.Vector3(...b), dir=end.clone().sub(start);
 const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(radius,Math.max(.01,dir.length()-radius*2),4,radial),material);
 mesh.name=name; mesh.userData.muscleId=id||null; mesh.position.copy(start.clone().add(end).multiplyScalar(.5));
 mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize()); parent.add(mesh);
 if(id){meshRecords.push({mesh,id,group:muscleData.find(m=>m.id===id)?.group,baseMaterial:material});pickables.push(mesh);muscleData.find(m=>m.id===id)?.parts.push(mesh);}
 return mesh;
}
function muscle(id,pos,scale,rot=[0,0,0],label=null){const d=muscleData.find(m=>m.id===id);return ellipsoid(body,label||d.name,id,pos,scale,materialByGroup[d.group],rot);}
function bone(pos,scale,rot=[0,0,0]){return ellipsoid(body,'Illustrative skeletal landmark',null,pos,scale,boneMaterial,rot,false);}
function makeModel(){
 // Stylized body silhouette: low-opacity neutral forms provide context, not a medical-grade mesh.
 ellipsoid(body,'Head',null,[0,2.62,0],[.34,.43,.31],bodyMaterial,[0,0,0],false);
 capsule(body,'Neck',null,[0,1.92,0],[0,2.28,0],.14,bodyMaterial);
 ellipsoid(body,'Torso',null,[0,.88,0],[.72,1.12,.37],bodyMaterial,[0,0,0],false);
 ellipsoid(body,'Pelvis',null,[0,-.15,0],[.57,.42,.34],bodyMaterial,[0,0,0],false);
 // Chest, bilateral fan-like muscle masses.
 muscle('pec',[-.34,1.28,.335],[.34,.34,.105],[0,0,-.13],'Pectoralis major (left)');
 muscle('pec',[.34,1.28,.335],[.34,.34,.105],[0,0,.13],'Pectoralis major (right)');
 // Shoulder caps
 muscle('deltoid',[-.73,1.47,.03],[.23,.31,.24],[0,0,-.22]);
 muscle('deltoid',[.73,1.47,.03],[.23,.31,.24],[0,0,.22]);
 // Arms, both sides. Long capsules plus biceps/triceps bulges.
 for(const s of [-1,1]){
   capsule(body,'Upper arm silhouette',null,[s*.78,1.25,0],[s*.98,.52,0],.14,bodyMaterial);
   capsule(body,'Forearm silhouette',null,[s*.98,.48,0],[s*1.06,-.25,.01],.105,bodyMaterial);
   muscle('biceps',[s*.91,.91,.13],[.135,.31,.13],[0,0,-s*.17]);
   muscle('triceps',[s*.94,.91,-.10],[.12,.32,.11],[0,0,-s*.16]);
   muscle('forearm',[s*1.035,.13,.08],[.105,.33,.09],[0,0,-s*.1]);
   muscle('forearm',[s*1.03,.14,-.055],[.07,.27,.065],[0,0,-s*.12],'Forearm extensors');
 }
 // Abdominal wall and obliques
 for(const s of [-1,1]){
   for(let i=0;i<3;i++) muscle('rectus',[s*.16,.67-i*.25,.344],[.135,.105,.07],[0,0,s*.025],`Rectus abdominis segment ${i+1}`);
   muscle('oblique',[s*.48,.55,.235],[.18,.43,.09],[0,0,-s*.28]);
 }
 // Thighs and lower legs, anterior and posterior group representations
 for(const s of [-1,1]){
   capsule(body,'Thigh silhouette',null,[s*.31,-.35,0],[s*.37,-1.25,0],.205,bodyMaterial);
   capsule(body,'Lower leg silhouette',null,[s*.37,-1.28,0],[s*.4,-2.15,0],.135,bodyMaterial);
   muscle('quad',[s*.31,-.72,.17],[.19,.49,.13],[0,0,-s*.035]);
   muscle('quad',[s*.45,-.78,.13],[.12,.39,.11],[0,0,s*.15],'Vastus lateralis');
   muscle('hamstrings',[s*.34,-.78,-.15],[.16,.44,.11],[0,0,-s*.06]);
   muscle('calf',[s*.4,-1.58,-.005],[.145,.35,.13],[0,0,-s*.05]);
   muscle('calf',[s*.4,-1.56,-.12],[.105,.29,.095],[0,0,-s*.07],'Soleus (illustrative)');
   muscle('tibialis',[s*.37,-1.67,.12],[.085,.36,.075],[0,0,s*.025]);
   muscle('glute',[s*.31,-.16,-.16],[.25,.28,.13],[0,0,-s*.12]);
 }
 // Minimal pale landmarks show rough joint positions without suggesting actual bone anatomy.
 bone([0,1.85,0],[.11,.28,.12]); bone([-.31,-.2,0],[.12,.22,.12]); bone([.31,-.2,0],[.12,.22,.12]);
}
makeModel();

function selectMuscle(id){
 selected=id; const item=muscleData.find(m=>m.id===id); if(!item)return;
 document.querySelector('#selectedName').textContent=item.name;
 document.querySelector('#selectedDescription').textContent=item.desc;
 document.querySelector('#selectedRegion').textContent=item.region;
 renderMuscleList(); updateMaterials();
}
function renderMuscleList(){
 const query=document.querySelector('#search').value.trim().toLowerCase();
 muscleList.innerHTML='';
 muscleData.filter(m=>m.name.toLowerCase().includes(query)||m.region.toLowerCase().includes(query)||m.desc.toLowerCase().includes(query)).forEach(m=>{
   const btn=document.createElement('button');btn.className='muscle-item'+(m.id===selected?' active':'');btn.type='button';
   const swatch=document.createElement('span');swatch.className='muscle-swatch';swatch.style.background='#'+colors[m.group].toString(16).padStart(6,'0');
   const label=document.createElement('span');label.className='muscle-label';label.textContent=m.name;
   const region=document.createElement('span');region.className='muscle-region';region.textContent=m.region;
   const eye=document.createElement('span');eye.className='eye';eye.textContent=m.parts.some(p=>p.visible)?'◉':'○';eye.title='Click to select; use isolation control to focus';
   btn.append(swatch,label,region,eye);btn.addEventListener('click',()=>selectMuscle(m.id));muscleList.appendChild(btn);
 });
}
function updateMaterials(){
 meshRecords.forEach(({mesh,id,group,baseMaterial})=>{
   const active=id===selected;
   mesh.material=active?selectedMaterial:(showAnatomyColors?baseMaterial:new THREE.MeshStandardMaterial({color:0xb96b64,roughness:.7}));
   mesh.material.transparent=transparencyMode||opacity<1;
   mesh.material.opacity=opacity*(transparencyMode&&!active?.55:1);
   mesh.material.depthWrite=mesh.material.opacity>.95;
   mesh.visible=!isolateMode||active;
 });
 body.traverse(o=>{if(o.isMesh&&!o.userData.muscleId){o.material=bodyMaterial;o.material.opacity=transparencyMode?.09:.16;}});
 renderMuscleList();
}
function setView(view){
 const positions={front:[0,1.3,8.7],side:[8.7,1.1,0],back:[0,1.3,-8.7]};
 camera.position.set(...positions[view]);controls.target.set(0,.3,0);controls.update();
}
document.querySelector('#search').addEventListener('input',renderMuscleList);
document.querySelector('#showAll').addEventListener('click',()=>{isolateMode=false;meshRecords.forEach(r=>r.mesh.visible=true);updateMaterials();});
document.querySelector('#isolate').addEventListener('click',()=>{isolateMode=!isolateMode;updateMaterials();document.querySelector('#isolate').textContent=isolateMode?'Show all muscles':'Isolate selected muscle';});
document.querySelector('#colorMode').addEventListener('change',e=>{showAnatomyColors=e.target.checked;updateMaterials();});
document.querySelector('#transparentMode').addEventListener('change',e=>{transparencyMode=e.target.checked;updateMaterials();});
document.querySelector('#opacity').addEventListener('input',e=>{opacity=Number(e.target.value)/100;document.querySelector('#opacityValue').textContent=e.target.value+'%';updateMaterials();});
document.querySelector('#frontView').addEventListener('click',()=>setView('front'));
document.querySelector('#sideView').addEventListener('click',()=>setView('side'));
document.querySelector('#backView').addEventListener('click',()=>setView('back'));
document.querySelector('#resetView').addEventListener('click',()=>{setView('front');controls.reset();isolateMode=false;opacity=1;transparencyMode=false;showAnatomyColors=true;document.querySelector('#opacity').value=100;document.querySelector('#opacityValue').textContent='100%';document.querySelector('#transparentMode').checked=false;document.querySelector('#colorMode').checked=true;document.querySelector('#isolate').textContent='Isolate selected muscle';updateMaterials();});
renderer.domElement.addEventListener('pointerdown',()=>{renderer.domElement.style.cursor='grabbing';});
window.addEventListener('pointerup',()=>{renderer.domElement.style.cursor='grab';});
renderer.domElement.addEventListener('click',event=>{
 const rect=renderer.domElement.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;
 raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(pickables,false);
 if(hits.length){const id=hits[0].object.userData.muscleId;if(id)selectMuscle(id);}
});
function resize(){const w=stage.clientWidth,h=stage.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
new ResizeObserver(resize).observe(stage);resize();
renderMuscleList();selectMuscle('pec');
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}
animate();loading.hidden=true;
