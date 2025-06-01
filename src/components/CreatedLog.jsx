import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTicketAlt, FaClock} from "react-icons/fa";

export default function CreatedLog() {
  const [guests, setGuests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("createdGuests")) || [];
    setGuests(saved.reverse()); // terbaru di atas
  }, []);

   const clearData = () => {
    localStorage.removeItem("attendees");
    localStorage.removeItem("scannedUUIDs");
    setAttendees([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-yellow-600">
          📋 Log Tiket yang Telah Dibuat
        </h1>

        <div className="flex justify-center">
          <button
            onClick={() => navigate("/")}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold"
          >
            🔙 Kembali ke Form
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {guests.length === 0 ? (
            <p className="text-center py-10 text-gray-500">
              Belum ada tiket yang dibuat.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {guests.map((g, index) => (
                <li key={g.uuid + index} className="p-5 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg">{g.name}</h3>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        g.table === "VVIP ⭐⭐"
                          ? "bg-yellow-300"
                          : g.table === "VIP ⭐"
                          ? "bg-yellow-200"
                          : "bg-gray-300"
                      }`}
                    >
                      {g.table}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><FaTicketAlt className="inline mr-1" /> {g.bookingCode}</p>
                    <p>📱 {g.phone}</p>
                    <p>👥 {g.guests} tamu</p>
                    <p><FaClock className="inline mr-1" /> {g.createdAt}</p>
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
