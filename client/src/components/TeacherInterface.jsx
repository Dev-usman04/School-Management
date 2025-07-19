import React,{ useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import axios from "axios";

export default function TeacherInterface() {
  const { user, token, logout } = useAuth();
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [marks, setMarks] = useState({});
  const [feedback, setFeedback] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all classes, filter by teacher
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    axios
      .get("http://localhost:1000/api/classes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const myClasses = res.data.filter((c) => c.teacherId?._id === user.id);
        setClasses(myClasses);
      })
      .finally(() => setLoading(false));
  }, [user, token]);

  // Fetch students for selected class
  useEffect(() => {
    if (!selectedClass) return setStudents([]);
    setLoading(true);
    axios
      .get("http://localhost:1000/api/auth/students", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Only students in this class
        setStudents(res.data.filter((s) => s.classId === selectedClass._id));
      })
      .finally(() => setLoading(false));
  }, [selectedClass, token]);

  // Take attendance
  const handleAttendance = async () => {
    setMessage("");
    try {
      await Promise.all(
        students.map((student) =>
          axios.post(
            "http://localhost:1000/api/attendance",
            {
              studentId: student._id,
              classId: selectedClass._id,
              present: attendance[student._id] || false,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );
      setMessage("Attendance submitted!");
    } catch {
      setMessage("Error submitting attendance.");
    }
  };

  // Assign marks
  const handleMarks = async () => {
    setMessage("");
    try {
      await Promise.all(
        students.map((student) =>
          marks[student._id] != null && marks[student._id] !== ""
            ? axios.post(
                "http://localhost:1000/api/marks",
                {
                  studentId: student._id,
                  classId: selectedClass._id,
                  marks: Number(marks[student._id]),
                  feedback: feedback[student._id] || "",
                },
                { headers: { Authorization: `Bearer ${token}` } }
              )
            : Promise.resolve()
        )
      );
      setMessage("Marks submitted!");
    } catch {
      setMessage("Error submitting marks.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-8 mt-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-700 mb-1">Welcome, {user?.name}!</h1>
            <div className="text-gray-500">Teacher Interface</div>
          </div>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow transition-transform hover:scale-105"
          >
            Logout
          </button>
        </div>
        {loading ? (
          <div className="text-center text-green-600 animate-pulse">Loading...</div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2 text-blue-700">Your Classes</h2>
              <div className="flex flex-wrap gap-4">
                {classes.map((c) => (
                  <button
                    key={c._id}
                    className={`px-4 py-2 rounded-lg shadow font-bold transition-all ${
                      selectedClass && selectedClass._id === c._id
                        ? "bg-blue-600 text-white scale-105"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    }`}
                    onClick={() => setSelectedClass(c)}
                  >
                    {c.name} <span className="text-xs">({c.subject})</span>
                  </button>
                ))}
              </div>
            </div>
            {selectedClass && (
              <div className="mb-8 animate-fade-in">
                <h3 className="text-lg font-bold mb-2 text-green-700">
                  Students in {selectedClass.name}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border rounded-lg shadow">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b">Name</th>
                        <th className="px-4 py-2 border-b">Attendance</th>
                        <th className="px-4 py-2 border-b">Mark</th>
                        <th className="px-4 py-2 border-b">Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student._id} className="hover:bg-green-50 transition">
                          <td className="px-4 py-2 border-b font-bold text-blue-700">
                            {student.name}
                          </td>
                          <td className="px-4 py-2 border-b">
                            <input
                              type="checkbox"
                              checked={attendance[student._id] || false}
                              onChange={(e) =>
                                setAttendance((prev) => ({
                                  ...prev,
                                  [student._id]: e.target.checked,
                                }))
                              }
                              className="w-5 h-5 accent-green-500"
                            />
                          </td>
                          <td className="px-4 py-2 border-b">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={marks[student._id] || ""}
                              onChange={(e) =>
                                setMarks((prev) => ({
                                  ...prev,
                                  [student._id]: e.target.value,
                                }))
                              }
                              className="w-20 px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="px-4 py-2 border-b">
                            <input
                              type="text"
                              value={feedback[student._id] || ""}
                              onChange={(e) =>
                                setFeedback((prev) => ({
                                  ...prev,
                                  [student._id]: e.target.value,
                                }))
                              }
                              className="w-32 px-2 py-1 border rounded"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={handleAttendance}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow transition-transform hover:scale-105"
                  >
                    Submit Attendance
                  </button>
                  <button
                    onClick={handleMarks}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow transition-transform hover:scale-105"
                  >
                    Submit Marks
                  </button>
                </div>
                {message && (
                  <div className="mt-4 text-center text-lg font-bold text-purple-700 animate-bounce">
                    {message}
                  </div>
                )}
              </div>
            )}
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
        `}
      </style>
    </div>
  );
}
