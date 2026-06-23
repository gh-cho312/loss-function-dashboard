import { useState } from 'react';
import type { LossDef } from '../data/types';
import { useLang } from '../i18n/LanguageContext';
import { ui } from '../i18n/ui';
import { FormulaBlock } from './FormulaBlock';

type Props = {
  loss: LossDef;
  /** resolve a related loss id to its display name */
  nameOf: (id: string) => string | undefined;
  /** scroll to a related loss card */
  onNavigate: (id: string) => void;
  defaultOpen?: boolean;
};

export function LossCard({ loss, nameOf, onNavigate, defaultOpen = false }: Props) {
  const { t } = useLang();
  const [open, setOpen] = useState(defaultOpen);
  const learnOnly = !loss.profileId;

  return (
    <div className="card" id={`loss-${loss.id}`}>
      <div className="card-head">
        <div className="heading">
          <h3 className="card-name">
            {loss.name}
            {learnOnly && <span className="badge learn-only">{t(ui.learnOnly)}</span>}
          </h3>
          <p className="card-oneliner">{t(loss.oneLiner)}</p>
        </div>
        <button
          className="expand-btn"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open ? t(ui.hideDetails) : t(ui.showDetails)}
        </button>
      </div>

      {open && (
        <div className="card-body">
          <div className="formula-row">
            <FormulaBlock tex={loss.formulaTeX} label={t(ui.formula)} />
            {loss.gradientTeX && (
              <FormulaBlock tex={loss.gradientTeX} label={t(ui.gradient)} />
            )}
          </div>

          <div className="detail-block">
            <h4>{t(ui.intuition)}</h4>
            <p>{t(loss.intuition)}</p>
          </div>

          <div className="detail-block">
            <h4>{t(ui.whenToUse)}</h4>
            <p>{t(loss.whenToUse)}</p>
          </div>

          <div className="pros-cons">
            <div className="pros detail-block">
              <h4>{t(ui.pros)}</h4>
              <ul>
                {loss.pros.map((p, i) => (
                  <li key={i}>{t(p)}</li>
                ))}
              </ul>
            </div>
            <div className="cons detail-block">
              <h4>{t(ui.cons)}</h4>
              <ul>
                {loss.cons.map((c, i) => (
                  <li key={i}>{t(c)}</li>
                ))}
              </ul>
            </div>
          </div>

          {loss.related && loss.related.length > 0 && (
            <div className="detail-block">
              <h4>{t(ui.related)}</h4>
              <div className="related-links">
                {loss.related.map((rid) => {
                  const name = nameOf(rid);
                  if (!name) return null;
                  return (
                    <button
                      key={rid}
                      className="related-link"
                      onClick={() => onNavigate(rid)}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="detail-block">
            <h4>{t(ui.papers)}</h4>
            <ul className="papers">
              {loss.papers.map((p, i) => (
                <li className="paper" key={i}>
                  <span className="ptitle">
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noopener noreferrer">
                        {p.title}
                      </a>
                    ) : (
                      p.title
                    )}
                  </span>{' '}
                  <span className="pmeta">
                    — {p.authors} ({p.year}
                    {p.venue ? `, ${p.venue}` : ''})
                  </span>
                  {p.note && <div className="pnote">{t(p.note)}</div>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
