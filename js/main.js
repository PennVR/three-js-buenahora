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

// Scene variables
var camera, scene, renderer;
var raycaster;
var controls;
var prevTimeStamp, currTimeStamp;

var floor;
var geometry, material, mesh;

// fireworks variables
var fireworks = [];
const FIREWORKS_LAUNCH_INTERVAL = 120;
const FIREWORKS_RANGE = 400;
const FIREWORKS_MIN_DISTANCE = 100;
const FIREWORKS_LIFETIME = 10000;
const FIREWORKS_BOOMTIME = 8000;
const MIN_PARTICLES = 15, MAX_PARTICLES = 30;
const PARTICLE_VELOCITY = .6;
const GRAVITY = new THREE.Vector3(0, .03, 0);


var FLOOR_WIDTH = 2000, FLOOR_HEIGHT = 2000;

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
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  var ambientLight = new THREE.AmbientLight(0x0c0c0c);
  scene.add(ambientLight);

  // add fog
  scene.fog = new THREE.Fog(0xffffff, 0.015, 200);

  // Get pointer lock controls
  controls = new THREE.PointerLockControls( camera );
  scene.add( controls.getObject() );

  // setup floor
  geometry = new THREE.PlaneGeometry(FLOOR_WIDTH, FLOOR_HEIGHT, 500, 500);
  geometry.rotateX( - Math.PI / 2 );
  // setup mountains from floor 
  noise.seed(Math.random());
  geometry.vertices.forEach(function (v) { 
    v.y = noise.simplex2(v.x / 10, v.z / 10) * 10;
  });
  var texture = new THREE.TextureLoader().load( "media/floor-texture.jpg" );
  material = new THREE.MeshBasicMaterial( { map: texture } );
  mesh = new THREE.Mesh( geometry, material );
  scene.add(mesh);

  // Setup renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x000080);
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // resize support
  window.addEventListener( 'resize', onWindowResize, false );
  prevTimeStamp = Date.now();
}


function animate() {
  currTimeStamp = Date.now();
  var deltaTime = currTimeStamp - prevTimeStamp;
  var normalizedDeltaTime = deltaTime / 50;
  prevTimeStamp = currTimeStamp;

  var acc = GRAVITY.clone().multiplyScalar(normalizedDeltaTime);

  // animate fireworks
  fireworks = fireworks.filter(firework => {
    var isActive = firework.lifetime > 0;
    if (isActive) {
      firework.lifetime -= deltaTime;

      // firework rising up
      if (!firework.hasBoomed) {
        var v = firework.velocity.clone().multiplyScalar(normalizedDeltaTime);
        firework.velocity.subVectors(firework.velocity, acc);
        firework.mesh.position.addVectors(firework.mesh.position, v);
        if (FIREWORKS_BOOMTIME + firework.lifetime < FIREWORKS_LIFETIME) {
          firework.boom();
          firework.hasBoomed = true;
        }

      // firework combusting
      } else {
        firework.particles.map(particle => {
          var v = particle.velocity.clone().multiplyScalar(normalizedDeltaTime);
          particle.velocity.subVectors(particle.velocity, acc);
          particle.geometry.translate(v.x, v.y, v.z);
        });
      }
    } else {
      firework.particles.map(particle => {
        particle.geometry.dispose();
        particle.material.dispose();
        scene.remove(particle.mesh);
      });
      delete firework.particles;
    }
    // removes firework from array if inactive
    return isActive;
  });

  requestAnimationFrame(animate);
  var center = new THREE.Vector2();
  raycaster.setFromCamera(center, camera);
  renderer.render(scene, camera);
}


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

var Fireworks = class Fireworks {

  constructor() {
    this.geometry = new THREE.CylinderGeometry( .1, .1, .5, 6);
    this.lifetime = FIREWORKS_LIFETIME;
    this.hasBoomed = false;
    this.velocity = new THREE.Vector3(0, 5, 0);

    this.material = new THREE.MeshBasicMaterial( {color: 0xff0000 } );
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    scene.add(this.mesh);

    // spawn at random position 
    // at a minimum distance away from the camera
    var x_pos = Math.random() * (FIREWORKS_RANGE - FIREWORKS_MIN_DISTANCE) + FIREWORKS_MIN_DISTANCE;
    var z_pos = Math.random() * (FIREWORKS_RANGE - FIREWORKS_MIN_DISTANCE) + FIREWORKS_MIN_DISTANCE;
    if (Math.random() > .5) x_pos *= -1;
    if (Math.random() > .5) z_pos *= -1;
    this.mesh.position.x = x_pos;
    this.mesh.position.y = 5;
    this.mesh.position.z = z_pos;
  }

  boom() {
    this.particles = [];
    var numParticles = Math.random() * (MAX_PARTICLES - MIN_PARTICLES) + MIN_PARTICLES;
    for (var i = 0; i < numParticles; i++) {
      this.particles.push(new Particle(this.mesh.position));
    }

    // remove cylinder
    this.geometry.dispose();
    this.material.dispose();
    scene.remove(this.mesh);
  }
}

var Particle = class Particle {
  constructor(position) {
    this.geometry = new THREE.SphereGeometry( .5, 3, 2);
    this.geometry.translate(position.x, position.y, position.z);
    this.material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    scene.add(this.mesh);

    // particles explode in random directions
    this.velocity = new THREE.Vector3();
    this.velocity.x = Math.random() * (2 * PARTICLE_VELOCITY) - PARTICLE_VELOCITY;
    this.velocity.y = Math.random() * (2 * PARTICLE_VELOCITY) - PARTICLE_VELOCITY;
    this.velocity.z = Math.random() * (2 * PARTICLE_VELOCITY) - PARTICLE_VELOCITY;
    this.velocity.normalize();
  }
}

// launch fireworks
setInterval(function() {
  fireworks.push(new Fireworks());
}, FIREWORKS_LAUNCH_INTERVAL);
