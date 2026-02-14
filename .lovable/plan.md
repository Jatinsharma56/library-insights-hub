

# Remote Smart Library Monitoring & Analytics System

## Overview
A real-time library seat monitoring dashboard built with React, Supabase, and Tailwind CSS. Students can book/release seats, view live occupancy data, and access AI-powered predictions — all from their hostel room.

---

## Phase 1: Core Dashboard & Seat Grid

### 1. Database Setup (Supabase)
- **`profiles` table** — student/admin roles, name, student ID
- **`seats` table** — seat number, status (free/booked), booked_by, booked_at, expires_at
- **`occupancy_logs` table** — hourly snapshots of occupancy percentage for analytics
- Row-Level Security so students can only manage their own bookings, admins can manage all

### 2. Authentication
- Email-based login/signup with role selection (student or admin)
- Admin dashboard with ability to reset seats and view all bookings
- Student view with ability to book/release their own seats

### 3. Seat Grid Display
- Visual 5×10 grid (50 seats) with color coding:
  - **Green** = Free seat (clickable to book)
  - **Red** = Booked seat (shows who booked it)
  - **Blue** = Your booked seat
- Click a free seat to book it; click your seat to release it
- Auto-expire bookings after 2 hours with visual countdown

### 4. Real-Time Statistics Panel
- Total seats, free seats, booked seats
- Live occupancy percentage with progress bar
- Crowd status badge: **Low** (<40%), **Medium** (40-75%), **High** (>75%)
- All data updates in real-time via Supabase Realtime subscriptions

---

## Phase 2: Noise Detection & Analytics

### 5. Noise Level Monitor
- Browser microphone access using Web Audio API
- Real-time decibel meter with color-coded levels (Quiet / Moderate / Loud)
- Visual noise level bar on the dashboard

### 6. Occupancy Charts
- Line chart showing today's occupancy trend (hourly)
- Bar chart showing weekly occupancy patterns
- Built with Recharts (already installed)

### 7. Best Time to Visit
- Analyze stored occupancy logs to find historically low-traffic hours
- Display a recommendation card: "Best time to visit: 6-8 AM, 2-4 PM"

---

## Phase 3: AI Prediction

### 8. Peak Hour Prediction
- Use stored occupancy log data to calculate hourly averages per day of week
- Apply simple weighted moving average / linear trend analysis
- Generate a 7-day prediction chart showing expected busy hours
- Clear explanation card showing how the prediction works

---

## Design & UX
- Clean, modern dashboard with card-based layout
- Fully responsive — works on mobile from hostel room
- Dark/light mode support
- Toast notifications for booking confirmations and expiry warnings
- Navigation: Dashboard (main view), My Bookings, Analytics, Admin Panel

