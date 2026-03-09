import { useState } from 'react'
import WatermarkTools from './WatermarkTools'
import ConvertTools from './ConvertTools'

const Tools = () => {
  const [selectedTool, setSelectedTool] = useState<'watermark' | 'convert'>('watermark')

  return (
    <div className="container">
      <h1 className="text-center mb-2">Tools</h1>

      <div className="tab-nav-container">
        <div className="tab-nav-wrapper">
          <div className={`tab-slider ${selectedTool}`}></div>
          
          <button
            onClick={() => setSelectedTool('watermark')}
            className={`tab-item ${selectedTool === 'watermark' ? 'active' : ''}`}
            aria-label="Watermark Tools"
          >
            Images Watermark
          </button>
          
          <button
            onClick={() => setSelectedTool('convert')}
            className={`tab-item ${selectedTool === 'convert' ? 'active' : ''}`}
            aria-label="Convert Tools"
          >
            Images Convert
          </button>
        </div>
      </div>

      {selectedTool === 'watermark' ? <WatermarkTools /> : <ConvertTools />}
    </div>
  )
}

export default Tools