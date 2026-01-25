import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function OrganizerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
    pendingTransactions: 0
  })
  const [events, setEvents] = useState([])
  const [transactions, setTransactions] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'ORGANIZER') {
      router.push('/')
      return
    }

    setUser(parsedUser)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      // Load stats
      const statsResponse = await fetch('/api/dashboard/organizer/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (statsResponse.ok) {
        const statsResult = await statsResponse.json()
        setStats(statsResult.data)
      }

      // Load events
      const eventsResponse = await fetch('/api/dashboard/organizer/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (eventsResponse.ok) {
        const eventsResult = await eventsResponse.json()
        setEvents(eventsResult.data || [])
      }

      // Load transactions
      const transactionsResponse = await fetch('/api/dashboard/organizer/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (transactionsResponse.ok) {
        const transactionsResult = await transactionsResponse.json()
        setTransactions(transactionsResult.data || [])
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionAction = async (transactionId, action) => {
    try {
      const token = localStorage.getItem('token')
      const endpoint = action === 'approve' 
        ? `/api/transactions/${transactionId}/approve`
        : `/api/transactions/${transactionId}/reject`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          reason: action === 'reject' ? 'Bukti pembayaran tidak valid' : undefined 
        })
      })

      if (response.ok) {
        alert(`Transaksi berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`)
        loadDashboardData() // Reload data
      } else {
        const result = await response.json()
        alert(result.message || 'Terjadi kesalahan')
      }
    } catch (error) {
      alert('Terjadi kesalahan saat memproses transaksi')
    }
  }

  const viewPaymentProof = async (transactionId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/transactions/${transactionId}/payment-proof`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        // Create a blob URL for the image
        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        
        // Open in new window
        const newWindow = window.open()
        newWindow.document.write(`
          <html>
            <head><title>Bukti Pembayaran</title></head>
            <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f0f0f0;">
              <img src="${imageUrl}" style="max-width:100%; max-height:100%; object-fit:contain;" alt="Bukti Pembayaran" />
            </body>
          </html>
        `)
        newWindow.document.close()
      } else {
        const result = await response.json()
        alert(result.message || 'Gagal memuat bukti pembayaran')
      }
    } catch (error) {
      console.error('Error viewing payment proof:', error)
      alert('Terjadi kesalahan saat memuat bukti pembayaran')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Memuat dashboard...</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Dashboard Organizer - EventKu</title>
      </Head>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="container">
            <div className="dashboard-nav">
              <Link href="/" className="logo">🎉 EventKu</Link>
              <div className="user-info">
                <span>Selamat datang, {user?.name}</span>
                <button onClick={logout} className="btn-logout">Logout</button>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="container">
            <div className="dashboard-tabs">
              <button 
                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button 
                className={`tab ${activeTab === 'events' ? 'active' : ''}`}
                onClick={() => setActiveTab('events')}
              >
                Event Saya
              </button>
              <button 
                className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
                onClick={() => setActiveTab('transactions')}
              >
                Transaksi
              </button>
              <button 
                className={`tab ${activeTab === 'create' ? 'active' : ''}`}
                onClick={() => setActiveTab('create')}
              >
                Buat Event
              </button>
            </div>

            {activeTab === 'overview' && (
              <div className="tab-content">
                <h2>Dashboard Overview</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>{stats.totalEvents}</h3>
                    <p>Total Event</p>
                  </div>
                  <div className="stat-card revenue">
                    <h3>Rp {stats.totalRevenue.toLocaleString('id-ID')}</h3>
                    <p>Total Revenue</p>
                  </div>
                  <div className="stat-card tickets">
                    <h3>{stats.totalTicketsSold}</h3>
                    <p>Tiket Terjual</p>
                  </div>
                  <div className="stat-card pending">
                    <h3>{stats.pendingTransactions}</h3>
                    <p>Transaksi Pending</p>
                  </div>
                </div>

                <div className="recent-activity">
                  <h3>Aktivitas Terbaru</h3>
                  <div className="activity-list">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="activity-item">
                        <div className="activity-info">
                          <strong>{transaction.user.name}</strong> membeli {transaction.quantity} tiket untuk <strong>{transaction.event.title}</strong>
                          <small>{new Date(transaction.createdAt).toLocaleDateString('id-ID')}</small>
                        </div>
                        <div className={`status ${transaction.status.toLowerCase()}`}>
                          {transaction.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="tab-content">
                <h2>Event Saya</h2>
                <div className="events-grid">
                  {events.map((event) => (
                    <div key={event.id} className="event-management-card">
                      <div className="event-image">
                        <div className="event-icon">{event.icon}</div>
                      </div>
                      <div className="event-info">
                        <h3>{event.title}</h3>
                        <p>{event.description}</p>
                        <div className="event-meta">
                          <span>📅 {new Date(event.date).toLocaleDateString('id-ID')}</span>
                          <span>🎫 {event.availableSeats}/{event.totalSeats}</span>
                          <span>💰 Rp {event.price.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                      <div className="event-actions">
                        <button className="btn-small btn-edit">Edit</button>
                        <button className="btn-small btn-view">Lihat</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="tab-content">
                <h2>Manajemen Transaksi</h2>
                <div className="transactions-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Event</th>
                        <th>Jumlah</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Bukti Bayar</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td>{transaction.user.name}</td>
                          <td>{transaction.event.title}</td>
                          <td>{transaction.quantity}</td>
                          <td>Rp {transaction.finalPrice.toLocaleString('id-ID')}</td>
                          <td>
                            <span className={`status ${transaction.status.toLowerCase()}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td>
                            {transaction.paymentProof ? (
                              <button 
                                className="btn-small btn-view-proof"
                                onClick={() => viewPaymentProof(transaction.id)}
                              >
                                Lihat Bukti
                              </button>
                            ) : (
                              'Belum upload'
                            )}
                          </td>
                          <td>
                            {transaction.status === 'WAITING_CONFIRMATION' && (
                              <div className="action-buttons">
                                <button 
                                  className="btn-small btn-approve"
                                  onClick={() => handleTransactionAction(transaction.id, 'approve')}
                                >
                                  Setujui
                                </button>
                                <button 
                                  className="btn-small btn-reject"
                                  onClick={() => handleTransactionAction(transaction.id, 'reject')}
                                >
                                  Tolak
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'create' && (
              <div className="tab-content">
                <h2>Buat Event Baru</h2>
                <CreateEventForm onEventCreated={loadDashboardData} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Component untuk form create event
function CreateEventForm({ onEventCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'MUSIK',
    price: 0,
    totalSeats: 100,
    icon: '🎉'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Event berhasil dibuat!')
        setFormData({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          category: 'MUSIK',
          price: 0,
          totalSeats: 100,
          icon: '🎉'
        })
        onEventCreated()
      } else {
        const result = await response.json()
        alert(result.message || 'Gagal membuat event')
      }
    } catch (error) {
      alert('Terjadi kesalahan saat membuat event')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'totalSeats' ? parseInt(value) || 0 : value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="create-event-form">
      <div className="form-row">
        <div className="form-group">
          <label>Judul Event</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Kategori</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="MUSIK">Musik</option>
            <option value="TEKNOLOGI">Teknologi</option>
            <option value="OLAHRAGA">Olahraga</option>
            <option value="SENI">Seni</option>
            <option value="BISNIS">Bisnis</option>
            <option value="MAKANAN">Makanan</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Deskripsi</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Tanggal</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Waktu</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Lokasi</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Harga Tiket (Rp)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Total Kursi</label>
          <input
            type="number"
            name="totalSeats"
            value={formData.totalSeats}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Icon Event</label>
        <select name="icon" value={formData.icon} onChange={handleChange}>
          <option value="🎉">🎉 Party</option>
          <option value="🎵">🎵 Musik</option>
          <option value="💻">💻 Teknologi</option>
          <option value="🏃">🏃 Olahraga</option>
          <option value="🎨">🎨 Seni</option>
          <option value="💼">💼 Bisnis</option>
          <option value="🍜">🍜 Makanan</option>
        </select>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Membuat Event...' : 'Buat Event'}
      </button>
    </form>
  )
}