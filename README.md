# Reactify Web - React.js Application

This is the React.js web application for Reactify, migrated from the mobile app to provide feature parity on the web platform.

## Technology Stack

- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Redux Toolkit** - State management (matching mobile app)
- **Redux Persist** - State persistence
- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Socket.io** - Real-time communication
- **Solana Wallet Adapter** - Web3 integration

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── auth/        # Authentication components
│   ├── ui/          # UI primitives
│   └── ...
├── pages/           # Page components
│   ├── auth/        # Auth pages
│   └── ...
├── lib/             # Utilities and configurations
│   ├── api.ts       # API client
│   ├── queries.ts   # React Query hooks
│   └── ...
├── store/           # Redux store
│   ├── index.ts     # Store configuration
│   └── reducers/    # Redux slices
│       ├── authSlice.ts
│       └── ...      # Other slices (post, chat, etc.)
├── hooks/           # Custom React hooks
│   └── redux.ts     # Typed Redux hooks
├── types/           # TypeScript type definitions
└── App.tsx          # Root component
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://app.reeltoksocial.com
VITE_SOLANA_NETWORK=mainnet-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

## Features

### Implemented
- ✅ Project setup and configuration (Vite + React + TypeScript)
- ✅ Redux Toolkit store setup (matching mobile app structure)
- ✅ Redux Persist for state persistence
- ✅ Authentication system with Redux
  - ✅ Login/Register pages
  - ✅ Protected routes
  - ✅ Token management
  - ✅ User state management
- ✅ API client with interceptors
- ✅ React Router setup
- ✅ Tailwind CSS configuration

### In Progress
- 🔄 Email verification flow
- 🔄 Social login integration
- 🔄 Feed module
- 🔄 Content module

### Planned
- ⏳ Post reducers (matching mobile app)
- ⏳ Chat reducers (matching mobile app)
- ⏳ Notifications reducers (matching mobile app)
- ⏳ Groups reducers (matching mobile app)
- ⏳ Profile reducers (matching mobile app)
- ⏳ Social features
- ⏳ Messaging
- ⏳ Groups
- ⏳ Settings
- ⏳ And more...

## API Integration

The app connects to the backend API at `https://app.reeltoksocial.com/api`

All API requests include the `x-auth-token` header when authenticated.

## Development Guidelines

1. **Module-by-module development** - Implement features incrementally
2. **Feature parity** - Match mobile app functionality
3. **Type safety** - Use TypeScript for all new code
4. **Component reusability** - Create reusable UI components
5. **API consistency** - Follow existing API patterns from mobile app

## License

Private - Reactify
