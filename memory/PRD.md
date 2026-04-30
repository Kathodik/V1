# Kathodik - Galvanotechnik Website

## Original Problem Statement
Professional website for the electroplating business "Kathodik" with services showcase, AI-powered 3D configurator, customer/admin portal, and AI chatbot.

## Core Requirements
- Homepage with cinematic scroll animations and company slogan
- Services page with 3D periodic table of metals (13 metals including Weiß Bronze)
- Portfolio/References page with real project images
- AI-powered 3D Configurator (3 paths: upload, partner, AI generation)
- AI Chatbot "Luigi Galvani" for technical questions
- Customer & Admin Portal with authentication
- Cookie consent (DSGVO) and analytics dashboard
- Order acceptance pause/resume functionality
- Email integration via Resend (domain: info.kathodik.com)

## Architecture
- Frontend: React + Tailwind CSS + Shadcn/UI
- Backend: FastAPI + Python
- Database: MongoDB
- AI: emergentintegrations (text chat + image generation GPT Image 1)
- Email: Resend API

## What's Been Implemented (as of 2026-04-30)
- [x] Homepage with cinematic scroll animations
- [x] Services page with 3D metallic periodic table (13 metals)
- [x] Portfolio/References page with user images
- [x] AI Chatbot "Luigi Galvani" (text)
- [x] 3D Configurator with 3 paths (Upload / Partner / KI-Konzept)
- [x] KI-Bildgenerierung (GPT Image 1) for photorealistic concepts
- [x] Customer Portal with login/register
- [x] Admin Portal with analytics dashboard
- [x] Order acceptance toggle (pause/resume)
- [x] Cookie consent banner (DSGVO)
- [x] Visitor statistics & analytics
- [x] Password reset flow
- [x] Email integration (Resend - pending domain verification)
- [x] Weiß Bronze as metal option
- [x] Imprint with USt-ID DE461441959
- [x] Favicon with K+ logo
- [x] "Made with Emergent" watermark removed

## Admin Access
- URL: /admin (via Portal Login)
- Email: service@kathodik.com
- Password: Sniffi18

## Pending / Blocked
- Resend domain info.kathodik.com verification (DNS propagation pending)
- Chat UI layout overflow (minor, old bug)

## Backlog / Future Tasks
- P2: 3D Printing Partner Integration (B2B partner API)
- P2: Customer Portal - show saved requests and order history from DB
- P3: Dynamic 3D Model Background (WebGL/Three.js)
- P3: Parallax Effect on Services Page
