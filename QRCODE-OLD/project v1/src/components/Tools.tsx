import { useState } from 'react'
import WatermarkTools from './WatermarkTools'
import ConvertTools from './ConvertTools'

const Tools = () => {
  const [selectedTool, setSelectedTool] = useState<'watermark' | 'convert'>('watermark')

  return (
    <div className="container">
      <h2 className="text-center mb-2">Tools</h2>

      {/* Pilihan Tools */}
      <div className="button-group">
        <button
          onClick={() => setSelectedTool('watermark')}
          className={`tool-button ${
            selectedTool === 'watermark' 
              ? 'active' 
              : ''
          }`}
          aria-label="Watermark Tools"
        >
          <span className="button-icon">🖼️</span>
          Images Watermark
        </button>
        
        <button
          onClick={() => setSelectedTool('convert')}
          className={`tool-button ${
            selectedTool === 'convert' 
              ? 'active' 
              : ''
          }`}
          aria-label="Convert Tools"
        >
          <span className="button-icon">🔄</span>
          Images Convert
        </button>
      </div>

      {/* Render Komponen */}
      {selectedTool === 'watermark' ? <WatermarkTools /> : <ConvertTools />}
    </div>
  )
}

export default Tools