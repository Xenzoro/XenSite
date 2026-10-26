import { highlight } from "@/lib/highlight";
import type { Project } from "@/lib/types";
import styles from "./Project.module.css";
import Terminal from "./Terminal";

interface Props {
  project: Project;
  // Section headings sit one level below the project title
  headingLevel: "h2" | "h3";
  snippetHeadingLevel: "h3" | "h4";
}

// Write up, demo link, code excerpts, then the terminal replay, the same order detail.js used
export default function ProjectContent({ project, headingLevel: Heading, snippetHeadingLevel: SnippetHeading }: Props) {
  return (
    <>
      {project.longDescription && <p className={styles.longDesc}>{project.longDescription}</p>}

      {project.demoUrl && (
        <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className={styles.demoBtn}>
          View Live Demo<span className="visually-hidden"> of {project.title} (opens in a new tab)</span>
        </a>
      )}

      {project.codeSnippets.length > 0 && (
        <>
          <Heading className={styles.subheading}>Code</Heading>
          <div className={styles.snippets}>
            {project.codeSnippets.map((snippet, i) => (
              <figure key={i} className={styles.snippet} style={{ margin: 0 }}>
                <SnippetHeading className={styles.snippetLabel}>
                  {snippet.label || snippet.title || `Snippet ${i + 1}`}
                </SnippetHeading>
                <pre className={styles.code} tabIndex={0}>
                  <code dangerouslySetInnerHTML={{ __html: highlight(snippet.code, snippet.language) }} />
                </pre>
              </figure>
            ))}
          </div>
        </>
      )}

      {project.terminalSession.length > 0 && (
        <>
          <Heading className={styles.subheading}>Terminal</Heading>
          <p className={styles.disclaimer}>
            <span className={styles.infoIcon} aria-hidden="true">
              &#9432;
            </span>
            This is not a live terminal. It is real captured output from actually running my code, replayed here for
            demonstration.
          </p>
          <Terminal session={project.terminalSession} />
        </>
      )}
    </>
  );
}
