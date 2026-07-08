import { useState } from 'react'
import WatermarkTools from './WatermarkTools'
import ConvertTools from './ConvertTools'
import ImageLayoutTools from './ImageLayoutTools'

const Tools = () => {
  const [selectedTool, setSelectedTool] = useState<'watermark' | 'convert' | 'layout'>('watermark')

  const getSliderLeftPosition = () => {
    switch (selectedTool) {
      case 'watermark':
        return '0%'
      case 'convert':
        return '33.333%'
      case 'layout':
        return '66.666%'
      default:
        return '0%'
    }
  }

  return (
    <div className="container">
      <h1 className="text-center mb-2">Tools</h1>

      <div className="tab-nav-container">
        <div className="tab-nav-wrapper" style={{ position: 'relative', display: 'flex', width: '100%' }}>
          <div 
            className="tab-slider"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: getSliderLeftPosition(),
              width: '33.333%',
              transition: 'left 0.2s ease-in-out',
              zIndex: 0,
              borderRadius: 'inherit'
            }}
          ></div>
          
          <button
            onClick={() => setSelectedTool('watermark')}
            className={`tab-item ${selectedTool === 'watermark' ? 'active' : ''}`}
            aria-label="Watermark Tools"
            style={{ flex: 1, zIndex: 1, position: 'relative', background: 'transparent' }}
          >
            Images Watermark
          </button>
          
          <button
            onClick={() => setSelectedTool('convert')}
            className={`tab-item ${selectedTool === 'convert' ? 'active' : ''}`}
            aria-label="Convert Tools"
            style={{ flex: 1, zIndex: 1, position: 'relative', background: 'transparent' }}
          >
            Images Convert
          </button>

          <button
            onClick={() => setSelectedTool('layout')}
            className={`tab-item ${selectedTool === 'layout' ? 'active' : ''}`}
            aria-label="Image Layout"
            style={{ flex: 1, zIndex: 1, position: 'relative', background: 'transparent' }}
          >
            Image Layout
          </button>
          
        </div>
      </div>

      {selectedTool === 'watermark' && <WatermarkTools />}
      {selectedTool === 'convert' && <ConvertTools />}
      {selectedTool === 'layout' && <ImageLayoutTools />}
    </div>
  )
}

export default Tools