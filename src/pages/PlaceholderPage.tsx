import styles from './PlaceholderPage.module.css';

type PlaceholderPageProps = {
  title: string;
  text: string;
};

export function PlaceholderPage({ title, text }: PlaceholderPageProps) {
  return (
    <section className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{text}</p>
    </section>
  );
}
