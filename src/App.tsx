import { useState } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BookingModal from "./components/BookingModal";
import WhatsAppButton from "./components/WhatsAppButton";
import Home from "./pages/Home";
import Classes from "./pages/Classes";
import CalculatorsPage from "./pages/CalculatorsPage";
import TrainersPage from "./pages/TrainersPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";
import AdminLogin from "./pages/admin/Login";
import AdminLayout from "./components/admin/AdminLayout";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminDashboard from "./pages/admin/Dashboard";
import MembersPage from "./pages/admin/MembersPage";
import AdminTrainersPage from "./pages/admin/TrainersPage";
import ClassesPage from "./pages/admin/ClassesPage";
import SchedulesPage from "./pages/admin/SchedulesPage";
import BookingsPage from "./pages/admin/BookingsPage";
import WorkoutsPage from "./pages/admin/WorkoutsPage";
import ProgressPage from "./pages/admin/ProgressPage";
import AttendancePage from "./pages/admin/AttendancePage";

const Layout = () => {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingTitle, setBookingTitle] = useState("Claim Free Trial");
  const [bookingScheduleId, setBookingScheduleId] = useState<string | undefined>();

  const openModal = (title?: string, scheduleId?: string) => {
    if (title) setBookingTitle(title);
    setBookingScheduleId(scheduleId);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <Navbar onOpenModal={() => openModal("Claim Free Trial")} />
      <main className="flex-grow">
        <Outlet context={{ openModal }} />
      </main>
      <Footer />
      <WhatsAppButton />
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        title={bookingTitle}
        scheduleId={bookingScheduleId}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="classes" element={<Classes />} />
              <Route path="calculators" element={<CalculatorsPage />} />
              <Route path="trainers" element={<TrainersPage />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="trainers" element={<AdminTrainersPage />} />
                <Route path="classes" element={<ClassesPage />} />
                <Route path="schedules" element={<SchedulesPage />} />
                <Route path="bookings" element={<BookingsPage />} />
                <Route path="workouts" element={<WorkoutsPage />} />
                <Route path="progress" element={<ProgressPage />} />
                <Route path="attendance" element={<AttendancePage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
