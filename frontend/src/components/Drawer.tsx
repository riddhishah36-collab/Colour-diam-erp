import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Drawer({
  title,
  onClose,
  children,
  wide,
  subtitle,
}: {
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
  subtitle?: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside
        className={`drawer ${wide ? 'wide' : ''}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="drawer-head">
          <div>
            <h3>{title}</h3>
            {subtitle && <div className="drawer-sub">{subtitle}</div>}
          </div>
          <button className="icon-btn" style={{ marginLeft: 'auto' }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  );
}
