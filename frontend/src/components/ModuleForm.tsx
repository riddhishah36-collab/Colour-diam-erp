import React, { useState } from 'react';
import type { Field, Row } from '../api';

export default function ModuleForm({
  fields,
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  fields: Field[];
  initial?: Row;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const v: Record<string, unknown> = {};
    for (const f of fields) {
      const init = initial ? initial[f.key] : undefined;
      if (f.type === 'multiselect') {
        v[f.key] = Array.isArray(init) ? (init as string[]) : init ? String(init).split(',').map((s) => s.trim()) : [];
      } else if (f.type === 'boolean') {
        v[f.key] = Boolean(init);
      } else {
        v[f.key] = init ?? '';
      }
    }
    return v;
  });

  const set = (key: string, val: unknown) => setValues((prev) => ({ ...prev, [key]: val }));

  const toggleMulti = (key: string, opt: string) => {
    const cur = (values[key] as string[]) || [];
    set(
      key,
      cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const out: Record<string, unknown> = {};
    for (const f of fields) {
      if (f.readonly) continue;
      let v = values[f.key];
      if (f.type === 'number') {
        v = v === '' || v === null || v === undefined ? null : Number(v);
      } else if (f.type === 'multiselect') {
        v = (v as string[]).join(',');
      }
      out[f.key] = v;
    }
    onSubmit(out);
  };

  const renderField = (f: Field) => {
    if (f.type === 'multiselect') {
      return (
        <div className="field full">
          <label>{f.label}</label>
          <div className="check-grid">
            {(f.options || []).map((opt) => {
              const on = ((values[f.key] as string[]) || []).includes(opt);
              return (
                <label key={opt} className={`check-pill ${on ? 'on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => toggleMulti(f.key, opt)} />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>
      );
    }
    if (f.type === 'textarea') {
      return (
        <div className="field full">
          <label>{f.label}</label>
          <textarea
            value={String(values[f.key] ?? '')}
            onChange={(e) => set(f.key, e.target.value)}
            placeholder={f.placeholder}
            required={f.required}
            rows={3}
          />
        </div>
      );
    }
    if (f.type === 'select') {
      return (
        <div className="field">
          <label>{f.label}</label>
          <select
            value={String(values[f.key] ?? '')}
            onChange={(e) => set(f.key, e.target.value)}
            required={f.required}
          >
            <option value="">— Select —</option>
            {(f.options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return (
      <div className="field">
        <label>{f.label}</label>
        <input
          type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'boolean' ? 'checkbox' : 'text'}
          step={f.step}
          value={f.type === 'boolean' ? undefined : String(values[f.key] ?? '')}
          checked={f.type === 'boolean' ? Boolean(values[f.key]) : undefined}
          onChange={(e) =>
            set(f.key, f.type === 'boolean' ? e.target.checked : e.target.value)
          }
          placeholder={f.placeholder}
          required={f.required}
          readOnly={f.readonly}
        />
        {f.placeholder && !f.required && <div className="hint">{f.placeholder}</div>}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">{fields.map((f) => renderField(f))}</div>
      <div className="modal-foot" style={{ margin: '18px -20px -20px' }}>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
