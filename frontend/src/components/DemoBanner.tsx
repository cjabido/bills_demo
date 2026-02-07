import { AlertTriangle, Github } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="fixed top-0 left-14 right-0 z-30 bg-accent-amber/10 border-b border-accent-amber/20 px-4 py-1.5 flex items-center justify-center gap-3">
      <AlertTriangle className="w-3.5 h-3.5 text-accent-amber shrink-0" />
      <span className="text-xs font-medium text-accent-amber">
        This is a demo with sample data. All changes reset periodically.
      </span>
      <a
        href="https://github.com/cjabido/bills_demo"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs font-semibold text-accent-amber hover:text-accent-amber/80 transition-colors"
      >
        <Github className="w-3 h-3" />
        GitHub
      </a>
    </div>
  );
}
