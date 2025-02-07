import { useState } from 'react'
import WatermarkTools from './WatermarkTools'
import ConvertTools from './ConvertTools'

const Tools = () => {
  const [selectedTool, setSelectedTool] = useState<'watermark' | 'convert'>('watermark')

  return (
    <div className="container">
      <h2 className="text-center mb-2">Tools</h2>

      {/* Pilihan Tools */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setSelectedTool('watermark')}
          className={`btn ${selectedTool === 'watermark' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Images Watermark
        </button>
        <button
          onClick={() => setSelectedTool('convert')}
          className={`btn ${selectedTool === 'convert' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Images Convert
        </button>
      </div>

      {/* Render Komponen Berdasarkan Pilihan */}
      {selectedTool === 'watermark' ? <WatermarkTools /> : <ConvertTools />}
    </div>
  )
}

export default Tools