"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MediaImage } from "@/lib/media";
import styles from "./Gallery.module.css";

export interface GalleryCard {
  caption: string;
  images: { thumb: MediaImage; full: MediaImage }[];
}

const PLACEHOLDER_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.5" />
    <path d="m21 15-5-5L5 21" />
  </svg>
);

// Photo cards with a small carousel when a card has several photos, plus a lightbox to view them large
export default function Gallery({ cards }: { cards: GalleryCard[] }) {
  // Current photo per card; the lightbox and the card stay in step
  const [indexes, setIndexes] = useState<number[]>(() => cards.map(() => 0));
  const [openCard, setOpenCard] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  function step(card: number, direction: number) {
    const count = cards[card].images.length;
    setIndexes((current) => current.map((value, i) => (i === card ? (value + direction + count) % count : value)));
  }

  function show(card: number, index: number) {
    setIndexes((current) => current.map((value, i) => (i === card ? index : value)));
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openCard !== null && !dialog.open) dialog.showModal();
    if (openCard === null && dialog.open) dialog.close();
  }, [openCard]);

  const active = openCard !== null ? cards[openCard] : null;
  const activeIndex = openCard !== null ? indexes[openCard] : 0;
  const activeImage = active?.images[activeIndex]?.full;
  const hasMultiple = (active?.images.length ?? 0) > 1;

  return (
    <>
      <div className={styles.grid}>
        {cards.map((card, cardIndex) => {
          const index = indexes[cardIndex];
          const image = card.images[index]?.thumb;
          const multiple = card.images.length > 1;
          return (
            <figure key={cardIndex} className={styles.card}>
              <div className={styles.imageArea}>
                {image ? (
                  <button
                    type="button"
                    className={styles.zoomBtn}
                    aria-label={`View larger: ${card.caption}${multiple ? `, photo ${index + 1} of ${card.images.length}` : ""}`}
                    onClick={(event) => {
                      openerRef.current = event.currentTarget;
                      setOpenCard(cardIndex);
                    }}
                  >
                    <Image
                      src={image.src}
                      width={image.width}
                      height={image.height}
                      alt={card.caption}
                      className={styles.img}
                      sizes="(min-width: 700px) 320px, 100vw"
                    />
                  </button>
                ) : (
                  <div className={styles.placeholder}>{PLACEHOLDER_ICON}</div>
                )}
                {multiple && (
                  <>
                    <button type="button" className={`${styles.arrow} ${styles.arrowLeft}`} aria-label="Previous photo" onClick={() => step(cardIndex, -1)}>
                      &#10094;
                    </button>
                    <button type="button" className={`${styles.arrow} ${styles.arrowRight}`} aria-label="Next photo" onClick={() => step(cardIndex, 1)}>
                      &#10095;
                    </button>
                  </>
                )}
              </div>
              {multiple && (
                <div className={styles.dots}>
                  {card.images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                      aria-label={`Photo ${i + 1}`}
                      aria-current={i === index ? "true" : undefined}
                      onClick={() => show(cardIndex, i)}
                    />
                  ))}
                </div>
              )}
              <figcaption className={styles.caption}>{card.caption}</figcaption>
            </figure>
          );
        })}
      </div>

      <dialog
        ref={dialogRef}
        className={styles.lightbox}
        aria-label={active ? active.caption : "Photo"}
        onClose={() => {
          setOpenCard(null);
          openerRef.current?.focus();
        }}
        onClick={(event) => {
          // A click on the backdrop (the dialog itself, not its content) closes it
          if (event.target === event.currentTarget) setOpenCard(null);
        }}
        onKeyDown={(event) => {
          if (openCard === null || !hasMultiple) return;
          if (event.key === "ArrowLeft") step(openCard, -1);
          if (event.key === "ArrowRight") step(openCard, 1);
        }}
      >
        <button type="button" className={styles.close} aria-label="Close photo" onClick={() => setOpenCard(null)}>
          &times;
        </button>
        {active && activeImage && openCard !== null && (
          <div className={styles.lightboxContent}>
            <div className={styles.stage}>
              {/* eslint-disable-next-line @next/next/no-img-element -- the large photo is sized by CSS to the viewport */}
              <img
                src={activeImage.src}
                width={activeImage.width}
                height={activeImage.height}
                alt={active.caption}
                className={styles.lightboxImg}
              />
              {hasMultiple && (
                <>
                  <button type="button" className={`${styles.lightboxArrow} ${styles.lightboxArrowLeft}`} aria-label="Previous photo" onClick={() => step(openCard, -1)}>
                    &#10094;
                  </button>
                  <button type="button" className={`${styles.lightboxArrow} ${styles.lightboxArrowRight}`} aria-label="Next photo" onClick={() => step(openCard, 1)}>
                    &#10095;
                  </button>
                </>
              )}
            </div>
            {hasMultiple && (
              <div className={styles.lightboxDots}>
                {active.images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.lightboxDot} ${i === activeIndex ? styles.dotActive : ""}`}
                    aria-label={`Photo ${i + 1}`}
                    aria-current={i === activeIndex ? "true" : undefined}
                    onClick={() => show(openCard, i)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
