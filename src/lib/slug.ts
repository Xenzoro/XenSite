// Lowercase, symbols dropped, words joined by a hyphen: "Lori - L'Oreal AI Chatbot" -> "lori-loreal-ai-chatbot"
export function slugify(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['\u2019]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .join("-");
}

const VALID_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  return VALID_SLUG.test(slug);
}
