# Backend Architecture

## Overview
The CollaborateWise backend consists of a hybrid architecture combining:
- **Supabase** for authentication, database, and real-time features
- **External API services** for core business logic and operations
- **Microservices** for specialized AI processing

## API Structure
The frontend communicates with backend services through the following endpoints:

### Authentication API
Located in `src/services/hybridAuth.ts`:
- `/api/auth/hybrid/signup` - User registration with email verification
- `/api/auth/hybrid/reset-password` - Password reset functionality
- `/api/auth/hybrid/verify-otp` - Email OTP verification
- `/api/auth/hybrid/resend-verification` - Resend verification codes

### Core API Client
The application uses an API client (`src/services/apiClient.ts`) that:
- Handles authentication token management
- Provides automatic token refresh
- Implements timeout handling (120 seconds)
- Manages request/response cycles with proper error handling

### Configuration
Backend configuration is managed in `src/services/ConfigService.ts`:
- API base URL: Retrieved from environment variables
- Supabase configuration: URL and anonymous key
- Environment-specific settings

## Environment Variables
The backend integration requires the following environment variables:
- `REACT_APP_API_URL` or `VITE_BACKEND_URL` - Main backend API URL
- `REACT_APP_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Supabase Integration
The application leverages Supabase for:
- User authentication and session management
- Database operations (PostgreSQL)
- Real-time features
- Row-level security (RLS)

## Error Handling
The backend communication includes:
- Automatic retry mechanisms for network errors (except for mutations)
- Proper timeout handling for long-running operations
- Comprehensive error message parsing
- Session refresh on token expiration

## Security
Security measures include:
- JWT token authentication
- Secure token storage and refresh
- Input validation on all requests
- Protection against unauthorized access

## Deployment
The backend services are designed to be deployed separately from the frontend. The frontend connects to the backend via the configured API URLs.

## Local Development
For local development, ensure the backend services are running and accessible at the configured API URL (defaults to `http://localhost:3001`).

## API Documentation
Complete API documentation is available at the configured documentation URL (defaults to `https://docs.colabwize.com`).