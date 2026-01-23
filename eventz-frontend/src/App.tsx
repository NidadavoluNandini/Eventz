import { BrowserRouter, Routes, Route } from "react-router-dom";

/* PUBLIC */
import EventsList from "./pages/public/EventsList";
import EventDetails from "./pages/public/EventDetails";
import RegisterEvent from "./pages/public/RegisterEvent";
import VerifyOtp from "./pages/public/VerifyOtp";
import TicketSuccess from "./pages/public/TicketSuccess";
import Payment from "./pages/public/Payment";
import PaymentCancelled from "./pages/public/PaymentCancelled";
import ResumeRegistration from "./pages/public/ResumeRegistration";
import RegistrationExpired from "./pages/public/RegistrationExpired";
import AboutUs from "./components/AboutUs";
import ContactUs from "./components/ContactUs";

/* ORGANIZER */
import OrganizerLogin from "./pages/organizer/Login";
import Register from "./pages/organizer/Register";
import OrganizerForgotPassword from "./pages/organizer/OrganizerForgotPassword";
import OrganizerResetPassword from "./pages/organizer/OrganizerResetPassword";
import Dashboard from "./pages/organizer/Dashboard";
import Events from "./pages/organizer/Events";
import CreateEvent from "./pages/organizer/CreateEvent";
import UserManagement from "./pages/organizer/UserManagement";
import OrganizerLayout from "./pages/organizer/OrganizerLayout";

/* PROTECTION */
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ========== PUBLIC ROUTES ========== */}
        <Route path="/" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/events/:id/register" element={<RegisterEvent />} />

        {/* 🔥 RESUME FLOW */}
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/verify-otp/:registrationId" element={<VerifyOtp />} />

        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/:registrationId" element={<Payment />} />

        <Route path="/resume/:registrationId" element={<ResumeRegistration />} />
        <Route path="/ticket-success/:id" element={<TicketSuccess />} />
        <Route path="/payment-cancelled/:id" element={<PaymentCancelled />} />
        <Route path="/registration-expired" element={<RegistrationExpired />} />

        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* ========== ORGANIZER AUTH ========== */}
        <Route path="/organizer/login" element={<OrganizerLogin />} />
        <Route path="/organizer/register" element={<Register />} />
        <Route
          path="/organizer/forgot-password"
          element={<OrganizerForgotPassword />}
        />
        <Route
          path="/organizer/reset-password"
          element={<OrganizerResetPassword />}
        />

        {/* ========== ORGANIZER PROTECTED ========== */}
        <Route
          path="/organizer"
          element={
            <ProtectedRoute>
              <OrganizerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path="events/create" element={<CreateEvent />} />
          <Route path="users" element={<UserManagement />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
