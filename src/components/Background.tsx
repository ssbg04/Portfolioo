import React, { useEffect, useRef, useState } from 'react';
import {
  Renderer,
  Camera,
  Transform,
  Program,
  Mesh,
  Geometry,
  Color,
  Vec3,
  Torus,
  Cylinder,
  Box
} from 'ogl';

// ─── GLSL Shaders for Blender-style 3D Physical Lighting ───

// 1. Faceted Core & Solid Mesh Material (Flat Normals + Diffuse + Specular + Fresnel Rim Glow)
const coreVertexShader = `
attribute vec3 position;
attribute vec3 normal;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vPosition = mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
`;

const coreFragmentShader = `
precision highp float;

uniform vec3 uColorBase;
uniform vec3 uColorRim;
uniform vec3 uLightDir;
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(-vPosition);
    vec3 lightDir = normalize(uLightDir);

    // Diffuse wrap
    float NdotL = max(dot(normal, lightDir), 0.0);
    float diffuse = NdotL * 0.65 + 0.35;

    // Specular highlight (Blinn-Phong)
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 28.0) * 0.55;

    // Fresnel rim effect (Blender physical glow on silhouette)
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.2);

    vec3 baseCol = mix(uColorBase, uColorRim, fresnel * 0.75);
    vec3 finalCol = baseCol * diffuse + uColorRim * spec + uColorRim * fresnel * 0.45;

    // Semi-translucent core so foreground typography stays 100% legible
    float alpha = clamp(uOpacity * (0.28 + fresnel * 0.62), 0.0, 0.85);

    gl_FragColor = vec4(finalCol, alpha);
}
`;

// 2. Glowing Wireframe Material
const wireVertexShader = `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const wireFragmentShader = `
precision highp float;
uniform vec3 uColorWire;
uniform float uOpacity;

void main() {
    gl_FragColor = vec4(uColorWire, uOpacity);
}
`;

// 3. Dynamic Constellation Network Link Lines
const tetherFragmentShader = `
precision highp float;
uniform vec3 uColorTether;
uniform float uOpacity;
uniform float uTime;

void main() {
    float pulse = 0.55 + 0.45 * sin(uTime * 2.8);
    gl_FragColor = vec4(uColorTether, uOpacity * pulse);
}
`;

// 4. Vertex Node Beacons (Glowing Network Data Points)
const nodeVertexShader = `
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uPixelRatio;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (26.0 / -mvPosition.z) * uPixelRatio;
    gl_Position = projectionMatrix * mvPosition;
}
`;

const nodeFragmentShader = `
precision highp float;
uniform vec3 uColorNode;
uniform float uTime;
uniform float uOpacity;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.06, dist);
    float pulse = 0.8 + 0.2 * sin(uTime * 3.2);
    gl_FragColor = vec4(uColorNode, alpha * pulse * uOpacity);
}
`;

// ─── Procedural 3D Geometry Generators ───

// A) 3D Icosahedron & Polyhedral Lattice Data
function createPolyhedralData(radius = 1.6) {
  const phi = (1.0 + Math.sqrt(5.0)) / 2.0;
  const rawVerts = [
    [-1,  phi,  0], [ 1,  phi,  0], [-1, -phi,  0], [ 1, -phi,  0],
    [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
    [ phi,  0, -1], [ phi,  0,  1], [-phi,  0, -1], [-phi,  0,  1]
  ];

  const invLen = 1.0 / Math.sqrt(1.0 + phi * phi);
  const baseVerts = rawVerts.map(([x, y, z]) => [
    x * invLen * radius,
    y * invLen * radius,
    z * invLen * radius
  ]);

  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
  ];

  const corePositions = new Float32Array(20 * 3 * 3);
  const coreNormals = new Float32Array(20 * 3 * 3);

  let vIdx = 0;
  faces.forEach(([i0, i1, i2]) => {
    const v0 = baseVerts[i0];
    const v1 = baseVerts[i1];
    const v2 = baseVerts[i2];

    const ax = v1[0] - v0[0], ay = v1[1] - v0[1], az = v1[2] - v0[2];
    const bx = v2[0] - v0[0], by = v2[1] - v0[1], bz = v2[2] - v0[2];
    let nx = ay * bz - az * by;
    let ny = az * bx - ax * bz;
    let nz = ax * by - ay * bx;
    const nlen = Math.hypot(nx, ny, nz) || 1;
    nx /= nlen; ny /= nlen; nz /= nlen;

    [v0, v1, v2].forEach((v) => {
      corePositions[vIdx] = v[0];
      corePositions[vIdx + 1] = v[1];
      corePositions[vIdx + 2] = v[2];

      coreNormals[vIdx] = nx;
      coreNormals[vIdx + 1] = ny;
      coreNormals[vIdx + 2] = nz;

      vIdx += 3;
    });
  });

  const edgeSet = new Set<string>();
  const edgePairs: [number, number][] = [];
  faces.forEach(([a, b, c]) => {
    const triPairs: [number, number][] = [
      [Math.min(a, b), Math.max(a, b)],
      [Math.min(b, c), Math.max(b, c)],
      [Math.min(c, a), Math.max(c, a)]
    ];
    triPairs.forEach(([p1, p2]) => {
      const key = `${p1}_${p2}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edgePairs.push([p1, p2]);
      }
    });
  });

  const wireRadius = radius * 1.025;
  const wirePositions = new Float32Array(edgePairs.length * 2 * 3);
  let wIdx = 0;
  edgePairs.forEach(([p1, p2]) => {
    const vA = rawVerts[p1];
    const vB = rawVerts[p2];

    wirePositions[wIdx] = vA[0] * invLen * wireRadius;
    wirePositions[wIdx + 1] = vA[1] * invLen * wireRadius;
    wirePositions[wIdx + 2] = vA[2] * invLen * wireRadius;

    wirePositions[wIdx + 3] = vB[0] * invLen * wireRadius;
    wirePositions[wIdx + 4] = vB[1] * invLen * wireRadius;
    wirePositions[wIdx + 5] = vB[2] * invLen * wireRadius;

    wIdx += 6;
  });

  const nodeRadius = radius * 1.03;
  const nodePositions = new Float32Array(rawVerts.length * 3);
  rawVerts.forEach((v, idx) => {
    nodePositions[idx * 3] = v[0] * invLen * nodeRadius;
    nodePositions[idx * 3 + 1] = v[1] * invLen * nodeRadius;
    nodePositions[idx * 3 + 2] = v[2] * invLen * nodeRadius;
  });

  return { corePositions, coreNormals, wirePositions, nodePositions };
}

// B) 3D Cryptographic Octahedron (Cybersecurity & Credentials Crystal)
function createOctahedronData(r = 0.55) {
  const top = [0, r * 1.15, 0];
  const btm = [0, -r * 1.15, 0];
  const eq = [
    [r, 0, 0],
    [0, 0, r],
    [-r, 0, 0],
    [0, 0, -r]
  ];

  const faces = [
    [top, eq[0], eq[1]],
    [top, eq[1], eq[2]],
    [top, eq[2], eq[3]],
    [top, eq[3], eq[0]],
    [btm, eq[1], eq[0]],
    [btm, eq[2], eq[1]],
    [btm, eq[3], eq[2]],
    [btm, eq[0], eq[3]]
  ];

  const positions = new Float32Array(8 * 3 * 3);
  const normals = new Float32Array(8 * 3 * 3);

  let idx = 0;
  faces.forEach(([v0, v1, v2]) => {
    const ax = v1[0] - v0[0], ay = v1[1] - v0[1], az = v1[2] - v0[2];
    const bx = v2[0] - v0[0], by = v2[1] - v0[1], bz = v2[2] - v0[2];
    let nx = ay * bz - az * by;
    let ny = az * bx - ax * bz;
    let nz = ax * by - ay * bx;
    const nlen = Math.hypot(nx, ny, nz) || 1;
    nx /= nlen; ny /= nlen; nz /= nlen;

    [v0, v1, v2].forEach((v) => {
      positions[idx] = v[0];
      positions[idx + 1] = v[1];
      positions[idx + 2] = v[2];
      normals[idx] = nx;
      normals[idx + 1] = ny;
      normals[idx + 2] = nz;
      idx += 3;
    });
  });

  // Wireframe edges for the octahedron (12 edges)
  const edges: [number[], number[]][] = [
    [top, eq[0]], [top, eq[1]], [top, eq[2]], [top, eq[3]],
    [btm, eq[0]], [btm, eq[1]], [btm, eq[2]], [btm, eq[3]],
    [eq[0], eq[1]], [eq[1], eq[2]], [eq[2], eq[3]], [eq[3], eq[0]]
  ];

  const wirePositions = new Float32Array(edges.length * 2 * 3);
  let wIdx = 0;
  edges.forEach(([vA, vB]) => {
    wirePositions[wIdx] = vA[0] * 1.02;
    wirePositions[wIdx + 1] = vA[1] * 1.02;
    wirePositions[wIdx + 2] = vA[2] * 1.02;
    wirePositions[wIdx + 3] = vB[0] * 1.02;
    wirePositions[wIdx + 4] = vB[1] * 1.02;
    wirePositions[wIdx + 5] = vB[2] * 1.02;
    wIdx += 6;
  });

  return { positions, normals, wirePositions };
}

// ─── Waypoint Interpolation for Cinematic Parallax ───
interface ParallaxTransform {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
}

function getParallaxWaypoint(p: number, isPortrait: boolean): ParallaxTransform {
  const t = Math.max(0, Math.min(1, p));

  if (isPortrait) {
    const waypoints: { p: number; data: ParallaxTransform }[] = [
      { p: 0.0, data: { x: 0.0, y: 0.55, z: -0.6, rotX: 0.35, rotY: 0.5, rotZ: 0.05, scale: 0.88 } },
      { p: 0.2, data: { x: 0.0, y: -0.2, z: -0.8, rotX: 0.65, rotY: 1.5, rotZ: 0.15, scale: 1.12 } },
      { p: 0.5, data: { x: 0.0, y: 0.25, z: -0.6, rotX: -0.3, rotY: 2.8, rotZ: -0.1, scale: 1.20 } },
      { p: 0.8, data: { x: 0.0, y: -0.35, z: -0.9, rotX: 0.45, rotY: 4.2, rotZ: 0.12, scale: 1.05 } },
      { p: 1.0, data: { x: 0.0, y: 0.0, z: -0.7, rotX: 0.55, rotY: 5.6, rotZ: 0.08, scale: 1.10 } },
    ];
    return interpolateWaypoints(waypoints, t);
  }

  const waypoints: { p: number; data: ParallaxTransform }[] = [
    // 0.0 - Hero: Clean initial baseline scale
    { p: 0.0, data: { x: 1.35, y: 0.15, z: 0.1, rotX: 0.22, rotY: 0.45, rotZ: 0.08, scale: 1.05 } },
    // 0.22 - About: Dynamic zoom-in as user scrolls down into narrative
    { p: 0.22, data: { x: -1.15, y: -0.22, z: -0.1, rotX: 0.68, rotY: 1.65, rotZ: -0.25, scale: 1.35 } },
    // 0.45 - Projects: Deep close-up zoom showcasing 3D geometry & satellites
    { p: 0.45, data: { x: 1.25, y: 0.28, z: 0.18, rotX: -0.42, rotY: 3.1, rotZ: 0.32, scale: 1.45 } },
    // 0.72 - Skills & Tech: Balanced framing behind modular bento cards
    { p: 0.72, data: { x: -0.95, y: -0.38, z: -0.15, rotX: 0.52, rotY: 4.4, rotZ: -0.28, scale: 1.25 } },
    // 1.0 - Contact / Footer: Majestic elevated scale looking up
    { p: 1.0, data: { x: 0.85, y: -0.05, z: 0.05, rotX: 0.65, rotY: 5.85, rotZ: 0.18, scale: 1.30 } },
  ];

  return interpolateWaypoints(waypoints, t);
}

function interpolateWaypoints(
  waypoints: { p: number; data: ParallaxTransform }[],
  t: number
): ParallaxTransform {
  if (t <= waypoints[0].p) return { ...waypoints[0].data };
  if (t >= waypoints[waypoints.length - 1].p) return { ...waypoints[waypoints.length - 1].data };

  let i = 0;
  while (i < waypoints.length - 1 && waypoints[i + 1].p < t) {
    i++;
  }

  const p0 = waypoints[i].p;
  const p1 = waypoints[i + 1].p;
  const ratio = (t - p0) / (p1 - p0);
  const factor = ratio * ratio * (3 - 2 * ratio);

  const d0 = waypoints[i].data;
  const d1 = waypoints[i + 1].data;

  return {
    x: d0.x + (d1.x - d0.x) * factor,
    y: d0.y + (d1.y - d0.y) * factor,
    z: d0.z + (d1.z - d0.z) * factor,
    rotX: d0.rotX + (d1.rotX - d0.rotX) * factor,
    rotY: d0.rotY + (d1.rotY - d0.rotY) * factor,
    rotZ: d0.rotZ + (d1.rotZ - d0.rotZ) * factor,
    scale: d0.scale + (d1.scale - d0.scale) * factor,
  };
}

export default function Background() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLowTier, setIsLowTier] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkTier = () => {
      setIsLowTier(document.documentElement.dataset.tier === 'low');
    };
    checkTier();
    window.addEventListener('tier-change', checkTier);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReducedMotion(true);
    }

    return () => {
      window.removeEventListener('tier-change', checkTier);
    };
  }, []);

  useEffect(() => {
    if (!mounted || isLowTier || !containerRef.current) return;

    const container = containerRef.current;
    let animationFrameId: number;
    let isDisposed = false;

    // ─── 1. OGL Renderer Setup ───
    const renderer = new Renderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      dpr: Math.min(window.devicePixelRatio || 1, 2)
    });

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    container.appendChild(gl.canvas);
    gl.canvas.style.position = 'absolute';
    gl.canvas.style.inset = '0';
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.pointerEvents = 'none';

    // ─── 2. Camera & Scene Hierarchy ───
    const camera = new Camera(gl, { fov: 42 });
    camera.position.set(0, 0, 7.5);

    const scene = new Transform();
    // Unified Root: The entire 3D cybernetic portfolio ecosystem transforms as ONE cohesive entity
    const sceneRoot = new Transform();
    sceneRoot.setParent(scene);

    // ─── 3. Shared Program Shaders ───
    const coreProgram = new Program(gl, {
      vertex: coreVertexShader,
      fragment: coreFragmentShader,
      transparent: true,
      cullFace: null,
      depthTest: true,
      depthWrite: false,
      uniforms: {
        uColorBase: { value: new Color(0.06, 0.12, 0.28) },
        uColorRim: { value: new Color(0.23, 0.51, 0.96) },
        uLightDir: { value: new Vec3(0.8, 1.2, 1.5).normalize() },
        uOpacity: { value: 0.65 }
      }
    });

    const wireProgram = new Program(gl, {
      vertex: wireVertexShader,
      fragment: wireFragmentShader,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      uniforms: {
        uColorWire: { value: new Color(0.35, 0.75, 1.0) },
        uOpacity: { value: 0.68 }
      }
    });

    const nodeProgram = new Program(gl, {
      vertex: nodeVertexShader,
      fragment: nodeFragmentShader,
      transparent: true,
      depthTest: false,
      uniforms: {
        uColorNode: { value: new Color(0.4, 0.85, 1.0) },
        uTime: { value: 0 },
        uOpacity: { value: 0.85 },
        uPixelRatio: { value: renderer.dpr }
      }
    });

    const tetherProgram = new Program(gl, {
      vertex: wireVertexShader,
      fragment: tetherFragmentShader,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      uniforms: {
        uColorTether: { value: new Color(0.3, 0.7, 1.0) },
        uOpacity: { value: 0.35 },
        uTime: { value: 0 }
      }
    });

    // ─── 4. OBJECT 1: Central Polyhedral Core with Gyroscopic Rings (Computing / Architecture) ───
    const polyData = createPolyhedralData(1.55);

    const coreGeometry = new Geometry(gl, {
      position: { size: 3, data: polyData.corePositions },
      normal: { size: 3, data: polyData.coreNormals }
    });
    const coreMesh = new Mesh(gl, { geometry: coreGeometry, program: coreProgram });
    coreMesh.setParent(sceneRoot);

    const wireGeometry = new Geometry(gl, {
      position: { size: 3, data: polyData.wirePositions }
    });
    const wireMesh = new Mesh(gl, { mode: gl.LINES, geometry: wireGeometry, program: wireProgram });
    wireMesh.setParent(sceneRoot);

    const nodeGeometry = new Geometry(gl, {
      position: { size: 3, data: polyData.nodePositions }
    });
    const nodeMesh = new Mesh(gl, { mode: gl.POINTS, geometry: nodeGeometry, program: nodeProgram });
    nodeMesh.setParent(sceneRoot);

    // Gyroscopic Orbital Rings
    const ring1Geom = new Torus(gl, { radius: 2.1, tube: 0.016, radialSegments: 48, tubularSegments: 16 });
    const ring2Geom = new Torus(gl, { radius: 2.48, tube: 0.013, radialSegments: 56, tubularSegments: 16 });

    const ring1Mesh = new Mesh(gl, { geometry: ring1Geom, program: coreProgram });
    ring1Mesh.rotation.set(0.65, 0.25, 0.0);
    ring1Mesh.setParent(sceneRoot);

    const ring2Mesh = new Mesh(gl, { geometry: ring2Geom, program: coreProgram });
    ring2Mesh.rotation.set(-0.85, 0.15, 0.45);
    ring2Mesh.setParent(sceneRoot);

    // ─── 5. OBJECT 2: 3-Tier Database Storage Canister (MySQL & Backend Infrastructure) ───
    const dbGroup = new Transform();
    dbGroup.setParent(sceneRoot);

    const discGeom = new Cylinder(gl, { radiusTop: 0.42, radiusBottom: 0.42, height: 0.15, radialSegments: 28 });
    const discRingGeom = new Torus(gl, { radius: 0.43, tube: 0.012, radialSegments: 28, tubularSegments: 8 });

    [-0.2, 0.0, 0.2].forEach((offsetY) => {
      const disc = new Mesh(gl, { geometry: discGeom, program: coreProgram });
      disc.position.set(0, offsetY, 0);
      disc.setParent(dbGroup);

      const discRing = new Mesh(gl, { geometry: discRingGeom, program: wireProgram });
      discRing.position.set(0, offsetY, 0);
      discRing.rotation.set(Math.PI / 2, 0, 0);
      discRing.setParent(dbGroup);
    });

    // ─── 6. OBJECT 3: Cryptographic Octahedron Crystal (Cybersecurity & Credentials) ───
    const octaData = createOctahedronData(0.5);
    const octaGroup = new Transform();
    octaGroup.setParent(sceneRoot);

    const octaGeom = new Geometry(gl, {
      position: { size: 3, data: octaData.positions },
      normal: { size: 3, data: octaData.normals }
    });
    const octaMesh = new Mesh(gl, { geometry: octaGeom, program: coreProgram });
    octaMesh.setParent(octaGroup);

    const octaWireGeom = new Geometry(gl, {
      position: { size: 3, data: octaData.wirePositions }
    });
    const octaWireMesh = new Mesh(gl, { mode: gl.LINES, geometry: octaWireGeom, program: wireProgram });
    octaWireMesh.setParent(octaGroup);

    // ─── 7. OBJECT 4: Cisco Router Node Satellite (Cisco Networking & Routing Mesh) ───
    const ciscoGroup = new Transform();
    ciscoGroup.setParent(sceneRoot);

    // Central router hub node
    const ciscoHubGeom = new Cylinder(gl, { radiusTop: 0.28, radiusBottom: 0.28, height: 0.16, radialSegments: 20 });
    const ciscoHub = new Mesh(gl, { geometry: ciscoHubGeom, program: coreProgram });
    ciscoHub.setParent(ciscoGroup);

    // Cross antenna prongs
    const prongGeom = new Cylinder(gl, { radiusTop: 0.016, radiusBottom: 0.016, height: 0.88, radialSegments: 8 });
    const prongH = new Mesh(gl, { geometry: prongGeom, program: wireProgram });
    prongH.rotation.set(0, 0, Math.PI / 2);
    prongH.setParent(ciscoGroup);

    const prongV = new Mesh(gl, { geometry: prongGeom, program: wireProgram });
    prongV.setParent(ciscoGroup);

    // Satellite wave ring
    const ciscoRingGeom = new Torus(gl, { radius: 0.48, tube: 0.01, radialSegments: 32, tubularSegments: 8 });
    const ciscoRing = new Mesh(gl, { geometry: ciscoRingGeom, program: wireProgram });
    ciscoRing.rotation.set(Math.PI / 2, 0, 0);
    ciscoRing.setParent(ciscoGroup);

    // 4 Glowing transceiver port LEDs
    const ciscoPortPositions = new Float32Array([
      0.44, 0, 0,
      -0.44, 0, 0,
      0, 0.44, 0,
      0, -0.44, 0
    ]);
    const ciscoPortsGeom = new Geometry(gl, { position: { size: 3, data: ciscoPortPositions } });
    const ciscoPortsMesh = new Mesh(gl, { mode: gl.POINTS, geometry: ciscoPortsGeom, program: nodeProgram });
    ciscoPortsMesh.setParent(ciscoGroup);

    // ─── 8. OBJECT 5: Syntax / Terminal Code Prism (Frontend & Full-Stack Development) ───
    const codeGroup = new Transform();
    codeGroup.setParent(sceneRoot);

    const boxGeom = new Box(gl, { width: 0.46, height: 0.58, depth: 0.38 });
    const codeMesh = new Mesh(gl, { geometry: boxGeom, program: coreProgram });
    codeMesh.setParent(codeGroup);

    // Outer wireframe framing the code prism
    const codeRingGeom = new Torus(gl, { radius: 0.42, tube: 0.01, radialSegments: 24, tubularSegments: 8 });
    const codeRing = new Mesh(gl, { geometry: codeRingGeom, program: wireProgram });
    codeRing.rotation.set(0.4, 0.3, 0);
    codeRing.setParent(codeGroup);

    // ─── 9. Interconnecting Constellation Network Links (Lines connecting Satellites to Core) ───
    // 4 lines (8 vertices) linking Central Core (0,0,0) to each of the 4 satellites
    const tetherPositions = new Float32Array(4 * 2 * 3);
    const tetherGeom = new Geometry(gl, {
      position: { size: 3, data: tetherPositions }
    });
    const tetherMesh = new Mesh(gl, { mode: gl.LINES, geometry: tetherGeom, program: tetherProgram });
    tetherMesh.setParent(sceneRoot);

    // ─── 10. Dynamic Theme Color Adaptation (Dark & Light Mode) ───
    const applyThemeColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        // Futuristic Obsidian / Bioluminescent Electric Blue
        coreProgram.uniforms.uColorBase.value.set(0.05, 0.11, 0.25);
        coreProgram.uniforms.uColorRim.value.set(0.23, 0.51, 0.96);
        coreProgram.uniforms.uOpacity.value = 0.65;

        wireProgram.uniforms.uColorWire.value.set(0.35, 0.75, 1.0);
        wireProgram.uniforms.uOpacity.value = 0.65;

        nodeProgram.uniforms.uColorNode.value.set(0.45, 0.88, 1.0);
        nodeProgram.uniforms.uOpacity.value = 0.85;

        tetherProgram.uniforms.uColorTether.value.set(0.28, 0.65, 0.98);
        tetherProgram.uniforms.uOpacity.value = 0.32;
      } else {
        // Clean Minimalist Frosted Ice / Architectural Blueprint Azure
        coreProgram.uniforms.uColorBase.value.set(0.72, 0.82, 0.95);
        coreProgram.uniforms.uColorRim.value.set(0.15, 0.39, 0.92);
        coreProgram.uniforms.uOpacity.value = 0.42;

        wireProgram.uniforms.uColorWire.value.set(0.18, 0.42, 0.88);
        wireProgram.uniforms.uOpacity.value = 0.45;

        nodeProgram.uniforms.uColorNode.value.set(0.15, 0.4, 0.95);
        nodeProgram.uniforms.uOpacity.value = 0.75;

        tetherProgram.uniforms.uColorTether.value.set(0.2, 0.45, 0.85);
        tetherProgram.uniforms.uOpacity.value = 0.22;
      }
    };

    applyThemeColors();

    const themeObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'class') {
          applyThemeColors();
        }
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // ─── 11. Viewport Sizing & Resize ───
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
      nodeProgram.uniforms.uPixelRatio.value = renderer.dpr;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // ─── 12. Mouse Inertia & Parallax Input ───
    let mouseTargetX = 0;
    let mouseTargetY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth >= 768) {
        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;
        mouseTargetX = (e.clientX - halfW) / halfW;
        mouseTargetY = (e.clientY - halfH) / halfH;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ─── 13. Smooth Interpolation State ───
    let curX = 0, curY = 0, curZ = 0;
    let curRotX = 0, curRotY = 0, curRotZ = 0;
    let curScale = 1.0;
    let lastTime = performance.now();
    let isVisible = true;

    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const isPortrait = window.innerHeight > window.innerWidth;
    const initialProgress = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const initialWp = getParallaxWaypoint(initialProgress, isPortrait);
    curX = initialWp.x;
    curY = initialWp.y;
    curZ = initialWp.z;
    curRotX = initialWp.rotX;
    curRotY = initialWp.rotY;
    curRotZ = initialWp.rotZ;
    curScale = initialWp.scale;

    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    // ─── 14. Main 60FPS Render & Parallax Loop ───
    const renderLoop = (now: number) => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(renderLoop);

      if (!isVisible) return;

      const dt = Math.min((now - lastTime) * 0.001, 0.1);
      lastTime = now;
      const tSec = now * 0.001;

      // Update shader time uniforms
      nodeProgram.uniforms.uTime.value = tSec;
      tetherProgram.uniforms.uTime.value = tSec;

      // Local Gyroscopic Spin for Central Rings
      ring1Mesh.rotation.y += dt * 0.32;
      ring1Mesh.rotation.x += dt * 0.14;

      ring2Mesh.rotation.z -= dt * 0.28;
      ring2Mesh.rotation.y -= dt * 0.16;

      // ── Satellite 1: Database Canister (Top-Left quadrant) ──
      const dbX = -2.85 + Math.cos(tSec * 0.45) * 0.28;
      const dbY = 1.45 + Math.sin(tSec * 0.5) * 0.22;
      const dbZ = -0.75 + Math.sin(tSec * 0.35) * 0.2;
      dbGroup.position.set(dbX, dbY, dbZ);
      dbGroup.rotation.set(0.35 + Math.sin(tSec * 0.3) * 0.15, tSec * 0.35, -0.2);

      // ── Satellite 2: Cryptographic Octahedron (Top-Right quadrant) ──
      const octX = 2.8 + Math.sin(tSec * 0.4) * 0.3;
      const octY = 1.55 + Math.cos(tSec * 0.38) * 0.25;
      const octZ = -0.65 + Math.cos(tSec * 0.45) * 0.22;
      octaGroup.position.set(octX, octY, octZ);
      octaGroup.rotation.set(tSec * 0.45, tSec * 0.55, tSec * 0.2);

      // ── Satellite 3: Cisco Router Node (Bottom-Left quadrant) ──
      const ciscoX = -2.55 + Math.sin(tSec * 0.35) * 0.25;
      const ciscoY = -1.75 + Math.cos(tSec * 0.42) * 0.2;
      const ciscoZ = -0.55 + Math.sin(tSec * 0.28) * 0.2;
      ciscoGroup.position.set(ciscoX, ciscoY, ciscoZ);
      ciscoGroup.rotation.set(0.4, tSec * 0.38, tSec * 0.25);

      // ── Satellite 4: Syntax / Code Prism (Bottom-Right quadrant) ──
      const codeX = 2.65 + Math.cos(tSec * 0.48) * 0.26;
      const codeY = -1.55 + Math.sin(tSec * 0.36) * 0.22;
      const codeZ = -0.7 + Math.sin(tSec * 0.42) * 0.2;
      codeGroup.position.set(codeX, codeY, codeZ);
      codeGroup.rotation.set(tSec * 0.3, tSec * 0.4, tSec * 0.2);

      // ── Update Constellation Tether Lines ──
      // Line 0: Core -> DB Canister
      tetherPositions[0] = 0; tetherPositions[1] = 0; tetherPositions[2] = 0;
      tetherPositions[3] = dbX; tetherPositions[4] = dbY; tetherPositions[5] = dbZ;

      // Line 1: Core -> Octahedron
      tetherPositions[6] = 0; tetherPositions[7] = 0; tetherPositions[8] = 0;
      tetherPositions[9] = octX; tetherPositions[10] = octY; tetherPositions[11] = octZ;

      // Line 2: Core -> Cisco Router
      tetherPositions[12] = 0; tetherPositions[13] = 0; tetherPositions[14] = 0;
      tetherPositions[15] = ciscoX; tetherPositions[16] = ciscoY; tetherPositions[17] = ciscoZ;

      // Line 3: Core -> Code Prism
      tetherPositions[18] = 0; tetherPositions[19] = 0; tetherPositions[20] = 0;
      tetherPositions[21] = codeX; tetherPositions[22] = codeY; tetherPositions[23] = codeZ;

      tetherGeom.attributes.position.needsUpdate = true;

      // ── Parallax Waypoint & Dynamic Scroll-Down Zoom ──
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Damped scroll velocity tracking
      scrollVelocity += (scrollDelta - scrollVelocity) * 0.12;

      // Tactile zoom impulse: scrolling down pulses a smooth forward zoom-in
      const scrollZoomImpulse = Math.min(0.25, Math.max(-0.06, scrollVelocity * 0.0032));

      const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const scrollProgress = currentScrollY / scrollMax;
      const currentPortrait = window.innerHeight > window.innerWidth;

      const wp = getParallaxWaypoint(scrollProgress, currentPortrait);

      currentMouseX += (mouseTargetX - currentMouseX) * 0.05;
      currentMouseY += (mouseTargetY - currentMouseY) * 0.05;

      const ambientSpinY = (now * 0.00015);
      const ambientSpinX = Math.sin(now * 0.0002) * 0.08;

      const targetX = wp.x + currentMouseX * 0.22;
      const targetY = wp.y - currentMouseY * 0.18;
      const targetZ = wp.z;

      const targetRotX = wp.rotX + ambientSpinX - currentMouseY * 0.32;
      const targetRotY = wp.rotY + ambientSpinY + currentMouseX * 0.38;
      const targetRotZ = wp.rotZ;

      // Combined progressive section zoom + dynamic scroll-down impulse
      const targetScale = wp.scale + scrollZoomImpulse;

      const lerpFactor = reducedMotion ? 0.2 : 0.045;
      curX += (targetX - curX) * lerpFactor;
      curY += (targetY - curY) * lerpFactor;
      curZ += (targetZ - curZ) * lerpFactor;

      curRotX += (targetRotX - curRotX) * lerpFactor;
      curRotY += (targetRotY - curRotY) * lerpFactor;
      curRotZ += (targetRotZ - curRotZ) * lerpFactor;

      curScale += (targetScale - curScale) * lerpFactor;

      sceneRoot.position.set(curX, curY, curZ);
      sceneRoot.rotation.set(curRotX, curRotY, curRotZ);
      sceneRoot.scale.set(curScale, curScale, curScale);

      // Render the unified 3D constellation
      renderer.render({ scene, camera });
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    // ─── 15. Cleanup on Unmount ───
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);

      try {
        if (gl.canvas && gl.canvas.parentElement) {
          gl.canvas.parentElement.removeChild(gl.canvas);
        }
        const loseContextExt = gl.getExtension('WEBGL_lose_context');
        if (loseContextExt) {
          loseContextExt.loseContext();
        }
      } catch (err) {
        // Safe context teardown
      }
    };
  }, [mounted, isLowTier, reducedMotion]);

  if (!mounted || isLowTier) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
      {/* Layer 1: Dot Matrix Grid (Code Matrix blueprint background) */}
      <div
        className="absolute -top-32 -bottom-32 inset-x-0 bg-[radial-gradient(hsla(var(--foreground)/0.12)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] opacity-35"
      />

      {/* Layer 2: Real-time Blender-style 3D Constellation Parallax Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
