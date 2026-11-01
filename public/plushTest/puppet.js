
const view = document.getElementById('view');
const fallback = document.getElementById('fallback');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
async function start() {
  const [THREE, { GLTFLoader }] = await Promise.all([
    import('three'), import('three/addons/loaders/GLTFLoader.js'),
  ]);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  view.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 1.4, 5.6);
  camera.lookAt(0, 1.3, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x536184, 2));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(3, 5, 4);
  scene.add(light);
  const { scene: model } = await new GLTFLoader().loadAsync('./puppet.glb');
  // The USDZ character faces negative X; turn its face toward the camera.
  model.rotation.y = Math.PI / 2;
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = 2.5 / size.y;
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
  const buddy = new THREE.Group();
  buddy.add(model);
  scene.add(buddy);
  function resize() {
    const { clientWidth: w, clientHeight: h } = view;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(view);
  resize();
  let last = 0;
  renderer.setAnimationLoop(time => {
    const dt = Math.min((time - last) / 1000, .05);
    last = time;
    const target = window.puppetTarget;
    const r = view.getBoundingClientRect();
    const box = target?.getBoundingClientRect();
    const direction = box ? Math.max(-1, Math.min(1, (box.left + box.width / 2 - r.left - r.width / 2) / r.width)) : 0;
    const goal = direction * .32;
    buddy.rotation.y += (goal - buddy.rotation.y) * (reduce.matches ? 1 : 1 - Math.exp(-8 * dt));
    buddy.rotation.z = reduce.matches ? 0 : -direction * .035;
    buddy.position.y = reduce.matches ? 0 : Math.sin(time * .0018) * .025;
    renderer.render(scene, camera);
  });
}
start().catch(() => {
  fallback.hidden = false;
  fallback.textContent = 'The puppet could not load. Use Open my menu below to browse and search.';
});
