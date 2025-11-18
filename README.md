# The Christie Hotel — Web Booking Platform

A full-stack web application for browsing and booking hotel rooms, built entirely from scratch with a custom Node.js backend and a JSON file-based database.

---

## Core Features

### Custom Backend Server
- Built using the native Node.js http module  
- No external frameworks like Express  
- Fully manual routing, request parsing, and response handling

### File-Based Database
- All room and booking data stored in local JSON files  
- Uses the Node.js fs module for reading/writing  
- Simple and fast for small-scale applications

### Room Search & Viewer
- Search available rooms by type  
- View detailed room information on dedicated pages  
- All room details served dynamically from the backend

### Dynamic Booking System
- Users select a room and choose check-in/check-out dates  
- Server validates booking requests  
- Prevents overlapping bookings  
- Stores confirmed reservations in JSON database

### Booking Lookup
- Users can retrieve their existing booking  
- Search by full name and check-in date  
- Displays stored reservation details

### Custom API Endpoints
- Example: /api/rooms  
- Serves room data to the front-end  
- Handles booking submissions and validation

---

## Technologies Used

| Layer | Technologies |
|-------|-------------|
| Back-End | Node.js (native http module), fs (File System) |
| Front-End | JavaScript (ES6), Bootstrap, HTML5, CSS3 |
| Database | JSON file-based data storage |

---

## How to Run Locally

### Step 1: Clone the repository

    git clone https://github.com/ChristieLiam/HotelBookingPlatform.git

### Step 2: Navigate into the project directory

    cd HotelBookingPlatform-main

### Step 3: Start the server

    node server.js

This project uses only native Node.js modules, so no npm install is required.

### Step 4: Open the application

Visit in your browser:

    http://localhost:5000

(or the port specified in server.js)

---

## Project Notes

- Ideal for demonstrating understanding of raw Node.js HTTP handling  
- Lightweight and easy to deploy  
- Great foundation for expanding into a full hotel reservation system (database migration, admin panel, real auth, etc.)

---

## Future Improvements

- Room image gallery
- Admin dashboard for editing rooms and bookings  
- Email confirmation system  
- Migration from JSON to SQL or MongoDB  
- User authentication for managing personal reservations

