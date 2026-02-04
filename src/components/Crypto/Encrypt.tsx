import { useState, ChangeEvent } from 'react'
import { Copy, RefreshCw } from 'lucide-react'

const ALGORITHMS = ['AES-GCM', 'AES-CBC', 'AES-CTR'] as const
type AlgorithmType = (typeof ALGORITHMS)[number]

const Encrypt = () => {
  const [input, setInput] = useState('')
  const [password, setPassword] = useState('')
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('AES-GCM')
  const [result, setResult] = useState('')
  const [showCopied, setShowCopied] = useState(false)
  const [showKeyCopied, setShowKeyCopied] = useState(false)
  const [loading, setLoading] = useState(false)

  const toBase64 = (buf: Uint8Array): string => {
    const binString = Array.from(buf, (byte) => String.fromCharCode(byte)).join('')
    return btoa(binString)
  }

  const generateSecureKey = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+"
    const length = 32 
    const array = new Uint32Array(length)
    window.crypto.getRandomValues(array)
    
    let secureKey = ""
    for (let i = 0; i < length; i++) {
      secureKey += charset[array[i] % charset.length]
    }
    setPassword(secureKey)
  }

  const copyKey = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setShowKeyCopied(true)
    setTimeout(() => setShowKeyCopied(false), 2000)
  }

  const handleEncrypt = async () => {
    if (!input || !password) return

    setLoading(true)
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(input)
      const salt = window.crypto.getRandomValues(new Uint8Array(16))

      const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
      )

      const aesKey = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 600000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: algorithm, length: 256 },
        false,
        ['encrypt']
      )

      const ivLength = algorithm === 'AES-GCM' ? 12 : 16
      const iv = window.crypto.getRandomValues(new Uint8Array(ivLength))

      let encryptParams: AesGcmParams | AesCbcParams | AesCtrParams
      if (algorithm === 'AES-GCM') {
        encryptParams = { name: 'AES-GCM', iv }
      } else if (algorithm === 'AES-CBC') {
        encryptParams = { name: 'AES-CBC', iv }
      } else {
        encryptParams = { name: 'AES-CTR', counter: iv, length: 64 }
      }

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        encryptParams,
        aesKey,
        data
      )

      const encryptedArray = new Uint8Array(encryptedBuffer)
      const combined = new Uint8Array(salt.length + iv.length + encryptedArray.length)
      
      combined.set(salt, 0)
      combined.set(iv, salt.length)
      combined.set(encryptedArray, salt.length + iv.length)

      setResult(toBase64(combined))
    } catch (error) {
      console.error('Encryption Failed:', error)
      setResult('Encryption Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-center mb-2">Encrypt Text</h2>

      <div className="input-group">
        <label className="label">Select Algorithm</label>
        <select 
          value={algorithm}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setAlgorithm(e.target.value as AlgorithmType)
            setResult('') 
          }}
          className="select"
        >
          {ALGORITHMS.map((algo) => (
            <option key={algo} value={algo}>{algo}</option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label className="label">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to encrypt"
          className="textarea"
        />
      </div>

      <div className="input-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="label">Encryption Key (PBKDF2)</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={generateSecureKey} className="btn btn-sm btn-secondary">
              <RefreshCw size={14} /> Generate
            </button>
            {password && (
              <button onClick={copyKey} className="btn btn-sm btn-secondary">
                {showKeyCopied ? '✓' : <Copy size={14} />}
              </button>
            )}
          </div>
        </div>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter secret key or generate"
          className="input"
        />
      </div>

      <button 
        onClick={handleEncrypt} 
        className="btn btn-primary w-full" 
        disabled={loading || !input || !password} 
        style={{ marginTop: '1rem' }}
      >
        {loading ? 'Encrypting...' : 'Encrypt'}
      </button>

      {result && (
        <div className="result-container m-8">
          <button onClick={() => {
            navigator.clipboard.writeText(result)
            setShowCopied(true)
            setTimeout(() => setShowCopied(false), 2000)
          }} className="copy-button">
            {showCopied ? <span style={{ color: 'var(--text-primary)' }}>✓</span> : <Copy size={16} />}
          </button>
          <h3 className="mb-1 text-sm font-semibold">Encrypted Result (Base64):</h3>
          <pre className="result" style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
            {result}
          </pre>
        </div>
      )}
    </div>
  )
}

export default Encrypt