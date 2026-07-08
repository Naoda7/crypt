import { useState } from 'react'
import CryptoJS from 'crypto-js'
import { Copy } from 'lucide-react'

const algorithms = ['AES', 'DES', 'TripleDES', 'RC4', 'Rabbit', 'RC4Drop'] as const

const Encrypt = () => {
  const [input, setInput] = useState('')
  const [key, setKey] = useState('')
  const [algorithm, setAlgorithm] = useState<(typeof algorithms)[number]>('AES')
  const [result, setResult] = useState('')
  const [showCopied, setShowCopied] = useState(false)

  const handleEncrypt = () => {
    try {
      const encrypted = CryptoJS[algorithm].encrypt(input, key)
      setResult(encrypted.toString())
    } catch {
      setResult('Error encrypting text')
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
      <h2 className="text-center mb-2">Encrypt Text</h2>
      
      <div className="input-group">
        <select 
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value as typeof algorithms[number])}
          className="select"
        >
          {algorithms.map(algo => (
            <option key={algo} value={algo}>{algo}</option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to encrypt"
          className="textarea"
        />
      </div>

      <div className="input-group">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter encryption key"
          className="input"
        />
      </div>

      <button onClick={handleEncrypt} className="btn btn-primary">
        Encrypt
      </button>

      {result && (
        <div className="result-container">
          <button 
            onClick={copyToClipboard} 
            className="copy-button"
          >
            {showCopied ? (
              <span style={{ color: 'var(--primary)' }}>✓</span>
            ) : (
              <Copy size={16} />
            )}
          </button>
          <h3 className="mb-1">Encrypted Result:</h3>
          <pre className="result">{result}</pre>
        </div>
      )}
      
    </div>
  )
}

export default Encrypt