// src/pages/VipVvipCheckin.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function VipVvipCheckin() {
  const [search, setSearch] = useState("");
  const [guestMaster, setGuestMaster] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);

  // navigate untuk berpindah halaman
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const { data: guests } = await supabase.from("guest_master").select("*");
      const { data: attendance } = await supabase.from("guest_attendance").select("name");

        console.log("🎯 Semua data guest_master dari Supabase:", guests); // ⬅️ log ini
    console.log("✅ Semua data kehadiran:", attendance); // ⬅️ log ini

      setGuestMaster(guests || []);
      setAttendanceList(attendance?.map((g) => g.name.toLowerCase()) || []);
    };
    fetchData();
  }, []);

  const normalize = (str) =>
  str?.toLowerCase().trim().replace(/[.,]/g, "").replace(/\s+/g, " ");

const handleSearch = (e) => {
  const term = e.target.value;
  setSearch(term);

  if (!term) {
    setFilteredResults([]);
    return;
  }

  const normalizedTerm = normalize(term);
  const filtered = guestMaster.filter((guest) =>
    guest.name && normalize(guest.name).includes(normalizedTerm)
  );

  console.log("Search term:", term);
  console.log("Normalized:", normalizedTerm);
  console.log("Filtered results:", filtered);

  setFilteredResults(filtered);
};

 const handleCheckin = async (guest) => {
  console.log("📥 Checkin untuk:", guest.name);

  if (attendanceList.includes((guest.name || "").toLowerCase())) {
    toast.info(`${guest.name} sudah ditandai hadir.`);
    return;
  }

  const now = new Date().toISOString();
  const category = guest.category || "Reguler";
  const source =
    category.toLowerCase() === "vip" || category.toLowerCase() === "vvip"
      ? "vip"
      : ""; // ✅ Jika bukan VIP/VVIP, dianggap manual

  const { error } = await supabase.from("guest_attendance").insert([
    {
      name: guest.name,
      category: category,
      status: guest.status,
      time: now,
      source: source,
    },
  ]);

  if (error) {
    toast.error("Gagal menyimpan kehadiran.");
    console.error("❌ Insert error:", error);
    return;
  }

  const audio = new Audio("/sound/success.mp3");
  audio.play();
  toast.success(`${guest.name} berhasil ditandai hadir!`);
  setAttendanceList((prev) => [...prev, guest.name.toLowerCase()]);
};

  return (
    <div className="min-h-screen bg-white p-6 max-w-3xl mx-auto">
        <ToastContainer /> 
      <h1 className="text-2xl font-bold text-center text-green-700 mb-4">
        🔍 Cek Kehadiran
      </h1>

       <button
              onClick={() => navigate("/attendance")}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-900 transition-all mb-4"
            >
              📋 Lihat Kehadiran
            </button>

      <input
        type="text"
        placeholder="Ketik nama..."
        value={search}
        onChange={handleSearch}
        className="w-full p-3 border border-gray-300 rounded-lg mb-4"
      />

      {filteredResults.length === 0 ? (
        <p className="text-gray-400 text-center">Belum ada hasil.</p>
      ) : (
        <ul className="space-y-4">
          {filteredResults.map((guest) => (
            <li
            key={guest.name}
            className={`p-4 border rounded-lg shadow-sm animate-fadeIn ${
              guest.category === "VVIP"
                ? "bg-purple-100 text-purple-800 border-purple-300"
                : guest.category === "VIP"
                ? "bg-green-100 text-yellow-800 border-green-300"
                : "bg-yellow-100 text-yellow-800 border-yellow-300" // Tambahkan untuk Reguler
            }`}
          >
               <p className="font-bold text-lg">👤 {guest.name}</p>
                <p className="text-sm text-gray-600">📛 {guest.status || "-"}</p>
                <p className="text-sm text-gray-600">
                  {guest.category === "VVIP"
                    ? "🔱 Kategori: VVIP"
                    : guest.category === "VIP"
                    ? "🌟 Kategori: VIP"
                    : "👥 Kategori: Reguler"}
                </p>
              {attendanceList.includes(guest.name.toLowerCase()) ? (
                <p className="text-green-600 font-semibold mt-2">✅ Sudah Hadir</p>
              ) : (
                <button
              onClick={async (e) => {
                try {
                  e.preventDefault();
                  e.stopPropagation();
                  e.currentTarget.classList.add("animate-bounceOnce");
                  setTimeout(() => e.currentTarget.classList.remove("animate-bounceOnce"), 300);
                  await handleCheckin(guest);
                } catch (err) {
                  console.error("🛑 Error di tombol:", err);
                }
              }}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                ✅ Tandai Hadir
              </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
