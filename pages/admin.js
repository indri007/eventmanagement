import Head from 'next/head'
import { useState, useEffect } from 'react'

export default function Admin() {
  const [pendingTransactions, setPendingTransactions] = useState([])

  useEffect(() => {
    loadPendingTransactions()
    // Refresh every 30 seconds
    const interval = setInterval(loadPendingTransactions, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadPendingTransactions = async () => {
    try {
      const response = await fetch('/api/admin/transactions/pending')
      if (response.ok) {
        const data = await response.json()
        setPendingTransactions(data)
      }
    } catch (error) {
      console.error('Error loading pending transactions:', error)
      // Fallback to localStorage for demo
      const transactions = JSON.parse(localStorage.getItem('eventku_transactions') || '[]')
      setPendingTransactions(transactions.filter(t => t.status === 'waiting_confirmation'))
    }
  }

  const approveTransaction = async (transactionId) => {
    if (confirm('Apakah Anda yakin ingin menyetujui transaksi ini?')) {
      try {
        const response = await fetch(`/api/admin/transactions/${transactionId}/approve`, {
          method: 'POST'
        })
        if (response.ok) {
          alert('Transaksi berhasil disetujui!')
          loadPendingTransactions()
        }
      } catch (error) {
        console.error('Error approving transaction:', error)
        // Fallback to localStorage for demo
        const transactions = JSON.parse(localStorage.getItem('eventku_transactions') || '[]')
        const transaction = transactions.find(t => t.id === transactionId)
        if (transaction) {
          transaction.status = 'done'
          localStorage.setItem('eventku_transactions', JSON.stringify(transactions))
          alert('Transaksi berhasil disetujui!')
          loadPendingTransactions()
        }
      }
    }
  }

  const rejectTransaction = async (transactionId) => {
    if (confirm('Apakah Anda yakin ingin menolak transaksi ini? Points dan kursi akan dikembalikan.')) {
      try {
        const response = await fetch(`/api/admin/transactions/${transactionId}/reject`, {
          method: 'POST'
        })
        if (response.ok) {
          alert('Transaksi ditolak. Points dan kursi akan dikembalikan.')
          loadPendingTransactions()
        }
      } catch (error) {
        console.error('Error rejecting transaction:', error)
        // Fallback to localStorage for demo
        const transactions = JSON.parse(localStorage.getItem('eventku_transactions') || '[]')
        const transaction = transactions.find(t => t.id === transactionId)
        if (transaction) {
          transaction.status = 'rejected'
          localStorage.setItem('eventku_transactions', JSON.stringify(transactions))
          alert('Transaksi ditolak. Points dan kursi akan dikembalikan.')
          loadPendingTransactions()
        }
      }
    }
  }

  return (
    <>
      <Head>
        <title>Admin Panel - EventKu</title>
        <meta name="description" content="Kelola konfirmasi pembayaran transaksi" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="admin-container">
        <div className="admin-header">
          <h1>🛠️ Admin Panel EventKu</h1>
          <p>Kelola konfirmasi pembayaran transaksi</p>
        </div>
        
        <div className="pending-transactions">
          <h2>Transaksi Menunggu Konfirmasi</h2>
          <div>
            {pendingTransactions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666' }}>
                Tidak ada transaksi yang menunggu konfirmasi.
              </p>
            ) : (
              pendingTransactions.map(transaction => (
                <div key={transaction.id} className="admin-transaction-item">
                  <h4>Transaksi #{transaction.id}</h4>
                  <p><strong>Event:</strong> {transaction.eventTitle}</p>
                  <p><strong>Jumlah Tiket:</strong> {transaction.quantity}</p>
                  <p><strong>Total Bayar:</strong> Rp {transaction.finalPrice?.toLocaleString('id-ID')}</p>
                  <p><strong>Points Digunakan:</strong> {transaction.pointsUsed?.toLocaleString('id-ID')}</p>
                  <p><strong>Tanggal Transaksi:</strong> {new Date(transaction.createdAt).toLocaleDateString('id-ID')}</p>
                  <p><strong>Bukti Pembayaran:</strong> {transaction.paymentProof || 'Belum ada'}</p>
                  
                  <div className="admin-actions">
                    <button 
                      className="btn-approve" 
                      onClick={() => approveTransaction(transaction.id)}
                    >
                      ✅ Setujui
                    </button>
                    <button 
                      className="btn-reject" 
                      onClick={() => rejectTransaction(transaction.id)}
                    >
                      ❌ Tolak
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-container {
          max-width: 1000px;
          margin: 2rem auto;
          padding: 0 20px;
        }
        .admin-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          text-align: center;
        }
        .pending-transactions {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .admin-transaction-item {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          background: #f8f9fa;
        }
        .admin-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        .btn-approve {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        .btn-approve:hover {
          background: #218838;
        }
        .btn-reject {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }
        .btn-reject:hover {
          background: #c82333;
        }
      `}</style>
    </>
  )
}