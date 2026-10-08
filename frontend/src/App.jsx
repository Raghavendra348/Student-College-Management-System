import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";

import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Students from "./components/Students";
import StudentDetails from "./components/StudentDetails";
import AddStudent from "./components/AddStudent";
import Attendance from "./components/Attendance";
import Marks from "./components/Marks";
import Backlogs from "./components/Backlogs";
import SemesterResult from "./components/SemesterResult";
import Profile from "./components/Profile";

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/add-student" element={<AddStudent />} />
          <Route path="/students/:id" element={<StudentDetails />} />
          <Route path="/marks" element={<Marks />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/backlogs" element={<Backlogs />} />
          <Route path="/semester-results" element={<SemesterResult />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Default Fallback Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;