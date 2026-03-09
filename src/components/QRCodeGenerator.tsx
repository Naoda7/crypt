import { useState, useRef, useEffect } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { 
  Download, X, Image as ImageIcon, Palette, ScanLine, 
  ShieldAlert, UploadCloud, Copy, Check, Loader2, ChevronDown, Search 
} from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import jsQR from 'jsqr';

import { LOGO_LIBRARY, ICON_MAP, IconName, QRIcon } from '../data/qrIcons';
import '../styles/qr-generator.css';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
type DotType = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded';
type CornerSquareType = 'square' | 'dot' | 'rounded' | 'extra-rounded';
type CornerDotType = 'square' | 'dot';
type Extension = 'png' | 'jpeg' | 'svg';

interface QRState {
  data: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  bgColor: string;
  qrColor: string;
  dotType: DotType;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  imageFormat: Extension;
  size: number;
  logoSize: number;
}

const PRESETS = [
  { name: 'Classic', qrColor: '#000000', bgColor: '#ffffff', dotType: 'square', cornerType: 'square' },
  { name: 'Midnight', qrColor: '#0f172a', bgColor: '#ffffff', dotType: 'rounded', cornerType: 'extra-rounded' },
  { name: 'Emerald', qrColor: '#064e3b', bgColor: '#f0fdf4', dotType: 'classy', cornerType: 'rounded' },
  { name: 'Sunset', qrColor: '#7c2d12', bgColor: '#fff7ed', dotType: 'extra-rounded', cornerType: 'extra-rounded' },
  { name: 'Ocean', qrColor: '#1e3a8a', bgColor: '#eff6ff', dotType: 'dots', cornerType: 'dot' },
  { name: 'Amethyst', qrColor: '#581c87', bgColor: '#faf5ff', dotType: 'classy-rounded', cornerType: 'rounded' },
];

const QRCodeGenerator = () => {
  const [options, setOptions] = useState<QRState>({
    data: '',
    errorCorrectionLevel: 'H',
    bgColor: '#ffffff',
    qrColor: '#000000',
    dotType: 'square',
    cornerSquareType: 'square',
    cornerDotType: 'square',
    imageFormat: 'png',
    size: 500,
    logoSize: 0.2
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanResultText, setScanResultText] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isImgReady, setIsImgReady] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<QRIcon | null>(null);
  const [iconColor, setIconColor] = useState('#000000'); 
  const [logoError, setLogoError] = useState<string | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrCode = useRef<QRCodeStyling>(
    new QRCodeStyling({
      width: 280,
      height: 280,
      data: ' ',
      margin: 10,
      type: 'canvas',
      imageOptions: { hideBackgroundDots: true, margin: 5, crossOrigin: 'anonymous' }
    })
  );

  const getIconDataUrl = (iconName: IconName, color: string) => {
    const IconComponent = ICON_MAP[iconName];
    if (!IconComponent) return null;
    const svgString = renderToStaticMarkup(<IconComponent color={color} size={48} strokeWidth={2.5} />);
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  };

  const processScanFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setScanError("File must be an image (PNG/JPG).");
      return;
    }
    setScanError(null); setScanResultText(null); setIsImgReady(false); setIsScanning(false);
    const reader = new FileReader();
    reader.onload = (e) => setScanPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageLoad = () => {
    setTimeout(() => {
      setIsImgReady(true); setIsScanning(true);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext('2d'); if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        setTimeout(() => {
          setIsScanning(false);
          if (code) setScanResultText(code.data);
          else setScanError("This image does not contain a valid QR Code.");
        }, 2200);
      };
      img.src = scanPreview || '';
    }, 400);
  };

  const handleDrag = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(e.type === "dragenter" || e.type === "dragover"); 
  };

  const handleDrop = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(false); 
    const file = e.dataTransfer.files?.[0]; 
    if (file) processScanFile(file); 
  };

  useEffect(() => { 
    if (qrRef.current) qrCode.current.append(qrRef.current); 
  }, []);

  useEffect(() => {
    if (selectedIcon?.iconName) {
      setLogoPreview(getIconDataUrl(selectedIcon.iconName, iconColor));
    }
  }, [iconColor, selectedIcon]);

  useEffect(() => {
    const isShortData = options.data.length > 0 && options.data.length < 15;
    qrCode.current.update({
      data: options.data || ' ',
      qrOptions: { 
        typeNumber: (isShortData && logoPreview) ? 6 : 0, 
        errorCorrectionLevel: options.errorCorrectionLevel 
      },
      dotsOptions: { color: options.qrColor, type: options.dotType },
      cornersSquareOptions: { color: options.qrColor, type: options.cornerSquareType },
      cornersDotOptions: { color: options.qrColor, type: options.cornerDotType },
      backgroundOptions: { color: options.bgColor },
      image: logoPreview || undefined,
      imageOptions: { hideBackgroundDots: true, imageSize: options.logoSize, margin: 5, crossOrigin: 'anonymous' }
    });
  }, [options, logoPreview]);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setOptions(prev => ({ 
      ...prev, 
      qrColor: preset.qrColor, 
      bgColor: preset.bgColor, 
      dotType: preset.dotType as DotType, 
      cornerSquareType: preset.cornerType as CornerSquareType, 
      cornerDotType: preset.cornerType === 'dot' ? 'dot' : 'square' 
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null); const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 500 * 1024) { setLogoError('Max file size is 500KB'); return; }
    setSelectedIcon(null);
    const reader = new FileReader(); reader.onload = (e) => { if (e.target?.result) setLogoPreview(e.target.result as string) }; reader.readAsDataURL(file);
  };

  const downloadQR = async () => {
    if (!options.data) return;
    const finalSize = options.size < 100 ? 500 : options.size;
    qrCode.current.update({ data: options.data, width: finalSize, height: finalSize });
    await qrCode.current.download({ extension: options.imageFormat, name: `qr-code-${Date.now()}` });
    qrCode.current.update({ data: options.data, width: 280, height: 280 });
  };

  const filteredIcons = LOGO_LIBRARY.filter(icon => icon.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container qr-gen-main-wrapper">
      <div className="generator-layout">
        <div className="sticky-col">
          <h1 className="text-center">QR Generator</h1>
          <div className="qr-preview-container shadow-sm">
            <div ref={qrRef} className="qr-canvas-wrapper" />
          </div>
          <div className="qr-actions-container">
            <button onClick={downloadQR} className="btn btn-primary shadow-sm" disabled={!options.data}>
              <Download size={18} /> <span className="btn-text">Download</span>
            </button>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-secondary shadow-sm">
              <ScanLine size={18} /> <span className="btn-text">Scan</span>
            </button>
          </div>
          <div className="desktop-presets">
              <div className="presets-wrapper shadow-sm">
                <button className="presets-dropdown-trigger" onClick={() => setShowPresets(!showPresets)}>
                  <div className="flex-center gap-2">
                    <Palette size={16} />
                    <span>Quick Presets</span>
                  </div>
                  <ChevronDown size={18} className={`chevron-icon ${showPresets ? 'rotate' : ''}`} />
                </button>
                <div className={`presets-grid-container ${showPresets ? 'show' : ''}`}>
                  <div className="presets-grid">
                    {PRESETS.map((p) => (
                      <button key={p.name} onClick={() => applyPreset(p)} className={`preset-card ${options.qrColor === p.qrColor && options.bgColor === p.bgColor ? 'active' : ''}`}>
                        <div className="preset-preview-circle" style={{ background: `linear-gradient(135deg, ${p.qrColor} 50%, ${p.bgColor} 50%)` }} />
                        <span className="preset-name">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
          </div>
        </div>

        <div className="config-scroll-area">
          <div className="result-container no-margin-top">
            <div className="result-header"><h3>Configuration</h3></div>
            <div className="input-group">
              <label className="label-text">Content Data</label>
              <textarea value={options.data} onChange={(e) => setOptions({ ...options, data: e.target.value })} placeholder="Enter URL or text here..." className="textarea" />
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="label-text">Background</label>
                <input type="color" value={options.bgColor} onChange={(e) => setOptions({ ...options, bgColor: e.target.value })} className="color-input" />
              </div>
              <div className="input-group">
                <label className="label-text">QR Color</label>
                <input type="color" value={options.qrColor} onChange={(e) => setOptions({ ...options, qrColor: e.target.value })} className="color-input" />
              </div>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="label-text">Shape Style</label>
                <div className="select-wrapper">
                  <select value={options.dotType} onChange={(e) => setOptions({ ...options, dotType: e.target.value as DotType })}>
                    <option value="square">Square</option>
                    <option value="dots">Dots</option>
                    <option value="rounded">Rounded</option>
                    <option value="extra-rounded">Extra Rounded</option>
                    <option value="classy">Classy</option>
                    <option value="classy-rounded">Classy Rounded</option>
                  </select>
                  <ChevronDown className="select-arrow" size={18} />
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="label-text">Corner Frame</label>
                <div className="select-wrapper">
                  <select value={options.cornerSquareType} onChange={(e) => setOptions({ ...options, cornerSquareType: e.target.value as CornerSquareType })}>
                    <option value="square">Square</option>
                    <option value="dot">Dot</option>
                    <option value="rounded">Rounded</option>
                    <option value="extra-rounded">Extra Rounded</option>
                  </select>
                  <ChevronDown className="select-arrow" size={18} />
                </div>
              </div>
              <div className="input-group">
                <label className="label-text">Corner Dot</label>
                <div className="select-wrapper">
                  <select value={options.cornerDotType} onChange={(e) => setOptions({ ...options, cornerDotType: e.target.value as CornerDotType })}>
                    <option value="square">Square</option>
                    <option value="dot">Dot</option>
                  </select>
                  <ChevronDown className="select-arrow" size={18} />
                </div>
              </div>
            </div>

            <div className="logo-config-row">
              <div className="input-group">
                <label className="label-text">Logo Overlay</label>
                <div className="logo-action-container">
                  {logoPreview ? (
                    <div className="logo-preview-badge">
                      <img src={logoPreview} alt="Selected" />
                      <span className="badge-name">{selectedIcon ? selectedIcon.name : 'Custom'}</span>
                      <button className="badge-remove-btn" onClick={() => { setLogoPreview(null); setSelectedIcon(null); }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden-file-input" id="logo-upload" ref={fileInputRef} />
                      <label htmlFor="logo-upload" className="btn btn-secondary w-full cursor-pointer">
                        <UploadCloud size={18} /> Upload
                      </label>
                    </>
                  )}
                </div>
              </div>
              <div className="input-group">
                <label className="label-text">Icon Library</label>
                <button className="icon-lib-trigger-btn" onClick={() => setIsIconModalOpen(true)}>
                  <Search size={16} /> Browse
                </button>
              </div>
            </div>
            {logoError && <p className="error-text">{logoError}</p>}

            <div className="grid-2">
              <div className="input-group">
                <label className="label-text">Icon Color</label>
                <input type="color" value={iconColor} onChange={(e) => setIconColor(e.target.value)} className="color-input" />
              </div>
              <div className="input-group">
                <label className="label-text">Logo Scale</label>
                <div className="select-wrapper">
                  <select value={options.logoSize} onChange={(e) => setOptions({ ...options, logoSize: parseFloat(e.target.value) })}>
                    <option value={0.1}>Small (10%)</option>
                    <option value={0.2}>Medium (20%)</option>
                    <option value={0.3}>Large (30%)</option>
                  </select>
                  <ChevronDown className="select-arrow" size={18} />
                </div>
              </div>
              <div className="input-group">
                <label className="label-text">Error Correction</label>
                <div className="select-wrapper">
                  <select value={options.errorCorrectionLevel} onChange={(e) => setOptions({ ...options, errorCorrectionLevel: e.target.value as ErrorCorrectionLevel })}>
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                  <ChevronDown className="select-arrow" size={18} />
                </div>
              </div>
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label className="label-text">Format</label>
                <div className="select-wrapper">
                  <select value={options.imageFormat} onChange={(e) => setOptions({ ...options, imageFormat: e.target.value as Extension })}>
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="svg">SVG</option>
                  </select>
                  <ChevronDown className="select-arrow" size={18} />
                </div>
              </div>
              <div className="input-group">
                <label className="label-text">Size (px) <span className="text-xs opacity-50">(100-3000)</span></label>
                <input 
                  type="number" 
                  placeholder="500"
                  value={options.size === 0 ? '' : options.size} 
                  
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setOptions({ ...options, size: 0 });
                      return;
                    }

                    const numVal = parseInt(val);
                    
                    if (numVal > 3000) {
                      setOptions({ ...options, size: 3000 });
                    } else {
                      setOptions({ ...options, size: numVal });
                    }
                  }} 
                  
                  onBlur={(e) => {
                    const val = parseInt(e.target.value);
                    if (!val || val < 100) {
                      setOptions({ ...options, size: 500 }); 
                    }
                  }}
                  className="input" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isIconModalOpen && (
        <div className="modal-overlay" onClick={() => setIsIconModalOpen(false)}>
          <div className="modal-content fixed-size-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Icon Library</h3>
              <button onClick={() => setIsIconModalOpen(false)} className="close-modal-x-btn"><X size={20}/></button>
            </div>
            <div className="search-wrapper">
              <Search className="search-icon" size={18} />
              <input type="text" placeholder="Search icons..." className="icon-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
            </div>
            <div className="icon-selection-grid custom-scrollbar">
              <div className="icon-selection-item none-item" onClick={() => { setLogoPreview(null); setSelectedIcon(null); setIsIconModalOpen(false); }}>
                <div className="icon-img-wrapper"><ShieldAlert size={24} className="text-danger" /></div>
                <span>No Logo</span>
              </div>
              {filteredIcons.map((item) => {
                const LucideIcon = item.iconName ? ICON_MAP[item.iconName] : null;
                return (
                  <div key={item.id} className="icon-selection-item" onClick={() => { 
                      setSelectedIcon(item); setIconColor(item.color);
                      setLogoPreview(item.url || (item.iconName ? getIconDataUrl(item.iconName, item.color) : null));
                      setIsIconModalOpen(false); 
                  }}>
                    <div className="icon-img-wrapper">
                      {item.url ? <img src={item.url} alt={item.name} /> : LucideIcon ? <LucideIcon color={item.color} size={28} /> : <ImageIcon size={24} />}
                    </div>
                    <span>{item.name}</span>
                  </div>
                );
              })}
              {filteredIcons.length === 0 && (
                <div className="no-results-placeholder"><Search size={40} opacity={0.2} /><p>No icons found</p></div>
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button onClick={() => { setIsModalOpen(false); setScanPreview(null); setScanResultText(null); setScanError(null); setIsScanning(false); }} className="close-btn">
              <X size={24} />
            </button>
            <div className="modal-header">
              <h3>Import & Scan QR</h3>
            </div>
            <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop} onClick={() => !isScanning && document.getElementById('scan-upload')?.click()} className={`drop-zone ${isDragging ? 'dragging' : ''}`}>
              <input type="file" id="scan-upload" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && processScanFile(e.target.files[0])} />
              {scanPreview ? (
                <div className="scan-preview-wrapper">
                  {isScanning && isImgReady && <div className="scanner-line" />}
                  <img src={scanPreview} alt="Preview" onLoad={handleImageLoad} className={`scan-img ${isImgReady ? 'ready' : ''}`} />
                </div>
              ) : (
                <div className="drop-zone-content"><UploadCloud size={48} /><p>Drop QR image here or click to browse</p></div>
              )}
            </div>
            {(isScanning || scanError || scanResultText) && (
              <div className="scan-result-area">
                {isScanning && <div className="status-processing"><Loader2 className="animate-spin-icon" /> PROCESSING...</div>}
                {scanError && !isScanning && <div className="status-error"><ShieldAlert size={18} /> {scanError}</div>}
                {scanResultText && !isScanning && (
                  <div className="scan-success-card">
                    <div className="success-header">
                      <span className="decoded-label">Decoded Content</span>
                      <button className={`copy-scan-btn ${copied ? 'copied' : ''}`} onClick={() => { navigator.clipboard.writeText(scanResultText || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    </div>
                    <div className="decoded-text-wrapper"><p className="decoded-content">{scanResultText}</p></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;