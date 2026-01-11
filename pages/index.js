import Head from 'next/head'
import { useState, useEffect } from 'react'

export default function Home() {
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    
    // Load events on component mount
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/events')
      if (response.ok) {
        const result = await response.json()
        setEvents(result.data || [])
      }
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    // Filter events based on search term and category
    loadEvents()
  }

  const showLogin = () => {
    // Show login modal (you can implement modal state here)
    alert('Login modal would open here')
  }

  const showRegister = () => {
    // Show register modal
    alert('Register modal would open here')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    alert('Logout berhasil!')
  }

  return (
    <>
      <Head>
        <title>EventKu - Temukan Event Terbaik di Sekitarmu</title>
        <meta name="description" content="Jelajahi berbagai acara, konser, workshop, dan kegiatan seru lainnya" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <nav className="navbar">
          <div className="container">
            <div className="logo">
              <h1>🎉 EventKu</h1>
            </div>
            <div className="nav-links">
              <a href="#" className="nav-link">Beranda</a>
              {user ? (
                <>
                  <a href="#" className="nav-link">Dashboard</a>
                  <a href="#" className="nav-link">Transaksi Saya</a>
                  <span className="nav-link">Points: {user.points?.toLocaleString('id-ID') || 0}</span>
                  <a href="#" className="nav-link" onClick={logout}>Logout</a>
                </>
              ) : (
                <>
                  <a href="#" className="nav-link" onClick={showLogin}>Login</a>
                  <a href="#" className="nav-link" onClick={showRegister}>Register</a>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="container">
            <h2>Temukan Event Menarik di Sekitarmu</h2>
            <p>Jelajahi berbagai acara, konser, workshop, dan kegiatan seru lainnya</p>
            
            <div className="search-bar">
              <input 
                type="text" 
                placeholder="Cari event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Semua Kategori</option>
                <option value="musik">Musik</option>
                <option value="teknologi">Teknologi</option>
                <option value="olahraga">Olahraga</option>
                <option value="seni">Seni & Budaya</option>
                <option value="bisnis">Bisnis</option>
                <option value="makanan">Makanan & Minuman</option>
              </select>
              <button onClick={handleSearch}>Cari</button>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="events-section">
          <div className="container">
            <h3>Event Populer</h3>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Memuat events...</p>
              </div>
            ) : (
              <div className="events-grid">
                {events.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>Tidak ada event yang ditemukan.</p>
                  </div>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="event-card">
                      <div className="event-icon">{event.icon || '🎉'}</div>
                      <h4>{event.title}</h4>
                      <p>{event.description}</p>
                      <div className="event-details">
                        <span>📅 {new Date(event.date).toLocaleDateString('id-ID')}</span>
                        {event.time && <span>🕐 {event.time}</span>}
                        <span>📍 {event.location}</span>
                        <span>💰 {event.price ? `Rp ${event.price.toLocaleString('id-ID')}` : 'Gratis'}</span>
                        <span>🎫 {event.availableSeats || 0} kursi tersisa</span>
                      </div>
                      <button className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                        Lihat Detail
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <p>&copy; 2025 EventKu. Semua hak dilindungi.</p>
        </div>
      </footer>
    </>
  )
}