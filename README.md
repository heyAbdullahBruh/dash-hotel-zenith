# 🏨 HotelZenith Admin Dashboard

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-TanStack-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 📖 Project Overview

**HotelZenith Admin Dashboard** is a production-ready, enterprise-grade management system designed for modern hotels, high-end restaurants, and event venues. Built with the latest **React 18** stack and **Vite**, this dashboard provides a comprehensive solution for managing daily operations, including food/menu curation, order workflows, table reservations, event bookings, and staff administration.

Engineered for performance and scalability, the application features real-time data updates via WebSockets, strict TypeScript-ready architecture, and robust security measures including role-based access control (RBAC).

---

|                                   **Dashboard Overview**                                   |                              **Food Management**                              |
| :----------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------: |
| ![Dashboard Screenshot](https://via.placeholder.com/600x350?text=Dashboard+Analytics+View) |  ![Food Management](https://via.placeholder.com/600x350?text=Food+Menu+Grid)  |
|                                     **Order Workflow**                                     |                             **Mobile Responsive**                             |
|      ![Order Management](https://via.placeholder.com/600x350?text=Order+Kanban+Board)      | ![Mobile View](https://via.placeholder.com/600x350?text=Mobile+Responsive+UI) |

---

## ✨ Features

### ✅ Core Features

- **Authentication & RBAC:** Secure JWT-based login with HttpOnly cookies; distinct roles for Super Admin, Manager, and Staff.
- **Dashboard Analytics:** Interactive charts (Recharts) visualizing revenue, booking trends, and occupancy rates.
- **Food Management:** Full CRUD capabilities for menu items with drag-and-drop image uploading.
- **Order Management:** Visual workflow for tracking orders (Pending → Preparing → Served → Paid).
- **Booking Management:** Integrated calendar and list views for Table reservations and Event bookings.
- **Review System:** Moderation tools to approve, reply to, or delete customer reviews.
- **Admin Management:** Tools for creating staff accounts and managing permissions.

### ✅ Advanced Features

- **Real-time Notifications:** WebSocket integration for instant alerts on new orders and bookings.
- **Advanced Search & Filter:** Global search functionality with multi-parameter filtering.
- **Data Export:** One-click export of reports to CSV, JSON, and Excel formats.
- **Invoice Generation:** Print-ready PDF invoice generation using `html2canvas` and `jspdf`.
- **Audit Logging:** Detailed security logs tracking all administrative actions.

### ✅ Developer Features

- **Dockerized:** Fully containerized environment for consistent deployment.
- **CI/CD Ready:** Pre-configured GitHub Actions workflows for automated testing and deployment.
- **Performance:** Code splitting, lazy loading, and virtualized lists for handling large datasets.
- **Error Handling:** Global error boundaries and Sentry integration for monitoring.

---

## 🛠️ Technology Stack

| Category          | Technology             | Purpose                          |
| :---------------- | :--------------------- | :------------------------------- |
| **Frontend**      | React 18               | Core UI Framework                |
| **Build Tool**    | Vite                   | Lightning-fast build & HMR       |
| **Routing**       | React Router v7        | Client-side routing & navigation |
| **State Mgmt**    | React Query (TanStack) | Server state & caching           |
| **UI State**      | Context API            | Global application state         |
| **Styling**       | CSS Modules            | Scoped component styling         |
| **HTTP Client**   | Axios                  | API Request handling             |
| **Forms**         | React Hook Form + Zod  | Form validation & schema         |
| **Charts**        | Recharts               | Data visualization               |
| **Icons**         | FontAwesome            | Iconography                      |
| **Animations**    | Framer Motion          | Fluid UI transitions             |
| **Notifications** | React Hot Toast        | User feedback toasts             |
| **Date/Time**     | date-fns               | Date manipulation & formatting   |
| **Container**     | Docker                 | Application containerization     |
| **Proxy**         | Nginx                  | Production reverse proxy         |
| **CI/CD**         | GitHub Actions         | Automated pipeline               |

---

## 📂 File Structure

```text
hotelzenith-admin/
├── src/
│   ├── components/
│   │   ├── ui/               # Reusable UI atoms (Button, Input, Modal)
│   │   ├── layout/           # Sidebar, Header, Layout wrappers
│   │   └── shared/           # Complex shared components (Calendar, Uploader)
│   ├── pages/                # Route components (Dashboard, Food, Orders)
│   ├── services/
│   │   ├── api/              # API call definitions organized by domain
│   │   ├── export/           # CSV/Excel export logic
│   │   ├── print/            # PDF generation logic
│   │   ├── websocket/        # Socket.io connection handler
│   │   └── monitoring/       # Sentry & performance vitals
│   ├── contexts/             # Global providers (Auth, Theme)
│   ├── hooks/                # Custom hooks (useAuth, useDebounce)
│   ├── styles/               # Global CSS variables & animations
│   ├── utils/                # Helpers, formatters, and constants
│   └── config/               # Environment configuration
├── public/                   # Static assets
├── docker/                   # Dockerfile & Nginx configs
├── .github/workflows/        # CI/CD pipelines
├── scripts/                  # Automation scripts
├── docs/                     # API Documentation
├── tests/                    # Unit & Integration tests
└── [Config Files]            # vite.config.js, package.json, etc.
```

---

## 📦 Dependencies

### Production Dependencies

```json
"dependencies": {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router": "^7.9.3",
  "@tanstack/react-query": "^5.12.0",
  "axios": "^1.6.2",
  "react-hook-form": "^7.48.2",
  "zod": "^3.22.4",
  "@hookform/resolvers": "^3.3.2",
  "recharts": "^2.10.0",
  "react-countup": "^6.4.1",
  "framer-motion": "^10.16.16",
  "react-hot-toast": "^2.4.1",
  "date-fns": "^2.30.0",
  "@fortawesome/fontawesome-svg-core": "^6.5.1",
  "@fortawesome/free-solid-svg-icons": "^6.5.1",
  "@fortawesome/react-fontawesome": "^0.2.0",
  "clsx": "^2.0.0",
  "react-dropzone": "^14.2.3",
  "html2canvas": "^1.4.1",
  "jspdf": "^2.5.1"
}
```

### Development Dependencies

```json
"devDependencies": {
  "@types/react": "^18.2.37",
  "@types/react-dom": "^18.2.15",
  "@vitejs/plugin-react": "^4.2.0",
  "vite": "^5.0.0",
  "eslint": "^8.55.0",
  "eslint-plugin-react-hooks": "^4.6.0",
  "eslint-plugin-react-refresh": "^0.4.5",
  "prettier": "^3.1.0",
  "@types/node": "^20.10.0",
  "typescript": "^5.3.0",
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.1.0"
}
```

---

## 🔌 API Integration

The dashboard communicates with the backend via RESTful endpoints. Ensure your backend is running and matches these signatures:

```text
Authentication:
POST   /api/admin/login          # Login with JWT cookies
POST   /api/admin/logout         # Logout
GET    /api/admin/profile        # Get admin profile

Food Management:
GET    /api/admin/foods          # Get all foods
POST   /api/admin/foods/create   # Create food with images
PUT    /api/admin/foods/:id      # Update food

Order Management:
GET    /api/admin/orders         # Get all orders
PUT    /api/admin/orders/:id/status # Update order status

Booking Management:
GET    /api/admin/bookings/table # Get table bookings
GET    /api/admin/bookings/event # Get event bookings

Category Management:
GET    /api/admin/categories     # Get categories
POST   /api/admin/categories/create # Create category

Review Management:
GET    /api/admin/reviews/pending # Get pending reviews
PUT    /api/admin/reviews/:id/approve # Approve review
```

---

## 🚀 Installation & Setup

### Method 1: Local Development

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/hotelzenith-admin.git
    cd hotelzenith-admin
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Configure Environment**

    ```bash
    cp .env.example .env
    # Edit .env with your specific configuration (API URLs, etc.)
    ```

4.  **Start Development Server**
    ```bash
    npm run dev
    ```

### Method 2: Docker Deployment

1.  **Using Docker Compose**

    ```bash
    docker-compose up -d
    ```

2.  **Or Build Manually**
    ```bash
    docker build -t hotelzenith-admin .
    docker run -p 80:80 hotelzenith-admin
    ```

### Method 3: Production Build

1.  **Build the Application**
    ```bash
    npm run build
    ```
2.  **Deploy**: The build artifacts will be stored in the `/dist` directory. Upload these files to your web server (Nginx, Apache, Vercel, etc.).

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

| Variable            | Description                 | Example                          |
| :------------------ | :-------------------------- | :------------------------------- |
| `VITE_API_URL`      | Backend API Base URL        | `http://localhost:5000`          |
| `VITE_WS_URL`       | WebSocket URL for Real-time | `ws://localhost:5000`            |
| `VITE_APP_NAME`     | Branding Name               | `"HotelZenith Dashboard"`        |
| `VITE_IMAGEKIT_URL` | Image CDN URL               | `https://ik.imagekit.io/your-id` |
| `VITE_SENTRY_DSN`   | Sentry Error Tracking       | `https://xxx@sentry.io/xxx`      |

---

## 📜 Available Scripts

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext js,jsx",
  "lint:fix": "eslint . --ext js,jsx --fix",
  "test": "vitest",
  "test:coverage": "vitest --coverage",
  "docker:build": "docker build -t hotelzenith-admin .",
  "docker:run": "docker run -p 80:80 hotelzenith-admin",
  "docker:compose": "docker-compose up -d",
  "deploy:staging": "npm run build && node scripts/deploy.js --env staging",
  "deploy:production": "npm run build && node scripts/deploy.js --env production",
  "generate-docs": "node scripts/generate-docs.js",
  "health:check": "node scripts/health-check.js"
}
```

---

## 🛡️ Security & Performance

### Security Measures

- **JWT Authentication**: Stores tokens in `httpOnly` cookies to prevent XSS token theft.
- **CSRF Protection**: Axios interceptors configured to handle CSRF tokens.
- **Input Sanitization**: All user inputs are validated via `Zod` schemas before submission.
- **Content Security Policy (CSP)**: Strict headers configured in Nginx/HTML.
- **Rate Limiting**: Handled on the API level, with UI feedback for 429 errors.

### Performance Optimizations

- **Lazy Loading**: Route-based code splitting using `React.lazy` and `Suspense`.
- **Image Optimization**: Automatic WebP conversion and lazy loading for grid images.
- **Virtualization**: Uses virtualized lists for efficient rendering of large order/booking tables.
- **Caching**: Aggressive server-state caching with `React Query`.
- **Bundle Optimization**: Tree-shaking and minification via Vite's Rollup build.

---

## 🌍 Browser Support

| Chrome | Firefox | Safari | Edge |
| :----: | :-----: | :----: | :--: |
|  90+   |   88+   |  14+   | 90+  |

**Responsive Design Breakpoints:**

- 📱 **Mobile:** < 640px (Hamburger menu, stacked cards)
- 💻 **Tablet:** 640px - 1024px (Collapsible sidebar)
- 🖥️ **Desktop:** > 1024px (Full sidebar, grid layouts)

---

## 🚢 Deployment Options

### Option A: Docker (Recommended)

This project includes a production-ready `docker-compose.yml`:

```yaml
services:
  frontend:
    build: .
    ports: ["80:80"]
  # Backend & DB services can be added here
```

### Option B: Cloud Platforms

- **Vercel / Netlify:** Connect your GitHub repo and set the build command to `npm run build` and output directory to `dist`.
- **AWS Amplify:** configured via `amplify.yml`.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1.  Fork the repository.
2.  Create a feature branch: `git checkout -b feature/AmazingFeature`.
3.  Commit your changes: `git commit -m 'Add some AmazingFeature'`.
4.  Push to the branch: `git push origin feature/AmazingFeature`.
5.  Open a Pull Request.

**Code Style:**

- Run `npm run lint` before committing.
- Use Prettier for formatting.

---

## 🔮 Future Roadmap

- [ ] Dark Mode Toggle
- [ ] Multi-language Support (i18n)
- [ ] Integration with Thermal Printers
- [ ] AI-based Menu Recommendations

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 📞 Support & Acknowledgments

**Support:**

- 🐛 **Issues:** [GitHub Issues](https://github.com/yourusername/hotelzenith-admin/issues)
- 📧 **Email:** support@hotelzenith.com

**Acknowledgments:**

- Special thanks to the [React](https://react.dev) and [Vite](https://vitejs.dev) teams.
- Icons provided by [FontAwesome](https://fontawesome.com).
- Charts powered by [Recharts](https://recharts.org).

```

```
