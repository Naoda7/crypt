import { useState } from 'react'
import bcrypt from 'bcryptjs'
import { Copy, Check } from 'lucide-react'

const saltRoundsOptions = [8, 9, 10, 11, 12] as const

const Bcrypt = () => {
  const [password, setPassword] = useState('')
  const [saltRounds, setSaltRounds] = useState<typeof saltRoundsOptions[number]>(10)
  const [hashed, setHashed] = useState('')
  const [showCopied, setShowCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const generateHash = async () => {
    setIsLoading(true)
    try {
      const salt = await bcrypt.genSalt(saltRounds)
      const hash = await bcrypt.hash(password, salt)
      setHashed(hash)
    } catch {
      setHashed('Error generating hash')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(hashed)
      setShowCopied(true)
      setTimeout(() => setShowCopied(false), 2000)
    } catch {
      console.error('Failed to copy text')
    }
  }

  return (
    <div className="container">
      <h2 className="text-center mb-2">Bcrypt Hash Generator</h2>

      <div className="input-group">
        <select
          value={saltRounds}
          onChange={(e) => setSaltRounds(Number(e.target.value) as typeof saltRoundsOptions[number])}
          className="select"
        >
          {saltRoundsOptions.map(round => (
            <option key={round} value={round}>
              Salt Rounds: {round}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password to hash"
          className="input"
        />
      </div>

      <button 
        onClick={generateHash} 
        className="btn btn-primary"
        disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate Hash'}
      </button>

      {hashed && (
        <div className="result-container">
          <button 
            onClick={copyToClipboard} 
            className="copy-button"
            disabled={!hashed}
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
          <h3 className="mb-1">Bcrypt Hash:</h3>
          <pre className="result">{hashed}</pre>
        </div>
      )}
    </div>
  )
}

export default Bcrypt