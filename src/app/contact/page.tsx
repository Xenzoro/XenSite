import type { Metadata } from "next";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Jacob Martinez about internships, collaboration or a project. LinkedIn, GitHub and a contact form.",
};

function web3formsKey(): string {
  const key = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_WEB3FORMS_KEY is not set. Copy .env.example to .env.local and fill it in, or add it as an Actions secret in CI.",
    );
  }
  return key;
}

export default function ContactPage() {
  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <div className={styles.bodyRow}>
          <div className={styles.leftCol}>
            <div className={styles.headerGroup}>
              <h1 className={styles.heading}>Get In Touch</h1>
              <hr className={styles.rule} />
              <div className={styles.socialLinks}>
                <a href="https://www.linkedin.com/in/jacobmartinii/" target="_blank" rel="noopener noreferrer" className={styles.socialPill}>
                  LinkedIn<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                <a href="https://github.com/Xenzoro" target="_blank" rel="noopener noreferrer" className={styles.socialPill}>
                  GitHub<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                <a href="#contact-form" className={styles.socialPill}>
                  Email
                </a>
              </div>
            </div>

            {/* Web3Forms delivers the message by email; the access key is public by design */}
            <form id="contact-form" action="https://api.web3forms.com/submit" method="POST" className={styles.form}>
              <input type="hidden" name="access_key" value={web3formsKey()} />
              <label htmlFor="contact-name" className="visually-hidden">
                Your name
              </label>
              <input id="contact-name" type="text" name="Name" placeholder="Your Name" autoComplete="name" required className={styles.input} />
              <label htmlFor="contact-email" className="visually-hidden">
                Your email
              </label>
              <input id="contact-email" type="email" name="Email" placeholder="Your Email" autoComplete="email" required className={styles.input} />
              <label htmlFor="contact-message" className="visually-hidden">
                Your message
              </label>
              <textarea id="contact-message" name="message" placeholder="Your Message" required className={`${styles.input} ${styles.textarea}`} />
              <button type="submit" className={styles.submit}>
                Submit
              </button>
            </form>
          </div>
          <div className={styles.right}>
            <div className={styles.imagePlaceholder}>
              <span className={styles.imagePlaceholderText}>Image Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
