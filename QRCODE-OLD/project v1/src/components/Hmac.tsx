import { useState } from 'react'
import CryptoJS from 'crypto-js'
import { Copy, Check } from 'lucide-react'

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

  const generateHmac = () => {
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
      <h2 className="text-center mb-2">HMAC Generator</h2>

      <div className="input-group">
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as typeof hmacAlgorithms[number])}
          className="select"
        >
          {hmacAlgorithms.map(algo => (
            <option key={algo} value={algo}>{algo}</option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter message to sign"
          className="textarea"
        />
      </div>

      <div className="input-group">
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Enter secret key"
          className="input"
        />
      </div>

      <button onClick={generateHmac} className="btn btn-primary">
        Generate HMAC
      </button>

      {result && (
        <div className="result-container">
          <button 
            onClick={copyToClipboard} 
            className="copy-button"
          >
            {showCopied ? (
              <>
                <Check size={16} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy</span>
              </>
            )}
          </button>
          <h3 className="mb-1">HMAC Result:</h3>
          <pre className="result">{result}</pre>
        </div>
      )}
    </div>
  )
}

export default Hmac