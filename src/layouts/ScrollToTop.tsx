import { useEffect, useState, type RefObject } from 'react';
import { ChevronUp } from 'lucide-react';
import styles from './ScrollToTop.module.css';

type ScrollToTopProps = {
  target: RefObject<HTMLElement | null>;
};

export function ScrollToTop({ target }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = target.current;
    if (!element) return;

    const onScroll = () => {
      setVisible(element.scrollTop > 240);
    };

    onScroll();
    element.addEventListener('scroll', onScroll, { passive: true });
    return () => element.removeEventListener('scroll', onScroll);
  }, [target]);

  if (!visible) return null;

  return (
    <button
      type="button"
      className={styles.button}
      onClick={() => target.current?.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Наверх"
    >
      <ChevronUp size={18} aria-hidden="true" />
    </button>
  );
}
