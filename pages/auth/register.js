import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
    referralCode: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // Get referral code from URL if exists
  useState(() => {
    const { ref } = router.query
    if (ref) {
      setFormData(prev => ({ ...prev, referralCode: ref }))
    }
  }, [router.query])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validate password
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          referralCode: formData.referralCode || undefined
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess('Registrasi berhasil! Silakan login.')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        setError(result.message || 'Registrasi gagal')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Register - EventKu</title>
        <meta name="description" content="Daftar akun EventKu baru" />
      </Head>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link href="/" className="back-link">← Kembali ke Beranda</Link>
            <h1>🎉 EventKu</h1>
            <h2>Buat Akun Baru</h2>
            <p>Bergabunglah dengan EventKu dan temukan event menarik!</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <div className="form-group">
              <label htmlFor="name">Nama Lengkap</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Masukkan nama lengkap Anda"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Masukkan email Anda"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Konfirmasi Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Ulangi password Anda"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Daftar Sebagai</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="CUSTOMER">Customer (Pembeli Tiket)</option>
                <option value="ORGANIZER">Organizer (Penyelenggara Event)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="referralCode">Kode Referral (Opsional)</label>
              <input
                type="text"
                id="referralCode"
                name="referralCode"
                value={formData.referralCode}
                onChange={handleChange}
                placeholder="Masukkan kode referral jika ada"
              />
              <small>Dapatkan bonus poin dengan menggunakan kode referral!</small>
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Sudah punya akun? <Link href="/auth/login">Masuk di sini</Link></p>
          </div>
        </div>
      </div>
    </>
  )
}