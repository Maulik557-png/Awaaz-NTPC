# Awaaz-NTPC: Industrial Equipment Monitoring System

## Project Overview

Awaaz-NTPC is an AI-powered industrial equipment monitoring system that uses sound analysis to detect faults in machinery. The system enables technicians to record equipment sounds, analyze them for anomalies, and generate comprehensive reports for predictive maintenance.

## Architecture

### Frontend
- **Framework**: React with TypeScript
- **UI Library**: Custom components with Tailwind CSS
- **State Management**: React Query for data fetching
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)

### Backend
- **Framework**: Django REST Framework
- **AI/ML**: Python-based sound analysis using machine learning models
- **Database**: PostgreSQL
- **API**: RESTful endpoints for data management

### Key Components
- **Recording Module**: Audio capture and upload
- **Analysis Engine**: Fault detection using sound patterns
- **Dashboard**: Real-time monitoring and alerts
- **Reports System**: Automated report generation
- **Equipment Management**: Asset tracking and maintenance scheduling

## Key Features

### 1. Audio Recording & Analysis
- Real-time audio recording from equipment
- AI-powered fault detection (Fault levels 1-5)
- Automatic classification of equipment issues

### 2. Dashboard & Monitoring
- Live equipment status overview
- Alert system for critical faults
- Recent activity tracking
- Health score calculations

### 3. Reports & Analytics
- Daily/Weekly/Monthly report generation
- Detailed findings with recommendations
- Export capabilities (PDF)
- Historical data analysis

### 4. Equipment Management
- Equipment registration and tracking
- Maintenance scheduling
- Asset health monitoring

### 5. User Management
- Role-based access control
- Profile management
- Secure authentication

## Technology Stack

### Frontend Technologies
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (Icons)
- React Router (Navigation)
- React Query (Data fetching)
- Sonner (Notifications)
- Date-fns (Date utilities)

### Backend Technologies
- Django 4.x
- Django REST Framework
- PostgreSQL
- Python ML libraries (TensorFlow/PyTorch)
- Supabase (BaaS)

### DevOps & Tools
- Git (Version control)
- VS Code (Development)
- Node.js/npm (Frontend build)
- Python/pip (Backend dependencies)

## Demo Flow

1. **Login**: User authentication
2. **Dashboard**: Overview of system status
3. **Equipment Recording**: Record audio from equipment
4. **Analysis**: AI processes the recording
5. **Reports**: View generated reports
6. **Settings**: User preferences and logout

## Challenges & Solutions

### Challenge 1: Real-time Audio Processing
- **Solution**: Implemented efficient audio capture and streaming to backend for analysis

### Challenge 2: Accurate Fault Detection
- **Solution**: Trained ML models on industrial sound datasets with multiple fault categories

### Challenge 3: Mobile-First Design
- **Solution**: Responsive design with touch-friendly interfaces for industrial use

### Challenge 4: Data Security
- **Solution**: Secure authentication, encrypted data storage, and role-based access

## Future Enhancements

- Integration with IoT sensors
- Advanced analytics with predictive maintenance
- Mobile app development
- Multi-language support
- Offline functionality

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- PostgreSQL
- Supabase account

### Installation
1. Clone the repository
2. Install frontend dependencies: `npm install`
3. Install backend dependencies: `pip install -r requirements.txt`
4. Set up Supabase project and configure environment variables
5. Run migrations and seed data
6. Start development servers

### Running the Application
```bash
# Frontend
npm run dev

# Backend
python manage.py runserver
```

## Team & Credits

- **Development**: AI-assisted development with modern web technologies
- **Design**: Industrial-focused UI/UX for field technicians
- **Testing**: Comprehensive testing for reliability in industrial environments

---

*This presentation covers the Awaaz-NTPC industrial monitoring system, showcasing its capabilities in predictive maintenance through sound analysis.*
