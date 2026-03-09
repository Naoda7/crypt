import { useState } from 'react'
import bcrypt from 'bcryptjs'
import { Copy, Check, ChevronDown, Eye, EyeOff } from 'lucide-react'

const saltRoundsOptions = [8, 9, 10, 11, 12] as const

const Bcrypt = () => {
  const [password, setPassword] = useState('')
  const [saltRounds, setSaltRounds] = useState<typeof saltRoundsOptions[number]>(10)
  const [hashed, setHashed] = useState('')
  const [showCopied, setShowCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    generateHash()
  }

  const generateHash = async () => {
    if (!password) return
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
      <div className="tool-header text-center mb-2">
        <h1>Bcrypt Hash Generator</h1>
      </div>

      <form onSubmit={handleSubmit} className="tool-body">
        {/* Input Salt Rounds */}
        <div className="input-group">
          <label className="label">Salt Rounds</label>
          <div className="select-wrapper">
            <select
              value={saltRounds}
              onChange={(e) => setSaltRounds(Number(e.target.value) as typeof saltRoundsOptions[number])}
              className="select"
            >
              {saltRoundsOptions.map(round => (
                <option key={round} value={round}>
                  Cost Factor: {round}
                </option>
              ))}
            </select>
            <ChevronDown className="select-arrow" size={18} />
          </div>
        </div>

        <div className="input-group">
          <label className="label">Data to Hash</label>
          <input 
            type="text" 
            name="username" 
            autoComplete="username" 
            style={{ display: 'none' }} 
            readOnly 
          />
          <div className="password-input-wrapper" style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="bcrypt-input"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password or data"
              className="input"
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary w-full"
          disabled={isLoading || !password}
        >
          {isLoading ? 'Generating Hash...' : 'Generate Bcrypt Hash'}
        </button>
      </form>

      {hashed && (
        <div className="result-container mt-4" style={{ marginTop: '2rem' }}>
          <div className="result-header">
            <h3 className="mb-0">Bcrypt Hash:</h3>
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
            }}>{hashed}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bcrypt