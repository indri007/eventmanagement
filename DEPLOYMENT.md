# EventKu - Deployment Guide

## Deploy ke Vercel

### 1. Persiapan Database (PostgreSQL)

Anda memerlukan database PostgreSQL untuk production. Pilihan yang direkomendasikan:

#### Option A: Neon (Gratis)
1. Daftar di [neon.tech](https://neon.tech)
2. Buat database baru
3. Copy connection string

#### Option B: Supabase (Gratis)
1. Daftar di [supabase.com](https://supabase.com)
2. Buat project baru
3. Pergi ke Settings > Database
4. Copy connection string

#### Option C: Railway (Gratis)
1. Daftar di [railway.app](https://railway.app)
2. Deploy PostgreSQL
3. Copy connection string

### 2. Deploy ke Vercel

#### Via GitHub (Recommended)
1. Push code ke GitHub repository
2. Pergi ke [vercel.com](https://vercel.com)
3. Import project dari GitHub
4. Set environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_nextauth_secret_key
   ```
5. Deploy!

#### Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET

# Redeploy with env vars
vercel --prod
```

### 3. Setelah Deploy

1. **Seed Database**:
   - Buka Vercel dashboard
   - Pergi ke Functions tab
   - Jalankan seed script atau gunakan Prisma Studio

2. **Test Aplikasi**:
   - Akses URL Vercel Anda
   - Test login dengan demo accounts:
     - Organizer: admin@eventku.com / admin123
     - Customer: customer@demo.com / demo123

### 4. Environment Variables yang Diperlukan

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

### 5. Custom Domain (Opsional)

1. Beli domain
2. Di Vercel dashboard, pergi ke Settings > Domains
3. Tambahkan domain Anda
4. Update DNS records sesuai instruksi Vercel
5. Update NEXTAUTH_URL dengan domain baru

### 6. Troubleshooting

#### Database Connection Issues
- Pastikan DATABASE_URL benar
- Cek apakah database dapat diakses dari internet
- Verifikasi credentials

#### Build Errors
- Cek Vercel build logs
- Pastikan semua dependencies terinstall
- Verifikasi Prisma schema

#### File Upload Issues
- File uploads di Vercel memiliki limitasi
- Untuk production, gunakan cloud storage (AWS S3, Cloudinary)

### 7. Monitoring & Analytics

- Vercel Analytics: Aktifkan di dashboard
- Error tracking: Integrate dengan Sentry
- Database monitoring: Gunakan tools dari provider database

## Production Checklist

- [ ] Database PostgreSQL setup
- [ ] Environment variables configured
- [ ] Domain configured (optional)
- [ ] SSL certificate active
- [ ] Database seeded
- [ ] Demo accounts working
- [ ] File uploads working
- [ ] Email notifications configured (optional)
- [ ] Analytics setup (optional)
- [ ] Error monitoring setup (optional)

## Support

Jika ada masalah deployment, cek:
1. Vercel build logs
2. Database connection
3. Environment variables
4. Prisma schema compatibility