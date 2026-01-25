import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
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

  const loadEvents = async (searchQuery = '', categoryQuery = '') => {
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (categoryQuery) params.append('category', categoryQuery)
      
      const url = `/api/events${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      
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
    loadEvents(searchTerm, categoryFilter)
  }

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    setCategoryFilter('')
    loadEvents('', '')
  }

  const showLogin = () => {
    window.location.href = '/auth/login'
  }

  const showRegister = () => {
    window.location.href = '/auth/register'
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
                  <Link href="/my-transactions" className="nav-link">Transaksi Saya</Link>
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
                onKeyPress={handleKeyPress}
              />
              <select 
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  // Auto-search when category changes
                  setTimeout(() => loadEvents(searchTerm, e.target.value), 100)
                }}
              >
                <option value="">Semua Kategori</option>
                <option value="MUSIK">Musik</option>
                <option value="TEKNOLOGI">Teknologi</option>
                <option value="OLAHRAGA">Olahraga</option>
                <option value="SENI">Seni & Budaya</option>
                <option value="BISNIS">Bisnis</option>
                <option value="MAKANAN">Makanan & Minuman</option>
              </select>
              <button onClick={handleSearch} className="search-btn" disabled={loading}>
                {loading ? '⏳ Mencari...' : '🔍 Cari'}
              </button>
              {(searchTerm || categoryFilter) && (
                <button onClick={clearSearch} className="clear-btn" disabled={loading}>
                  ✖️ Reset
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="events-section">
          <div className="container">
            <div className="section-header">
              <h3>
                {searchTerm || categoryFilter ? 'Hasil Pencarian' : 'Event Populer'}
                {events.length > 0 && (searchTerm || categoryFilter) && (
                  <span className="search-count"> ({events.length} event ditemukan)</span>
                )}
              </h3>
              {(searchTerm || categoryFilter) && (
                <div className="search-info">
                  {searchTerm && <span className="search-tag">🔍 "{searchTerm}"</span>}
                  {categoryFilter && <span className="search-tag">📂 {
                    categoryFilter === 'MUSIK' ? 'Musik' :
                    categoryFilter === 'TEKNOLOGI' ? 'Teknologi' :
                    categoryFilter === 'OLAHRAGA' ? 'Olahraga' :
                    categoryFilter === 'SENI' ? 'Seni & Budaya' :
                    categoryFilter === 'BISNIS' ? 'Bisnis' :
                    categoryFilter === 'MAKANAN' ? 'Makanan & Minuman' :
                    categoryFilter
                  }</span>}
                </div>
              )}
            </div>
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
                    <div key={event.id} className="event-card" onClick={() => router.push(`/events/${event.id}`)}>
                      <div className="event-image">
                        <div className="event-icon">{event.icon || '🎉'}</div>
                        <div className="event-category">{event.category}</div>
                      </div>
                      <div className="event-content">
                        <h4 className="event-title">{event.title}</h4>
                        <p className="event-description">{event.description}</p>
                        <div className="event-details">
                          <div className="event-info">
                            <span className="event-date">📅 {new Date(event.date).toLocaleDateString('id-ID')}</span>
                            {event.time && <span className="event-time">🕐 {event.time}</span>}
                            <span className="event-location">📍 {event.location}</span>
                          </div>
                          <div className="event-meta">
                            <span className="event-price">
                              {event.price ? `Rp ${event.price.toLocaleString('id-ID')}` : 'GRATIS'}
                            </span>
                            <span className="event-seats">🎫 {event.availableSeats || 0} kursi tersisa</span>
                            {event.averageRating > 0 && (
                              <span className="event-rating">⭐ {event.averageRating.toFixed(1)} ({event.totalReviews})</span>
                            )}
                          </div>
                        </div>
                        <button className="btn-primary event-btn" onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/events/${event.id}`)
                        }}>
                          Lihat Detail & Beli Tiket
                        </button>
                      </div>
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