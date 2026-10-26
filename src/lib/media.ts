// Maps Supabase Storage URLs to the WebP copies scripts/images.mjs writes into public/media/
import manifest from "./generated/media.json";
import { withBasePath } from "./site";

export type MediaVariant = "cover" | "profile" | "thumb" | "full";

export interface MediaImage {
  src: string;
  width: number;
  height: number;
}

const entries: Record<string, Partial<Record<MediaVariant, MediaImage>>> = manifest;

export function media(url: string, variant: MediaVariant): MediaImage {
  const image = entries[url]?.[variant];
  if (!image) {
    throw new Error(`No ${variant} image for ${url.split("/").pop()}. Run "npm run images" to refresh public/media/.`);
  }
  return { ...image, src: withBasePath(image.src) };
}
