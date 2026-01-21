# CardNest KYC

A modern KYC (Know Your Customer) application built with Next.js that uses facial recognition and document verification technology to verify user identity.

## Features

- **Facial Recognition**: Advanced face scanning with real-time detection and verification
- **Document Verification**: Capture and verify government-issued ID cards (front and back)
- **Camera Integration**: 
  - Uses device rear camera (environment facing) on mobile devices
  - Real-time camera preview with alignment guides
  - Transparent ID placeholder overlay for better user guidance
- **Responsive Design**: Mobile-first design with a clean white theme and cyan-500 accents
- **User-Friendly Flow**: 
  - Welcome screen with animated face ID visualization
  - Face scanning with progress indicator
  - Document capture with placeholder images
  - Success confirmation page

## Technology Stack

- **Framework**: Next.js 16.1.4
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS v4
- **Camera API**: getUserMedia API for camera access
- **Routing**: Next.js App Router

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cardnest_kyc
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Important Notes

- Camera access requires **HTTPS** in production or **localhost** in development
- For mobile testing, ensure your device grants camera permissions
- ID placeholder images should be placed in `/public/images/id_f.png` and `/public/images/id_b.png`

## Project Structure

```
cardnest_kyc/
├── src/
│   └── app/
│       ├── page.js                    # Home/Landing page with Face ID animation
│       ├── scanning/
│       │   └── page.js                # Face scanning page with live camera feed
│       ├── document-verification/
│       │   └── page.js                # ID document capture page
│       ├── success/
│       │   └── page.js                # Verification success page
│       ├── layout.js                  # Root layout
│       └── globals.css                # Global styles
├── public/
│   └── images/
│       ├── id_f.png                   # Front ID placeholder
│       └── id_b.png                   # Back ID placeholder
└── package.json
```

## User Flow

1. **Landing Page** (`/`): Introduction with Face ID visualization and "Get Started" button
2. **Face Scanning** (`/scanning`): Live camera feed scans user's face with progress bar
3. **Document Verification** (`/document-verification`): 
   - User captures front and back of ID card
   - Camera modal with alignment guide
   - Upload button enabled after both sides captured
4. **Success** (`/success`): Confirmation page with user details

## Camera Features

### Document Verification Camera
- Full-screen overlay interface
- Real-time camera preview
- Transparent ID card placeholder with:
  - Dashed cyan border outline
  - Corner markers for alignment
  - "Align ID here" text hint
- Capture & confirm button
- Close button to return to document page

## Development

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Design Theme

- **Background**: White (`bg-white`)
- **Text**: Black (`text-black`)
- **Accent Color**: Cyan-500 (`bg-cyan-500`, `text-cyan-500`)
- **Typography**: Geist font family
- **UI Style**: Clean, modern, mobile-first

## Browser Compatibility

- Requires browser support for:
  - `getUserMedia` API (camera access)
  - Canvas API (image capture)
  - ES6+ JavaScript features

## License

This project is private and proprietary.

## Learn More

To learn more about Next.js, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js GitHub repository](https://github.com/vercel/next.js)

