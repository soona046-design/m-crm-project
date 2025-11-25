# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Start production server
npm start

# Export static files
npm run export
```

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 14 with App Router, TypeScript, Material-UI
- **Backend**: Laravel (separate project at `/Users/soona/Documents/인사이트/2025_MCRM/mcrm-backend/`)
- **Real-time**: Laravel Echo + Pusher.js
- **HTTP Client**: Axios with base URL configuration
- **State Management**: React Context (AuthContext, RealtimeContext)

### Authentication System
- **Development Mode**: Mock authentication using localStorage
- **Token Format**: `mock_token_${userId}_${timestamp}`
- **Storage**: localStorage with key `auth_token`
- **User Data**: Stored in localStorage as `mcrm_users` array
- **Default Users**: Predefined users with roles (상담매니저, 지점관리자)
- **Context**: `src/contexts/AuthContext.tsx` manages all authentication state

### Key Components
- **AppShell**: Main layout wrapper with TopBar and SideNav
- **TopBar**: Navigation header with user info and logout
- **SideNav**: Collapsible sidebar navigation
- **ThemeRegistry**: Material-UI theme provider setup

### Data Management
- **Development**: localStorage mock data for all entities
- **API Integration**: Axios client configured for Laravel backend
- **User Management**: Dynamic user creation via agent-performance dashboard
- **Real-time**: Echo/Pusher for live updates

### File Structure Patterns
- `src/app/[feature]/page.tsx` - App Router pages
- `src/components/` - Reusable UI components
- `src/contexts/` - React Context providers
- `src/lib/` - Utility libraries and configurations
- `src/types/` - TypeScript type definitions

### Environment Configuration
- **API URL**: Configurable via `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`)
- **Development**: Uses mock data and localStorage
- **Production**: Connects to Laravel backend API

### Business Modules
- **Leads**: Customer lead management
- **Tickets**: Support ticket system
- **Appointments**: Medical appointment scheduling
- **Dashboards**: Analytics and performance metrics
- **Channels**: Marketing channel management
- **Communications**: Message handling system

### Important Implementation Notes
- **SSR Safety**: Always check `typeof window !== 'undefined'` before localStorage access
- **Token Parsing**: Extract userId from token using `tokenParts.slice(2, -1).join('_')`
- **User Data**: Add password fields to fallback users for consistency
- **Layout**: All pages use the global AppShell layout with authentication checks
- **Role-based UI**: Different features available based on user roles