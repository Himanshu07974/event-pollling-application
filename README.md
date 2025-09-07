# Event Polling Platform (MERN)

A collaborative event & polling platform built with the MERN stack.  
Users can sign up/login, create events with multiple possible dates, invite participants, run polls inside events and vote. Backend APIs are secured with JWT. This repository contains both backend and frontend (see folder layout).

> **Status:** Backend implemented and tested locally. Frontend skeleton / deployment steps included in README.  
> **Note:** Rotate any exposed credentials — do not commit `.env`.

---

## Table of Contents

- [Live Links](#live-links)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Data Modeling](#data-modeling)
- [Authentication & Access Control](#authentication--access-control)
- [Setup — Local Development](#setup--local-development)
- [API Endpoints (high level)](#api-endpoints-high-level)
- [Deployment](#deployment)
- [Architecture Decisions](#architecture-decisions)
- [Validation, Errors & Security](#validation-errors--security)
- [Challenges Faced & Solutions](#challenges-faced--solutions)
- [Testing & QA](#testing--qa)
- [How to contribute / submit](#how-to-contribute--submit)

---

## Live Links
- Frontend: `FRONTEND_LIVE_URL` (add after deploy)
- Backend API Base URL: `BACKEND_API_BASE_URL` (add after deploy)

---

## Tech Stack

**Backend**
- Node.js + Express
- MongoDB Atlas (Mongoose)
- JWT for authentication
- express-validator for request validation
- nodemon for development
- dotenv for config

**Frontend**
- React (or Next.js) — optional skeleton provided / recommended
- Fetch / Axios for API calls

**Dev / Deployment**
- GitHub for source control
- Render / Railway for backend deployment (free tiers suggested)
- Vercel / Netlify for frontend

---

## Folder Structure (backend)
