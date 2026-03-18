# Kathodik - Galvanotechnik Website PRD

## Original Problem Statement
Professional website for "Kathodik", an electroplating business owned by Hannes Barfuss. The site should showcase galvanizing services with an interactive periodic table, include an AI chatbot for technical advice, a 3D configurator, customer/admin portals, and a contact form.

## Core Requirements
- **Homepage**: Slogan "Kathodik. Weil Ihr Lieblingsstück die Kathode ist."
- **Services Page**: Periodic table of galvanizing metals with parallax effect + 3D model
- **AI Chat Bot**: Technical advice about electroplating, available on all pages except homepage
- **3D Configurator**: AI-driven configurator for custom parts
- **Customer Portal**: Account system with email verification, order tracking
- **Admin Portal**: Dashboard for managing customers and orders
- **Contact Form**: Functional form with email notifications
- **Design**: White background, logo blue (#2c7a7b)

## Tech Stack
- Frontend: React, Tailwind CSS, Shadcn/UI, React Router
- Backend: FastAPI, Python
- Database: MongoDB
- AI: OpenAI GPT-4o via emergentintegrations library
- Email: Resend (pending API key)
- Auth: JWT

## What's Implemented
### Completed (March 17, 2026)
- [x] Homepage with correct slogan
- [x] Services page with interactive periodic table (12 metals)
- [x] AI Chat Bot - FIXED using emergentintegrations library
- [x] Contact form - FIXED with backend API (POST /api/contact)
- [x] User registration with email verification flow
- [x] User login with JWT
- [x] Customer Portal (basic structure)
- [x] 3D Configurator page (UI + chat integration)
- [x] Header with navigation and login button
- [x] Footer with company info and links
- [x] Floating chat button (hidden on homepage)

### Completed (March 18, 2026)
- [x] "Made with Emergent" watermark removed via CSS (#emergent-badge)
- [x] Arrow icon removed from homepage CTA buttons
- [x] Homepage redesigned with cinematic scroll animations (like drhessetech.de)
- [x] Parallax effects on hero section and brand section
- [x] Scroll-triggered fade-in/slide animations (IntersectionObserver)
- [x] New AnimateOnScroll component + useScrollAnimation/useParallax hooks
- [x] Metals preview strip with 12 element symbols
- [x] Dark CTA section with gradient background
- [x] Professional section transitions with staggered delays
- [x] ALL pages redesigned with consistent scroll animations:
  - Services: Animated hero + periodic table with mouse parallax + animated metal details
  - 3D Configurator: Animated hero + fade-in chat interface + 3D preview
  - References: Animated cards with hover zoom + teal owner section
  - Contact: Animated contact info + slide-in form
  - Imprint: Staggered card animations for legal sections
  - Customer Portal: Fade-in header + content animations
  - Portal Login: Hero-reveal animation on login form
- [x] Header: Scroll-aware (transparent at top -> white/blur on scroll)
- [x] Footer: Redesigned with dark slate-900 theme, 4-column layout
- [x] Pill-shaped navigation with active-state highlighting
- [x] Services page: 3D metallic periodic table with realistic metal textures
  - ElementCube component with CSS 3D transforms, specular highlights, 3D depth edges
  - Transparent glass containers with backdrop-blur
  - Hover: 3D tilt rotation following mouse movement
  - Click: Detail panel with large 3D preview + order form
  - metalGradients: Realistic multi-stop CSS gradients per metal (Au=gold, Cu=copper, Ag=silver, etc.)
  - Period grouping (4, 5, 6) with correct element positioning

## Pending / In Progress
- [ ] **P0**: Resend API key needed for actual email sending (verification + contact form)
- [ ] **P1**: Admin Portal (separate login + dashboard)
- [ ] **P1**: Order status in Customer Portal (currently no real orders)
- [ ] **P2**: Parallax effect on Services page metal selection
- [ ] **P2**: Dynamic 3D model background on Services page
- [ ] **P3**: 3D Printing partner integration

## API Endpoints
- POST /api/chat - AI chat
- GET /api/chat/history/{session_id} - Chat history
- DELETE /api/chat/history/{session_id} - Clear history
- POST /api/contact - Contact form submission
- GET /api/contact/messages - Admin: view contact messages
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user
- POST /api/auth/verify-email - Email verification
- POST /api/orders - Create order
- GET /api/orders - List orders
- POST /api/3d-models - Create 3D model
- POST /api/print-requests - Create print request

## Database Collections
- users, chat_messages, contact_messages, orders, threed_models, print_requests
