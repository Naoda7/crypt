import { useState } from 'react'
import CryptoJS from 'crypto-js'
import { Copy, Check, ChevronDown, Eye, EyeOff } from 'lucide-react'

const hmacAlgorithms = [
  'MD5',
  'SHA1',
  'SHA224',
  'SHA256',
  'SHA384',
  'SHA512',
  'SHA3',
  'RIPEMD160'
] as const

type HmacAlgorithm = typeof hmacAlgorithms[number]

const algorithmMap: Record<HmacAlgorithm, (message: string, key: string) => CryptoJS.lib.WordArray> = {
  MD5: CryptoJS.HmacMD5,
  SHA1: CryptoJS.HmacSHA1,
  SHA224: CryptoJS.HmacSHA224,
  SHA256: CryptoJS.HmacSHA256,
  SHA384: CryptoJS.HmacSHA384,
  SHA512: CryptoJS.HmacSHA512,
  SHA3: (message, key) => CryptoJS.HmacSHA3?.(message, key) || CryptoJS.lib.WordArray.create(),
  RIPEMD160: (message, key) => CryptoJS.HmacRIPEMD160?.(message, key) || CryptoJS.lib.WordArray.create()
}

const Hmac = () => {
  const [input, setInput] = useState('')
  const [secret, setSecret] = useState('')
  const [algorithm, setAlgorithm] = useState<HmacAlgorithm>('SHA256')
  const [result, setResult] = useState('')
  const [showCopied, setShowCopied] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateHmac()
  }

  const generateHmac = () => {
    if (!input || !secret) return
    try {
      const hmacFunction = algorithmMap[algorithm]
      const hmac = hmacFunction(input, secret)
      setResult(hmac.toString(CryptoJS.enc.Hex))
    } catch {
      setResult('Error generating HMAC')
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    } catch {
      console.error('Failed to copy text')
    }
  }

  return (
    <div className="container">
      <div className="tool-header text-center mb-2">
        <h1>HMAC Generator</h1>
      </div>

      <form onSubmit={handleSubmit} className="tool-body">
        {/* Input Algoritma */}
        <div className="input-group">
          <label className="label">Algorithm</label>
          <div className="select-wrapper">
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as HmacAlgorithm)}
              className="select"
            >
              {hmacAlgorithms.map(algo => (
                <option key={algo} value={algo}>{algo}</option>
              ))}
            </select>
            <ChevronDown className="select-arrow" size={18} />
          </div>
        </div>

        {/* Input Message */}
        <div className="input-group">
          <label className="label">Message</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter message to sign"
            className="textarea"
            rows={4}
          />
        </div>

        <div className="input-group">
          <label className="label">Secret Key</label>
          <input 
            type="text" 
            name="username" 
            autoComplete="username" 
            style={{ display: 'none' }} 
            readOnly 
          />
          <div className="password-input-wrapper" style={{ position: 'relative' }}>
            <input
              type={showSecret ? 'text' : 'password'}
              name="hmac-key"
              value={secret}
              autoComplete="new-password"
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter secret key"
              className="input"
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary, #666)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {showSecret ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Generate HMAC
        </button>
      </form>

      {result && (
        <div className="result-container mt-4" style={{ marginTop: '2rem' }}>
          <div className="result-header">
            <h3 className="mb-0">HMAC Result ({algorithm}):</h3>
            <button 
              onClick={copyToClipboard} 
              className="copy-button"
              type="button"
            >
              {showCopied ? (
                <><Check size={16} /><span>Copied!</span></>
              ) : (
                <><Copy size={16} /><span>Copy</span></>
              )}
            </button>
          </div>
          <div className="result-box mt-1">
            <pre className="result-text" style={{ 
              background: 'var(--surface)', 
              padding: '1rem', 
              borderRadius: '6px',
              overflow: 'auto',
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap'
            }}>{result}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default Hmac