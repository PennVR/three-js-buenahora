/*
 * @author buenahora / http://buenahora.io/
 * @summary Virtual Reality scene in Three.js
 * University of Pennsylvania, CIS-568-002
 */

// Pointer lock and first person shooter controls
// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

if ( WEBVR.isAvailable() === false ) {
  document.body.appendChild( WEBVR.getMessage() );
}

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
var fireworks = [];

var floor;
var geometry, material, mesh;

var FIREWORK_INTERVAL = 10;
var FLOOR_WIDTH = 2000, FLOOR_HEIGHT = 2000;

// Enforce WebGL and browser compatibility
if (Detector.webgl) {
  init();
  animate();
} else {
  var warning = Detector.getWebGLErrorMessage();
  document.getElementById('container').appendChild(warning);
}

// shoot firework on spacebar click
document.body.onkeyup = function(e){
  // spacebar
  if(e.keyCode == 32){
      shootFireworks();
  }
}


function init() {
  // Setup camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  scene = new THREE.Scene();
  raycaster = new THREE.Raycaster();
  scene.add ( camera );

  // Setup light
  var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  var ambientLight = new THREE.AmbientLight(0x0c0c0c);
  scene.add(ambientLight);

  // add fog
  scene.fog = new THREE.Fog(0xffffff, 0.015, 200);

  // Get pointer lock controls
  controls = new THREE.PointerLockControls( camera );
  scene.add( controls.getObject() );

  // // build the skybox Mesh 
  // geometry = new THREE.BoxGeometry(1000, 1000, 1000, 1, 1, 1);
  // texture = new THREE.TextureLoader().load( "media/sky-texture.jpg" );
  // material = new THREE.MeshBasicMaterial( { map: texture } );
  // // material = new THREE.MeshBasicMaterial();
  // mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);

  // Setup floor
  geometry = new THREE.PlaneGeometry(FLOOR_WIDTH, FLOOR_HEIGHT, 500, 500);
  geometry.rotateX( - Math.PI / 2 );

  // Setup Mountains
  noise.seed(Math.random());
  geometry.vertices.forEach(function (v) { 
    v.y = noise.simplex2(v.x / 10, v.z / 10) * 10;
  });
  
  var texture = new THREE.TextureLoader().load( "media/floor-texture.jpg" );
  material = new THREE.MeshBasicMaterial( { map: texture } );
  mesh = new THREE.Mesh( geometry, material );
  scene.add(mesh);

  // basic fireworks
  // firework = new THREE.CylinderGeometry( .5, .5, 2, 20);
  // firework.translate(0, 5, 20);
  // material = new THREE.MeshBasicMaterial( {color: "rgb(255, 0, 0)"} );
  // mesh = new THREE.Mesh( firework, material );
  // scene.add( mesh );


  // Setup renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x000080);
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // Setup Scenery
  // TODO

  window.addEventListener( 'resize', onWindowResize, false );
  prevTimeStamp = Date.now();
}


function animate() {
  currTimeStamp = Date.now();
  var deltaTime = currTimeStamp - prevTimeStamp;
  var normalizedDeltaTime = deltaTime / 50;
  prevTimeStamp = currTimeStamp;

  //Animate Fireworks
  fireworks = fireworks.filter(firework => {
    var isActive = firework.lifetime > 0;
    if (isActive) {
      var v = firework.velocity.clone().multiplyScalar(normalizedDeltaTime);
      firework.velocity.subVectors(firework.velocity, firework.acceleration);
      firework.geometry.translate(v.x, v.y, v.z);
      firework.lifetime -= deltaTime;

    } else {
      firework.geometry.dispose();
      firework.material.dispose();
      scene.remove(firework.mesh);
    }
    // removes firework from array if inactive
    return isActive;
  });

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

var Fireworks = class Fireworks {

  constructor() {
    this.geometry = new THREE.CylinderGeometry( .1, .1, .5, 6);
    this.lifetime = 10000;
    this.velocity = new THREE.Vector3(0, 2, 0);
    this.acceleration = new THREE.Vector3(0, .03, 0);

    // spawn at random position
    var RANGE = 100;
    var x_pos = Math.random() * (RANGE * 2) - RANGE;
    var z_pos = Math.random() * (RANGE * 2) - RANGE;
    
    this.geometry.translate(x_pos, 5, z_pos);
    this.material = new THREE.MeshBasicMaterial( {color: 0xff0000 } );
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    scene.add(this.mesh);

    // const MIN_PARTICLES = 10, MAX_PARTICLES = 30;
      // const DEFAULT_LIFETIME = 300;
      // const DEFAULT_POS = new THREE.Vector3(0, 30, 10);
      // const DEFAULT_VEL = new THREE.Vector3(0, 80, 0);
      // const DEFAULT_ACC = new THREE.Vector3(0, -9, 0);

      // this.particles = [];

      // define properties
      // var pos, vel, acc; 
      // var lifetime = 
      // var color = 
      // var sphereRadius = 

      // create particles
    
    // var numParticles = Math.Random() * (MAX_PARTICLES - MIN_PARTICLES) + MIN_PARTICLES;
    // for (var i = 0; i < numParticles; i++) {
    //   var particle = 
    // }
  }
}

// var Particle = class Particle {
//   constructor(pos, vel, acc, lifetime) {
//     this.pos = pos;
//     this.vel = vel;
//     this.acc = acc;
//     this.lifetime = lifetime;
//   }

//   addToScene() {
//     this.geometry = new THREE.SphereGeometry(1, 3, 3);
//     this.geometry.translate(0, 20, 0);
//     this.material = new THREE.MeshBasicMaterial({ color: "rgb(255, 0, 0)" });
//     this.mesh = new THREE.Mesh(geometry, material);
//     scene.add(this.mesh);
//     console.log(scene);
//   }
// }

// function shootFireworks() {
//   var geometry = new THREE.CylinderGeometry( 5, 5, 20, 32 );
//   var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
//   var cylinder = new THREE.Mesh( geometry, material );
//   scene.add( cylinder );
// }


  //     this.geometry = new THREE.SphereGeometry(1, 3, 3);
  //     this.geometry.translate(0, 20, 0);
  //     this.material = new THREE.MeshBasicMaterial({ color: "rgb(255, 0, 0)" });
  //     this.mesh = new THREE.Mesh(geometry, material);
  //     scene.add(this.mesh);
  //     console.log(scene);


  // var firework = [];
  // for (var i = 0; i < 1; i++) {
  //   var pos = new THREE.Vector3();
  //   var vel = new THREE.Vector3(0, 100, 0);
  //   var acc = new THREE.Vector3(0, -9.8, 0);
  //   var lifetime = 500;
  //   var particle = new Particle(pos, vel, acc, lifetime);
  //   particle.addToScene();
  //   firework.push(particle);
  // }
  // fireworks.push(firework);


//launch fireworks
setInterval(function() {
  fireworks.push(new Fireworks());
}, FIREWORK_INTERVAL);
