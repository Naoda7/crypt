import { useState, ChangeEvent } from 'react'
import { Copy } from 'lucide-react'

const ALGORITHMS = ['AES-GCM', 'AES-CBC', 'AES-CTR'] as const
type AlgorithmType = (typeof ALGORITHMS)[number]

const Decrypt = () => {
  const [input, setInput] = useState('')
  const [password, setPassword] = useState('')
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('AES-GCM')
  const [result, setResult] = useState('')
  const [showCopied, setShowCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const base64ToBuffer = (str: string): Uint8Array => {
    try {
      const binString = atob(str)
      const bytes = new Uint8Array(binString.length)
      for (let i = 0; i < binString.length; i++) {
        bytes[i] = binString.charCodeAt(i)
      }
      return bytes
    } catch {
      throw new Error("Invalid Base64 format")
    }
  }

  const handleDecrypt = async () => {
    if (!input || !password) return
    
    setLoading(true)
    setError('')
    setResult('')

    try {
      const fullBuffer = base64ToBuffer(input)
      
      const salt = fullBuffer.slice(0, 16)
      const ivLength = algorithm === 'AES-GCM' ? 12 : 16
      const iv = fullBuffer.slice(16, 16 + ivLength)
      const encryptedData = fullBuffer.slice(16 + ivLength)

      const encoder = new TextEncoder()
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
        ['decrypt']
      )

      let decryptParams: AesGcmParams | AesCbcParams | AesCtrParams
      if (algorithm === 'AES-GCM') {
        decryptParams = { name: 'AES-GCM', iv }
      } else if (algorithm === 'AES-CBC') {
        decryptParams = { name: 'AES-CBC', iv }
      } else {
        decryptParams = { name: 'AES-CTR', counter: iv, length: 64 }
      }

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        decryptParams,
        aesKey,
        encryptedData
      )

      setResult(new TextDecoder().decode(decryptedBuffer))
    } catch (err) {
      console.error('Decryption Failed:', err)
      setError('Decryption Error: Please check your password, algorithm, or encrypted data.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-center mb-2">Decrypt Text</h2>

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
        <label className="label">Encrypted Data (Base64)</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste the encrypted result here"
          className="textarea"
        />
      </div>

      <div className="input-group">
        <label className="label">Encryption Key (PBKDF2)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter secret key used for encryption"
          className="input"
        />
      </div>

      <button 
        onClick={handleDecrypt} 
        className="btn btn-primary w-full" 
        disabled={loading || !input || !password} 
        style={{ marginTop: '1rem' }}
      >
        {loading ? 'Decrypting...' : 'Decrypt'}
      </button>

      {error && (
        <p style={{ color: 'var(--action-remove)', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' }}>
          {error}
        </p>
      )}

      {result && (
        <div className="result-container m-8">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(result)
              setShowCopied(true)
              setTimeout(() => setShowCopied(false), 2000)
            }} 
            className="copy-button"
          >
            {showCopied ? <span style={{ color: 'var(--text-primary)' }}>✓</span> : <Copy size={16} />}
          </button>
          <h3 className="mb-1 text-sm font-semibold">Decrypted Message:</h3>
          <pre className="result" style={{ wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
            {result}
          </pre>
        </div>
      )}
    </div>
  )
}

export default Decrypt