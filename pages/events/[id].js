import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function EventDetail() {
  const router = useRouter()
  const { id } = router.query
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [reviews, setReviews] = useState([])
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingData, setBookingData] = useState({
    quantity: 1,
    pointsUsed: 0
  })

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }

    if (id) {
      loadEventDetail()
      loadReviews()
    }
  }, [id])

  const loadEventDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/events/${id}`)
      if (response.ok) {
        const result = await response.json()
        setEvent(result.data)
      }
    } catch (error) {
      console.error('Error loading event:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/events/${id}/reviews`)
      if (response.ok) {
        const result = await response.json()
        setReviews(result.data || [])
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  const handleBooking = () => {
    if (!user) {
      alert('Silakan login terlebih dahulu')
      router.push('/auth/login')
      return
    }
    setShowBookingModal(true)
  }

  const calculateFinalPrice = () => {
    const originalPrice = event.price * bookingData.quantity
    const discount = Math.min(bookingData.pointsUsed, originalPrice)
    return originalPrice - discount
  }

  const submitBooking = async () => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          eventId: parseInt(id),
          quantity: bookingData.quantity,
          pointsUsed: bookingData.pointsUsed
        })
      })

      const result = await response.json()
      if (response.ok) {
        alert('Booking berhasil! Silakan lakukan pembayaran.')
        setShowBookingModal(false)
        // Redirect to payment page or show payment modal
        router.push(`/transactions/${result.data.id}`)
      } else {
        alert(result.message || 'Booking gagal')
      }
    } catch (error) {
      alert('Terjadi kesalahan saat booking')
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Memuat detail event...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Event tidak ditemukan</p>
        <Link href="/">← Kembali ke Beranda</Link>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{event.title} - EventKu</title>
        <meta name="description" content={event.description} />
      </Head>

      <div className="event-detail-container">
        <div className="container">
          <Link href="/" className="back-link">← Kembali ke Beranda</Link>
          
          <div className="event-detail-card">
            <div className="event-detail-header">
              <div className="event-detail-image">
                <div className="event-icon">{event.icon || '🎉'}</div>
                <div className="event-category">{event.category}</div>
              </div>
              
              <div className="event-detail-info">
                <h1>{event.title}</h1>
                <p className="event-description">{event.description}</p>
                
                <div className="event-meta-grid">
                  <div className="meta-item">
                    <span className="meta-icon">📅</span>
                    <div>
                      <strong>Tanggal</strong>
                      <p>{new Date(event.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-icon">🕐</span>
                    <div>
                      <strong>Waktu</strong>
                      <p>{event.time} WIB</p>
                    </div>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-icon">📍</span>
                    <div>
                      <strong>Lokasi</strong>
                      <p>{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-icon">💰</span>
                    <div>
                      <strong>Harga</strong>
                      <p className="price">{event.price ? `Rp ${event.price.toLocaleString('id-ID')}` : 'GRATIS'}</p>
                    </div>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-icon">🎫</span>
                    <div>
                      <strong>Kursi Tersedia</strong>
                      <p>{event.availableSeats} dari {event.totalSeats}</p>
                    </div>
                  </div>
                  
                  {event.averageRating > 0 && (
                    <div className="meta-item">
                      <span className="meta-icon">⭐</span>
                      <div>
                        <strong>Rating</strong>
                        <p>{event.averageRating.toFixed(1)} ({event.totalReviews} review)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="event-actions">
              <button 
                className="btn-book"
                onClick={handleBooking}
                disabled={event.availableSeats === 0}
              >
                {event.availableSeats === 0 ? 'Tiket Habis' : 'Beli Tiket Sekarang'}
              </button>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="reviews-section">
            <h2>Review & Rating</h2>
            {reviews.length === 0 ? (
              <p>Belum ada review untuk event ini.</p>
            ) : (
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <strong>{review.user.name}</strong>
                      <div className="rating">
                        {'⭐'.repeat(review.rating)}
                      </div>
                    </div>
                    <p>{review.comment}</p>
                    <small>{new Date(review.createdAt).toLocaleDateString('id-ID')}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Booking Tiket</h2>
              <span className="close" onClick={() => setShowBookingModal(false)}>&times;</span>
            </div>
            
            <div className="booking-form">
              <div className="form-group">
                <label>Jumlah Tiket</label>
                <input
                  type="number"
                  min="1"
                  max={Math.min(event.availableSeats, 10)}
                  value={bookingData.quantity}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    quantity: parseInt(e.target.value)
                  })}
                />
              </div>
              
              <div className="form-group">
                <label>Gunakan Poin (Opsional)</label>
                <input
                  type="number"
                  min="0"
                  max={Math.min(user?.points || 0, event.price * bookingData.quantity)}
                  value={bookingData.pointsUsed}
                  onChange={(e) => setBookingData({
                    ...bookingData,
                    pointsUsed: parseInt(e.target.value) || 0
                  })}
                />
                <small>Poin tersedia: {user?.points?.toLocaleString('id-ID') || 0}</small>
              </div>
              
              <div className="price-summary">
                <div className="price-row">
                  <span>Harga Asli:</span>
                  <span>Rp {(event.price * bookingData.quantity).toLocaleString('id-ID')}</span>
                </div>
                <div className="price-row">
                  <span>Diskon Poin:</span>
                  <span>- Rp {bookingData.pointsUsed.toLocaleString('id-ID')}</span>
                </div>
                <div className="price-row total">
                  <span>Total Bayar:</span>
                  <span>Rp {calculateFinalPrice().toLocaleString('id-ID')}</span>
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setShowBookingModal(false)}>
                  Batal
                </button>
                <button className="btn-primary" onClick={submitBooking}>
                  Konfirmasi Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}