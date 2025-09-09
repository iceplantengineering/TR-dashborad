# Toray Composite Materials Manufacturing Dashboard

A comprehensive manufacturing execution system (MES) for real-time process monitoring, equipment management, and quality control in composite materials production. Features complete Japanese/English multi-language support and role-based access control.

## 🌟 Features

### Real-time Monitoring
- **Process Monitoring**: Live tracking of PAN precursor, carbon fiber, prepreg, and composite manufacturing processes
- **Equipment Status**: Real-time equipment health, efficiency, and maintenance scheduling
- **Quality Control**: Continuous quality metrics monitoring with KPI correlation analysis
- **Multi-language Support**: Complete Japanese (日本語) and English language switching with persistent preferences

### Advanced Analytics
- **Interactive Dashboards**: Role-based dashboards with customizable KPIs
- **Data Visualization**: Real-time charts, trends, and statistical analysis
- **Predictive Analytics**: Equipment failure prediction and process optimization
- **Historical Analysis**: Comprehensive data analysis and reporting capabilities

### User Management & Security
- **Role-based Access Control**: Different access levels for operators, managers, and executives
- **Secure Authentication**: JWT-based authentication with secure session management
- **Audit Trail**: Complete activity logging and traceability

### Reporting & Compliance
- **Automated Reports**: Production, quality, environmental, and ESG reports
- **Compliance Tracking**: ISO 9001, ISO 14001, and industry-specific standards
- **Export Capabilities**: PDF, Excel, and CSV export options

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js with Express.js framework
- TypeScript for type safety
- Socket.IO for real-time communication
- JWT authentication
- Winston logging

**Frontend:**
- React 18 with TypeScript
- Redux Toolkit for state management
- Ant Design UI components
- Recharts for data visualization
- Socket.IO client for real-time updates
- react-i18next for internationalization (Japanese/English)

**Database & Infrastructure:**
- PostgreSQL (production-ready)
- Redis (caching and sessions)
- Docker containerization
- Nginx reverse proxy
- Prometheus & Grafana monitoring

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│     Redis       │◄─────────────┘
                        │   (Cache)       │
                        │   Port: 6379    │
                        └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (recommended)
- Git

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Tcompany-process-MES-ERP-integration
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Grafana Monitoring: http://localhost:3001 (admin/admin123)

### Option 2: Manual Setup

1. **Install dependencies**
   ```bash
   # Install root dependencies
   npm run install:all
   
   # Or install individually
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

2. **Setup environment variables**
   ```bash
   # Copy environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   
   # Edit the files with your configuration
   ```

3. **Start the applications**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or start individually
   npm run server:dev  # Backend only
   npm run client:dev  # Frontend only
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 👤 Demo Accounts

The system includes demo accounts for different roles:

| Username | Role | Description |
|----------|------|-------------|
| `admin` | Production Manager | Full access to all features including process control |
| `operator1` | Operator | Process monitoring and equipment status viewing |
| `quality_mgr` | Quality Inspector | Quality control and inspection reports |
| `executive` | Executive | Strategic dashboard and high-level reports |

**Default Password:** `admin123` (admin), `demo` (others)

**Multi-language Access:** All interfaces support Japanese (日本語) and English with persistent language preferences.

## 🌐 Multi-language Support

The application provides comprehensive internationalization support:

### Supported Languages
- **Japanese (日本語)**: Default language with complete manufacturing terminology
- **English**: Full interface translation with technical vocabulary

### Features
- **Language Switching**: Real-time language switching via top navigation
- **Persistent Preferences**: Language selection saved in localStorage
- **Complete Coverage**: All UI elements, forms, tables, and alerts translated
- **Technical Terminology**: Specialized manufacturing and process terms
- **Role-based Content**: Translations adapted for different user roles

### Key Translated Sections
- Dashboard and KPI metrics
- Process monitoring controls and data
- Equipment management and maintenance
- Quality management and inspection forms
- Alert messages and notifications
- Navigation and menu items

### Implementation Details
- **react-i18next**: Industry-standard i18n library
- **Namespace Organization**: Logical grouping of translations
- **Dynamic Loading**: Efficient translation file loading
- **Fallback Support**: Automatic fallback to default language

## 📁 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Charts/    # Chart components (RealtimeChart, etc.)
│   │   │   ├── Equipment/ # Equipment visualization components
│   │   │   └── LanguageSwitcher/ # Multi-language support
│   │   ├── pages/         # Application pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ProcessMonitoring.tsx
│   │   │   ├── EquipmentStatus.tsx
│   │   │   └── QualityManagement.tsx
│   │   ├── i18n/          # Internationalization
│   │   │   ├── index.ts   # i18n configuration
│   │   │   └── locales/   # Translation files (ja.json, en.json)
│   │   ├── services/      # API and WebSocket services
│   │   ├── store/         # Redux store configuration
│   │   ├── hooks/         # Custom React hooks
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Node.js backend application
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── services/      # Business logic services
│   │   ├── middleware/    # Express middleware
│   │   ├── websockets/    # Socket.IO handlers
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── package.json
│
├── docker-compose.yml     # Docker composition configuration
├── README.md             # This file
└── package.json          # Root package configuration
```

## 🔧 Configuration

### Environment Variables

**Server (.env):**
```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=toray_monitoring
DB_USERNAME=postgres
DB_PASSWORD=password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Client (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=http://localhost:5000
```

### Data Simulation

The system includes a sophisticated data generator that simulates:
- Real-time process data with realistic variations
- Equipment status and efficiency metrics
- Quality measurements and defect tracking
- Environmental data and compliance metrics
- Alerts and maintenance notifications

## 📊 Monitoring & Analytics

### Real-time Data
- Process parameters (temperature, pressure, flow rates)
- Equipment efficiency and status
- Quality metrics (tensile strength, defect counts)
- Environmental data (CO₂, energy consumption)

### KPIs & Metrics
- Overall Equipment Effectiveness (OEE)
- Quality rates and yield percentages
- Energy efficiency indicators
- Environmental compliance scores

### Alerting
- Critical process deviations
- Equipment failures and maintenance needs
- Quality threshold violations
- Environmental compliance issues

## 🛡️ Security Features

- **Authentication**: JWT-based secure authentication
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Input validation and sanitization
- **Secure Communication**: HTTPS and WSS support
- **Audit Logging**: Comprehensive activity tracking

## 🚀 Development

### Available Scripts

```bash
# Install all dependencies
npm run install:all

# Development mode (both apps)
npm run dev

# Build applications
npm run build

# Run linting
npm run lint

# Individual commands
npm run server:dev    # Start backend only
npm run client:dev    # Start frontend only
npm run server:build  # Build backend
npm run client:build  # Build frontend
```

### API Documentation

The backend provides RESTful APIs for:

- **Authentication** (`/api/auth`): Login, registration, user management
- **Process Data** (`/api/process`): Real-time and historical process data
- **Equipment** (`/api/equipment`): Equipment status, maintenance, OEE
- **Alerts** (`/api/alerts`): Alert management and acknowledgment
- **Reports** (`/api/reports`): Various report generation endpoints

### WebSocket Events

Real-time events include:
- `processData`: Live process measurements
- `equipmentStatus`: Equipment state updates
- `newAlert`: Alert notifications
- `kpiUpdate`: KPI metric updates

## 🏭 Manufacturing Process Coverage

### 1. PAN Precursor Manufacturing
- Polymerization reaction monitoring
- Spinning process control
- Fiber diameter and quality tracking

### 2. Carbon Fiber Production
- Stabilization process monitoring
- Carbonization temperature control
- Mechanical property validation

### 3. Prepreg Manufacturing
- Resin impregnation process
- Fiber volume ratio control
- Void content monitoring

### 4. Composite Formation
- Autoclave curing process
- RTM/VARTM monitoring
- Final product quality validation

## 📈 Scalability & Performance

- **Microservices Ready**: Modular architecture for easy scaling
- **Caching**: Redis integration for improved performance
- **Database Optimization**: Efficient queries and indexing
- **Real-time Optimization**: Optimized WebSocket communication
- **Container Ready**: Docker support for easy deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation and FAQ

## 🚀 Deployment

### Netlify Deployment (Production Ready)

This application is fully configured for deployment on Netlify with proper SPA routing and environment handling.

#### Quick Deploy to Netlify

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Netlify Setup**
   - Connect your GitHub repository to Netlify
   - Build settings are automatically configured via `netlify.toml`
   - No additional configuration needed

#### Configuration Files

The following files are configured for production deployment:

- **`netlify.toml`**: Build configuration, SPA redirects, security headers
- **`client/.env.production`**: Production environment variables
- **`client/vite.config.ts`**: Optimized build settings with code splitting

#### Environment Variables (Optional)

Set these in Netlify dashboard if connecting to live backend:
```
VITE_API_URL=https://your-api-domain.com/api
VITE_WS_URL=https://your-websocket-domain.com
VITE_ENVIRONMENT=production
```

If not set, the app runs with demo data and gracefully handles missing WebSocket connections.

#### Features
- ✅ SPA routing with proper redirects
- ✅ Optimized bundles (vendor, antd, charts chunks)
- ✅ Security headers configured
- ✅ WebSocket fallback handling
- ✅ Multi-language support preserved
- ✅ Static asset caching

### Manual Production Build

```bash
cd client
npm run build
npx serve dist  # Test production build locally
```

## 🔄 Version History

- **v1.1.0** - Netlify deployment ready with production optimizations
  - Added Netlify configuration with SPA support
  - WebSocket connection graceful degradation
  - TypeScript strict mode optimizations
  - Production build bundle splitting
  - Security headers and caching configuration

- **v1.0.0** - Initial release with core monitoring features
  - Real-time dashboard and process monitoring
  - Equipment management and maintenance scheduling
  - Quality control and environmental tracking
  - Role-based user management

## 🎯 Future Roadmap

- [ ] Advanced machine learning models for predictive analytics
- [ ] Mobile app for remote monitoring
- [ ] Integration with ERP systems
- [ ] Advanced reporting and business intelligence
- [ ] IoT device integration capabilities
- [ ] Multi-plant management features

---

**Developed for Toray Composite Materials Manufacturing Excellence** 🏭✨