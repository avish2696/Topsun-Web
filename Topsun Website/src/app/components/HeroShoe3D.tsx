import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const VIEWS: Record<string, { azimuth: number; polar: number; distance: number }> = {
  side:    { azimuth: Math.PI / 2,  polar: Math.PI * 0.42, distance: 8.5 },
  quarter: { azimuth: Math.PI * 0.7, polar: Math.PI * 0.38, distance: 8.2 },
  heel:    { azimuth: -Math.PI / 2, polar: Math.PI * 0.42, distance: 8.5 },
  top:     { azimuth: Math.PI / 2,  polar: Math.PI * 0.18, distance: 7.5 },
};

export default function HeroShoe3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [activeView, setActiveView] = useState<string>("side");
  const [webGLError, setWebGLError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let cam: THREE.PerspectiveCamera | null = null;
    let shoe: THREE.Object3D | null = null;
    let animId = 0;
    let isDragging = false;
    let resumeSpinTimer: ReturnType<typeof setTimeout> | null = null;
    let prevMouse = { x: 0, y: 0 };
    let azimuth = VIEWS.side.azimuth;
    let polar = VIEWS.side.polar;
    let baseDistance = VIEWS.side.distance;
    let distance = baseDistance;
    let targetAzimuth = azimuth;
    let targetPolar = polar;
    let targetDistance = distance;
    let loadedOK = false;

    // Helper to calculate responsive distance based on container aspect ratio
    const getResponsiveDistance = (aspect: number, baseDist: number) => {
      // Calibrated for crisp, fill-screen mobile viewing without clipping
      if (aspect < 0.65) return baseDist * 1.22;
      if (aspect < 0.85) return baseDist * 1.15;
      if (aspect < 1.05) return baseDist * 1.08;
      if (aspect < 1.25) return baseDist * 1.02;
      return baseDist;
    };

    // Helper to get safe container size
    const getSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.max(container.clientWidth, rect.width, 280);
      const h = Math.max(container.clientHeight, rect.height, 320);
      return { width: w, height: h };
    };

    try {
      const { width, height } = getSize();
      const aspect = width / height;

      // ── Renderer ─────────────────────────────────────────────────────
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      if ('outputColorSpace' in renderer) {
        (renderer as any).outputColorSpace = THREE.SRGBColorSpace;
      }
      
      const canvas = renderer.domElement;
      canvas.style.position = "absolute";
      canvas.style.inset = "0";
      canvas.style.display = "block";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.touchAction = "none"; // Critical for mobile: prevent page scrolling on touch drag
      canvas.style.cursor = "grab";
      container.appendChild(canvas);

      // ── Scene & Camera ────────────────────────────────────────────────
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(34, aspect, 0.1, 200);

      distance = getResponsiveDistance(aspect, baseDistance);
      targetDistance = distance;

      // ── Lighting ──────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.65));

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
      keyLight.position.set(6, 10, 7);
      keyLight.castShadow = true;
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xaaccff, 1.2);
      fillLight.position.set(-6, 3, 5);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0x009fe3, 1.0);
      rimLight.position.set(0, -3, -8);
      scene.add(rimLight);

      const topLight = new THREE.PointLight(0xffffff, 1.0, 30);
      topLight.position.set(0, 10, 0);
      scene.add(topLight);

      // Soft ground shadow plane
      const gnd = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.ShadowMaterial({ opacity: 0.22 })
      );
      gnd.rotation.x = -Math.PI / 2;
      gnd.position.y = -2.1;
      gnd.receiveShadow = true;
      scene.add(gnd);

      // ── Load Model ────────────────────────────────────────────────────
      const loader = new GLTFLoader();
      loader.load(
        "/shoe-model.glb",
        (gltf) => {
          try {
            shoe = gltf.scene;

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(shoe);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            
            // Adjust scale slightly smaller for narrow mobile screens for comfortable padding
            const isSmallScreen = window.innerWidth < 640;
            const targetDim = isSmallScreen ? 3.1 : 3.5;
            const scale = targetDim / maxDim;

            shoe.scale.setScalar(scale);
            shoe.position.sub(center.multiplyScalar(scale));
            shoe.position.y += 0.2;

            // Enable shadows
            shoe.traverse((child: any) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });

            if (scene) scene.add(shoe);
            loadedOK = true;
            setModelLoaded(true);
          } catch (err) {
            console.error("Error configuring loaded GLB model:", err);
            shoe = buildFallbackShoe();
            if (scene) scene.add(shoe);
            loadedOK = true;
            setModelLoaded(true);
          }
        },
        undefined,
        (err) => {
          console.warn("GLB load failed, rendering fallback 3D model:", err);
          shoe = buildFallbackShoe();
          if (scene) scene.add(shoe);
          loadedOK = true;
          setModelLoaded(true);
        }
      );

      // ── Camera Position Calculation ───────────────────────────────────
      const updateCamera = () => {
        if (!cam) return;
        const x = distance * Math.sin(polar) * Math.cos(azimuth);
        const y = distance * Math.cos(polar);
        const z = distance * Math.sin(polar) * Math.sin(azimuth);
        cam.position.set(x, y, z);
        cam.lookAt(0, 0.2, 0);
      };

      // ── Animation Loop ────────────────────────────────────────────────
      const animate = () => {
        animId = requestAnimationFrame(animate);

        // Smooth continuous 360 spin
        if (loadedOK) {
          targetAzimuth += 0.012;
        }

        // Smooth easing towards target
        azimuth += (targetAzimuth - azimuth) * 0.08;
        polar += (targetPolar - polar) * 0.08;
        distance += (targetDistance - distance) * 0.08;

        updateCamera();
        if (renderer && scene && cam) {
          renderer.render(scene, cam);
        }
      };

      animate();

      // ── Resize Observer & Window Resize ───────────────────────────────
      const handleResize = () => {
        if (!renderer || !cam || !container) return;
        const { width: newW, height: newH } = getSize();
        const newAspect = newW / newH;

        cam.aspect = newAspect;
        cam.updateProjectionMatrix();

        renderer.setSize(newW, newH);

        // Re-scale distance responsively
        targetDistance = getResponsiveDistance(newAspect, baseDistance);
      };

      window.addEventListener("resize", handleResize);

      const ro = new ResizeObserver(() => {
        handleResize();
      });
      ro.observe(container);

      // ── Mouse Drag Controls ───────────────────────────────────────────
      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        setHasInteracted(true);
        if (resumeSpinTimer) clearTimeout(resumeSpinTimer);
        prevMouse = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = "grabbing";
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        targetAzimuth += dx * 0.008;
        targetPolar = Math.max(0.08, Math.min(Math.PI * 0.88, targetPolar - dy * 0.006));
        prevMouse = { x: e.clientX, y: e.clientY };
      };

      const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        canvas.style.cursor = "grab";
        resumeSpinTimer = setTimeout(() => {
          targetPolar = VIEWS.side.polar;
        }, 2500);
      };

      // ── Touch Controls for Mobile ─────────────────────────────────────
      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        isDragging = true;
        setHasInteracted(true);
        if (resumeSpinTimer) clearTimeout(resumeSpinTimer);
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      };

      const onTouchMove = (e: TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        // Prevent default browser swipe gestures when interacting with 3D model
        e.preventDefault();
        const dx = e.touches[0].clientX - prevMouse.x;
        const dy = e.touches[0].clientY - prevMouse.y;
        targetAzimuth += dx * 0.009;
        targetPolar = Math.max(0.08, Math.min(Math.PI * 0.88, targetPolar - dy * 0.007));
        prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      };

      const onTouchEnd = () => {
        isDragging = false;
        resumeSpinTimer = setTimeout(() => {
          targetPolar = VIEWS.side.polar;
        }, 2500);
      };

      canvas.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);

      canvas.addEventListener("touchstart", onTouchStart, { passive: false });
      canvas.addEventListener("touchmove", onTouchMove, { passive: false });
      canvas.addEventListener("touchend", onTouchEnd);
      canvas.addEventListener("touchcancel", onTouchEnd);

      // Save view switch handler on container for dot buttons
      (container as any).__switchView = (v: string) => {
        const preset = VIEWS[v];
        if (!preset) return;
        baseDistance = preset.distance;
        targetPolar = preset.polar;
        const { width: w, height: h } = getSize();
        targetDistance = getResponsiveDistance(w / h, preset.distance);
        setActiveView(v);
        setHasInteracted(true);
      };

      return () => {
        cancelAnimationFrame(animId);
        if (resumeSpinTimer) clearTimeout(resumeSpinTimer);
        window.removeEventListener("resize", handleResize);
        ro.disconnect();
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);

        canvas.removeEventListener("mousedown", onMouseDown);
        canvas.removeEventListener("touchstart", onTouchStart);
        canvas.removeEventListener("touchmove", onTouchMove);
        canvas.removeEventListener("touchend", onTouchEnd);
        canvas.removeEventListener("touchcancel", onTouchEnd);

        if (renderer) {
          renderer.dispose();
          if (container.contains(canvas)) {
            container.removeChild(canvas);
          }
        }
      };
    } catch (err) {
      console.error("Failed to initialize WebGL 3D scene:", err);
      setWebGLError(true);
    }
  }, []);

  const handleDotClick = (viewKey: string) => {
    if (containerRef.current && (containerRef.current as any).__switchView) {
      (containerRef.current as any).__switchView(viewKey);
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* Canvas container */}
      <div
        ref={containerRef}
        className="w-full h-full relative flex items-center justify-center"
        style={{ touchAction: "none" }}
      >
        {/* Loading overlay */}
        {!modelLoaded && !webGLError && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3.5 pointer-events-none transition-opacity duration-500"
          >
            <p className="text-[10px] sm:text-xs tracking-[0.35em] text-white/50 uppercase font-mono">
              Loading 3D Model
            </p>
            <div className="w-36 sm:w-44 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#009FE3] to-sky-300 w-3/4 rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* WebGL Error / Fallback Card */}
        {webGLError && (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-zinc-900/60 rounded-3xl border border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-[#009FE3]/15 border border-[#009FE3]/30 flex items-center justify-center text-[#009FE3] mb-3">
              <span className="text-2xl font-black">3D</span>
            </div>
            <p className="text-sm font-bold text-white uppercase tracking-wider">TOPSUN Nitro Glide 2026</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs">Interactive 3D model optimized for high-performance mobile GPUs.</p>
          </div>
        )}

        {/* View preset angle dots — left side */}
        <div className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2.5 sm:gap-3 items-center bg-black/30 backdrop-blur-md px-1.5 sm:px-2 py-3 rounded-full border border-white/10 shadow-lg">
          <p className="text-[7px] sm:text-[8px] tracking-[0.25em] text-white/40 uppercase [writing-mode:vertical-rl] mb-1 font-mono">
            View
          </p>
          {(["side", "quarter", "heel", "top"] as const).map((v, i) => (
            <button
              key={v}
              onClick={() => handleDotClick(v)}
              title={["Side Profile", "¾ Front", "Heel", "Top"][i]}
              aria-label={`View ${["Side Profile", "¾ Front", "Heel", "Top"][i]}`}
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeView === v
                  ? "bg-[#009FE3] ring-2 ring-white/60 scale-125 shadow-[0_0_10px_#009FE3]"
                  : "bg-white/35 hover:bg-white/70 hover:scale-110"
              }`}
            />
          ))}
        </div>

        {/* Mobile Swipe / Drag Hint Badge */}
        {!hasInteracted && modelLoaded && (
          <div className="absolute bottom-3 sm:bottom-4 inset-x-0 mx-auto w-fit z-20 pointer-events-none animate-bounce">
            <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/90 text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-xl">
              <span className="text-[#009FE3]">⟳</span>
              <span>Drag to rotate 360°</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Fallback procedural shoe (if GLB model fails to load) ───────────────────
function buildFallbackShoe() {
  const group = new THREE.Group();
  const mkMat = (col: number, rough: number, metal: number) =>
    new THREE.MeshStandardMaterial({ color: col, roughness: rough, metalness: metal });

  // Sole
  const sole = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.25, 0.75), mkMat(0x111111, 0.6, 0.2));
  sole.position.y = -0.6;
  group.add(sole);

  // Midsole
  const mid = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.2, 0.7), mkMat(0xffffff, 0.8, 0.0));
  mid.position.y = -0.35;
  group.add(mid);

  // Upper body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.3, 0.55, 16),
    mkMat(0x009fe3, 0.65, 0.1)
  );
  body.position.set(-0.2, 0.1, 0);
  body.rotation.z = -0.15;
  body.scale.set(2.2, 1, 1.1);
  group.add(body);

  // Toe cap
  const toe = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 12),
    mkMat(0x009fe3, 0.65, 0.1)
  );
  toe.position.set(0.85, 0.05, 0);
  toe.scale.set(1, 0.7, 0.85);
  group.add(toe);

  group.rotation.y = Math.PI * 0.1;
  return group;
}
