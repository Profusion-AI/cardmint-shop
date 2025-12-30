import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { applyImageKitTransform, CARD_3D_TEXTURE_TRANSFORM_SEGMENT } from "@/utils/imagekit";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  frontImageUrl: string;
  backImageUrl: string;
};

export function Card3DViewerModal({ open, onClose, title, frontImageUrl, backImageUrl }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const resetRef = useRef<null | (() => void)>(null);
  const cleanupRef = useRef<null | (() => void)>(null);

  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const textureUrls = useMemo(() => {
    const front = applyImageKitTransform(frontImageUrl, CARD_3D_TEXTURE_TRANSFORM_SEGMENT);
    const back = applyImageKitTransform(backImageUrl, CARD_3D_TEXTURE_TRANSFORM_SEGMENT);
    return { front, back };
  }, [frontImageUrl, backImageUrl]);

  useEffect(() => {
    if (!open) return;

    const mount = mountRef.current;
    if (!mount) return;

    setStatus("loading");
    setErrorMessage(null);
    resetRef.current = null;

    let cancelled = false;

    (async () => {
      try {
        const [
          three,
          { OrbitControls },
        ] = await Promise.all([
          import("three"),
          import("three/examples/jsm/controls/OrbitControls.js"),
        ]);
        if (cancelled) return;

        const {
          AmbientLight,
          BoxGeometry,
          ClampToEdgeWrapping,
          DirectionalLight,
          LinearFilter,
          Mesh,
          MeshStandardMaterial,
          PerspectiveCamera,
          Scene,
          SRGBColorSpace,
          Texture,
          TextureLoader,
          Vector3,
          WebGLRenderer,
        } = three;

        const renderer = new WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "low-power",
        });
        renderer.outputColorSpace = SRGBColorSpace;
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

        mount.replaceChildren(renderer.domElement);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.display = "block";

        const scene = new Scene();
        const camera = new PerspectiveCamera(35, 1, 0.01, 50);
        camera.position.set(0, 0, 2.2);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.enableDamping = false;
        controls.minDistance = 1.2;
        controls.maxDistance = 4.0;
        controls.rotateSpeed = 0.7;
        controls.zoomSpeed = 0.8;

        const render = () => renderer.render(scene, camera);
        controls.addEventListener("change", render);

        // Lighting: soft but directional to give edge depth cues.
        scene.add(new AmbientLight(0xffffff, 0.9));
        const key = new DirectionalLight(0xffffff, 0.8);
        key.position.set(2, 2, 3);
        scene.add(key);
        const fill = new DirectionalLight(0xffffff, 0.4);
        fill.position.set(-2, -1, 2);
        scene.add(fill);

        const loader = new TextureLoader();
        loader.setCrossOrigin("anonymous");

        const configureTexture = (texture: Texture) => {
          texture.colorSpace = SRGBColorSpace;
          texture.wrapS = ClampToEdgeWrapping;
          texture.wrapT = ClampToEdgeWrapping;
          texture.generateMipmaps = false;
          texture.minFilter = LinearFilter;
          texture.magFilter = LinearFilter;
          texture.needsUpdate = true;
        };

        const loadTexture = (url: string) =>
          new Promise<Texture>((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
          });

        const [frontTex, backTex] = await Promise.all([
          loadTexture(textureUrls.front),
          loadTexture(textureUrls.back),
        ]);
        if (cancelled) return;
        configureTexture(frontTex);
        configureTexture(backTex);

        // Match the 3D geometry to the scan's aspect ratio to avoid stretching.
        const frontImg = frontTex.image as { width?: number; height?: number } | undefined;
        const aspect =
          frontImg?.width && frontImg?.height ? frontImg.width / frontImg.height : 0.714;

        const cardHeight = 1.0;
        const cardWidth = cardHeight * aspect;
        const cardDepth = 0.02;

        const geometry = new BoxGeometry(cardWidth, cardHeight, cardDepth);
        const edgeMaterial = new MeshStandardMaterial({
          color: 0x111827, // midnight-ish edge
          roughness: 0.95,
          metalness: 0.0,
        });

        const frontMaterial = new MeshStandardMaterial({
          map: frontTex,
          roughness: 1.0,
          metalness: 0.0,
        });
        const backMaterial = new MeshStandardMaterial({
          map: backTex,
          roughness: 1.0,
          metalness: 0.0,
        });

        // BoxGeometry materials order: +x, -x, +y, -y, +z, -z
        // We want +z = front, -z = back.
        const mesh = new Mesh(geometry, [
          edgeMaterial,
          edgeMaterial,
          edgeMaterial,
          edgeMaterial,
          frontMaterial,
          backMaterial,
        ]);
        scene.add(mesh);

        // Frame the card.
        const target = new Vector3(0, 0, 0);
        controls.target.copy(target);
        controls.update();

        const resize = () => {
          const { clientWidth, clientHeight } = mount;
          if (clientWidth === 0 || clientHeight === 0) return;
          renderer.setSize(clientWidth, clientHeight, false);
          camera.aspect = clientWidth / clientHeight;
          camera.updateProjectionMatrix();
          render();
        };
        resize();

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(mount);
        window.addEventListener("orientationchange", resize, { passive: true });

        resetRef.current = () => {
          // Reset to a slightly angled view to make the depth visible.
          camera.position.set(0, 0, 2.2);
          controls.target.set(0, 0, 0);
          controls.update();
          mesh.rotation.set(0, 0, 0);
          mesh.rotateY(Math.PI * 0.15);
          mesh.rotateX(Math.PI * -0.04);
          render();
        };
        resetRef.current();

        setStatus("ready");

        cleanupRef.current = () => {
          window.removeEventListener("orientationchange", resize);
          resizeObserver.disconnect();
          controls.removeEventListener("change", render);
          controls.dispose();

          scene.remove(mesh);
          geometry.dispose();
          frontTex.dispose();
          backTex.dispose();
          frontMaterial.dispose();
          backMaterial.dispose();
          edgeMaterial.dispose();

          renderer.dispose();
          mount.replaceChildren();
        };
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : String(error));
      }
    })();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", handleKeyDown);
      cleanupRef.current?.();
      cleanupRef.current = null;
      resetRef.current = null;
      setStatus("idle");
      setErrorMessage(null);
    };
  }, [open, onClose, textureUrls.front, textureUrls.back]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} 3D viewer`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-oxford-blue border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="min-w-0">
            <p className="text-sm text-paper font-medium truncate">{title}</p>
            <p className="text-xs text-paper/50">
              Drag to rotate • Pinch to zoom • Simulated 3D from front/back scans
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => resetRef.current?.()}
              className="bg-white/5 hover:bg-white/10 text-paper/80 px-3 py-2 rounded-xl text-sm font-medium border border-white/10 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-white/5 hover:bg-white/10 text-paper/80 p-2 rounded-xl border border-white/10 transition-colors"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
        </div>

        <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-white/5 to-white/[0.02]">
          <div
            ref={mountRef}
            className="absolute inset-0"
            style={{ touchAction: "none" }}
          />

          {status !== "ready" && (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
              {status === "loading" && (
                <p className="text-paper/70 text-sm">Loading 3D preview…</p>
              )}
              {status === "error" && (
                <div className="space-y-2">
                  <p className="text-paper font-medium">3D preview unavailable</p>
                  <p className="text-paper/60 text-sm">
                    {errorMessage ?? "Your device or browser may not support WebGL."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

