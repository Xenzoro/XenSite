import Image from "next/image";
import Link from "next/link";
import Tags from "@/components/Project/Tags";
import type { FunCard } from "@/lib/fun";
import styles from "./Fun.module.css";

// Cards in the same style as the home page project grid; the whole card links through its title
export default function FunGrid({ cards }: { cards: FunCard[] }) {
  return (
    <ul className={styles.grid} role="list">
      {cards.map((card) => (
        <li key={card.href} className={styles.card}>
          <div className={styles.cardImg}>
            {card.cover ? (
              <Image src={card.cover.src} width={card.cover.width} height={card.cover.height} alt={`Cover art for ${card.title}`} />
            ) : (
              <span className={styles.tiles} aria-hidden="true">
                {[...(card.tiles ?? card.title.slice(0, 5).toUpperCase())].map((letter, i) => (
                  <span key={i} className={styles.tile}>
                    {letter}
                  </span>
                ))}
              </span>
            )}
          </div>
          <div className={styles.cardBody}>
            <Tags tags={card.tags} className={styles.cardTags} />
            <h2 className={styles.cardTitle}>
              <Link href={card.href} className={styles.cardLink}>
                {card.title}
              </Link>
            </h2>
            <p className={styles.cardDesc}>{card.summary}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
