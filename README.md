DropVault – Secure & Scalable File Sharing Platform

DropVault is a cloud-based, secure file-sharing platform that enables users to upload, manage, and share files using a credit-based access model.

Built with a modern full-stack architecture using Spring Boot + React, it integrates AWS S3 for scalable storage, MongoDB for persistence, and Clerk for authentication.

🌟 Key Features
📂 File Management

Secure file upload & download

Cloud storage integration using AWS S3

Public file sharing via shareable links

File metadata tracking (size, type, upload date)

Organized dashboard view of user files

👤 User & Authentication

Secure JWT authentication powered by Clerk

User profile management

Role-based access control

Credit-based system for file operations

💳 Credit & Subscription System

Credit consumption on file uploads

Multiple subscription tiers

Real-time credit updates

Transaction history tracking

⚡ Advanced Capabilities

Scalable cloud storage architecture

Optimized backend APIs

Responsive UI (Desktop + Mobile)

Real-time file & credit updates

Secure public/private file access

🏗️ System Architecture Overview
Client (React + Clerk)
        ↓
Spring Boot REST APIs
        ↓
MongoDB (Metadata Storage)
        ↓
AWS S3 (File Storage)

MongoDB → Stores file metadata, user credits, transactions

AWS S3 → Stores actual file content

Clerk → Handles authentication & JWT validation

Redis (Optional / Planned) → Caching layer for performance optimization

🛠️ Technology Stack
🔹 Backend

Framework: Spring Boot 3.4.1

Language: Java 17

Database: MongoDB

Cloud Storage: AWS S3

Authentication: Clerk JWT

Build Tool: Maven

Security: Spring Security

🔹 Frontend

Framework: React 19

Build Tool: Vite

Routing: React Router v7

Styling: Tailwind CSS

Authentication: Clerk React SDK

HTTP Client: Axios

Package Manager: npm

📁 Project Structure
DropVault/
│
├── backend/
│   ├── src/main/java/com/dropvault/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── model/
│   │   └── security/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
│
└── README.md
🔐 Security Implementation

JWT verification using Clerk

Spring Security filters for request validation

Secure file access control

Input validation & API request sanitization

Role-based endpoint protection

📊 Database Design
Collections

users → User info & credit balance

files → File metadata (S3 key, size, owner, visibility)

transactions → Credit usage & subscription logs
