import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTicketAlt, FaClock } from "react-icons/fa";

export default function ScanLog() {
  const [attendees, setAttendees] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("attendees")) || [];
    setAttendees(stored.reverse()); // Tampilkan yang terbaru di atas
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-green-700">
          📝 Riwayat Scan Kehadiran
        </h1>

        <div className="flex justify-center">
          <button
            onClick={() => navigate("/")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            🔙 Kembali ke Scan
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {attendees.length === 0 ? (
            <p className="text-center py-10 text-gray-500">
              Belum ada tamu yang di-scan.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {attendees.map((guest, index) => (
                <li key={guest.uuid + index} className="p-5 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">{guest.name}</h3>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        guest.table === "VVIP ⭐⭐"
                          ? "bg-yellow-300 text-black"
                          : guest.table === "VIP ⭐"
                          ? "bg-yellow-200 text-black"
                          : "bg-gray-300 text-black"
                      }`}
                    >
                      {guest.table}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <FaTicketAlt className="inline mr-1" /> {guest.uuid}
                    </p>
                    <p>📱 {guest.phone}</p>
                    <p>👥 {guest.guests} tamu</p>
                    <p>
                      <FaClock className="inline mr-1" /> {guest.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
