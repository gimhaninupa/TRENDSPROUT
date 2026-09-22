import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  RotateCw, Play, Pause, ZoomIn, ZoomOut, Layers, Sun,
  Sparkles, Palette, RefreshCw, Box, Move3d, Compass, Eye
} from "lucide-react";

interface Interactive3DViewerProps {
  artworkUrl?: string;
  mockupUrl?: string | null;
  template: "tshirt" | "hoodie" | "tote" | "pants";
  fabric?: string;
  colorPalette?: string;
  style?: string;
  title?: string;
  isLoading?: boolean;
}

const FABRIC_COLORS = [
  { name: "Onyx Black", hex: "#18181b" },
  { name: "Pure White", hex: "#f8fafc" },
  { name: "Heather Gray", hex: "#64748b" },
  { name: "Royal Navy", hex: "#1e3a8a" },
  { name: "Forest Green", hex: "#14532d" },
  { name: "Crimson Red", hex: "#991b1b" },
  { name: "Lavender", hex: "#a855f7" },
  { name: "Warm Beige", hex: "#d4c5b3" },
];

export function Interactive3DViewer({
  artworkUrl,
  mockupUrl,
  template,
  fabric = "Silk",
  colorPalette = "Jewel Tones",
  style = "Editorial",
  title = "3D Apparel Mockup",
  isLoading = false,
}: Interactive3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  // UI States
  const [selectedColor, setSelectedColor] = useState(FABRIC_COLORS[0].hex); // Onyx Black
  const [isAutoSpin, setIsAutoSpin] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [lightingMode, setLightingMode] = useState<"studio" | "runway" | "cyber">("studio");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [currentYawDeg, setCurrentYawDeg] = useState(0);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const garmentGroupRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const lightsRef = useRef<{
    keyLight?: THREE.DirectionalLight;
    fillLight?: THREE.DirectionalLight;
    rimLight?: THREE.SpotLight;
    ambLight?: THREE.AmbientLight;
  }>({});

  // 1. Procedural Fabric Weave Bump Texture
  const createFabricBumpMap = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = "#a8a8a8";
      for (let x = 0; x < 128; x += 4) {
        for (let y = 0; y < 128; y += 4) {
          if ((x + y) % 8 === 0) ctx.fillRect(x, y, 2, 2);
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(32, 32);
    return texture;
  };

  // 2. Continuous Sculpted Mannequin Form
  const buildMannequinForm = (group: THREE.Group) => {
    // Sculpted Form Material (Matte Studio Dark Carbon)
    const mannequinMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.65,
      metalness: 0.2,
    });

    // Neck & Upper Chest Core
    const neckGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.9, 32);
    const neckMesh = new THREE.Mesh(neckGeo, mannequinMat);
    neckMesh.position.set(0, 1.35, 0);
    group.add(neckMesh);

    // Neck Wooden Cap
    const capGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.08, 32);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, metalness: 0.7, roughness: 0.3 });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.set(0, 1.8, 0);
    group.add(capMesh);

    // Studio Pedestal Pole & Weighted Base
    const poleGeo = new THREE.CylinderGeometry(0.035, 0.035, 4.4, 16);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.85, roughness: 0.2 });
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.position.y = -0.8;
    group.add(poleMesh);

    const baseGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.12, 36);
    const baseMesh = new THREE.Mesh(baseGeo, poleMat);
    baseMesh.position.y = -2.45;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);
  };

  // 3. Continuous Unified 3D T-Shirt Mesh with Integrated Sleeves & Collar
  const createSeamlessTShirtGeometry = () => {
    const geo = new THREE.BufferGeometry();
    const rows = 56;
    const cols = 64;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let r = 0; r <= rows; r++) {
      const v = r / rows;
      // y ranges from top collar (1.25) to bottom hem (-1.25)
      const y = 1.25 - v * 2.5;

      for (let c = 0; c <= cols; c++) {
        const u = c / cols;
        const angle = u * Math.PI * 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        let rx = 0.94;
        let rz = 0.52;
        let yPos = y;

        // Shoulder & Sleeve Flare (Upper 35% of Garment)
        if (y > 0.45) {
          const t = (y - 0.45) / 0.8; // 0 to 1 at shoulders
          // Widen along X for natural seamless sleeve wings
          const sleeveFactor = Math.pow(Math.abs(cosA), 1.6);
          rx += t * (1.15 * sleeveFactor);
          rz *= (1 - t * 0.22);

          // Sleeve downward slope along arm angle
          yPos -= t * sleeveFactor * 0.42;

          // Collar dip (Front neckline scoop)
          if (sinA > 0.5 && y > 0.9) {
            const scoop = (sinA - 0.5) / 0.5;
            yPos -= scoop * 0.28;
            rz *= (1 - scoop * 0.35);
          }
        } 
        // Waist taper
        else if (y > -0.6) {
          const t = (y + 0.6) / 1.05;
          rx = 0.88 + t * 0.06;
          rz = 0.46 + t * 0.06;
        } 
        // Bottom hem flare
        else {
          const t = (-0.6 - y) / 0.65;
          rx = 0.88 + t * 0.08;
          rz = 0.46 + t * 0.04;
        }

        // Soft organic cloth ripples and creases
        const ripple = Math.sin(y * 10 + angle * 4) * 0.012 + Math.cos(y * 6) * 0.008;
        const xPos = cosA * rx + cosA * ripple;
        const zPos = sinA * rz + sinA * ripple;

        positions.push(xPos, yPos, zPos);
        uvs.push(u, v);
      }
    }

    // Indices
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p1 = r * (cols + 1) + c;
        const p2 = p1 + 1;
        const p3 = (r + 1) * (cols + 1) + c;
        const p4 = p3 + 1;

        indices.push(p1, p3, p2);
        indices.push(p2, p3, p4);
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  };

  // 4. Build Complete 3D Garment Mesh Tree
  const buildComplete3DGarment = (scene: THREE.Scene, type: string) => {
    if (garmentGroupRef.current) {
      scene.remove(garmentGroupRef.current);
    }

    const group = new THREE.Group();
    garmentGroupRef.current = group;
    materialsRef.current = [];

    const fabricBump = createFabricBumpMap();
    const isSilk = fabric.toLowerCase().includes("silk");

    // Main Cloth Material
    const mainClothMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedColor),
      roughness: isSilk ? 0.35 : 0.8,
      metalness: isSilk ? 0.3 : 0.05,
      bumpMap: fabricBump,
      bumpScale: 0.018,
      wireframe: showWireframe,
      side: THREE.DoubleSide,
    });
    materialsRef.current.push(mainClothMat);

    // Ribbed Collar / Seam Material
    const ribMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(selectedColor).multiplyScalar(0.9),
      roughness: 0.9,
      wireframe: showWireframe,
      side: THREE.DoubleSide,
    });
    materialsRef.current.push(ribMat);

    // Add Stand & Mannequin
    buildMannequinForm(group);

    // ─── T-SHIRT ─────────────────────────────────────────────────────────────
    if (type === "tshirt") {
      const shirtGeo = createSeamlessTShirtGeometry();
      const shirtMesh = new THREE.Mesh(shirtGeo, mainClothMat);
      shirtMesh.castShadow = true;
      shirtMesh.receiveShadow = true;
      group.add(shirtMesh);

      // Tailored Collar Ribbing Trim
      const collarGeo = new THREE.TorusGeometry(0.42, 0.038, 16, 48);
      const collarMesh = new THREE.Mesh(collarGeo, ribMat);
      collarMesh.position.set(0, 1.15, 0.08);
      collarMesh.rotation.x = Math.PI / 2.35;
      group.add(collarMesh);

      // Bottom Hem Trim
      const hemGeo = new THREE.TorusGeometry(0.94, 0.025, 12, 48);
      const hemMesh = new THREE.Mesh(hemGeo, ribMat);
      hemMesh.position.set(0, -1.24, 0);
      hemMesh.rotation.x = Math.PI / 2;
      group.add(hemMesh);
    }
    // ─── HOODIE ──────────────────────────────────────────────────────────────
    else if (type === "hoodie") {
      const hoodieTorsoGeo = new THREE.CylinderGeometry(1.05, 1.15, 2.45, 48, 20);
      // Add soft organic bulge
      const pos = hoodieTorsoGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const z = pos.getZ(i);
        if (z > 0 && y > -0.4 && y < 0.6) {
          pos.setZ(i, z + Math.sin((y + 0.4) * Math.PI) * 0.12);
        }
      }
      hoodieTorsoGeo.computeVertexNormals();

      const hoodieMesh = new THREE.Mesh(hoodieTorsoGeo, mainClothMat);
      hoodieMesh.castShadow = true;
      group.add(hoodieMesh);

      // Drop Sleeves
      const sleeveGeo = new THREE.CylinderGeometry(0.44, 0.32, 1.85, 32);
      const leftSleeve = new THREE.Mesh(sleeveGeo, mainClothMat);
      leftSleeve.position.set(-1.18, 0.25, 0);
      leftSleeve.rotation.z = Math.PI / 5.2;
      leftSleeve.castShadow = true;
      group.add(leftSleeve);

      const rightSleeve = new THREE.Mesh(sleeveGeo, mainClothMat);
      rightSleeve.position.set(1.18, 0.25, 0);
      rightSleeve.rotation.z = -Math.PI / 5.2;
      rightSleeve.castShadow = true;
      group.add(rightSleeve);

      // Sculpted Hood Drape
      const hoodGeo = new THREE.SphereGeometry(0.82, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.72);
      const hoodMesh = new THREE.Mesh(hoodGeo, mainClothMat);
      hoodMesh.position.set(0, 1.35, -0.22);
      hoodMesh.rotation.x = 0.35;
      hoodMesh.castShadow = true;
      group.add(hoodMesh);

      // Kangaroo Pouch Pocket
      const pocketGeo = new THREE.BoxGeometry(1.2, 0.7, 0.24, 16, 8, 4);
      const pocketMesh = new THREE.Mesh(pocketGeo, mainClothMat);
      pocketMesh.position.set(0, -0.38, 1.08);
      pocketMesh.rotation.x = -0.05;
      pocketMesh.castShadow = true;
      group.add(pocketMesh);

      // Waistband Rib
      const waistGeo = new THREE.CylinderGeometry(1.16, 1.14, 0.25, 48);
      const waistMesh = new THREE.Mesh(waistGeo, ribMat);
      waistMesh.position.set(0, -1.22, 0);
      group.add(waistMesh);
    }
    // ─── TOTE BAG ────────────────────────────────────────────────────────────
    else if (type === "tote") {
      const bagGeo = new THREE.BoxGeometry(1.8, 2.2, 0.65, 32, 32, 16);
      const bagMesh = new THREE.Mesh(bagGeo, mainClothMat);
      bagMesh.position.set(0, -0.1, 0);
      bagMesh.castShadow = true;
      group.add(bagMesh);

      // Shoulder Straps
      const strapGeo = new THREE.TorusGeometry(0.72, 0.05, 12, 36, Math.PI);
      const strapLeft = new THREE.Mesh(strapGeo, ribMat);
      strapLeft.position.set(0, 1.0, 0.22);
      strapLeft.rotation.z = Math.PI;
      group.add(strapLeft);

      const strapRight = new THREE.Mesh(strapGeo, ribMat);
      strapRight.position.set(0, 1.0, -0.22);
      strapRight.rotation.z = Math.PI;
      group.add(strapRight);
    }
    // ─── TROUSERS ────────────────────────────────────────────────────────────
    else if (type === "pants") {
      const waistGeo = new THREE.CylinderGeometry(0.98, 0.94, 0.45, 36);
      const waistMesh = new THREE.Mesh(waistGeo, mainClothMat);
      waistMesh.position.set(0, 1.0, 0);
      group.add(waistMesh);

      const legGeo = new THREE.CylinderGeometry(0.42, 0.32, 2.5, 32);
      const leftLeg = new THREE.Mesh(legGeo, mainClothMat);
      leftLeg.position.set(-0.46, -0.42, 0);
      leftLeg.castShadow = true;
      group.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, mainClothMat);
      rightLeg.position.set(0.46, -0.42, 0);
      rightLeg.castShadow = true;
      group.add(rightLeg);
    }

    // ─── PHOTOREALISTIC EMBLEM & DECAL PROJECTION ─────────────────────────────
    const decalGeo = new THREE.PlaneGeometry(1.2, 1.4, 24, 24);
    // Smoothly curve decal along torso chest curvature
    const decalPos = decalGeo.attributes.position;
    for (let i = 0; i < decalPos.count; i++) {
      const x = decalPos.getX(i);
      decalPos.setZ(i, -Math.pow(x, 2) * 0.12);
    }
    decalGeo.computeVertexNormals();

    const decalMat = new THREE.MeshStandardMaterial({
      transparent: true,
      roughness: isSilk ? 0.38 : 0.75,
      metalness: 0.05,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      side: THREE.FrontSide,
    });

    const decalMesh = new THREE.Mesh(decalGeo, decalMat);
    if (type === "tote") {
      decalMesh.position.set(0, -0.1, 0.34);
      decalMesh.scale.set(1.1, 1.2, 1);
    } else if (type === "pants") {
      decalMesh.position.set(0.46, -0.1, 0.36);
      decalMesh.scale.set(0.6, 0.7, 1);
    } else {
      decalMesh.position.set(0, 0.12, 0.54);
    }
    group.add(decalMesh);

    // Map the Generated AI Artwork onto the 3D Cloth
    const imgToLoad = artworkUrl || mockupUrl;
    if (imgToLoad) {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin("anonymous");
      loader.load(
        imgToLoad,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          decalMat.map = tex;
          decalMat.needsUpdate = true;
        },
        undefined,
        (err) => console.warn("3D Decal Texture notice:", err)
      );
    }

    scene.add(group);
  };

  // 5. Initialize Three.js Viewport
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 5.2);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    // OrbitControls for smooth 360 rotation & zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = isAutoSpin;
    controls.autoRotateSpeed = 2.0;
    controls.minDistance = 3.2;
    controls.maxDistance = 7.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.2; // Keep camera above floor
    controls.minPolarAngle = Math.PI / 4;
    controlsRef.current = controls;

    // Studio Lights
    const ambLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(4, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe9d5ff, 1.2);
    fillLight.position.set(-4, 3, -3);
    scene.add(fillLight);

    const rimLight = new THREE.SpotLight(0xa855f7, 2.8);
    rimLight.position.set(0, 6, -4);
    rimLight.angle = Math.PI / 4;
    scene.add(rimLight);

    lightsRef.current = { ambLight, keyLight, fillLight, rimLight };

    // Build the 3D Cloth
    buildComplete3DGarment(scene, template);

    // Render Loop
    let animId: number;
    const animate = () => {
      controls.autoRotate = isAutoSpin;
      controls.update();

      // Compute current yaw degree from camera azimuth
      const angle = controls.getAzimuthalAngle();
      const deg = Math.round((((angle * 180) / Math.PI) % 360 + 360) % 360);
      setCurrentYawDeg(deg);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
    };
  }, [template]);

  // Update Color
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      mat.color.set(selectedColor);
      mat.needsUpdate = true;
    });
  }, [selectedColor]);

  // Update Wireframe
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      mat.wireframe = showWireframe;
      mat.needsUpdate = true;
    });
  }, [showWireframe]);

  // Update Lighting Atmosphere
  useEffect(() => {
    const { keyLight, fillLight, rimLight, ambLight } = lightsRef.current;
    if (!keyLight || !fillLight || !rimLight || !ambLight) return;

    if (lightingMode === "runway") {
      keyLight.color.set(0xffffff);
      fillLight.color.set(0xec4899);
      fillLight.intensity = 1.8;
      rimLight.color.set(0xa855f7);
      rimLight.intensity = 3.2;
      ambLight.intensity = 0.9;
    } else if (lightingMode === "cyber") {
      keyLight.color.set(0x06b6d4);
      fillLight.color.set(0x3b82f6);
      fillLight.intensity = 2.0;
      rimLight.color.set(0x10b981);
      rimLight.intensity = 3.2;
      ambLight.intensity = 0.8;
    } else {
      keyLight.color.set(0xffffff);
      fillLight.color.set(0xf1f5f9);
      fillLight.intensity = 1.2;
      rimLight.color.set(0x9333ea);
      rimLight.intensity = 2.4;
      ambLight.intensity = 1.3;
    }
  }, [lightingMode]);

  const setPresetAngle = (deg: number) => {
    if (!controlsRef.current || !cameraRef.current) return;
    setHasInteracted(true);
    setIsAutoSpin(false);

    const rad = (deg * Math.PI) / 180;
    const distance = 5.2;
    cameraRef.current.position.x = Math.sin(rad) * distance;
    cameraRef.current.position.z = Math.cos(rad) * distance;
    cameraRef.current.position.y = 0.3;
    cameraRef.current.lookAt(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <div
      className="relative w-full aspect-[4/5] bg-gradient-to-b from-gray-950 via-gray-900 to-black select-none overflow-hidden flex flex-col justify-between rounded-t-xl"
      onPointerDown={() => {
        setHasInteracted(true);
        setIsAutoSpin(false);
      }}
    >
      {/* Three.js 3D Canvas Mounting Surface */}
      <div ref={mountRef} className="absolute inset-0 z-10 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Badge & Studio Controls */}
      <div className="relative z-20 p-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-purple-950/90 text-purple-200 border border-purple-500/40 backdrop-blur-md shadow-lg shadow-purple-950/50">
            <Box size={13} className="text-purple-400" />
            3D Garment Mesh • {template.toUpperCase()}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-800/80 text-gray-300 border border-gray-700/60 backdrop-blur-sm">
            {currentYawDeg}° Orbit
          </span>
        </div>

        {/* Wireframe & Lighting Atmosphere Toggles */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setShowWireframe(!showWireframe)}
            title="Toggle 3D Polygon Wireframe Mesh"
            className={`p-1.5 rounded-lg text-xs font-semibold backdrop-blur-md transition-all cursor-pointer ${
              showWireframe
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/40"
                : "bg-gray-800/80 text-gray-300 hover:text-white border border-gray-700/50"
            }`}
          >
            <Layers size={14} />
          </button>

          <button
            onClick={() =>
              setLightingMode(
                lightingMode === "studio" ? "runway" : lightingMode === "runway" ? "cyber" : "studio"
              )
            }
            title="Switch Studio Lighting Atmosphere"
            className="p-1.5 rounded-lg text-xs bg-gray-800/80 hover:bg-gray-700/80 text-gray-300 hover:text-white border border-gray-700/50 backdrop-blur-md transition-all cursor-pointer"
          >
            <Sun
              size={14}
              className={
                lightingMode === "cyber"
                  ? "text-cyan-400"
                  : lightingMode === "runway"
                  ? "text-pink-400"
                  : "text-amber-400"
              }
            />
          </button>
        </div>
      </div>

      {/* Floating "Drag cursor to rotate 360°" helper */}
      {!hasInteracted && !isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 animate-pulse">
          <div className="px-4 py-2 rounded-full bg-black/85 backdrop-blur-md border border-purple-500/40 text-white text-xs font-semibold shadow-2xl flex items-center gap-2">
            <Move3d size={16} className="text-purple-400" />
            Drag with cursor to rotate 360° around the 3D Cloth
          </div>
        </div>
      )}

      {/* Live 3D Fabric Color Palette Customizer */}
      <div className="relative z-20 px-4 py-2 flex items-center justify-between gap-2 pointer-events-auto bg-black/50 backdrop-blur-md border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <Palette size={13} className="text-purple-400" />
          <span className="text-[11px] font-semibold text-gray-300">Cloth Color:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {FABRIC_COLORS.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedColor(c.hex)}
              title={c.name}
              style={{ backgroundColor: c.hex }}
              className={`w-5 h-5 rounded-full transition-transform cursor-pointer border ${
                selectedColor === c.hex
                  ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-black scale-110 border-white"
                  : "border-gray-600 hover:scale-105"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Interactive Toolbar */}
      <div className="relative z-20 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pointer-events-auto">
        {/* Quick Angle Presets */}
        <div className="flex items-center gap-1 bg-gray-900/90 p-1 rounded-xl border border-gray-800 backdrop-blur-md">
          <button
            onClick={() => setPresetAngle(0)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              currentYawDeg < 25 || currentYawDeg > 335
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Front (0°)
          </button>
          <button
            onClick={() => setPresetAngle(45)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              currentYawDeg >= 30 && currentYawDeg <= 60
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            45°
          </button>
          <button
            onClick={() => setPresetAngle(90)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              currentYawDeg >= 75 && currentYawDeg <= 105
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Side Profile
          </button>
          <button
            onClick={() => setPresetAngle(180)}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              currentYawDeg >= 165 && currentYawDeg <= 195
                ? "bg-purple-600 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Back (180°)
          </button>
        </div>

        {/* Play/Pause Orbit & Zoom controls */}
        <div className="flex items-center gap-1.5 bg-gray-900/90 p-1 rounded-xl border border-gray-800 backdrop-blur-md">
          <button
            onClick={() => setIsAutoSpin(!isAutoSpin)}
            title={isAutoSpin ? "Pause Auto-Turntable" : "Play 360° Auto Turntable"}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isAutoSpin ? "bg-purple-600 text-white shadow-sm" : "text-gray-400 hover:text-white"
            }`}
          >
            {isAutoSpin ? <Pause size={13} /> : <Play size={13} />}
          </button>

          <button
            onClick={() => {
              if (controlsRef.current && cameraRef.current) {
                cameraRef.current.position.multiplyScalar(0.88);
                controlsRef.current.update();
              }
            }}
            title="Zoom In"
            className="p-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
          >
            <ZoomIn size={13} />
          </button>

          <button
            onClick={() => {
              if (controlsRef.current && cameraRef.current) {
                cameraRef.current.position.multiplyScalar(1.14);
                controlsRef.current.update();
              }
            }}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
          >
            <ZoomOut size={13} />
          </button>

          <button
            onClick={() => setPresetAngle(0)}
            title="Reset 3D View"
            className="p-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-all cursor-pointer"
          >
            <RotateCw size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
