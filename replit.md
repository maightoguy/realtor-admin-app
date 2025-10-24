# Realtor Admin - Project Documentation

## Overview
This is a React + TypeScript + Vite application for a Realtor Admin dashboard. The project uses Tailwind CSS v4 for styling and includes routing capabilities via React Router.

## Tech Stack
- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 6.0.11
- **Language**: TypeScript 5.7.2
- **Styling**: Tailwind CSS v4.1.16
- **Routing**: React Router DOM 7.9.4
- **UI Icons**: Lucide React 0.544.0
- **Additional Libraries**: react-range for slider components

## Project Structure
```
/
├── public/
│   ├── figmaAssets/     # SVG assets from Figma
│   └── vite.svg
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles with Tailwind
├── vite.config.ts       # Vite configuration
├── package.json         # Dependencies and scripts
└── tsconfig*.json       # TypeScript configurations
```

## Development

### Running Locally
The development server runs on port 5000:
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Replit Configuration

### Workflow
- **Name**: Server
- **Command**: `npm run dev`
- **Port**: 5000
- **Host**: 0.0.0.0 (configured for Replit proxy)

### Deployment
- **Type**: Autoscale (stateless website)
- **Build**: `npm run build`
- **Run**: `npm run preview`

## Recent Changes
- **2025-10-24**: Login Page Implementation
  - Created professional login page with modern UI/UX design
  - Features: email/password inputs, show/hide password toggle, remember me, forgot password link
  - Added React Router DOM for navigation between pages
  - Implemented accessibility features (autocomplete, aria-labels)
  - Used Lucide React icons for UI elements
  - Responsive design with Tailwind CSS styling
  - Decorative SVG assets from Figma integrated

- **2025-10-24**: Initial Replit setup
  - Added missing dev dependencies (@vitejs/plugin-react, @types/react, @types/react-dom, TypeScript, Vite)
  - Configured package.json with proper scripts
  - Set up Vite configuration for Replit environment (host 0.0.0.0, port 5000)
  - Created workflow for development server
  - Configured deployment for autoscale
  - Fixed file permissions for node_modules binaries

## Implemented Pages
- **Login Page** (`/login` or `/`): Professional authentication interface with email/password login, password visibility toggle, remember me checkbox, and forgot password link

## Notes
- Custom CSS animations and scrollbar styles are defined in index.css
- Tailwind CSS v4 is configured via @tailwindcss/vite plugin
- HMR (Hot Module Replacement) is working correctly
- Decorative SVG assets from Figma are used for visual enhancement
