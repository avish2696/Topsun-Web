import { useEffect, useRef } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Declare THREE on window for CDN load
declare global {
  interface Window {
    THREE: any;
  }
}

const VIEWS: Record<string, { azimuth: number; polar: number; distance: number }> = {
  side:    { azimuth: Math.PI / 2,  polar: Math.PI * 0.42, distance: 8.5 },
  quarter: { azimuth: Math.PI * 0.7, polar: Math.PI * 0.38, distance: 8.2 },
  heel:    { azimuth: -Math.PI / 2, polar: Math.PI * 0.42, distance: 8.5 },
  top:     { azimuth: Math.PI / 2,  polar: Math.PI * 0.18, distance: 7.5 },
};

export default function HeroShoe3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: any, scene: any, cam: any, shoe: any, animId = 0;
    let isDragging = false;
    let isUserDragging = false;
    let resumeSpinTimer: ReturnType<typeof setTimeout> | null = null;
    let prevMouse = { x: 0, y: 0 };
    let azimuth = VIEWS.side.azimuth;
    let polar = VIEWS.side.polar;
    let distance = VIEWS.side.distance;
    let targetAzimuth = azimuth;
    let targetPolar = polar;
    let targetDistance = distance;
    let loadedOK = false;

    // ── Load THREE + GLTFLoader from CDN ───────────────────────────────
    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => resolve();
        s.onerror = reject;
        document.head.appendChild(s);
      });

    async function init() {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");
        
        // Verify THREE loaded successfully
        if (!window.THREE) {
          throw new Error("THREE.js failed to load from CDN");
        }
        
        await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js");
        
        // Verify GLTFLoader is available
        if (!window.THREE.GLTFLoader) {
          throw new Error("GLTFLoader failed to load from CDN");
        }
      } catch (err) {
        console.error("Failed to load Three.js libraries:", err);
        // Show error in loading overlay and use fallback
        const loading = container.querySelector(".glb-loading") as HTMLElement;
        if (loading) {
          loading.innerHTML = '<p style="color: rgba(255,255,255,0.5);">Using fallback 3D viewer...</p>';
          loading.style.opacity = "0";
        }
      }

      const THREE = window.THREE;

      // ── Renderer ─────────────────────────────────────────────────────
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputEncoding = THREE.sRGBEncoding;
      container.appendChild(renderer.domElement);

      // ── Scene & Camera ────────────────────────────────────────────────
      scene = new THREE.Scene();
      cam = new THREE.PerspectiveCamera(34, container.clientWidth / container.clientHeight, 0.1, 200);

      // ── Lights ────────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0xffffff, 0.55));

      const key = new THREE.DirectionalLight(0xffffff, 2.5);
      key.position.set(6, 10, 7);
      key.castShadow = true;
      scene.add(key);

      const fill = new THREE.DirectionalLight(0xaaccff, 1.0);
      fill.position.set(-6, 3, 5);
      scene.add(fill);

      const rim = new THREE.DirectionalLight(0x88ffcc, 0.8);
      rim.position.set(0, -3, -8);
      scene.add(rim);

      scene.add(new THREE.PointLight(0xffffff, 1.0, 30).position.set(0, 10, 0) && new THREE.PointLight(0xffffff, 1.0, 30));

      // Shadow ground
      const gnd = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 30),
        new THREE.ShadowMaterial({ opacity: 0.18 })
      );
      gnd.rotation.x = -Math.PI / 2;
      gnd.position.y = -2.2;
      gnd.receiveShadow = true;
      scene.add(gnd);

      // ── Load GLB model ────────────────────────────────────────────────
      const loader = new THREE.GLTFLoader();
      loader.load(
        "/shoe-model.glb",
        (gltf: any) => {
          try {
            shoe = gltf.scene;

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(shoe);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3.5 / maxDim;
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

            scene.add(shoe);
            loadedOK = true;

            // Hide loading overlay
            const loading = container.querySelector(".glb-loading") as HTMLElement;
            if (loading) loading.style.opacity = "0";
            setTimeout(() => {
              if (loading) loading.style.display = "none";
            }, 600);
          } catch (err) {
            console.error("Error processing loaded GLB model:", err);
            // Fall back to procedural shoe
            shoe = buildFallbackShoe(THREE);
            scene.add(shoe);
            loadedOK = true;
          }
        },
        (_: any) => { /* progress */ },
        (err: any) => {
          // If GLB fails, show fallback mesh
          console.error("Error loading GLB model:", err);
          shoe = buildFallbackShoe(THREE);
          scene.add(shoe);
          loadedOK = true;
          const loading = container.querySelector(".glb-loading") as HTMLElement;
          if (loading) {
            loading.innerHTML = '<p style="color: rgba(255,255,255,0.3);">Using fallback 3D view</p>';
            loading.style.opacity = "0";
          }
        }
      );

      // ── Render loop ───────────────────────────────────────────────────
      function camPos() {
        const x = distance * Math.sin(polar) * Math.cos(azimuth);
        const y = distance * Math.cos(polar);
        const z = distance * Math.sin(polar) * Math.sin(azimuth);
        cam.position.set(x, y, z);
        cam.lookAt(0, 0.2, 0);
      }

      function animate() {
        animId = requestAnimationFrame(animate);

        // Always spin — even while user is dragging
        // During drag the user's delta is added to targetAzimuth in the event handler,
        // and we also keep incrementing it here so rotation never stops.
        if (loadedOK) {
          targetAzimuth += 0.015; // Increased 3.75x from 0.004 for faster rotation
        }

        // Smooth easing towards target
        azimuth += (targetAzimuth - azimuth) * 0.07;
        polar   += (targetPolar   - polar)   * 0.07;
        distance += (targetDistance - distance) * 0.07;

        camPos();
        renderer.render(scene, cam);
      }

      animate();

      // ── Resize ───────────────────────────────────────────────────────
      const onResize = () => {
        if (!renderer || !container) return;
        cam.aspect = container.clientWidth / container.clientHeight;
        cam.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener("resize", onResize);

      // ── Drag to rotate ────────────────────────────────────────────────
      const canvas = renderer.domElement;

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        isUserDragging = true;
        if (resumeSpinTimer) clearTimeout(resumeSpinTimer);
        prevMouse = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = "grabbing";
      };
      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - prevMouse.x;
        const dy = e.clientY - prevMouse.y;
        // User drag adds to targetAzimuth — spin already increments it each frame,
        // so the drag is applied on top of the continuous rotation.
        targetAzimuth += dx * 0.007; // fixed inverted X
        targetPolar = Math.max(0.05, Math.min(Math.PI * 0.9, targetPolar - dy * 0.005)); // fixed inverted Y
        prevMouse = { x: e.clientX, y: e.clientY };
      };
      const onMouseUp = () => {
        isDragging = false;
        canvas.style.cursor = "grab";
        // Smoothly snap polar back toward the default level after 2s
        resumeSpinTimer = setTimeout(() => {
          targetPolar = VIEWS.side.polar;
          isUserDragging = false;
        }, 2000);
      };

      // Touch support
      const onTouchStart = (e: TouchEvent) => {
        const t = e.touches[0];
        isDragging = true;
        isUserDragging = true;
        if (resumeSpinTimer) clearTimeout(resumeSpinTimer);
        prevMouse = { x: t.clientX, y: t.clientY };
      };
      const onTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;
        const t = e.touches[0];
        const dx = t.clientX - prevMouse.x;
        const dy = t.clientY - prevMouse.y;
        targetAzimuth += dx * 0.007; // fixed inverted X
        targetPolar = Math.max(0.05, Math.min(Math.PI * 0.9, targetPolar - dy * 0.005)); // fixed inverted Y
        prevMouse = { x: t.clientX, y: t.clientY };
      };
      const onTouchEnd = () => {
        isDragging = false;
        resumeSpinTimer = setTimeout(() => {
          targetPolar = VIEWS.side.polar;
          isUserDragging = false;
        }, 2000);
      };

      canvas.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      canvas.addEventListener("touchstart", onTouchStart);
      canvas.addEventListener("touchmove", onTouchMove);
      canvas.addEventListener("touchend", onTouchEnd);

      // ── View dot buttons ──────────────────────────────────────────────
      container.querySelectorAll("[data-view]").forEach((el) => {
        el.addEventListener("click", () => {
          const v = (el as HTMLElement).dataset.view!;
          const preset = VIEWS[v];
          if (!preset) return;
          // Snap to preset angle; spin continues from there
          targetPolar = preset.polar;
          targetDistance = preset.distance;
          container.querySelectorAll("[data-view]").forEach((d) => d.classList.remove("vdot-active"));
          el.classList.add("vdot-active");
        });
      });

      return () => {
        cancelAnimationFrame(animId);
        if (resumeSpinTimer) clearTimeout(resumeSpinTimer);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        renderer.dispose();
        if (container.contains(canvas)) container.removeChild(canvas);
      };
    }

    let cleanup: (() => void) | undefined;
    
    init()
      .then((fn) => { cleanup = fn; })
      .catch((err) => {
        console.error("Fatal error initializing 3D scene:", err);
        // Show error message to user
        if (container) {
          container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,0.3)"><p>3D viewer unavailable</p></div>';
        }
      });

    return () => { cleanup?.(); };
  }, []);

  return (
    <div
      className="relative w-full h-full flex items-center justify-center select-none"
      style={{ minHeight: 520 }}
    >
      {/* Canvas container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ position: "relative", cursor: "grab" }}
      >
        {/* Loading overlay */}
        <div
          className="glb-loading"
          style={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 14, transition: "opacity 0.6s",
            pointerEvents: "none",
          }}
        >
          <p style={{ fontSize: 9, letterSpacing: "0.4em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>
            Loading 3D Model
          </p>
          <div style={{ width: 160, height: 1, background: "rgba(255,255,255,0.08)" }}>
            <div
              style={{
                height: "100%", width: "80%",
                background: "rgba(255,255,255,0.5)",
                transition: "width 1.5s cubic-bezier(.4,0,.2,1)",
              }}
            />
          </div>
        </div>



        {/* View angle dots — left side */}
        <div style={{
          position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
          zIndex: 20, display: "flex", flexDirection: "column", gap: 10, alignItems: "center",
        }}>
          <p style={{
            fontSize: 7, letterSpacing: "0.25em", color: "rgba(255,255,255,0.18)",
            textTransform: "uppercase", writingMode: "vertical-rl", marginBottom: 4,
          }}>View</p>
          {(["side", "quarter", "heel", "top"] as const).map((v, i) => (
            <button
              key={v}
              data-view={v}
              title={["Side Profile", "¾ Front", "Heel", "Top"][i]}
              className={i === 0 ? "vdot-active" : ""}
              style={{
                width: 12, height: 12, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(207,216,211,0.7)",
                cursor: "pointer", transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.5)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          ))}
        </div>


      </div>

      <style>{`
        .vdot-active {
          border-color: rgba(255,255,255,0.7) !important;
          box-shadow: 0 0 8px rgba(255,255,255,0.25) !important;
          background: rgba(255,255,255,0.85) !important;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

// ── Fallback procedural shoe (if GLB fails to load) ────────────────────────
function buildFallbackShoe(THREE: any) {
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
    new THREE.CylinderGeometry(0.35, 0.3, 0.55, 12),
    mkMat(0x8dd5b0, 0.75, 0.05)
  );
  body.position.set(-0.2, 0.1, 0);
  body.rotation.z = -0.15;
  body.scale.set(2.2, 1, 1.1);
  group.add(body);

  // Toe cap
  const toe = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 8),
    mkMat(0x8dd5b0, 0.75, 0.05)
  );
  toe.position.set(0.85, 0.05, 0);
  toe.scale.set(1, 0.7, 0.85);
  group.add(toe);

  group.rotation.y = Math.PI * 0.1;
  return group;
}
