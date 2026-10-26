import styles from "./Project.module.css";

export default function Tags({ tags, className }: { tags: string[]; className?: string }) {
  if (!tags.length) return null;
  return (
    <ul className={`${styles.tags} ${className ?? ""}`} aria-label="Tools used" role="list">
      {tags.map((tag) => (
        <li key={tag} className={styles.tag}>
          {tag}
        </li>
      ))}
    </ul>
  );
}
