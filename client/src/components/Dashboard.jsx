import React from 'react';
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.role === "Admin") navigate("/admin");
    else if (user.role === "Teacher") navigate("/teacher");
    else if (user.role === "Student") navigate("/student");
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-2xl font-bold text-blue-700 animate-pulse">
        Redirecting to your dashboard...
      </div>
    </div>
  );
}


