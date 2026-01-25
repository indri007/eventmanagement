import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function MyTransactions() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    setUser(JSON.parse(userData))
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const result = await response.json()
        setTransactions(result.data || [])
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'WAITING_PAYMENT': return 'waiting_payment'
      case 'WAITING_CONFIRMATION': return 'waiting_confirmation'
      case 'DONE': return 'done'
      case 'REJECTED': return 'rejected'
      case 'EXPIRED': return 'expired'
      default: return 'waiting_payment'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'WAITING_PAYMENT': return 'Menunggu Pembayaran'
      case 'WAITING_CONFIRMATION': return 'Menunggu Konfirmasi'
      case 'DONE': return 'Selesai'
      case 'REJECTED': return 'Ditolak'
      case 'EXPIRED': return 'Kedaluwarsa'
      default: return status
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Memuat transaksi...</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Transaksi Saya - EventKu</title>
      </Head>

      <div className="my-transactions-container">
        <div className="container">
          <div className="page-header">
            <Link href="/" className="back-link">← Kembali ke Beranda</Link>
            <h1>Transaksi Saya</h1>
            <p>Kelola semua transaksi dan tiket Anda</p>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎫</div>
              <h2>Belum Ada Transaksi</h2>
              <p>Anda belum memiliki transaksi apapun. Mulai jelajahi event menarik!</p>
              <Link href="/" className="btn-primary">
                Jelajahi Event
              </Link>
            </div>
          ) : (
            <div className="transactions-grid">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-header">
                    <div className="event-info">
                      <div className="event-icon">{transaction.event.icon}</div>
                      <div>
                        <h3>{transaction.event.title}</h3>
                        <p>📅 {new Date(transaction.event.date).toLocaleDateString('id-ID')}</p>
                        <p>🕐 {transaction.event.time} WIB</p>
                      </div>
                    </div>
                    <div className={`status ${getStatusColor(transaction.status)}`}>
                      {getStatusText(transaction.status)}
                    </div>
                  </div>

                  <div className="transaction-details">
                    <div className="detail-row">
                      <span>Jumlah Tiket:</span>
                      <span>{transaction.quantity} tiket</span>
                    </div>
                    <div className="detail-row">
                      <span>Total Bayar:</span>
                      <span className="price">Rp {transaction.finalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    {transaction.pointsUsed > 0 && (
                      <div className="detail-row">
                        <span>Poin Digunakan:</span>
                        <span>{transaction.pointsUsed.toLocaleString('id-ID')} poin</span>
                      </div>
                    )}
                    <div className="detail-row">
                      <span>Tanggal Transaksi:</span>
                      <span>{new Date(transaction.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="transaction-actions">
                    <Link 
                      href={`/transactions/${transaction.id}`}
                      className="btn-detail"
                    >
                      Lihat Detail
                    </Link>
                    
                    {transaction.status === 'DONE' && (
                      <button className="btn-download">
                        Download E-Ticket
                      </button>
                    )}
                    
                    {transaction.status === 'DONE' && (
                      <button className="btn-review">
                        Beri Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}