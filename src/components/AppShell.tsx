import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  breadcrumbs?: { label: string; href?: string }[];
  children: ReactNode;
}

export default function AppShell({ breadcrumbs, children }: Props) {
  return (
    <div className="min-h-screen bg-akiva-navy text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-akiva-border bg-akiva-surface/50 px-6 py-4 flex items-center gap-4">
        <Link to="/clientes" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded bg-akiva-blue flex items-center justify-center flex-shrink-0">
            <span className="font-serif text-akiva-gold font-semibold text-sm leading-none">A</span>
          </div>
          <span className="font-serif text-akiva-gold text-lg font-medium tracking-wide">Akiva</span>
        </Link>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <>
            <span className="text-akiva-border text-lg">/</span>
            <nav className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <span className="text-akiva-border">/</span>}
                  {b.href ? (
                    <Link to={b.href} className="text-blue-300 hover:text-akiva-gold transition-colors">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-gray-400">{b.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
