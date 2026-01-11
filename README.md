# EventKu - Event Management System dengan Next.js

EventKu adalah sistem manajemen event yang lengkap dengan fitur authentication, review system, dashboard organizer, dan integrasi database. Dibangun dengan Next.js untuk performa dan pengalaman pengguna yang optimal.

## 🚀 Fitur Utama

### 🔐 Authentication & Authorization
- User registration dengan sistem referral
- Login/logout dengan JWT token
- Role-based access (Customer & Organizer)
- Referral code generation dan bonus points

### 🎫 Event Management
- CRUD operations untuk events
- Kategori event (musik, teknologi, olahraga, seni, bisnis, makanan)
- Event rating dan review system
- Real-time event updates

### 💳 Transaction System
- Pembelian tiket dengan points system
- Upload bukti pembayaran
- Approval/rejection system untuk organizer
- Automatic rollback untuk transaksi yang ditolak

### ⭐ Review & Rating System
- Customer dapat memberikan review setelah menghadiri event
- Rating 1-5 bintang
- Organizer profile dengan rating keseluruhan

### 📊 Dashboard Organizer
- Overview statistik (revenue, events, customers)
- Event management (edit, delete, view attendees)
- Transaction management (approve/reject payments)
- Event performance analytics

## 🛠️ Tech Stack

### Frontend & Backend (Full-Stack Next.js)
- **Next.js 16** dengan React 18
- **API Routes** untuk backend functionality
- **Prisma ORM** untuk database management
- **JWT** untuk authentication
- **bcrypt** untuk password hashing
- **Responsive design** dengan CSS modules

### Database
- **PostgreSQL** (production)
- **SQLite** (development fallback)
- **Prisma** sebagai ORM

## 📋 Prerequisites

Sebelum menjalankan aplikasi, pastikan Anda telah menginstall:

- **Node.js** (v18 atau lebih baru)
- **npm** atau **yarn**
- **PostgreSQL** (opsional, akan menggunakan fallback jika tidak tersedia)

## 🔧 Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd eventku
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Salin file environment dan sesuaikan:

```bash
cp .env.example .env.local
```

Edit file `.env.local`:
```env
# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Database (opsional - akan menggunakan fallback jika tidak ada)
DATABASE_URL="postgresql://username:password@localhost:5432/eventku_db"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

### 4. Setup Database (Opsional)

Jika Anda ingin menggunakan PostgreSQL:

```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push

# Seed database dengan sample data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📚 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (organizer only)
- `GET /api/events/[id]` - Get event by ID

### Admin
- `GET /api/admin/transactions/pending` - Get pending transactions

## 🗂️ Project Structure

```
├── pages/
│   ├── api/                 # Next.js API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── events.js       # Events API
│   │   └── admin/          # Admin endpoints
│   ├── index.js            # Homepage
│   ├── admin.js            # Admin panel
│   └── _app.js             # App wrapper
├── lib/
│   └── prisma-client.js    # Prisma client configuration
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Database seeding
├── styles.css              # Global styles
└── next.config.js          # Next.js configuration
```

## 🎯 Key Features

### 1. Integrated Full-Stack Architecture
- Frontend dan backend dalam satu aplikasi Next.js
- API routes untuk semua backend functionality
- Shared utilities dan configurations

### 2. Database Flexibility
- Prisma ORM untuk type-safe database operations
- Support PostgreSQL untuk production
- Fallback ke mock data untuk development

### 3. Modern React Patterns
- Functional components dengan hooks
- State management dengan useState dan useEffect
- Client-side routing dengan Next.js

### 4. Responsive Design
- Mobile-first approach
- CSS Grid dan Flexbox untuk layouts
- Optimized untuk semua device sizes

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Deployment
```bash
# Build aplikasi
npm run build

# Start production server
npm start
```

## 🔒 Security Features

- **JWT Authentication** dengan secure tokens
- **Password hashing** dengan bcrypt
- **Environment variables** untuk sensitive data
- **API route protection** dengan middleware
- **Input validation** pada semua endpoints

## 📱 Pages & Features

### Homepage (`/`)
- Event listing dengan search dan filter
- Responsive event cards
- User authentication status
- Real-time event updates

### Admin Panel (`/admin`)
- Transaction management
- Payment approval/rejection
- Real-time updates
- Admin-only access

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

### Development Features
- Hot reloading dengan Next.js
- API routes dengan built-in middleware
- TypeScript support (optional)
- Prisma Studio untuk database management

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**EventKu** - Modern event management system dengan Next.js 🎉