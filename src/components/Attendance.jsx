import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function Attendance() {
  const [attendees, setAttendees] = useState([]);
  const [qrGuests, setQrGuests] = useState([]);
  const [manualGuests, setManualGuests] = useState([]);
  const [vipGuests, setVipGuests] = useState([]);
  const [regulerGuests, setRegulerGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [currentPageQR, setCurrentPageQR] = useState(1);
  const [currentPageManual, setCurrentPageManual] = useState(1);
  const itemsPerPage = 5;

  const totalPagesQR = Math.ceil(qrGuests.length / itemsPerPage);
  const totalPagesManual = Math.ceil(manualGuests.length / itemsPerPage);

  const currentQRGuests = qrGuests.slice(
    (currentPageQR - 1) * itemsPerPage,
    currentPageQR * itemsPerPage
  );

  const currentManualGuests = manualGuests.slice(
    (currentPageManual - 1) * itemsPerPage,
    currentPageManual * itemsPerPage
  );

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("guest_attendance")
        .select("*")
        .order("time", { ascending: false });

      if (error) {
        console.error("Gagal ambil data kehadiran:", error.message);
      } else {
        setAttendees(data);

        setQrGuests(data.filter((g) => g.source === "qr"));

        setManualGuests(data.filter((g) =>
          g.source === "manual" &&
          (!g.category || g.category.toLowerCase() !== "reguler")
        ));

        setVipGuests(data.filter((g) =>
          ["vip", "vvip"].includes((g.category || "").toLowerCase())
        ));

        setRegulerGuests(data.filter((g) =>
          (g.category || "").toLowerCase() === "regular"
        ));
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-green-700 font-serif">📋 Daftar Kehadiran</h1>

        {loading ? (
          <p className="text-center text-gray-400">⏳ Memuat data...</p>
        ) : (
          <>
            {/* QR Guests */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-xl font-bold text-green-700 mb-2 font-serif">📲 Kehadiran via QR</h2>
              {qrGuests.length === 0 ? (
                <p className="text-center text-gray-400">Belum ada tamu dari QR.</p>
              ) : (
                <>
                  <AnimatePresence mode="wait">
                    <motion.ul
                      key={currentPageQR}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      {currentQRGuests.map((guest) => (
                        <li key={guest.uuid || guest.name} className="border-b pb-2">
                          <p><strong>👤 {guest.name}</strong></p>
                          <p>📱 {guest.phone || "-"} | 👥 {guest.guests || 1} tamu</p>
                          <span className="font-semibold flex items-center gap-2">
                            📍 {(guest.table || "").toUpperCase().includes("VVIP") ? (
                              <span className="text-yellow-600">VVIP ⭐⭐</span>
                            ) : (guest.table || "").toUpperCase().includes("VIP") ? (
                              <span className="text-yellow-500">VIP ⭐</span>
                            ) : (
                              <span className="text-blue-600 font-semibold">Reguler</span>
                            )}
                          </span>
                          <p className="text-xs text-gray-400">UUID: {guest.uuid}</p>
                        </li>
                      ))}
                    </motion.ul>
                  </AnimatePresence>
                </>
              )}
            </div>

            {/* Manual Guests */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold text-yellow-700 mb-2 font-serif">📝 Kehadiran Manual</h2>
              {manualGuests.length === 0 ? (
                <p className="text-center text-gray-400">Belum ada tamu manual.</p>
              ) : (
                <ul className="space-y-3">
                  {manualGuests.map((guest) => (
                    <li key={guest.uuid || guest.name} className="border-b pb-2">
                      <p><strong>👤 {guest.name}</strong></p>
                      <p>📱 {guest.phone || "-"} | 👥 {guest.guests || 1} tamu</p>
                      <span className="font-semibold flex flex-col">
                        <span>📍 {guest.table || "-"}</span>
                        {guest.category?.toUpperCase() === "VVIP" ? (
                          <span className="text-yellow-600">🔱 VVIP</span>
                        ) : guest.category?.toUpperCase() === "VIP" ? (
                          <span className="text-yellow-500">🌟 VIP</span>
                        ) : (
                          <span className="text-blue-600">🔰 Reguler</span>
                        )}
                      </span>
                      <p className="text-xs text-gray-400">UUID: {guest.uuid}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Reguler Guests */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-bold text-blue-700 mb-2 font-serif">🔰 Kehadiran Reguler</h2>
              {regulerGuests.length === 0 ? (
                <p className="text-center text-gray-400">Belum ada tamu Reguler.</p>
              ) : (
                <ul className="space-y-3">
                  {regulerGuests.map((guest) => (
                    <li key={guest.uuid || guest.name} className="border-b pb-2 bg-blue-50 text-blue-800 p-2 rounded">
                      <p className="font-bold">👤 {guest.name}</p>
                      <p className="text-sm">🔰 Kategori : Reguler</p>
                      {/* <p className="text-sm">📱 {guest.phone || "-"}</p>
                      <p className="text-sm">👥 {guest.guests || 1} tamu</p> */}
                      {/* <p className="text-sm">📍 {guest.table || "-"}</p> */}
                      <p className="text-xs text-gray-500">🕒 {new Date(guest.time).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* VIP & VVIP Guests */}
            <div className="bg-white rounded-lg shadow-md p-4 mt-6">
              <h2 className="text-xl font-bold text-purple-700 mb-2 font-serif">🎖️ Kehadiran VIP & VVIP</h2>
              {vipGuests.length === 0 ? (
                <p className="text-center text-gray-400">Belum ada tamu VIP/VVIP.</p>
              ) : (
                <ul className="space-y-3">
                  {vipGuests.map((guest) => (
                    <li key={guest.uuid || guest.name} className={`border-b pb-2 ${guest.category === "VVIP" ? "bg-purple-100 text-purple-800" : "bg-yellow-100 text-yellow-800"} p-2 rounded`}>
                      <p className="font-bold">👤 {guest.name}</p>
                      <p className="text-sm text-gray-700">📛 {guest.status || "-"}</p>
                      <p className="text-sm">Kategori : {guest.category === "VVIP" ? "🔱 VVIP" : "🌟 VIP"}</p>
                      <p className="text-xs text-gray-500">🕒 {new Date(guest.time).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={downloadCSV} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">📥 Download CSV</button>
              <button onClick={() => navigate("/QRScanner")} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">🔙 Kembali ke Scanner</button>
              <button onClick={() => navigate("/attendancevip")} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">👑 Kembali ke halaman VIP/VVIP</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
