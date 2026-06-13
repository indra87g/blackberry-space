'use client';

import { useState, useRef } from 'react';
import { Copy, Check, Download, Loader2 } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language: string;
  /** Pre-rendered Shiki HTML, highlighted on the server. */
  html: string;
}

export function CodeBlock({ code, language, html }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!blockRef.current) return;
    try {
      setIsExporting(true);

      // Dynamically import html-to-image only when needed to reduce initial JS bundle size
      const { toPng } = await import('html-to-image');

      // Memberikan jeda mikro agar DOM sempat menyembunyikan tombol sebelum di-render ke gambar
      await new Promise((resolve) => setTimeout(resolve, 50));

      const dataUrl = await toPng(blockRef.current, {
        cacheBust: true,
        backgroundColor: '#09100a',
        style: {
          margin: '0',
          borderRadius: '0',
        },
      });
      const link = document.createElement('a');
      link.download = `snippet-${language}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error exporting image:', err);
      alert('Gagal mengekspor gambar.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying text:', err);
      alert('Gagal menyalin kode ke clipboard.');
    }
  };

  return (
    <div
      ref={blockRef}
      className="overflow-hidden bg-surface-container-lowest border border-outline-variant"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-surface-container border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-outline-variant" />
          <div className="w-3 h-3 bg-outline-variant" />
          <div className="w-3 h-3 bg-outline-variant" />
        </div>
        <div className="text-xs font-mono text-on-surface-variant uppercase tracking-wider">
          {language}
        </div>
        {/* Menyembunyikan tombol secara visual saat proses export agar tidak ikut masuk ke dalam gambar */}
        <div
          className={`flex items-center gap-3 transition-opacity duration-150 ${isExporting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="text-on-surface-variant hover:text-on-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            aria-label="Export code as image"
            title="Export code as image"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="text-on-surface-variant hover:text-on-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Copy code"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-primary" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <div className="p-4 overflow-auto custom-scrollbar font-mono text-sm leading-relaxed max-h-[600px] bg-surface-container-lowest">
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="
            [&>pre]:!bg-transparent [&>pre]:!p-0 [&>pre]:!m-0 [&>pre]:!text-[0.875rem]
            [&>pre>code]:[counter-reset:line]
            [&>pre>code>.line]:before:[counter-increment:line]
            [&>pre>code>.line]:before:content-[counter(line)]
            [&>pre>code>.line]:before:inline-block
            [&>pre>code>.line]:before:w-6
            [&>pre>code>.line]:before:mr-4
            [&>pre>code>.line]:before:text-right
            [&>pre>code>.line]:before:text-outline-variant
            [&>pre>code>.line]:before:select-none
          "
        />
      </div>
    </div>
  );
}
