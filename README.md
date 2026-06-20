# Food Delivery App

A fullstack food delivery web application built with Node.js + Express (backend) and React + TypeScript (frontend).

## Tech Stack

## Backend: Node.js, Express 5, MongoDB, Mongoose, Socket.IO, JWT, Cloudinary, Passport (OAuth)

## Frontend: React 19, TypeScript, Vite, Material UI, Axios, Socket.IO Client

## Features

Authentication — Email/password + OAuth (Google, GitHub, Facebook)
Shopping cart with quantity management
Order management with real-time status updates via WebSocket
Image upload to Cloudinary
User management (admin)
Business hours enforcement (6:00 AM – 10:00 PM Vietnam time)
Product search and pagination

## Getting Started

## Prerequisites

Node.js >= 18
MongoDB

## Backend

bashcd backend
npm install
cp .env.example .env   # fill in your environment variables
npm run dev

Frontend

bashcd frontend
npm install
npm run dev

Environment Variables

Create backend/.env:

envPORT=4000
MONGODB_URI=mongodb://localhost:27017/FoodApp
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=

Create frontend/.env:

envVITE_API_URL=http://localhost:4000
