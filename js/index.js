/*
 * @author buenahora / http://buenahora.io/
 * @summary Virtual Reality scene in Three.js
 * University of Pennsylvania, CIS-568-002
 */

// Pointer lock and first person shooter controls
// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document 
  || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {
  var element = document.body;
  var pointerlockchange = function ( event ) {
    if ( document.pointerLockElement === element || document.mozPointerLockElement === element
      || document.webkitPointerLockElement === element ) {
      controls.enabled = true;
      blocker.style.display = 'none';
    } else {
      controls.enabled = false;
      blocker.style.display = '-webkit-box';
      blocker.style.display = '-moz-box';
      blocker.style.display = 'box';
      instructions.style.display = '';
    }
  };
  var pointerlockerror = function ( event ) {
    instructions.style.display = '';
  };
  // Hook pointer lock state change events
  document.addEventListener( 'pointerlockchange', pointerlockchange, false );
  document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
  document.addEventListener( 'pointerlockerror', pointerlockerror, false );
  document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
  document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
  instructions.style.display = 'none';
  
  // Ask the browser to lock the pointer
  element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock
    || element.webkitRequestPointerLock;
  element.requestPointerLock();
  instructions.addEventListener( 'click', function ( event ) {
    instructions.style.display = 'none';
    // Ask the browser to lock the pointer
    element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock 
      || element.webkitRequestPointerLock;
    element.requestPointerLock();
  }, false );
} else {
  instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}

// Create the scene
var camera, scene, renderer;
var raycaster;
var controls;
var prevTimeStamp, currTimeStamp;
var fireworks = []

var floor;
var geometry, material, mesh;

// Enforce WebGL and browser compatibility
if (Detector.webgl) {
  init();
  animate();
} else {
  var warning = Detector.getWebGLErrorMessage();
  document.getElementById('container').appendChild(warning);
}


function init() {
  // Setup camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  scene = new THREE.Scene();
  raycaster = new THREE.Raycaster();
  scene.add ( camera );

  // Setup light
  var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
  light.position.set( 0.5, 1, 0.75 );
  scene.add( light );

  // Get pointer lock controls
  controls = new THREE.PointerLockControls( camera );
  scene.add( controls.getObject() );

  // Create ray caster / crosshair
  var crosshair = new THREE.RingGeometry(0.01, 0.05, 32);
  var crosshairMaterial = new THREE.MeshBasicMaterial({color: "rgb(255, 0, 0)", opacity: 0.5, 
      transparent: true});
  var crosshairmesh = new THREE.Mesh(crosshair, crosshairMaterial);
  crosshairmesh.position.z = -2;
  camera.add(crosshairmesh);

  // Setup floor
  var texture = new THREE.TextureLoader().load( "media/ocean-texture.jpg" );
  geometry = new THREE.PlaneGeometry( 2000, 2000, 1000, 1000 );
  geometry.rotateX( - Math.PI / 2 );

  // Setup Mountains
  geometry.vertices.forEach(function (v) { 
    v.y = noise.simplex2(v.x / 10, v.z / 10) * 10;
  });

  material = new THREE.MeshBasicMaterial( { map: texture } );
  mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );


  // Setup renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xffffff );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // Setup Scenery
  // TODO

  window.addEventListener( 'resize', onWindowResize, false );
  prevTimeStamp = new Date();
}


function animate() {
  if (!currTimeStamp) {
    currTimeStamp = new Date();
  }
  var deltaTime = currTimeStamp - prevTimeStamp;
  prevTimeStamp = currTimeStamp;

  // Animate Fireworks
  fireworks.map(firework => {
    firework.map(particle => {
      
    })
  })

  requestAnimationFrame( animate );
  var center = new THREE.Vector2();
  raycaster.setFromCamera(center, camera);
  renderer.render( scene, camera );
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

var Particle = class Particle {
  constructor(pos, vel, acc, lifetime) {
    this.pos = pos;
    this.vel = vel;
    this.acc = acc;
    this.lifetime = lifetime;
  }
}


