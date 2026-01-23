# Presensi Trimulyo API

Backend API untuk aplikasi Presensi Kalurahan Trimulyo.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **File Upload**: Multer
- **Excel Export**: ExcelJS

## Quick Start

### 1. Install Dependencies

```bash
cd apps/api
npm install
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed sample data (optional)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3001`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with NIP + password |
| GET | `/api/auth/me` | Get current user profile |

### Presence (Presensi)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/presence/check-in` | Check-in with selfie + location |
| POST | `/api/presence/check-out` | Check-out |
| GET | `/api/presence/today` | Get today's presence |
| GET | `/api/presence/history` | Get presence history |
| GET | `/api/presence/export` | Export as Excel |

### Activities (Log Kegiatan)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/activities` | Create activity log |
| GET | `/api/activities` | Get activities list |
| GET | `/api/activities/export` | Export as Excel |

### Leave Requests (Pengajuan Izin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leave-requests` | Submit leave request |
| GET | `/api/leave-requests` | Get leave requests |

## Sample User Credentials

After running `npm run db:seed`:

| NIP | Password | Jabatan |
|-----|----------|---------|
| 19820312201001001 | password123 | Lurah |
| 19850515201501002 | password123 | Dukuh A |
| 19900720202001003 | password123 | Dukuh B |
| 19880305201801004 | password123 | Ulu-ulu |
| 19950612202201005 | password123 | Staf Administrasi |

## Folder Structure

```
apps/api/
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.js           # Seed data
├── src/
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   └── app.js            # Express app entry
├── uploads/              # Uploaded files
│   ├── selfies/
│   └── activities/
├── .env.example
├── package.json
└── README.md
```

## License

ISC
