import { useState } from 'react'
import WatermarkText from './WatermarkText'
import WatermarkLogo from './WatermarkLogo'

const WatermarkTools = () => {
  const [selectedOption, setSelectedOption] = useState<'text' | 'logo'>('text')

  return (
    <div>
      {/* Pilihan Watermark */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setSelectedOption('text')}
          className={`btn ${selectedOption === 'text' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Watermark with Text
        </button>
        <button
          onClick={() => setSelectedOption('logo')}
          className={`btn ${selectedOption === 'logo' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Watermark with Logo
        </button>
      </div>

      {/* Render Komponen Berdasarkan Pilihan */}
      {selectedOption === 'text' ? <WatermarkText /> : <WatermarkLogo />}
    </div>
  )
}

export default WatermarkTools