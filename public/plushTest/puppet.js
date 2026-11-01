const view = document.getElementById('view');
const fallback = document.getElementById('fallback');
const danceButton = document.getElementById('dance-button');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

async function start() {
  const [THREE, { FBXLoader }] = await Promise.all([
    import('three'), import('three/addons/loaders/FBXLoader.js'),
  ]);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  view.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 1.4, 6.2);
  camera.lookAt(0, 1.3, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x536184, 2));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(3, 5, 4);
  scene.add(light);

  // FBX references old desktop paths; resolve only known bundled textures.
  const textures = {
    'sackboy_pinched_dirt.png': 'puppit_pinched_dirt.png',
    'sackboy_stitch_diffuse.png': 'puppit_stitch_diffuse.png',
    'zip_1_diffuse.png': 'zip_1_diffuse.png',
    'zip_pull_dirt.png': 'zip_pull_dirt.png',
  };
  const neutral = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4////fwAJ+wP9KobjigAAAABJRU5ErkJggg==';
  const manager = new THREE.LoadingManager();
  manager.setURLModifier(url => {
    if (/\.fbx(?:\?.*)?$/i.test(url)) return url;
    const name = url.replaceAll('\\', '/').split('/').pop();
    return textures[name] ? `./textures/${textures[name]}` : neutral;
  });
  const model = await new FBXLoader(manager).loadAsync('./puppet-dance.fbx');
  model.traverse(object => {
    if (!object.isMesh) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach(material => {
      if (material.name === 'sack_boy_weave_base') material.color.set('#bca17b');
      if (material.name === 'sack_boy_tongue') { material.map = null; material.color.set('#b8747f'); }
    });
  });
  const mixer = new THREE.AnimationMixer(model);
  const clip = model.animations[0];
  if (!clip) throw new Error('The character animation is missing.');
  const idle = mixer.clipAction(clip.clone());
  idle.play();
  idle.paused = true;
  const dance = mixer.clipAction(clip);
  dance.play();
  dance.setEffectiveWeight(0);
  mixer.update(0);
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model, true);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = 2.5 / size.y;
  model.scale.multiplyScalar(scale);
  model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
  const buddy = new THREE.Group();
  buddy.add(model);
  scene.add(buddy);
  const head = model.getObjectByName('Bip01_Head');
  const headBase = head?.quaternion.clone();
  let dancing = false;
  let weight = 0;
  let greetingEnd = 0;
  function setDance(value) {
    dancing = value;
    danceButton.setAttribute('aria-pressed', String(value));
    danceButton.textContent = value ? 'Stop dancing' : 'Dance';
    if (value) { dance.reset().play(); greetingEnd = 0; }
  }
  danceButton.disabled = false;
  danceButton.textContent = 'Dance';
  danceButton.addEventListener('click', () => setDance(!dancing));
  document.addEventListener('puppet:menu', event => {
    setDance(false);
    greetingEnd = event.detail.open && !reduce.matches ? performance.now() + 1800 : 0;
    if (greetingEnd) dance.reset().play();
  });
  document.addEventListener('puppet:search', () => { setDance(false); greetingEnd = 0; });
  reduce.addEventListener('change', () => { setDance(false); greetingEnd = 0; });
  function resize() {
    const { clientWidth: w, clientHeight: h } = view;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = Math.max(6.2, 1.9 / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect) + 1.1);
    camera.lookAt(0, 1.3, 0);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(view);
  resize();
  let last = 0;
  renderer.setAnimationLoop(time => {
    const dt = Math.min((time - last) / 1000, .05);
    last = time;
    const moving = dancing || time < greetingEnd;
    const targetWeight = moving ? 1 : 0;
    weight += (targetWeight - weight) * (reduce.matches ? 1 : 1 - Math.exp(-8 * dt));
    idle.setEffectiveWeight(1 - weight);
    dance.setEffectiveWeight(weight);
    dance.paused = !moving && weight < .001;
    if (head) head.quaternion.copy(headBase);
    mixer.update(dt);
    if (head) headBase.copy(head.quaternion);
    const r = view.getBoundingClientRect();
    const box = window.puppetTarget?.getBoundingClientRect();
    const direction = box ? Math.max(-1, Math.min(1, (box.left + box.width / 2 - r.left - r.width / 2) / r.width)) : 0;
    buddy.rotation.y += (direction * .22 - buddy.rotation.y) * (reduce.matches ? 1 : 1 - Math.exp(-8 * dt));
    if (head && !reduce.matches) head.rotation.y += direction * .12 * (1 - weight);
    renderer.render(scene, camera);
  });
}
start().catch(() => {
  fallback.hidden = false;
  fallback.textContent = 'The puppet could not load. Use Open my menu below to browse and search.';
  danceButton.textContent = 'Dance unavailable';
});
