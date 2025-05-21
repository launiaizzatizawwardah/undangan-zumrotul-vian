// import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Attendance({ attendees, setAttendees }) {
  const navigate = useNavigate();

  const downloadCSV = () => {
    const headers = ["UUID", "Nama", "Phone", "Guests", "Table", "Time"];
    const csvRows = [
      headers.join(","),
      ...attendees.map((guest) =>
        [guest.uuid, guest.name, guest.phone, guest.guests, guest.table, guest.time].join(",")
      ),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "daftar_kehadiran.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearData = () => {
    localStorage.removeItem("attendees");
    localStorage.removeItem("scannedUUIDs");
    setAttendees([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-green-700">
          📋 Daftar Kehadiran
        </h1>

        {attendees.length === 0 ? (
          <p className="text-center text-gray-500">Belum ada tamu yang hadir.</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4">
            <ul className="space-y-3">
              {attendees.map((guest) => (
                <li key={guest.uuid} className="border-b pb-2">
                  <p><strong>👤 {guest.name}</strong></p>
                  <p>📱 {guest.phone} | 👥 {guest.guests} tamu</p>
                  <p>📍 {guest.table} | 🕒 {guest.time}</p>
                  <p className="text-xs text-gray-400">UUID: {guest.uuid}</p>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={downloadCSV}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                📥 Download CSV
              </button>
              <button
                onClick={clearData}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                🗑️ Hapus Semua Data
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
              >
                🔙 Kembali ke Scanner
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
