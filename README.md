# 🚌 BusQ – Bus Reservation, Tracking & Management System

BusQ is a **transport infrastructure SaaS platform** that digitizes the bus transit experience in Cebu.  
It enables **seat reservations, real-time bus tracking, and fleet management** in one unified system — eliminating long terminal queues through a **single-scan QR boarding experience**.

---

## 🚀 Overview

BusQ is designed for two main users:

- **Passengers (Client App)** → Book seats, track buses, and board seamlessly  
- **Bus Companies (SaaS Dashboard)** → Manage fleets, schedules, and operations in real time  

> 💡 Core Idea: *“Book in seconds. Board in one scan.”*

---

## ✨ Core Features

### 👤 Passenger (Client App)
- 📱 Mobile-first bus seat reservation
- 🪑 Interactive seat selection:
  - Traditional: A–D layout  
  - Airconditioned: A–E layout  
- 🎫 QR-based digital ticket (single-scan boarding)
- 📍 Real-time bus tracking with ETA
- 💳 Digital payments (GCash / Card-ready)
- 🧾 Downloadable booking receipts
- 🔔 Status updates:
  - Parked
  - Travelling
  - Arriving

---

### 🧠 Bus Company (Management SaaS)
- 🖥 Fleet management dashboard
- 🕒 Scheduling & dispatching system
- 📊 Demand analytics & reporting
- 📍 Real-time tracking of all buses
- 💰 Revenue monitoring & insights
- 👥 Booking and passenger management

---

### 🛰 Tracking System (Shared)
- Live GPS-based tracking for both passengers and operators
- Route visualization (origin → destination)
- Multi-bus monitoring for admin view
- Real-time updates and alerts

---

## 🔥 Key Innovation

- ❌ Eliminates **double-lining** (ticket + validation queues)
- ✅ Enables **single QR scan boarding**
- 🔄 Unifies **reservation + validation + operations**
- 📊 Provides **real-time data visibility for operators**

---

## 🎯 Target Market

- 🎓 Students & BPO workers (daily/weekly commuters)
- 👵 Vulnerable commuters (elderly, PWDs, pregnant women)
- 🎄 Holiday travelers (high-volume peak seasons)

---

## 💰 Business Model

- **B2C (Passengers):**
  - ₱2–₱5 convenience fee per booking  

- **B2B (Bus Companies):**
  - ₱1,500/month per bus (SaaS subscription)

- **Additional Revenue:**
  - Ads & partnerships  
  - Data-driven insights  

---

## 🧱 Tech Stack

### Frontend
- React (Next.js)
- Tailwind CSS
- ShadCN UI
- PWA Support (mobile-first experience)

### Backend (Planned / In Progress)
- Firebase / PostgreSQL (database)
- Authentication (Firebase Auth / JWT)
- Cloud Functions / API Layer (Node.js)
- Real-time updates (WebSockets / Firebase)

### Integrations
- Google Maps API (for tracking)
- QR Code system (ticket validation)

---

## 🗺 Supported Routes (Initial)

- Mantalongon, Dalaguete ↔ Cebu City (South Bus Terminal)
- Expandable to **45+ routes across Cebu**

---

## 📈 Roadmap

- [ ] Full GPS tracking integration  
- [ ] Payment gateway (GCash / Cards)  
- [ ] Admin dispatch system  
- [ ] Real-time analytics dashboard  
- [ ] Multi-terminal expansion (North & South)  
- [ ] Bus-to-Ferry integration (future)

---

## ⚙️ Installation

```bash
git clone https://github.com/Prannsss/BusQ.git
cd BusQ
npm install
npm run dev