# Winter Wonders
### Santiago Buenahora

Passive VR Experience to watch fireworks on a procedurally generated terrain.

## Github Pages
This project is hosted live [here](https://pennvr.github.io/three-js-buenahora).

## Source Files

```
├── js
│   ├── Controls
|   │   └── Detector.js
|   │   └── PointerLockControl.js
|   │   └── VRControls.js
│   ├── Effects
|   │   └── VREffect.js
|   │   └── perlin.js
|   │   └── VREffect.js
│   ├── ThreeJS
|   │   └── three.min.js
│   ├── VR
|   │   └── WebVR.js
│   ├── main.js
├── media
│   ├── floor-texture.jpg
├── index.html
└── README.md
```

## How to Build/Run
Type “npm install http-server -g” in your terminal, then run "http-server" in the index.html directory.
You can also view the file [here](https://pennvr.github.io/three-js-buenahora)

## How did I make this?

* I began by modifying a [Headgazer](https://github.com/PennVR/PennVR-Head-Gazer) code sample given in class as the foundation of my project. I used this to get the needed code for pointer-locker controls and also making a floor (which was vital to the mountains). It also provided a base for me to play in Three.js
* I created the mountains by creating the floor using a snowy texture and then manipulating the vertices of the floor to correspond with noise-generated y-values. This provided the illusion of a rocky terrain
* I created the fireworks by randomly choosing a point in the scene for the fireworks to shoot from (within distance of the camera) and then I launched a cylinder up (given a certain time until explosion). After the time had passed, the firework geometry was replaced by small spheres each representing a particle shooting in a random direction of equal length. At each frame of this explosion, the particle would leave child particles still in space but with decreasing opacity at each frame, to make the fireworks look more realistic. I also relied on physics in terms of velocity and gravity deceleration to make this particles fall

## Motion Sickness
I experienced no motion sickness as there is little movement

## Hardest part of the assignment
There were some features I wanted to add (fog, procedural city instead of terrain) that took up my time and I did not make enough meaningful work to keep in the final iteration of the project. The reasons for this is largely my inexperience with Three.js. Other than that, the only large difficulty was starting the project and then getting simple shapes like the firework cylinder to show up in the scene.

## What do I wish I had done differently
I wish I had tried to make the environment more realistic by adding snow falling.

## What do I wish you had done differently
It would have been helpful to use part of the class time to navigate the Three.js documentation with us and explain a little bit of what you found useful.
