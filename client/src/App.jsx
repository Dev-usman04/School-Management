import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import StudentDashboard from "./components/StudentDashboard.jsx";
import TeacherInterface from "./components/TeacherInterface.jsx";
import AdminInterface from "./components/AdminInterface.jsx";
import Register from "./components/Register.jsx";

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  console.log({user, role});
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/student" element={
            <PrivateRoute role="Student">
              <StudentDashboard />
            </PrivateRoute>
          } />
          <Route path="/teacher" element={
            <PrivateRoute role="Teacher">
              <TeacherInterface />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute role="Admin">
              <AdminInterface />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

