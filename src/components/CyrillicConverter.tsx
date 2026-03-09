'use client';

import React, { useState, useMemo } from 'react';
import { Copy, Check, Globe, ArrowLeftRight } from 'lucide-react';
import punycode from 'punycode';

const CYRILLIC_MAP: Record<string, string> = {
  'a': 'а', 'b': 'Ь', 'c': 'с', 'e': 'е', 'h': 'н', 'i': 'і', 'j': 'ј', 
  'k': 'к', 'm': 'м', 'o': 'о', 'p': 'р', 'r': 'г', 's': 'ѕ', 't': 'т', 
  'u': 'ц', 'x': 'х', 'y': 'у',
  'A': 'А', 'B': 'В', 'C': 'С', 'E': 'Е', 'H': 'Н', 'I': 'І', 'K': 'К', 
  'M': 'М', 'O': 'О', 'P': 'Р', 'T': 'Т', 'X': 'Х', 'Y': 'У'
};

const LATIN_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(CYRILLIC_MAP).map(([l, c]) => [c, l])
);

type Mode = 'latinToCyrillic' | 'cyrillicToLatin' | 'punycode';

// Helper untuk membersihkan URL sebelum dikonversi ke Punycode
const extractDomain = (url: string): string => {
  let domain = url.trim();
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');
  domain = domain.split('/')[0].split('?')[0].split('#')[0];
  return domain;
};

const CyrillicConverter: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [mode, setMode] = useState<Mode>('latinToCyrillic');
  const [showCopied, setShowCopied] = useState(false);

  // Logika utama konversi
  const output = useMemo(() => {
    if (!input.trim()) return '';

    if (mode === 'punycode') {
      try {
        const cleanDomain = extractDomain(input.toLowerCase());
        if (!cleanDomain) return '';
        return punycode.toASCII(cleanDomain);
      } catch {
        return "ERROR: Unsupported character or invalid domain format.";
      }
    }

    const activeMap = mode === 'latinToCyrillic' ? CYRILLIC_MAP : LATIN_MAP;
    return input.split('').map(char => activeMap[char] || char).join('');
  }, [input, mode]);

  // Fungsi untuk menukar hasil kembali ke input
  const handleSwap = () => {
    if (!output || mode === 'punycode' || output.startsWith("ERROR")) return;
    const newMode: Mode = mode === 'latinToCyrillic' ? 'cyrillicToLatin' : 'latinToCyrillic';
    const newContent = output;
    setMode(newMode);
    setInput(newContent);
  };

  const copyToClipboard = async () => {
    if (!output || output.startsWith("ERROR")) return;
    try {
      await navigator.clipboard.writeText(output);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const labels = {
    latinToCyrillic: { 
        in: 'Latin Text / URL', 
        out: 'Cyrillic Output (Visual Mirror)', 
        color: '#4ade80' 
    },
    cyrillicToLatin: { 
        in: 'Cyrillic Text / URL', 
        out: 'Latin Output (Original)', 
        color: '#60a5fa' 
    },
    punycode: { 
        in: 'Unicode Domain / URL', 
        out: 'Punycode (Standard RFC 3492)', 
        color: '#f59e0b' 
    }
  };

  return (
    <div className="container">
      <h1 className="text-center mb-2">Cyrillic</h1>
      
      <p className="text-center" style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Industry standard for Cyrillic Homoglyph & Punycode DNS conversion.
      </p>

      {/* Navigasi Mode */}
      <div className="flex-gap" style={{ justifyContent: 'center', marginBottom: '1.5rem', alignItems: 'center' }}>
        <button
          onClick={() => { setMode('latinToCyrillic'); setInput(''); }}
          className={`btn ${mode === 'latinToCyrillic' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ minWidth: '140px' }}
        >
          Latin to Cyr
        </button>

        <button
          onClick={() => { setMode('cyrillicToLatin'); setInput(''); }}
          className={`btn ${mode === 'cyrillicToLatin' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ minWidth: '140px' }}
        >
          Cyr to Latin
        </button>
        
        <button
          onClick={() => { setMode('punycode'); setInput(''); }}
          className={`btn ${mode === 'punycode' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ minWidth: '140px' }}
        >
          <Globe size={16} style={{ marginRight: '6px' }} />
          Punycode
        </button>
      </div>

      {/* Input Area */}
      <div className="input-group">
        <label className="label">{labels[mode].in}</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'punycode' ? "Example: https://соdе.com/path" : "Type or paste your text here..."}
          className="textarea"
          spellCheck={false}
          style={{ minHeight: '100px', fontFamily: 'monospace' }}
        />
      </div>

      {/* Output Area */}
      <div className="input-group">
        <label className="label">{labels[mode].out}</label>
        
        <div className="result-container" style={{ minHeight: '140px', position: 'relative', paddingTop: output ? '3.5rem' : '1rem' }}>
          {output ? (
            <>
              {/* Tombol Aksi di Pojok Kanan Atas */}
              <div style={{ 
                position: 'absolute', 
                top: '12px', 
                right: '12px', 
                display: 'flex', 
                gap: '10px', 
                zIndex: 20 
              }}>
                {mode !== 'punycode' && (
                  <button 
                    onClick={handleSwap} 
                    className="copy-button" 
                    style={{ 
                      position: 'static', // Memaksa tombol sejajar secara flex, bukan bertumpuk absolute
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px' 
                    }}
                  >
                    <ArrowLeftRight size={14} /> Swap
                  </button>
                )}
                <button 
                  onClick={copyToClipboard} 
                  className="copy-button" 
                  style={{ 
                    position: 'static', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px' 
                  }}
                >
                  {showCopied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
              
              <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', paddingRight: '160px' }}>
                {mode === 'latinToCyrillic' && "Characters look identical but are technically different (Unicode spoofing)."}
                {mode === 'cyrillicToLatin' && "Text has been sanitized and returned to original ASCII format."}
                {mode === 'punycode' && "URL sanitized. This format is valid for global DNS registration."}
              </div>

              {/* Preview Khusus Punycode */}
              {mode === 'punycode' && !output.startsWith("ERROR") && (
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '10px 14px', 
                  background: 'rgba(245, 158, 11, 0.08)', 
                  border: '1px solid rgba(245, 158, 11, 0.2)', 
                  borderRadius: '6px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px' 
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase' }}>Browser View:</div>
                  <div style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <span style={{ opacity: 0.5 }}>https://</span>{output}
                  </div>
                </div>
              )}

              <pre 
                className="result" 
                style={{ 
                  color: labels[mode].color,
                  marginTop: '0.5rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {output}
              </pre>

              {/* Tampilan Kode Unicode (Khusus Mode Text) */}
              {mode !== 'punycode' && output && !output.startsWith("ERROR") && (
                <div style={{ 
                  marginTop: '1.5rem', padding: '0.75rem', background: 'var(--background)',
                  border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.75rem' 
                }}>
                  <div style={{ color: '#888', marginBottom: '4px', fontWeight: 'bold' }}>RAW UNICODE SAMPLE:</div>
                  <div style={{ fontFamily: 'monospace', overflowX: 'auto', color: 'var(--text-secondary)' }}>
                    {output.slice(0, 8).split('').map(c => `U+${c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`).join(' ')}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              Awaiting data input...
            </div>
          )}
        </div>
      </div>

      {/* Info Sistem */}
      <div style={{ 
        marginTop: '2rem', padding: '1rem', background: 'var(--surface)', 
        border: '1px solid var(--border)', borderRadius: '8px' 
      }}>
        <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>💡 System Info:</h3>
        <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: '1.6', margin: 0 }}>
          <li><strong>Smart Swap:</strong> Use the swap button in the result box to quickly flip text formats.</li>
          <li><strong>URL Sanitization:</strong> Punycode mode automatically strips <code>https://</code>, paths, and parameters.</li>
          <li><strong>Memory Optimized:</strong> Algorithms use static data mapping for instantaneous conversion.</li>
        </ul>
      </div>
    </div>
  );
};

export default CyrillicConverter;