import { useState } from 'react'
import Encrypt from './Encrypt'
import Decrypt from './Decrypt'
import FileEncryption from './FileEncryption'
import { Type, Unlock, Shield } from 'lucide-react'

type TabType = 'encrypt' | 'decrypt' | 'file'

const CryptoPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('encrypt')

  const getSliderPos = () => {
    if (activeTab === 'encrypt') return 'pos-0'
    if (activeTab === 'decrypt') return 'pos-1'
    return 'pos-2'
  }

  return (
    <div className="container">
      <div className="text-center mb-3">
        <h1 className="text-xl font-semibold mb-1">Cryptography</h1>
        <p className="label">Secure Text and Files with AES-256</p>
      </div>

      <div className="tab-nav-container">
        <div className="tab-nav-wrapper" style={{ maxWidth: '600px' }}>
          <div className={`tab-slider three-tabs ${getSliderPos()}`} />
          
          <button
            onClick={() => setActiveTab('encrypt')}
            className={`tab-item ${activeTab === 'encrypt' ? 'active' : ''}`}
          >
            <Type size={16} />
            TEXT
          </button>
          
          <button
            onClick={() => setActiveTab('decrypt')}
            className={`tab-item ${activeTab === 'decrypt' ? 'active' : ''}`}
          >
            <Unlock size={16} />
            DECRYPT
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`tab-item ${activeTab === 'file' ? 'active' : ''}`}
          >
            <Shield size={16} />
            FILE
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'encrypt' && <Encrypt />}
        {activeTab === 'decrypt' && <Decrypt />}
        {activeTab === 'file' && <FileEncryption />}
      </div>
    </div>
  )
}

export default CryptoPage