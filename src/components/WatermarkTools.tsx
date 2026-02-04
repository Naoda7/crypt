import { useState } from 'react'
import WatermarkText from './WatermarkText'
import WatermarkLogo from './WatermarkLogo'

const WatermarkTools = () => {
  const [selectedOption, setSelectedOption] = useState<'text' | 'logo'>('text')

  return (
    <div>
      <div className="button-group">
        <button
          onClick={() => setSelectedOption('text')}
          className={`tool-button ${selectedOption === 'text' ? 'active' : ''}`}
          type="button"
        >
          <span className="button-icon">Aa</span>
          Text Watermark
        </button>

        <button
          onClick={() => setSelectedOption('logo')}
          className={`tool-button ${selectedOption === 'logo' ? 'active' : ''}`}
          type="button"
        >
          <span className="button-icon">🖼️</span>
          Logo Watermark
        </button>
      </div>

      <div className="tool-content">
        {selectedOption === 'text' ? <WatermarkText /> : <WatermarkLogo />}
      </div>
    </div>
  )
}

export default WatermarkTools