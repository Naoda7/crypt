import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="container text-center py-20">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-2xl mb-6">Halaman tidak ditemukan</p>
      <Link 
        to="/" 
        className="btn btn-primary px-8 py-3 text-lg"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}

export default NotFound