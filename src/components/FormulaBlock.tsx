import { useMemo } from 'react';
import katex from 'katex';

type Props = { tex: string; display?: boolean; label?: string };

/** Renders a KaTeX formula. Falls back to raw TeX text if rendering throws. */
export function FormulaBlock({ tex, display = true, label }: Props) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return null;
    }
  }, [tex, display]);

  return (
    <div className="formula-box">
      {label && <div className="label">{label}</div>}
      {html ? (
        <span dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <code>{tex}</code>
      )}
    </div>
  );
}

/** Inline KaTeX, e.g. inside prose. */
export function InlineMath({ tex }: { tex: string }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(tex, { displayMode: false, throwOnError: false });
    } catch {
      return null;
    }
  }, [tex]);
  return html ? (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <code>{tex}</code>
  );
}
