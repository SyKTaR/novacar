import { FAQ_ITEMS } from "../data/faq";

export default function SeoContentSection() {
  return (
    <div className="local-seo-content">
      <section id="faq" className="faq" aria-labelledby="faq-title">
        <header className="faq-header">
          <p className="local-seo-eyebrow">Questions fréquentes</p>
          <h2 id="faq-title" className="local-seo-title">
            Préparer votre intervention
          </h2>
        </header>
        <div className="faq-list">
          {FAQ_ITEMS.map((item) => (
            <details className="faq-item" key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
