import React from "react";

export default function PerformanceChart({ marks }) {
  if (!marks || !marks.length) return <div>No marks data.</div>;
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