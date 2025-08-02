# ShortSecure 🔐

ShortSecure is a secure, production-ready URL shortener backend built with Node.js, Express, TypeScript, and MongoDB. It includes robust authentication using JWT, role-based route protection, rate limiting, and optional custom slugs.

---

## 🚀 Features

- 🔒 JWT-based access & refresh token system
- 👤 Role-aware protected routes
- 📝 Custom or auto-generated short URLs
- 🧠 Anonymous and authenticated usage
- 🍪 Secure refresh token via HttpOnly cookies
- 🧾 Logging (user-aware) and rate limiting for abuse protection

---

## 🗂 Folder Structure

shortsecure-backend/
│
├── controllers/ # Auth, URL, and User controllers
├── routes/ # All API route definitions
├── middlewares/ # Auth, rate-limiting, logging
├── daos/ # DB interaction logic (services)
├── models/ # Mongoose schemas for User and URL
├── utils/ # helpers
├── app.ts # Express config and middleware
├── index.ts # Server start + MongoDB connection
├── .env # Environment configuration
└── README.md

---

## 📦 Tech Stack

- **Node.js + Express**
- **TypeScript**
- **MongoDB + Mongoose**
- **JWT + Refresh Tokens**
- **Bcrypt (password hashing)**
- **Morgan (logging)**
- **Rate limiting**
- **Zod (optional for request validation)**

---

## 🔐 Auth Flow

- Access tokens expire quickly (`15m`) and are stored in-memory.
- Refresh tokens are stored securely in cookies (`HttpOnly`, `Secure`) and rotated on every login/refresh.
- Users can log out to invalidate refresh tokens server-side.

---

## 📄 API Endpoints (v1)

### Auth Routes

| Method | Route            | Description           |
| ------ | ---------------- | --------------------- |
| POST   | `/auth/register` | Create account        |
| POST   | `/auth/login`    | Login + tokens        |
| POST   | `/auth/refresh`  | Refresh tokens        |
| POST   | `/auth/logout`   | Logout and invalidate |

### URL Routes

| Method | Route              | Description          |
| ------ | ------------------ | -------------------- |
| POST   | `/url/shorten`     | Create short URL     |
| GET    | `/url/:slug`       | Redirect to full URL |
| GET    | `/url/stats/:slug` | Get stats for URL    |

### User Routes

| Method | Route        | Description            |
| ------ | ------------ | ---------------------- |
| GET    | `/user/me`   | Fetch own user info    |
| GET    | `/user/urls` | List user-created URLs |

---

## 🛠 Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. Configure .env:
   PORT=
   DATABASE_URL=
   ACCESS_TOKEN_SECRET=your_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d

3.Start development server:
npm run dev

🚧 Future Enhancements
1.📊 Analytics Dashboard – View click trends, traffic, and top links per user.

2.🔗 URL Expiry Support – Allow setting expiry timestamps for temporary links.

3.🧪 Tests with Jest/Vitest – Add automated unit and integration tests.

👨‍💻 Author
Built with ❤️ by Khushi Khattar
