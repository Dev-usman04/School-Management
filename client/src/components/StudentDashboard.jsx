import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";
import { io } from "socket.io-client";
import PerformanceChart from "./PerformanceChart.jsx";

// Simple animated bar chart for marks
function PerformanceChartComponent({ marks }) {
  if (!marks.length) return <div>No marks data.</div>;
  const maxMark = Math.max(...marks.map(m => m.marks), 100);

  return (
    <div className="w-full mt-6">
      <h3 className="text-lg font-bold mb-2 text-blue-700">Performance Chart</h3>
      <div className="space-y-2">
        {marks.map((m, i) => (
          <div key={i} className="flex items-center">
            <span className="w-32 font-semibold">{m.classId?.subject || "Subject"}</span>
            <div className="flex-1 bg-blue-100 rounded h-6 mx-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-6 transition-all duration-700"
                style={{
                  width: `${(m.marks / maxMark) * 100}%`,
                  minWidth: "2rem",
                  animation: `growBar 1s ${i * 0.2}s both`
                }}
              />
            </div>
            <span className="font-bold text-blue-800">{m.marks}</span>
          </div>
        ))}
      </div>
      <style>
        {`
          @keyframes growBar {
            from { width: 0; }
            to { }
          }
        `}
      </style>
    </div>
  );
}

// Attendance calendar visualization
function AttendanceCalendar({ attendance }) {
  if (!attendance.length) return <div>No attendance data.</div>;
  // Group by month
  const byMonth = {};
  attendance.forEach(a => {
    const date = new Date(a.date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(a);
  });
  const months = Object.keys(byMonth);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2 text-blue-700">Attendance Calendar</h3>
      {months.map(month => (
        <div key={month} className="mb-2">
          <div className="font-semibold text-purple-600 mb-1">
            {new Date(month + "-01").toLocaleString("default", { month: "long", year: "numeric" })}
          </div>
          <div className="flex flex-wrap gap-1">
            {byMonth[month].map((a, i) => {
              const date = new Date(a.date);
              return (
                <div
                  key={i}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold shadow
                    ${a.present ? "bg-green-300 text-green-900 animate-pop" : "bg-red-200 text-red-700 animate-shake"}
                  `}
                  title={date.toLocaleDateString()}
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <style>
        {`
          .animate-pop {
            animation: pop 0.4s;
          }
          @keyframes pop {
            0% { transform: scale(0.5); opacity: 0.5;}
            80% { transform: scale(1.2);}
            100% { transform: scale(1); opacity: 1;}
          }
          .animate-shake {
            animation: shake 0.4s;
          }
          @keyframes shake {
            0% { transform: translateX(0);}
            20% { transform: translateX(-2px);}
            40% { transform: translateX(2px);}
            60% { transform: translateX(-2px);}
            80% { transform: translateX(2px);}
            100% { transform: translateX(0);}
          }
        `}
      </style>
    </div>
  );
}

// Feedback popup
function FeedbackPopup({ feedback, onClose }) {
  if (!feedback) return null;
  return (
    <div className="fixed top-8 right-8 z-50">
      <div className="bg-white border-2 border-purple-400 shadow-2xl rounded-xl px-6 py-4 animate-freaky-pop">
        <div className="text-lg font-bold text-purple-700 mb-1">🎉 New Mark!</div>
        <div className="text-blue-800">{feedback}</div>
        <button
          className="mt-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-700 transition"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <style>
        {`
          .animate-freaky-pop {
            animation: freaky-pop 0.7s cubic-bezier(.68,-0.55,.27,1.55);
          }
          @keyframes freaky-pop {
            0% { transform: scale(0.2) rotate(-10deg); opacity: 0;}
            60% { transform: scale(1.1) rotate(3deg);}
            80% { transform: scale(0.95) rotate(-2deg);}
            100% { transform: scale(1) rotate(0); opacity: 1;}
          }
        `}
      </style>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, token, logout } = useAuth();
  const [classes, setClasses] = useState([]);
  const [marks, setMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get("https://school-management-theta-brown.vercel.app/api/classes", { headers }),
      axios.get(`https://school-management-theta-brown.vercel.app/api/marks/student/${user.id}`, { headers }),
      axios.get(`https://school-management-theta-brown.vercel.app/api/attendance/student/${user.id}`, { headers }),
    ])
      .then(([classRes, marksRes, attRes]) => {
        setClasses(classRes.data);
        setMarks(marksRes.data);
        setAttendance(attRes.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setClasses([]);
        setMarks([]);
        setAttendance([]);
      })
      .finally(() => setLoading(false));
  }, [user, token]);

  // Real-time marks updates
  useEffect(() => {
    if (!user) return;
    const socket = io("https://school-management-theta-brown.vercel.app");
    socketRef.current = socket;
    socket.on("newMark", (data) => {
      if (data.studentId === user.id) {
        setPopup(`You received a new mark: ${data.marks}!`);
        // Refetch marks
        axios
          .get(`https://school-management-theta-brown.vercel.app/api/marks/student/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((res) => setMarks(res.data));
      }
    });
    return () => socket.disconnect();
  }, [user, token]);

  // Attendance summary
  const total = attendance.length;
  const present = attendance.filter(a => a.present).length;
  const attendanceRate = total ? Math.round((present / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-6">
      <FeedbackPopup feedback={popup} onClose={() => setPopup("")} />
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8 mt-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-blue-700 mb-1">Welcome, {user?.name}!</h1>
            <div className="text-gray-500">Student Dashboard</div>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow transition-transform hover:scale-105"
          >
            Logout
          </button>
        </div>
        {loading ? (
          <div className="text-center text-blue-600 animate-pulse">Loading your data...</div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2 text-purple-700">Your Classes</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((c) => (
                  <li key={c._id} className="bg-blue-100 rounded-lg p-4 shadow hover:scale-105 transition-transform">
                    <div className="font-bold text-blue-800">{c.name}</div>
                    <div className="text-sm text-gray-600">{c.subject}</div>
                    <div className="text-xs text-gray-500">Teacher: {c.teacherId?.name || "N/A"}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2 text-purple-700">Attendance</h2>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg animate-spin-slow">
                  {attendanceRate}%
                </div>
                <div>
                  <div className="font-bold">{present} / {total} days present</div>
                  <div className="text-gray-500 text-sm">Keep up the good work!</div>
                </div>
              </div>
              <AttendanceCalendar attendance={attendance} />
            </div>
            <div className="mb-8">
              <PerformanceChartComponent marks={marks} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 text-purple-700">Marks Table</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">Subject</th>
                      <th className="px-4 py-2 border-b">Mark</th>
                      <th className="px-4 py-2 border-b">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((m, i) => (
                      <tr key={i} className="hover:bg-blue-50 transition">
                        <td className="px-4 py-2 border-b">{m.classId?.subject || "Subject"}</td>
                        <td className="px-4 py-2 border-b font-bold text-blue-700">{m.marks}</td>
                        <td className="px-4 py-2 border-b">{m.feedback || <span className="text-gray-400">No feedback</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
      <style>
        {`
          .animate-fade-in {
            animation: fade-in 1s;
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(40px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-spin-slow {
            animation: spin 3s linear infinite;
          }
        `}
      </style>
    </div>
  );
} 