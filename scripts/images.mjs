// Image conversion with sharp.
//
//   node scripts/images.mjs          Downloads every image the site uses from Supabase Storage and writes
//                                    sized WebP files to public/media/ plus src/lib/generated/media.json.
//                                    Runs before `npm run dev` and `npm run build`. Both outputs are gitignored.
//                                    With --soft (used by dev) a failed refresh only warns if a manifest exists.
//   node scripts/images.mjs local    Converts the original photos and logo (from project-files/ or the folder
//                                    given after "local") into src/assets/. Run once; the output is committed.

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const MAX_BYTES = 300 * 1024;
const root = path.resolve(import.meta.dirname, "..");

// Encodes to WebP, stepping quality down until the file fits under maxBytes
async function toWebp(input, { width, height, fit = "inside", maxBytes = MAX_BYTES }) {
  for (let quality = 80; quality >= 40; quality -= 8) {
    const { data, info } = await sharp(input)
      .rotate()
      .resize({ width, height, fit, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer({ resolveWithObject: true });
    if (data.length <= maxBytes) return { data, width: info.width, height: info.height };
  }
  throw new Error(`Could not get an image under ${Math.round(maxBytes / 1024)} KB`);
}

// ── Local originals ──────────────────────────────────────────────

const LOCAL_IMAGES = [
  // Hero photo on the home page, shown up to 340px wide: keep it under 150 KB
  { from: "selfiecropped.jpg", to: "selfie-hero.webp", width: 680, maxBytes: 150 * 1024 },
  // Contact card photo, shown as a 160px square
  { from: "selfie2.JPG", to: "selfie-contact.webp", width: 320, height: 320, fit: "cover" },
  // Navbar logo, shown 100px wide
  { from: "logo.png", to: "logo.webp", width: 200 },
];

async function convertLocal(sourceDir) {
  const outDir = path.join(root, "src/assets");
  await mkdir(outDir, { recursive: true });
  for (const image of LOCAL_IMAGES) {
    const source = path.join(sourceDir, image.from);
    if (!existsSync(source)) {
      console.warn(`skip ${image.from} (not found in ${sourceDir})`);
      continue;
    }
    const { data, width, height } = await toWebp(source, image);
    await writeFile(path.join(outDir, image.to), data);
    console.log(`${image.to}  ${width}x${height}  ${Math.round(data.length / 1024)} KB`);
  }
  // Favicon from the same logo, through the app/icon.png file convention
  const logo = path.join(sourceDir, "logo.png");
  if (existsSync(logo)) {
    await sharp(logo).resize(64, 64).png().toFile(path.join(root, "src/app/icon.png"));
    console.log("src/app/icon.png  64x64");
  }
}

// ── Supabase Storage images ──────────────────────────────────────

// Widths per use: card covers, the round about photo, gallery thumbnails and the lightbox
const VARIANTS = {
  cover: { width: 960 },
  profile: { width: 320, height: 320, fit: "cover" },
  thumb: { width: 640 },
  full: { width: 1600 },
};

function loadEnv() {
  const envFile = path.join(root, ".env.local");
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set (see .env.example).");
  }
  return { url, key };
}

async function select(env, table, query) {
  const res = await fetch(`${env.url}/rest/v1/${table}?${query}`, {
    headers: { apikey: env.key, Authorization: `Bearer ${env.key}` },
  });
  if (!res.ok) throw new Error(`Supabase request for "${table}" failed: ${res.status} ${res.statusText}`);
  return res.json();
}

// Readable, collision free file name: "keyboard-3f2a1c9e"
function fileStem(url) {
  const base = path.basename(new URL(url).pathname).replace(/\.[^.]+$/, "");
  const safe = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${safe}-${createHash("sha256").update(url).digest("hex").slice(0, 8)}`;
}

async function convertRemote() {
  const env = loadEnv();
  const [projects, aboutRows] = await Promise.all([
    select(env, "project-cards", "select=image_url"),
    select(env, "about-me", "id=eq.1&select=profile_photo_url,gallery"),
  ]);

  // url -> variant names it needs
  const wanted = new Map();
  const want = (url, ...variants) => {
    if (!url) return;
    wanted.set(url, [...new Set([...(wanted.get(url) ?? []), ...variants])]);
  };
  for (const project of projects) want(project.image_url, "cover");
  const about = aboutRows[0] ?? {};
  want(about.profile_photo_url, "profile");
  for (const item of Array.isArray(about.gallery) ? about.gallery : []) {
    for (const url of Array.isArray(item.images) ? item.images : []) want(url, "thumb", "full");
  }

  const outDir = path.join(root, "public/media");
  const manifestPath = path.join(root, "src/lib/generated/media.json");
  await mkdir(outDir, { recursive: true });
  await mkdir(path.dirname(manifestPath), { recursive: true });

  const manifest = {};
  let converted = 0;
  for (const [url, variants] of wanted) {
    const stem = fileStem(url);
    let original = null;
    manifest[url] = {};
    for (const variant of variants) {
      const file = `${stem}-${variant}.webp`;
      const target = path.join(outDir, file);
      // Reuse files from an earlier run; the hash in the name changes when the URL does
      if (!existsSync(target)) {
        if (!original) {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Download failed (${res.status}) for ${path.basename(url)}`);
          original = Buffer.from(await res.arrayBuffer());
        }
        const { data } = await toWebp(original, VARIANTS[variant]);
        await writeFile(target, data);
        converted++;
      }
      const meta = await sharp(await readFile(target)).metadata();
      manifest[url][variant] = { src: `/media/${file}`, width: meta.width, height: meta.height };
    }
  }

  // Drop files from earlier runs that no image uses any more
  const used = new Set(Object.values(manifest).flatMap((variants) => Object.values(variants).map((v) => path.basename(v.src))));
  for (const file of await readdir(outDir)) {
    if (!used.has(file)) await rm(path.join(outDir, file));
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`media: ${wanted.size} images, ${converted} files converted, manifest written`);
}

const [mode, dir] = process.argv.slice(2);
if (mode === "local") {
  await convertLocal(path.resolve(root, dir ?? "project-files"));
} else {
  try {
    await convertRemote();
  } catch (error) {
    const haveManifest = existsSync(path.join(root, "src/lib/generated/media.json"));
    if (mode !== "--soft" || !haveManifest) throw error;
    console.warn(`media: refresh failed, keeping the images from the last run (${error.message})`);
  }
}
