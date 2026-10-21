import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css' // Az önce oluşturduğunuz CSS dosyasını buraya çağırıyoruz

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div style={{ padding: '20px', fontSize: '24px' }}>
      Proje başarıyla yüklendi!
    </div>
  </React.StrictMode>,
)