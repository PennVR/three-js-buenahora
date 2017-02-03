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
  console.log("reaches");
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
  var crosshairMaterial = new THREE.MeshBasicMaterial({color: 0xeeee0, opacity: 0.5, 
      transparent: true});
  var crosshairmesh = new THREE.Mesh(crosshair, crosshairmesh);
  crosshairmesh.position.z = -2;
  scene.add(crosshairmesh);
  raycaster = new THREE.Raycaster();

  // Setup floor
  geometry = new THREE.PlaneBufferGeometry ( 20000, 20000, 100, 100 );
  //geometry.rotateX( - Math.PI / 2 );
  material = new THREE.MeshBasicMaterial( { color: 'skyblue' } );
  floor = new THREE.Mesh( geometry, material );
  scene.add( floor );

  // Setup renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor( 0xffffff );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  selecting = false;

  // Setup Mountains
  // TODO

  // Setup Scenery
  // TODO
}


function animate() {
  requestAnimationFrame( animate );
  var center = new THREE.Vector2();
  raycaster.setFromCamera(center, camera);
  renderer.render( scene, camera );
}
