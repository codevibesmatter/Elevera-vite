# Elevera

A modern team collaboration platform built with React, Vite, and Convex.

## Features

- 🔐 Secure Authentication with Clerk
- 🚀 Real-time Backend with Convex
- 📁 File Management with Google Cloud Storage
- 👥 Team Collaboration
- 🎨 Beautiful UI with DaisyUI and Tailwind
- 🛣️ Type-safe Routing with TanStack Router
- 📊 Data Tables with TanStack Table
- 📝 Form Handling with React Hook Form
- ✅ Schema Validation with Zod

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Convex
- **Auth**: Clerk
- **Storage**: Google Cloud Storage
- **UI**: DaisyUI, Tailwind CSS
- **Routing**: TanStack Router
- **Data Tables**: TanStack Table
- **Icons**: Lucide
- **Components**: Radix UI
- **Forms**: React Hook Form
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Convex account
- Clerk account
- Google Cloud project with Storage enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/elevera-vite.git
cd elevera-vite
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
- Clerk publishable key
- Convex deployment URL
- Google Cloud credentials

4. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

The app will be available at http://localhost:5173

### Development

- **Frontend**: Source code in `src/`
- **Backend**: Convex functions in `convex/`
- **Types**: TypeScript types in `src/types/`
- **Components**: React components in `src/components/`
- **Routes**: TanStack Router routes in `src/routes/`
- **Styles**: Tailwind CSS in `src/styles/`

## Project Structure

```
elevera/
├── src/
│   ├── components/     # React components
│   ├── routes/         # Route definitions
│   ├── pages/          # Page components
│   ├── hooks/          # Custom hooks
│   ├── schemas/        # Zod schemas
│   ├── types/          # TypeScript types
│   └── styles/         # CSS styles
├── convex/
│   ├── schema.ts       # Database schema
│   ├── auth.ts         # Auth helpers
│   ├── users/          # User-related functions
│   ├── teams/          # Team-related functions
│   ├── files/          # File-related functions
│   └── admin/          # Admin functions
└── public/             # Static assets
```

## Documentation

- [Technical Guidelines](./TECHNICAL_GUIDELINES.md)
- [Development Plan](./DEVELOPMENT_PLAN.md)
- [TanStack Router Cheat Sheet](./TanStack_Router_Cheat_Sheet.md)
- [Convex Guide](./convex.md)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
