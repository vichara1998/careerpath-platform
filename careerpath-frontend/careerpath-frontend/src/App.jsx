import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar.jsx";
import Footer from "./components/common/Footer.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";

function Home() {
  return (
    <div className="page-container py-10">
      <h1 className="text-3xl font-bold">Welcome to CareerPath</h1>
      <p className="mt-4 text-gray-600">
        Find courses, universities and career guidance.
      </p>
    </div>
  );
}

function Courses() {
  return (
    <div className="page-container py-10">
      <h2 className="text-2xl font-semibold">Courses</h2>
      <p className="mt-2 text-gray-600">Course listing will appear here.</p>
    </div>
  );
}

function CourseDetails() {
  return (
    <div className="page-container py-10">
      <h2 className="text-2xl font-semibold">Course Details</h2>
      <p className="mt-2 text-gray-600">Course details will appear here.</p>
    </div>
  );
}

function Universities() {
  return (
    <div className="page-container py-10">
      <h2 className="text-2xl font-semibold">Universities</h2>
      <p className="mt-2 text-gray-600">University listing will appear here.</p>
    </div>
  );
}

function Recommendation() {
  return (
    <div className="page-container py-10">
      <h2 className="text-2xl font-semibold">Career Guide</h2>
      <p className="mt-2 text-gray-600">
        Career recommendations and chat will appear here.
      </p>
    </div>
  );
}

function About() {
  return (
    <div className="page-container py-10">
      <h2 className="text-2xl font-semibold">About</h2>
      <p className="mt-2 text-gray-600">About the project and team.</p>
    </div>
  );
}

function Login() {
  return (
    <div className="page-container py-10">
      <h2 className="text-2xl font-semibold">Login</h2>
    </div>
  );
}

function Register() {
  return (
    <div className="page-container py-10">
      <h2 className="text-2xl font-semibold">Get Started</h2>
    </div>
  );
}

function Notifications() {
  return (
    <div className="page-container py-10">
      <h2 className="text-2xl font-semibold">Notifications</h2>
    </div>
  );
}

function Profile() {
  return (
    <div className="page-container py-10">
      <h2 className="text-2xl font-semibold">Profile</h2>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="page-container py-10">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
    </div>
  );
}

function NotFound() {
  return (
    <div className="page-container py-10 text-center">
      <h2 className="text-2xl font-semibold">404 — Not Found</h2>
      <p className="mt-2 text-gray-600">
        The page you requested does not exist.
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/recommendation" element={<Recommendation />} />
            <Route path="/about" element={<About />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/notifications" element={<Notifications />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
