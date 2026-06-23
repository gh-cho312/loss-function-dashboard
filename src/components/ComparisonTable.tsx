import type { ComparisonTableDef } from '../data/types';
import { useLang } from '../i18n/LanguageContext';

type Props = { table: ComparisonTableDef; nameOf: (id: string) => string | undefined };

export function ComparisonTable({ table, nameOf }: Props) {
  const { t } = useLang();
  return (
    <div className="table-wrap">
      <table className="cmp">
        <thead>
          <tr>
            <th />
            {table.columns.map((c) => (
              <th key={c.key}>{t(c.label)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((r) => (
            <tr key={r.lossId}>
              <td>{nameOf(r.lossId) ?? r.lossId}</td>
              {table.columns.map((c) => (
                <td key={c.key}>{r.cells[c.key] ? t(r.cells[c.key]) : '—'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
