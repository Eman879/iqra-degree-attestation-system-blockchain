# Iqra Degree Attestation System

A full-stack monorepo web application designed for university degree attestation. The application automates student submissions, performs AI/rule validations, verifies CNIC documents with OCR text comparisons, processes mock payments, and generates verification hashes and printable QR code attestation forms.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Axios, React Router.
- **Backend:** Node.js, Express, MongoDB/Mongoose, Multer (file upload), Tesseract.js (OCR), qrcode, crypto.

---

## Getting Started

### Prerequisites
1. **Node.js** installed on your system.
2. **MongoDB** instance running locally or on Atlas.
   - Default URI: `mongodb://127.0.0.1:27017/iqra-attestation`
   - *Note: If MongoDB is unavailable, the server automatically starts with an in-memory/mock array-based fallback so the app runs immediately.*

### Installation & Run

1. Install root, client, and server dependencies:
   ```bash
   npm run install:all
   ```

2. Run the development server (runs both frontend and backend concurrently):
   ```bash
   npm run dev
   ```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:4000](http://localhost:4000)

---

## Seed Accounts

The system is automatically seeded with demo accounts on first launch:

### Student Account
- **Email:** `student@iqra.edu.pk`
- **Password:** `student123`

### Admin Account
- **Email:** `admin@iqra.edu.pk`
- **Password:** `admin123`
