import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import { supabase } from "../lib/supabaseClient";

function ManualGuestForm() {
  const [data, setData] = useState({
    name: "",
    phone: "",
    guests: "",
    table: "",
  });

  const [selectKey, setSelectKey] = useState(0); // ✅ untuk reset Select

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
        source: "manual",
        category: "reguler", // Tambahkan kategori
      },
    ]);

    if (error) {
      console.error(error);
      toast.error("❌ Gagal menyimpan ke database!");
    } else {
      toast.success("✅ Data tamu manual disimpan!");
      setData({ name: "", phone: "", guests: "", table: "" }); // reset
      setSelectKey(prev => prev + 1); // ✅ force remount Select
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <ToastContainer />
      <div className="bg-gray-900 p-10 rounded-3xl w-full max-w-xl space-y-6 shadow-2xl border border-gray-800 animate-fade-in">
        <h2 className="text-2xl font-bold text-yellow-400 text-center">📝 Form Manual Tamu</h2>

        {/* Nama */}
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

        {/* No HP */}
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

        {/* Jumlah Tamu */}
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

        {/* Select Table */}
        <div className="flex items-center gap-3 bg-gray-800 p-4 rounded-xl">
          <div className="w-full">
            <Select
              key={selectKey} // ✅ trigger reset
              options={tableOptions}
              value={tableOptions.find(opt => opt.value === data.table)}
              onChange={(selected) =>
                setData((prev) => ({ ...prev, table: selected.value }))
              }
              placeholder="Tamu Undangan Dari"
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

        {/* Tombol Simpan */}
        <button
          onClick={handleSave}
          className="w-full bg-yellow-500 py-3 rounded-xl font-bold text-black flex items-center justify-center gap-2"
        >
          <FaSave /> Simpan Tamu Manual
        </button>

        {/* Tombol Kembali */}
        {/* <button
          type="button"
          onClick={() => navigate("/Guest-Form")}
          className="w-full bg-gray-700 py-3 rounded-xl text-white font-bold flex items-center justify-center gap-2"
        >
          <FaArrowLeft /> Kembali ke Generate QR
        </button> */}
      </div>
    </div>
  );
}

export default ManualGuestForm;
