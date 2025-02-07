import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Encrypt from './components/Encrypt'
import Decrypt from './components/Decrypt'
import Hash from './components/Hash'
import Hmac from './components/Hmac'
import Bcrypt from './components/Bcrypt'
import QRCodeGenerator from './components/QRCodeGenerator'
import Tools from './components/Tools'
import './styles/global.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Encrypt /> },
      { path: "decrypt", element: <Decrypt /> },
      { path: "hash", element: <Hash /> },
      { path: "hmac", element: <Hmac /> },
      { path: "bcrypt", element: <Bcrypt /> },
      { path: "qrcode", element: <QRCodeGenerator /> },
      { path: "tools", element: <Tools /> }, // Tambahkan route untuk Tools
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)