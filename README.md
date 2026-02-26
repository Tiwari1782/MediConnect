# MediConnect

**MediConnect** is an all-in-one healthcare platform designed to seamlessly connect doctors and patients for hassle-free appointment scheduling, real-time consultations (chat & video), secure payments, and easy access to medical resources.

Built as a full-featured solo MERN stack project, MediConnect offers robust features to enhance healthcare accessibility and doctor-patient communication.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Monorepo Layout](#monorepo-layout)
  - [Backend Folder Structure](#backend-folder-structure)
  - [Frontend Folder Structure](#frontend-folder-structure)
- [Getting Started](#getting-started)
  - [Environment Variables](#environment-variables)
  - [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [API Endpoints (Backend)](#api-endpoints-backend)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features

- **Separate dashboards and login/signup flows** for doctors and patients
- **OTP SMS and email verification**
- **Doctor portal:** manage schedule, set slots/pricing, track appointments
- **Patient portal:** search doctors, book slots, request appointments
- **Secure online payments** — powered by Razorpay
- **Real-time Chat:** text, images, file sharing via Socket.IO
- **Video calls:** mic, cam, screen sharing via WebRTC
- **AI Health Chatbot** via Hugging Face
- **Nearby hospitals/pharmacies** (map, geolocation, Overpass/Leaflet)
- **Comprehensive medicine search** (by name, price, composition)
- **User profile with avatar upload** (Cloudinary integration)
- **JWT authentication** (access/refresh tokens)
- **File uploads:** Multer + Cloudinary
- **Notification system:** appointment reminders, updates
- **Responsive, beautiful UI:** Tailwind CSS, GSAP, Three.js animations

---

## Tech Stack

**Frontend:**
- [React.js (Vite)](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [GSAP](https://greensock.com/gsap/), [Three.js](https://threejs.org/)
- [Leaflet.js](https://leafletjs.com/)
- [Socket.IO-client](https://socket.io/)
- [react-router-dom](https://reactrouter.com/)
- [Razorpay Checkout JS](https://razorpay.com/docs/payment-gateway/web-integrations/standard/)

**Backend:**
- [Node.js](https://nodejs.org/en/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/) (Authentication)
- [Multer](https://www.npmjs.com/package/multer) & [Cloudinary](https://cloudinary.com/)
- [Twilio](https://www.twilio.com/) (OTP SMS)
- [Nodemailer](https://nodemailer.com/) (Email verification)
- [Socket.IO server](https://socket.io/) (Real-time)
- [WebRTC](https://webrtc.org/) (Video calls)
- [Razorpay](https://razorpay.com/) (Payments)
- [Hugging Face API](https://huggingface.co/) (AI chatbot)

---

## Monorepo Layout

```
.
├── backend/          # Express + MongoDB Server
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── utils/
│   ├── seeders/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/         # Vite + React Client
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── index.html
│   └── vite.config.js
├── README.md
```

---

### Backend Folder Structure

```
MediConnect/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── cloudinary.js
│   │   ├── twilio.js
│   │   └── razorpay.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Patient.js
│   │   ├── Appointment.js
│   │   ├── Chat.js
│   │   ├── Message.js
│   │   ├── Medicine.js
│   │   ├── Notification.js
│   │   ├── Payment.js
│   │   └── Schedule.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── patientController.js
│   │   ├── appointmentController.js
│   │   ├── chatController.js
│   │   ├── messageController.js
│   │   ├── paymentController.js
│   │   ├── medicineController.js
│   │   ├── notificationController.js
│   │   ├── aiChatbotController.js
│   │   ├── nearbyPlacesController.js
│   │   └── scheduleController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── medicineRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── aiChatbotRoutes.js
│   │   ├── nearbyPlacesRoutes.js
│   │   └── scheduleRoutes.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── errorHandler.js
│   │   └── uploadMiddleware.js
│   ├── utils/
│   │   ├── generateTokens.js
│   │   ├── sendEmail.js
│   │   ├── sendOtp.js
│   │   └── verifyOtp.js
│   ├── socket/
│   │   ├── socketServer.js
│   │   └── webrtcSignaling.js
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
```

**Key model files:**
- `User.js`, `Doctor.js`, `Patient.js`, `Schedule.js`, `Appointment.js`, `Payment.js`, `Chat.js`, `Message.js`, `Medicine.js`, `Notification.js`

---

### Frontend Folder Structure

```
frontend/
├── public/
│   └── mediconnect-logo.svg
├── src/
│   ├── assets/
│   │   └── images/
│   │       └── hero-doctor.svg
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── RoleRoute.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── landing/
│   │   │   ├── Hero.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── Testimonials.jsx
│   │   │   ├── CTASection.jsx
│   │   │   └── ThreeScene.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── OtpVerification.jsx
│   │   │   └── EmailVerification.jsx
│   │   ├── dashboard/
│   │   │   ├── doctor/
│   │   │   │   ├── DoctorSidebar.jsx
│   │   │   │   ├── DoctorStats.jsx
│   │   │   │   ├── ScheduleManager.jsx
│   │   │   │   ├── AppointmentList.jsx
│   │   │   │   └── DoctorProfile.jsx
│   │   │   └── patient/
│   │   │       ├── PatientSidebar.jsx
│   │   │       ├── PatientStats.jsx
│   │   │       ├── DoctorSearch.jsx
│   │   │       ├── DoctorCard.jsx
│   │   │       ├── BookingModal.jsx
│   │   │       ├── MyAppointments.jsx
│   │   │       └── PatientProfile.jsx
│   │   ├── chat/
│   │   │   ├── ChatSidebar.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   └── ChatInput.jsx
│   │   ├── video/
│   │   │   ├── VideoCall.jsx
│   │   │   └── VideoControls.jsx
│   │   ├── ai/
│   │   │   └── AIChatbot.jsx
│   │   ├── maps/
│   │   │   └── NearbyPlaces.jsx
│   │   ├── medicines/
│   │   │   ├── MedicineSearch.jsx
│   │   │   └── MedicineCard.jsx
│   │   ├── notifications/
│   │   │   └── NotificationPanel.jsx
│   │   └── payments/
│   │       └── PaymentCheckout.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── SocketContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   ├── useApi.js
│   │   └── useDebounce.js
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── VerifyEmailPage.jsx
│   │   ├── DoctorDashboardPage.jsx
│   │   ├── PatientDashboardPage.jsx
│   │   ├── ChatPage.jsx
│   │   ├── VideoCallPage.jsx
│   │   ├── MedicinePage.jsx
│   │   ├── NearbyPlacesPage.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── NotificationsPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── doctorService.js
│   │   ├── patientService.js
│   │   ├── appointmentService.js
│   │   ├── scheduleService.js
│   │   ├── paymentService.js
│   │   ├── chatService.js
│   │   ├── messageService.js
│   │   ├── medicineService.js
│   │   ├── notificationService.js
│   │   ├── aiService.js
│   │   └── nearbyPlacesService.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js


```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v16+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) instance (local or cloud)
- [Cloudinary](https://cloudinary.com/) account
- [Twilio](https://www.twilio.com/) account (for OTP)
- [Razorpay](https://razorpay.com/) account (for payments)
- [Hugging Face](https://huggingface.co/) (for AI chatbot)

---

### Environment Variables

Copy the `.env.example` file in both `backend/` and `frontend/` folders and fill variables with your credentials.

**backend/.env.example:**
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_SERVICE_SID=your_twilio_service_sid
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_USER=your_email_address_for_nodemailer
EMAIL_PASS=your_email_password_or_app_specific_password
HUGGINGFACE_API_KEY=your_huggingface_api_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**frontend/.env.example:**
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

---

### Installation & Setup

#### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # Add your credentials

# (Optional) Seed medicine data
npm run seed:medicines

npm run dev            # Starts on localhost:5000
```

#### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # Add your API and Razorpay key

npm run dev            # Starts on localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Usage

- Register as a **Doctor** or **Patient**
- Verify email and phone (OTP), login
- Doctors: Manage schedule, fees, view and approve appointments, chat, join video calls, manage profile
- Patients: Search and book doctors, join chat/video consults, pay securely, manage appointments/profile
- Real-time chat and notifications for reminders & status
- Search medicines/health resources, use AI chatbot for basic queries
- Secure file and image upload, responsive and accessible on all devices

---

## API Endpoints (Backend)

Key endpoints:

| Method | Route                           | Description                                 |
| ------ | ------------------------------- | ------------------------------------------- |
| POST   | /api/auth/register              | Register doctor/patient                     |
| POST   | /api/auth/login                 | Login and get JWT                           |
| POST   | /api/auth/send-otp              | Send OTP to phone (Twilio)                  |
| POST   | /api/auth/verify-otp            | Verify OTP                                  |
| GET    | /api/doctors                    | List/search doctors                         |
| GET    | /api/doctors/:id                | Get doctor details                          |
| POST   | /api/schedules                  | Doctor creates/edits schedule               |
| POST   | /api/appointments               | Patient requests appointment                |
| POST   | /api/payments/create-order      | Create payment order (Razorpay)             |
| POST   | /api/payments/verify            | Verify payment on completion                |
| POST   | /api/chats                      | Start/access chat                           |
| POST   | /api/messages                   | Send chat message (text/file/image)         |
| POST   | /api/ai-chatbot                 | Ask AI chatbot (Hugging Face)               |
| GET    | /api/nearby-places              | Search map for hospitals/pharmacies         |
| ...    | ...                             | Many more... See controller and routes code |

See `/backend/routes/` and comments in controllers for a full spec.

---

## Contributing

Pull requests and feedback welcome!  
- Fork this repo, create a branch, code, and PR!
- Please format code with Prettier and follow the structure/style conventions.
- Document any extra steps in your PR for review.

---

## Acknowledgments

- [Razorpay Docs](https://razorpay.com/docs/) for payment integration  
- [Twilio Docs](https://www.twilio.com/docs/) for OTP  
- [Cloudinary](https://cloudinary.com/documentation) for file cloud storage  
- [Leaflet](https://leafletjs.com/) & [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) for maps  
- [GSAP](https://greensock.com/gsap/) and [Three.js](https://threejs.org/) for inspiring animations  
- [Hugging Face](https://huggingface.co/) for the open AI chat model  
- All open-source contributors & the React/MERN/js community!

---

**MediConnect** — _Connecting care. Improving lives._  





