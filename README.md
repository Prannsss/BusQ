## 🚌 El-Joesur Highlander Transport – BusReservation&Tracker

A real-time bus reservation and tracking app that allows users to book seats, track bus locations via GPS, and check live bus statuses. The platform is built for El-Joesur Highlander Transport and connects Mantalongon, Dalaguete to Cebu City with stops in between.

---

## 🚀 Features

- 🔒 Secure seat reservations with real-time availability.
- 📍 GPS-based live bus tracking.
- ⏱ Dynamic schedule display with status updates:
  - Parked
  - Travelling
  - Scheduled
- 🪑 Interactive seat picker (A1–D12 for Traditional, A1–E12 for Airconditioned + backrow).
- 🎫 Downloadable ticket receipts for passengers.
- 🧮 Smart fare calculation (with 20% discounts for Students, Seniors, and PWDs).
- 📆 Automatically updates trip schedules using actual travel and arrival times.
- 🛣 Supports complete routes: Mantalongon → Cebu City and vice versa.
- 🌐 Firebase + Google Maps API integration.

---

## 🧱 Tech Stack

### Frontend
- React (with Next.js for routing)
- Tailwind CSS (for UI styling)
- ShadCN UI (for UI components)
- Google Maps API (for live tracking) //not implemented
- PWA Support (for mobile responsiveness and offline capabilities)

### Backend //not implemented
- Firebase Firestore (database for trips, seats, users)
- Firebase Authentication (user login and access control)
- Cloud Functions (for real-time bus status updates and fare calculations)
- Firebase Hosting

---

## ⚙️ Installation

1. Clone the repo:
```bash
git clone https://github.com/Prannsss/BusQ.git
cd BusQ

---
### Install dependencies
npm install

