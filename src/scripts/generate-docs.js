// scripts/generate-docs.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const generateAPIDocs = () => {
  const docs = {
    project: "HotelZenith Admin Dashboard",
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    modules: {},
    components: {},
    apiEndpoints: {},
  };

  // Scan components directory
  scanComponents(path.join(__dirname, "../src/components"), docs.components);

  // Scan pages directory
  scanPages(path.join(__dirname, "../src/pages"), docs.modules);

  // Generate API documentation
  docs.apiEndpoints = {
    authentication: [
      {
        method: "POST",
        endpoint: "/api/admin/login",
        description: "Admin login",
      },
      {
        method: "POST",
        endpoint: "/api/admin/logout",
        description: "Admin logout",
      },
      {
        method: "GET",
        endpoint: "/api/admin/profile",
        description: "Get admin profile",
      },
    ],
    foodManagement: [
      {
        method: "GET",
        endpoint: "/api/admin/foods",
        description: "Get all foods",
      },
      {
        method: "POST",
        endpoint: "/api/admin/foods/create",
        description: "Create food",
      },
      {
        method: "PUT",
        endpoint: "/api/admin/foods/:id",
        description: "Update food",
      },
    ],
    // Add more endpoints...
  };

  // Write documentation
  fs.writeFileSync(
    path.join(__dirname, "../docs/api-documentation.json"),
    JSON.stringify(docs, null, 2)
  );

  // Generate README
  generateREADME(docs);
};

const scanComponents = (dir, result) => {
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      result[item] = {};
      scanComponents(fullPath, result[item]);
    } else if (item.endsWith(".jsx") || item.endsWith(".tsx")) {
      const content = fs.readFileSync(fullPath, "utf8");
      const componentName = item.replace(/\.(jsx|tsx)$/, "");

      // Extract props from component
      const propsMatch = content.match(/propTypes\s*=\s*{([^}]+)}/s);
      const props = propsMatch ? extractProps(propsMatch[1]) : [];

      result[componentName] = {
        file: path.relative(__dirname, fullPath),
        props,
      };
    }
  });
};

const extractProps = (propString) => {
  const props = [];
  const lines = propString.split("\n");

  lines.forEach((line) => {
    const match = line.match(/(\w+)\s*:\s*(\w+)\.(\w+)/);
    if (match) {
      props.push({
        name: match[1],
        type: match[3],
        required: line.includes(".isRequired"),
      });
    }
  });

  return props;
};

const scanPages = (dir, result) => {
  const items = fs.readdirSync(dir);

  items.forEach((item) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const moduleName = item.replace(/([A-Z])/g, " $1").trim();
      result[moduleName] = {
        path: `/src/pages/${item}`,
        components: [],
      };

      // Find main component file
      const componentFiles = fs
        .readdirSync(fullPath)
        .filter((file) => file.endsWith(".jsx") || file.endsWith(".tsx"));

      if (componentFiles.length > 0) {
        result[moduleName].mainComponent = componentFiles[0];
      }
    }
  });
};

const generateREADME = (docs) => {
  const readme = `# HotelZenith Admin Dashboard

## Overview
A comprehensive admin dashboard for Hotel/Restaurant/Event Management system.

## Features
- Food Management with CRUD operations
- Order Management with real-time updates
- Booking Management (Table & Event)
- Review Management with moderation
- Admin Management with role-based access
- Real-time notifications via WebSocket
- Advanced search and filtering
- Export/Import functionality
- Print-ready invoices and reports

## Tech Stack
- **Frontend:** React 18, Vite, React Router v7
- **State Management:** React Query, Context API
- **Styling:** CSS Modules
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Icons:** FontAwesome
- **Animations:** Framer Motion

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Docker (optional)

### Installation
\`\`\`bash
# Clone repository
git clone https://github.com/yourusername/hotelzenith-dashboard.git

# Install dependencies
cd hotelzenith-dashboard
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
\`\`\`

### Environment Variables
\`\`\`env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
VITE_APP_NAME="HotelZenith Dashboard"
VITE_IMAGEKIT_URL=your-imagekit-url
\`\`\`

## Project Structure
\`\`\`
src/
├── components/           # Reusable UI components
├── pages/               # Page components
├── services/            # API services & utilities
├── contexts/            # React contexts
├── hooks/              # Custom hooks
├── styles/             # Global styles
└── utils/              # Utility functions
\`\`\`

## Available Scripts
- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Run ESLint
- \`npm run test\` - Run tests

## Deployment

### Docker Deployment
\`\`\`bash
# Build and run with Docker Compose
docker-compose up -d
\`\`\`

### Manual Deployment
1. Build the project: \`npm run build\`
2. Copy \`dist\` folder to your web server
3. Configure reverse proxy for API

## API Documentation
The dashboard interacts with the following API endpoints:

### Authentication
- \`POST /api/admin/login\` - Admin login
- \`POST /api/admin/logout\` - Admin logout
- \`GET /api/admin/profile\` - Get admin profile

### Food Management
- \`GET /api/admin/foods\` - Get all foods
- \`POST /api/admin/foods/create\` - Create food
- \`PUT /api/admin/foods/:id\` - Update food

[See full API documentation](./docs/api-documentation.json)

## Component Library
The project includes a comprehensive component library:

### Button Component
\`\`\`jsx
<Button
  variant="primary"
  size="md"
  loading={false}
  disabled={false}
>
  Click Me
</Button>
\`\`\`

### Input Component
\`\`\`jsx
<Input
  label="Email"
  type="email"
  placeholder="Enter email"
  error={errors.email?.message}
/>
\`\`\`

## Performance Optimization
- Code splitting with React.lazy
- Image optimization
- Bundle optimization
- Caching strategies
- Virtual scrolling for large lists

## Monitoring & Analytics
- Error tracking with Sentry
- Performance monitoring
- User analytics
- Audit logging

## Security Features
- JWT-based authentication
- CSRF protection
- XSS prevention
- Rate limiting
- Secure headers
- Audit logging

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License

## Support
For support, email support@hotelzenith.com or create an issue in the repository.
`;

  fs.writeFileSync(path.join(__dirname, "../README.md"), readme);
};

// Run documentation generation
generateAPIDocs();
console.log("Documentation generated successfully!");
