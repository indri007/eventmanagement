import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function TransactionDetail() {
  const router = useRouter()
  const { id } = router.query
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [paymentProof, setPaymentProof] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (id) {
      loadTransaction()
    }
  }, [id])

  useEffect(() => {
    if (transaction && transaction.expiresAt) {
      const timer = setInterval(() => {
        const now = new Date().getTime()
        const expiry = new Date(transaction.expiresAt).getTime()
        const difference = expiry - now

        if (difference > 0) {
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((difference % (1000 * 60)) / 1000)
          
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
        } else {
          setTimeLeft('EXPIRED')
          clearInterval(timer)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [transaction])

  const loadTransaction = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/transactions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const result = await response.json()
        setTransaction(result.data)
      } else {
        alert('Transaksi tidak ditemukan')
        router.push('/')
      }
    } catch (error) {
      console.error('Error loading transaction:', error)
      alert('Terjadi kesalahan saat memuat transaksi')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Ukuran file maksimal 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar')
        return
      }
      setPaymentProof(file)
    }
  }

  const uploadPaymentProof = async () => {
    if (!paymentProof) {
      alert('Pilih file bukti pembayaran terlebih dahulu')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('paymentProof', paymentProof)

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/transactions/${id}/upload-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        alert('Bukti pembayaran berhasil diupload!')
        loadTransaction() // Reload transaction data
        setPaymentProof(null)
      } else {
        const result = await response.json()
        alert(result.message || 'Gagal upload bukti pembayaran')
      }
    } catch (error) {
      alert('Terjadi kesalahan saat upload')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Memuat detail transaksi...</p>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Transaksi tidak ditemukan</p>
        <Link href="/">← Kembali ke Beranda</Link>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Detail Transaksi - EventKu</title>
      </Head>

      <div className="transaction-container">
        <div className="container">
          <Link href="/" className="back-link">← Kembali ke Beranda</Link>
          
          <div className="transaction-card">
            <div className="transaction-header">
              <h1>Detail Transaksi</h1>
              <div className={`status ${transaction.status.toLowerCase()}`}>
                {transaction.status}
              </div>
            </div>

            {timeLeft && timeLeft !== 'EXPIRED' && transaction.status === 'WAITING_PAYMENT' && (
              <div className="countdown-timer">
                <h3>⏰ Waktu Pembayaran Tersisa</h3>
                <div className="timer">{timeLeft}</div>
                <p>Transaksi akan otomatis dibatalkan jika tidak dibayar dalam waktu yang ditentukan</p>
              </div>
            )}

            {timeLeft === 'EXPIRED' && (
              <div className="expired-notice">
                <h3>⚠️ Transaksi Kedaluwarsa</h3>
                <p>Waktu pembayaran telah habis. Transaksi ini akan dibatalkan secara otomatis.</p>
              </div>
            )}

            <div className="transaction-details">
              <div className="event-info">
                <div className="event-icon">{transaction.event.icon}</div>
                <div>
                  <h2>{transaction.event.title}</h2>
                  <p>📅 {new Date(transaction.event.date).toLocaleDateString('id-ID')}</p>
                  <p>🕐 {transaction.event.time} WIB</p>
                  <p>📍 {transaction.event.location}</p>
                </div>
              </div>

              <div className="payment-summary">
                <h3>Ringkasan Pembayaran</h3>
                <div className="summary-row">
                  <span>Jumlah Tiket:</span>
                  <span>{transaction.quantity} tiket</span>
                </div>
                <div className="summary-row">
                  <span>Harga Asli:</span>
                  <span>Rp {transaction.originalPrice.toLocaleString('id-ID')}</span>
                </div>
                {transaction.pointsUsed > 0 && (
                  <div className="summary-row">
                    <span>Diskon Poin:</span>
                    <span>- Rp {transaction.pointsUsed.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total Bayar:</span>
                  <span>Rp {transaction.finalPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {transaction.status === 'WAITING_PAYMENT' && timeLeft !== 'EXPIRED' && (
                <div className="payment-instructions">
                  <h3>Instruksi Pembayaran</h3>
                  <div className="bank-info">
                    <h4>Transfer ke Rekening:</h4>
                    <p><strong>Bank BCA</strong></p>
                    <p>No. Rekening: <strong>1234567890</strong></p>
                    <p>Atas Nama: <strong>EventKu Indonesia</strong></p>
                    <p>Jumlah: <strong>Rp {transaction.finalPrice.toLocaleString('id-ID')}</strong></p>
                  </div>
                  
                  <div className="upload-section">
                    <h4>Upload Bukti Pembayaran</h4>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                    {paymentProof && (
                      <div className="file-preview">
                        <p>File dipilih: {paymentProof.name}</p>
                        <button 
                          onClick={uploadPaymentProof}
                          disabled={uploading}
                          className="btn-upload"
                        >
                          {uploading ? 'Mengupload...' : 'Upload Bukti Pembayaran'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {transaction.paymentProof && (
                <div className="proof-section">
                  <h3>Bukti Pembayaran</h3>
                  <div className="proof-status">
                    <p>✅ Bukti pembayaran telah diupload</p>
                    <p>Status: Menunggu konfirmasi dari organizer</p>
                  </div>
                </div>
              )}

              {transaction.status === 'DONE' && (
                <div className="success-section">
                  <h3>🎉 Pembayaran Berhasil!</h3>
                  <p>Tiket Anda telah dikonfirmasi. Selamat menikmati event!</p>
                  <button className="btn-primary">Download E-Ticket</button>
                </div>
              )}

              {transaction.status === 'REJECTED' && (
                <div className="rejected-section">
                  <h3>❌ Pembayaran Ditolak</h3>
                  <p>Bukti pembayaran Anda ditolak oleh organizer. Silakan hubungi organizer untuk informasi lebih lanjut.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}