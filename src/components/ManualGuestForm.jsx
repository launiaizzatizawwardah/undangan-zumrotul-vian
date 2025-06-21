import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { FaUser, FaPhone, FaUsers, FaChair, FaArrowLeft, FaSave } from "react-icons/fa";
import { supabase } from "../lib/supabaseClient";



function ManualGuestForm() {
  const [data, setData] = useState({
    name: "",
    phone: "",
    guests: "",
    table: ""
  });

  const navigate = useNavigate();

  const tableOptions = [
    { value: "Perempuan", label: "Perempuan" },
    { value: "Laki-Laki", label: "Laki-Laki" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: name === "guests" ? parseInt(value) : value
    }));
  };

const handleSave = async () => {
  if (!data.name || !data.phone || !data.guests || !data.table) {
    toast.error("Harap isi semua data dengan lengkap!");
    return;
  }

  const { error } = await supabase.from("guest_attendance").insert([
    {
      name: data.name,
      phone: data.phone,
      guests: data.guests,
      table: data.table,
      time: new Date().toISOString(),
      source: "manual", // ⬅️ tambahkan penanda input manual
    },
  ]);

  if (error) {
    console.error(error);
    toast.error("❌ Gagal menyimpan ke database!");
  } else {
    toast.success("✅ Data tamu manual disimpan!");
    setData({ name: "", phone: "", guests: "", table: "" });
  }
};

  const handleExportCSV = () => {
  const guests = JSON.parse(localStorage.getItem("manualGuests")) || [];

  if (guests.length === 0) {
    toast.warn("Belum ada data untuk diekspor!");
    return;
  }

  const headers = ["Nama", "No. HP", "Jumlah Tamu", "Kategori Meja", "Waktu Input"];
  const rows = guests.map(guest =>
    [guest.name, guest.phone, guest.guests, guest.table, guest.createdAt].join(",")
  );
  
  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "manual_guest_list.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success("📁 Data berhasil diekspor ke CSV!");
};


  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <ToastContainer />
      <div className="bg-gray-900 p-10 rounded-3xl w-full max-w-xl space-y-6 shadow-2xl border border-gray-800 animate-fade-in">
        <h2 className="text-2xl font-bold text-yellow-400 text-center">📝 Form Manual Tamu</h2>
        <div className="flex items-center gap-3 bg-gray-800 p-4 rounded-xl">
          <input
            type="text"
            name="name"
            placeholder="Nama Lengkap"
            className="w-full bg-transparent outline-none placeholder-gray-400 text-white"
            value={data.name}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center gap-3 bg-gray-800 p-4 rounded-xl">
          <input
            type="number"
            name="phone"
            placeholder="No. HP"
            className="w-full bg-transparent outline-none placeholder-gray-400 text-white"
            value={data.phone}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center gap-3 bg-gray-800 p-4 rounded-xl">
          <input
            type="number"
            name="guests"
            placeholder="Jumlah Tamu"
            className="w-full bg-transparent outline-none placeholder-gray-400 text-white"
            value={data.guests}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center gap-3 bg-gray-800 p-4 rounded-xl">
          <div className="w-full">
            <Select
              options={tableOptions}
              value={tableOptions.find(opt => opt.value === data.table)}
              onChange={(selected) => setData((prev) => ({ ...prev, table: selected.value }))}
              placeholder="Pilih Jenis Kelamin "
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "#1f2937",
                  borderColor: "#1f2937",
                  color: "white"
                }),
                singleValue: (base) => ({
                  ...base,
                  color: "white"
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "#1f2937"
                }),
                option: (base, { isFocused }) => ({
                  ...base,
                  backgroundColor: isFocused ? "#facc15" : "#1f2937",
                  color: isFocused ? "#000" : "#fff"
                })
              }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-yellow-500 py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2"
        >
          <FaSave /> Simpan Tamu Manual
        </button>

{/* 
         <button 
          type="button"
          onClick={() => navigate("/manualGuestLog")}
          className="w-full bg-red-700 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2"
        >
         📖 liat log tamu manual
        </button> */}

        
        <button 
          type="button"
          onClick={() => navigate("/Guest-Form")}
          className="w-full bg-gray-700 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2"
        >
          <FaArrowLeft /> Kembali ke Generate QR
        </button>
            
      </div>
    </div>
  );
}

export default ManualGuestForm;
