import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

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

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        
        // Redirect based on role
        if (result.user.role === 'ORGANIZER') {
          router.push('/dashboard/organizer')
        } else {
          router.push('/')
        }
      } else {
        setError(result.message || 'Login gagal')
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
        <title>Login - EventKu</title>
        <meta name="description" content="Login ke akun EventKu Anda" />
      </Head>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link href="/" className="back-link">← Kembali ke Beranda</Link>
            <h1>🎉 EventKu</h1>
            <h2>Masuk ke Akun Anda</h2>
            <p>Selamat datang kembali! Silakan masuk ke akun Anda.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            
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
                placeholder="Masukkan password Anda"
              />
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Belum punya akun? <Link href="/auth/register">Daftar di sini</Link></p>
            <p><Link href="/auth/forgot-password">Lupa password?</Link></p>
          </div>

          <div className="demo-accounts">
            <h3>Demo Accounts:</h3>
            <div className="demo-account">
              <strong>Admin/Organizer:</strong><br />
              Email: admin@eventku.com<br />
              Password: admin123
            </div>
            <div className="demo-account">
              <strong>Customer:</strong><br />
              Email: customer@demo.com<br />
              Password: demo123
            </div>
          </div>
        </div>
      </div>
    </>
  )
}