import { useState } from 'react'
import CryptoJS from 'crypto-js'
import { Copy } from 'lucide-react'

const algorithms = ['AES', 'DES', 'TripleDES', 'RC4', 'Rabbit', 'RC4Drop'] as const

const Decrypt = () => {
  const [input, setInput] = useState('')
  const [key, setKey] = useState('')
  const [algorithm, setAlgorithm] = useState<(typeof algorithms)[number]>('AES')
  const [result, setResult] = useState('')
  const [showCopied, setShowCopied] = useState(false)

  const handleDecrypt = () => {
    try {
      const decrypted = CryptoJS[algorithm].decrypt(input, key)
      const resultText = decrypted.toString(CryptoJS.enc.Utf8)
      setResult(resultText || 'Invalid key or cipher text')
    } catch {
      setResult('Error decrypting text')
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
      <h2 className="text-center mb-2">Decrypt Text</h2>

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
          placeholder="Enter text to decrypt"
          className="textarea"
        />
      </div>

      <div className="input-group">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter decryption key"
          className="input"
        />
      </div>

      <button onClick={handleDecrypt} className="btn btn-primary">
        Decrypt
      </button>

      {result && (
      <div className="result-container">
        <div className="result-header">
          <h3 className="mb-1">Decrypted Result:</h3>
          <button
            onClick={copyToClipboard}
            className="copy-button"
          >
            {showCopied ? 'Copied!' :
              <Copy size={16} />
            }
          </button>
        </div>
        <pre className="result">{result}</pre>
      </div>
    )}

    </div>
  )
}

export default Decrypt