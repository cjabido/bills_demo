import { useState } from 'react';
import { AlertTriangle, Github, Share2, X } from 'lucide-react';
import QRCode from 'react-qr-code';

export default function DemoBanner() {
  const [showQR, setShowQR] = useState(false);
  const demoUrl = "https://fin-demo.carljabido.dev";

  return (
    <>
      <div className="bg-accent-amber/10 border-b border-accent-amber/20 px-4 py-2 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-accent-amber shrink-0" />
          <span className="text-xs font-medium text-accent-amber">
            This is a demo with sample data. All changes reset periodically.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/cjabido/bills_demo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold text-accent-amber hover:text-accent-amber/80 transition-colors"
          >
            <Github className="w-3 h-3" />
            GitHub
          </a>
          <div className="w-px h-3 bg-accent-amber/20" />
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-1 text-xs font-semibold text-accent-amber hover:text-accent-amber/80 transition-colors cursor-pointer"
          >
            <Share2 className="w-3 h-3" />
            Mobile
          </button>
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowQR(false)} />
          <div className="relative bg-surface-1 border border-border-dim rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in-up">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">View on Mobile</h3>
                <p className="text-sm text-text-muted">Scan to test responsiveness</p>
              </div>

              <div className="bg-white p-4 rounded-xl inline-block shadow-inner border border-border-dim">
                <QRCode
                  value={demoUrl}
                  size={200}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 256 256`}
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-text-muted bg-surface-2/50 py-2 rounded-lg break-all">
                <span className="font-mono">{demoUrl}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
