# Stock and Tracking Management System (SGST)

## Overview

SGST (Sistema de Gestão de Stock e Rastreamento) is a comprehensive inventory management and product tracking system designed for businesses of all sizes. The system provides real-time inventory control, product tracking capabilities, and logistics operations management. It's built as a full-stack web application with a modern React frontend and Express.js backend, targeting Portuguese-speaking markets with multi-currency support.

The system handles complete inventory workflows including product registration, stock movements, order management, shipping tracking, and comprehensive reporting. It's designed to scale from small businesses to large enterprises with multi-warehouse operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client application uses **React 18** with **TypeScript** and **Vite** for development tooling. The UI is built with **shadcn/ui components** and **Radix UI primitives**, providing a consistent design system with **Tailwind CSS** for styling. State management is handled through **TanStack Query** for server state and React hooks for local state.

The application follows a modular page-based routing structure using **Wouter** for client-side navigation. Key architectural decisions include:
- Component composition pattern with reusable UI components
- Hook-based data fetching with React Query for caching and synchronization
- Responsive design targeting both desktop and mobile devices
- Portuguese language support with currency formatting (AOA - Angolan Kwanza)

### Backend Architecture
The server is built with **Express.js** and **TypeScript**, following a layered architecture pattern. Key components include:
- **Routes layer**: RESTful API endpoints for all business operations
- **Storage layer**: Data access abstraction with comprehensive CRUD operations
- **Database layer**: PostgreSQL with Drizzle ORM for type-safe database operations

The API provides endpoints for:
- Dashboard analytics (stats, top products, recent activities)
- Product management (CRUD operations with search capabilities)
- Inventory tracking (stock levels, movements, alerts)
- Order processing and shipment management
- User management and reporting

### Database Design
Uses **PostgreSQL** as the primary database with **Drizzle ORM** for schema management and queries. The schema includes:
- **Users**: Authentication and role-based access control
- **Products**: Complete product catalog with SKU, pricing, and categorization
- **Inventory**: Multi-warehouse stock tracking with real-time updates
- **Categories & Suppliers**: Product organization and vendor management
- **Orders & Shipments**: Complete order lifecycle from creation to delivery
- **Stock Movements**: Audit trail for all inventory changes

Schema uses UUID primary keys and includes proper foreign key relationships with cascading operations where appropriate.

### Development Environment
The project uses modern development tooling:
- **Vite**: Fast development server with HMR and optimized builds
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast backend compilation and bundling
- **Drizzle Kit**: Database migrations and schema management
- **Replit integration**: Development environment optimizations

## External Dependencies

### Database & ORM
- **PostgreSQL**: Primary database (configured for Neon Database serverless)
- **Drizzle ORM**: Type-safe database operations and schema management
- **@neondatabase/serverless**: Serverless PostgreSQL driver with WebSocket support

### UI Framework & Components
- **React**: Frontend framework with hooks and concurrent features
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, forms, etc.)
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

### Data Management
- **TanStack React Query**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation and schema validation
- **date-fns**: Date manipulation and formatting utilities

### Charts & Visualization
- **Recharts**: Data visualization library for dashboard analytics
- **Embla Carousel**: Touch-friendly carousel component

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **ESLint & Prettier**: Code linting and formatting
- **Wouter**: Lightweight client-side routing

The system is designed for deployment on modern cloud platforms with support for serverless PostgreSQL databases and can be easily extended with additional integrations for ERP systems, e-commerce platforms, or logistics providers.