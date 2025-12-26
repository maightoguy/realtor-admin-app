# Property Details Component

## Overview

A responsive property details component that displays comprehensive property information as a nested component within the dashboard layout. This replaces the property list view when a property is selected.

## Features

- **Nested Dashboard Layout**: Integrated as a dashboard section, not a modal
- **Responsive Design**: Optimized for mobile, tablet, and desktop screens
- **Image Gallery**: Main image with thumbnail navigation
- **Image Viewer Modal**: Full-screen image viewer with navigation controls
- **Property Information**: Title, price, location, and description
- **Documents Section**: Property documents with verification status
- **Features Grid**: Property amenities with icons and labels
- **Location Map**: Interactive map placeholder for property location
- **Action Buttons**: Upload receipt and download documents functionality
- **Breadcrumb Navigation**: Easy navigation back to property list
- **Keyboard Navigation**: Arrow keys and Escape key support
- **Seamless Data Integration**: Ready for backend API integration

## Usage

### Basic Implementation

```tsx
import PropertyDetails from './PropertyDetails';

<PropertyDetails
  property={selectedProperty}
  onBack={handleBackToList}
  isFavorited={isFavorited}
  onFavorite={handleFavorite}
/>
```

### Data Service Integration

The component is designed to work with the `propertyService` for seamless backend integration:

```tsx
import { propertyService } from '../../services/propertyService';

// Switch between mock data and backend
const USE_MOCK_DATA = true; // Set to false when backend is ready
```

## Responsive Breakpoints

- **Mobile**: < 640px - Single column layout, compact spacing
- **Tablet**: 640px - 1024px - Improved spacing, larger text
- **Desktop**: > 1024px - Side-by-side layout with image gallery

## Design Tokens

The component uses consistent design tokens from `src/design-system/tokens.ts`:

- **Colors**: Primary purple (#5E17EB), secondary (#6D00C2), neutral grays
- **Spacing**: Consistent padding and margins across breakpoints
- **Typography**: Poppins font family with responsive sizing
- **Shadows**: Subtle elevation for modal and cards

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast color ratios
- Focus management for modal interactions

## Future Enhancements

- Virtual tour integration
- 360° image support
- Advanced filtering options
- Social sharing functionality
- Print-friendly layout
