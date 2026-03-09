import { useState } from 'react'
import CryptoJS from 'crypto-js'
import { Copy, Check, ChevronDown } from 'lucide-react'

const hashAlgorithms = ['MD5', 'SHA1', 'SHA256', 'SHA512', 'SHA3', 'RIPEMD160'] as const

const Hash = () => {
  const [input, setInput] = useState('')
  const [algorithm, setAlgorithm] = useState<(typeof hashAlgorithms)[number]>('MD5')
  const [result, setResult] = useState('')
  const [showCopied, setShowCopied] = useState(false)

  const handleHash = () => {
    try {
      const hash = CryptoJS[algorithm](input)
      setResult(hash.toString(CryptoJS.enc.Hex))
    } catch {
      setResult('Error generating hash')
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
      <h1 className="text-center mb-2">Generate Hash</h1>

      <div className="input-group">
        <div className="select-wrapper">
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as typeof hashAlgorithms[number])}
          >
            {hashAlgorithms.map(algo => (
              <option key={algo} value={algo}>{algo}</option>
            ))}
          </select>
          <ChevronDown className="select-arrow" size={18} />
        </div>
      </div>

      <div className="input-group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash"
          className="textarea"
        />
      </div>

      <div className="input-group">
        <button onClick={handleHash} className="btn btn-primary">
          Generate Hash
        </button>
      </div>

      {result && (
      <div className="result-container">
        <div className="result-header">
          <h3 className="mb-1">Hash Result:</h3>
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
              <Copy size={16} />
            )}
          </button>
        </div>
        <pre className="result" style={{ 
          background: 'var(--surface)', 
          padding: '1rem', 
          borderRadius: '6px',
          overflow: 'auto',
          wordBreak: 'break-all'
        }}>{result}</pre>
      </div>
    )}
    </div>
  )
}

export default Hash