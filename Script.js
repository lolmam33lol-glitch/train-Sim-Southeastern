// script.js
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let playerControl = true;
let speed = 0;
let train = null;
let stations = [];
let currentStation = 0;
let aiDriving = false;
let controlMode = 1;
let selectedTrainType = '465';

const stationNames = ["Sevenoaks","Dunton Green","Tonbridge","Hastings"];
const stationPositions = [0,50,100,150];
const stationDelay = 2000;

// UI Elements
const mainMenu = document.getElementById("mainMenu");
const settingsMenu = document.getElementById("settingsMenu");
const trainSelectMenu = document.getElementById("trainSelectMenu");
const playBtn = document.getElementById("playBtn");
const settingsBtn = document.getElementById("settingsBtn");
const backFromSettings = document.getElementById("backFromSettings");
const controlSlider = document.getElementById("controlSlider");
const trainBtns = document.querySelectorAll(".trainBtn");
const throttleSlider = document.getElementById("throttle");
const speedDisplay = document.getElementById("speedDisplay");
const speedometer = document.getElementById("speedometer");
const menuIcon = document.getElementById("menuIcon");

// Main Menu Logic
playBtn.onclick = () => { mainMenu.style.display = 'none'; trainSelectMenu.style.display = 'flex'; };
settingsBtn.onclick = () => { mainMenu.style.display='none'; settingsMenu.style.display='flex'; };
backFromSettings.onclick = () => { settingsMenu.style.display='none'; mainMenu.style.display='flex'; };
controlSlider.oninput = ()=>{controlMode=parseInt(controlSlider.value);};

trainBtns.forEach(btn=>{
  btn.onclick = () => {
    selectedTrainType = btn.getAttribute('data-type');
    trainSelectMenu.style.display='none';
    playerControl = true;
    aiDriving = false;
    initScene();
  };
});

menuIcon.onclick = ()=>{ mainMenu.style.display = mainMenu.style.display==='flex'?'none':'flex'; };

// Scene setup
let scene = null;
function initScene(){
  if(scene) scene.dispose();
  scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.6,0.8,1);

  // Skybox
  const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000}, scene);
  const skyMat = new BABYLON.StandardMaterial("skyMat",scene);
  skyMat.backFaceCulling=false; skyMat.disableLighting=true;
  skyMat.reflectionTexture=new BABYLON.CubeTexture("https://playground.babylonjs.com/textures/skybox", scene);
  skyMat.reflectionTexture.coordinatesMode=BABYLON.Texture.SKYBOX_MODE;
  skybox.material=skyMat;

  // Ground
  const ground = BABYLON.MeshBuilder.CreateGround("ground",{width:500,height:500},scene);
  const gMat = new BABYLON.StandardMaterial("gMat",scene); gMat.diffuseColor=new BABYLON.Color3(0.2,0.7,0.2); ground.material=gMat;

  // Tracks
  for(let i=0;i<160;i+=5){
    const sleeper = BABYLON.MeshBuilder.CreateBox("sleeper"+i,{width:2,height:0.2,depth:0.5},scene);
    sleeper.position.z=i; sleeper.position.y=0.1;
    const sMat = new BABYLON.StandardMaterial("sMat",scene); sMat.diffuseColor=new BABYLON.Color3(0.4,0.2,0.1); sleeper.material=sMat;
  }

  // Stations
  stations = [];
  for(let i=0;i<stationPositions.length;i++){
    const plat = BABYLON.MeshBuilder.CreateBox("plat"+i,{width:10,height:0.3,depth:3},scene);
    plat.position.z=stationPositions[i]; plat.position.y=0.15; plat.position.x=3;
    const pMat = new BABYLON.StandardMaterial("pMat"+i,scene); pMat.diffuseColor=new BABYLON.Color3(0.5,0.5,0.5); plat.material=pMat;
    stations.push(plat);
  }

  // Load train model
  let modelUrl = "";
  if(selectedTrainType==='465') modelUrl = "https://raw.githubusercontent.com/VirtualTrains3D/TrainModels/main/Class465.glb";
  else if(selectedTrainType==='395') modelUrl = "https://raw.githubusercontent.com/VirtualTrains3D/TrainModels/main/Class395.glb";
  else modelUrl = "https://raw.githubusercontent.com/VirtualTrains3D/TrainModels/main/Class375.glb";

  BABYLON.SceneLoader.ImportMesh("", modelUrl, "", scene, function(meshes){
    train = meshes[0];
    train.position = new BABYLON.Vector3(0,0,0);
    train.scaling = new BABYLON.Vector3(0.5,0.5,0.5);
  });

  // Camera
  const camera = new BABYLON.FollowCamera("cam", new BABYLON.Vector3(0,5,-15), scene);
  camera.lockedTarget = train;
  camera.heightOffset = 5;
  camera.radius = 15;
  camera.rotationOffset = 0;
  scene.activeCamera = camera;
}

engine.runRenderLoop(()=>{ if(scene) scene.render(); });
window.addEventListener('resize',()=>engine.resize());
