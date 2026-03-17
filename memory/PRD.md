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
