// Shapes of the Supabase tables, as the old detail.js and about-me.js read them

export interface CodeSnippet {
  code: string;
  label?: string;
  title?: string;
  language?: string;
}

export interface TerminalStep {
  input: string;
  output: string;
}

/** A row of `project-cards` as Supabase returns it */
export interface ProjectRow {
  id: number;
  title: string;
  slug?: string | null;
  tools_used: string[] | null;
  blurb: string | null;
  image_url: string | null;
  sort_order: number | null;
  long_description: string | null;
  code_snippets: CodeSnippet[] | null;
  terminal_session: TerminalStep[] | null;
  demo_url: string | null;
}

/** A project after normalizing, with its slug resolved */
export interface Project {
  id: number;
  slug: string;
  title: string;
  tools: string[];
  blurb: string;
  imageUrl: string | null;
  longDescription: string;
  codeSnippets: CodeSnippet[];
  terminalSession: TerminalStep[];
  demoUrl: string | null;
}

export interface GalleryItem {
  images: string[];
  caption: string;
}

/** A row of `about-me` as Supabase returns it */
export interface AboutRow {
  id: number;
  profile_photo_url: string | null;
  gallery: GalleryItem[] | null;
}

export interface About {
  profilePhotoUrl: string | null;
  gallery: GalleryItem[];
}
