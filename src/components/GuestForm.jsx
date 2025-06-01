import { useState, useRef } from "react";
import { useEffect } from "react";
import QRCode from "react-qr-code";
import domtoimage from "dom-to-image-more";
import html2canvas from "html2canvas";
import { v4 as uuidv4 } from "uuid";
import '../App.css'
import {
  FaDownload,
  FaQrcode,
  FaUser,
  FaPhone,
  FaUsers,
  FaChair,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaChevronDown,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [data, setData] = useState({
    name: "",
    phone: "",
    guests: "",
    table: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [uuid, setUuid] = useState(uuidv4());
  const ticketRef = useRef(null);
  const qrRef = useRef(null); // Tambahan: hanya untuk QR
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const tableOptions = ["REGULAR", "VIP ⭐", "VVIP ⭐⭐"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: name === "guests" ? parseInt(value) : value,
    }));
  };

// untuk handle submit 
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data.name || !data.phone || !data.guests || !data.table) {
      toast.error("Harap isi semua data yang wajib!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    toast.info("Membuat tiket kamu, tunggu sebentar...", {
      position: "top-right",
      autoClose: 2000,
    });

    setTimeout(() => {
      setSubmitted(true);
      // Simpan ke localStorage sebagai log pembuatan QR
      const createdLog = JSON.parse(localStorage.getItem("createdGuests")) || [];
      const newEntry = {
        uuid,
        name: data.name,
        phone: data.phone,
        guests: data.guests,
        table: data.table,
        bookingCode,
        createdAt: new Date().toLocaleString(),
      };
      createdLog.push(newEntry);
      localStorage.setItem("createdGuests", JSON.stringify(createdLog));
      setLoading(false);
      toast.success("Tiket berhasil dibuat!", {
        position: "top-right",
        autoClose: 3000,
      });
    }, 2000);
  };


  // untuk countdown
  const [countdown, setCountdown] = useState("");

useEffect(() => {
  const targetDate = new Date("2025-07-15T18:00:00"); // Ganti sesuai tanggal acara
  const interval = setInterval(() => {
    const now = new Date();
    const distance = targetDate - now;

    if (distance <= 0) {
      setCountdown("🎉 Acara sedang berlangsung!");
      clearInterval(interval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    setCountdown(
      `${days} hari ${hours} jam ${minutes} menit ${seconds} detik`
    );
  }, 1000);

  return () => clearInterval(interval);
}, []);



  // untuk handle download 
const handleDownload = async () => {
  if (!qrRef.current) return;

  try {
    const dataUrl = await domtoimage.toPng(qrRef.current, {
      quality: 1,
      pixelRatio: 3,
      bgcolor: "#ffffff", // Pastikan background putih
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${data.name}_qr.png`;
    link.click();

    toast.success("QR berhasil disimpan!", {
      position: "top-right",
      autoClose: 2000,
    });
  } catch (err) {
    toast.error("Gagal menyimpan QR", {
      position: "top-right",
    });
    console.error("QR download error:", err);
  }
};

  // untuk handle download fullticket 
const handleDownloadFullTicket = async () => {
  if (!ticketRef.current) return;

  // Scroll dan blur agar tidak ada elemen aktif
  window.scrollTo(0, 0);
  if (document.activeElement) document.activeElement.blur();

  try {
    const canvas = await html2canvas(ticketRef.current, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const dataUrl = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${data.name}_ticket.png`;
    link.click();

    toast.success("Tiket berhasil disimpan!", {
      position: "top-right",
      autoClose: 2000,
    });
  } catch (err) {
    console.error("Gagal menyimpan tiket:", err);
    toast.error("Gagal menyimpan tiket", {
      position: "top-center",
    });
  }
};



  // untuk handle reset form 
  const handleReset = () => {
    setData({
      name: "",
      phone: "",
      guests: "",
      table: "",
    });
    setUuid(uuidv4());
    setSubmitted(false);
    toast.info("Form telah direset!", {
      position: "top-right  ",
      autoClose: 2000,
    });
  };


  // value qr 
  const qrDataMinimal = {
    uuid,
    name: data.name,
    phone: data.phone,
    guests: data.guests,
    table: data.table,
  };
  const qrContent = JSON.stringify(qrDataMinimal);

  const bookingCode = "WED-" + uuid.slice(0, 6).toUpperCase();

  const generateOwnerWhatsAppLink = () => {
    const ownerPhone = "6285155060927";
    const pesan = `Konfirmasi Kehadiran 🎉

Nama: *${data.name}*
No. HP: *${data.phone}*
Jumlah Tamu: *${data.guests}*
Kategori Meja: *${data.table}*
Kode Tiket: *${bookingCode}*

Saya Sudah Mengisi Form Dan Membuat Kode QR Dan Akan Di Scan Di Acara Pernikahan Dhito & Marwan.`;

    return `https://wa.me/${ownerPhone}?text=${encodeURIComponent(pesan)}`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 shadow-xl relative">
      <ToastContainer />
      {!submitted ? (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 p-10 rounded-3xl w-full max-w-xl space-y-6 shadow-2xl border border-gray-800"
        >
          <div className="text-center mb-4">
            
            <h1 className="text-5xl font-bold text-white mb-4 -mt-6">
              Wedding Book
            </h1>
            <div className="text-sm text-yellow-400 font-mono mb-2 animate-pulse">
              ⏳ Menuju Acara: {countdown}
            </div>
            <h1 className="text-xl font-bold text-yellow-400 mb-2">
              DHITO & MARWAN
            </h1>
            <p className="text-sm text-gray-400">31 Mei 2025 - 18:00 WIB</p>
          </div>

          <div className="flex items-center gap-3 bg-gray-800 p-4 rounded-2xl">
            <FaUser className="text-yellow-400 text-xl" />
            <input
              type="text"
              name="name"
              required
              placeholder="Nama Lengkap"
              className="w-full bg-transparent outline-none ring-0 focus:outline-none focus:ring-0 placeholder-gray-400 text-white text-lg"
              value={data.name}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center gap-3 bg-gray-800 p-4 rounded-2xl">
            <FaPhone className="text-yellow-400 text-xl" />
            <input
              type="tel"
              name="phone"
              required
              placeholder="No. HP"
              className="w-full bg-transparent outline-none ring-0 focus:outline-none focus:ring-0 placeholder-gray-400 text-white text-lg"
              value={data.phone}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center gap-3 bg-gray-800 p-4 rounded-2xl">
            <FaUsers className="text-yellow-400 text-xl" />
            <input
              type="number"
              name="guests"
              required
              max={10}
              placeholder="Jumlah Tamu"
              className="w-full bg-transparent outline-none ring-0 focus:outline-none focus:ring-0 placeholder-gray-400 text-white text-lg"
              value={data.guests || ""}
              onChange={handleChange}
            />
          </div>

          <div className="relative">
            <div
              className="flex items-center justify-between bg-gray-800 p-4 rounded-2xl cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="flex items-center gap-3">
                <FaChair className="text-yellow-400 text-xl" />
                <span className="text-white text-lg">
                  {data.table || "Pilih Kategori Tempat Duduk"}
                </span>
              </div>
              <FaChevronDown
                className={`text-white transition-transform duration-300 ${
                  showDropdown ? "rotate-180" : "rotate-0"
                }`}
              />
            </div>

            <div
              className={`absolute mt-2 w-full bg-gray-700 rounded-xl shadow-xl z-10 overflow-hidden transform transition-all duration-300 ease-in-out ${
                showDropdown
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
              }`}
            >
              {tableOptions.map((option) => (
                <div
                  key={option}
                  className="px-5 py-3 hover:bg-yellow-500 hover:text-black text-white cursor-pointer text-lg"
                  onClick={() => {
                    setData((prev) => ({ ...prev, table: option }));
                    setShowDropdown(false);
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-400"
            } text-black py-4 text-xl rounded-2xl flex items-center justify-center gap-3 font-bold`}
          >
            <FaQrcode size={22} />
            {loading ? "Membuat Tiket..." : "Buat Tiket"}
          </button>

          <div className="text-center text-sm pt-2">
            <a
              href="https://maps.app.goo.gl/vwxceNtzroy24jfE7"
              target="_blank"
              className="text-yellow-400 hover:underline flex items-center justify-center gap-1"
              rel="noreferrer"
            >
              <FaMapMarkerAlt /> Lihat Lokasi Acara
            </a>
          </div>
        </form>
      ) : (
        <div className="w-full max-w-[550px] space-y-4">
          <div
            ref={ticketRef}
            className="ticket-robek-bawah bg-gray-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-gray-800 animate-fade-in focus:outline-none focus:ring-0 "
          >
            <div className="bg-yellow-500 text-black px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-2xl flex items-center gap-2">
                <FaTicketAlt /> WEDDING PASS
              </h3>
              <span className="text-sm font-semibold">{bookingCode}</span>
            </div>

            <div className="p-6 flex justify-between items-center">
              <div className="space-y-2 text-base">
                <p>
                  <span className="text-gray-400 uppercase text-lg">Nama :</span><br></br><span className="font-semibold uppercase">{data.name}</span>
                </p>
                <p>
                  <span className="text-gray-400 uppercase">NO HANDPHONE:</span><br></br><span className="font-semibold">{data.phone}</span>
                </p>
                <p>
                  <span className="text-gray-400 uppercase">Jumlah Tamu:</span><br></br><span className="font-bold">{data.guests}</span> <span className="font-semibold uppercase">tamu</span>
                </p>
                <p>
                  <span className="text-gray-400 uppercase">Kategori:</span><br></br> <span className={`font-bold px-2 py-1 rounded inline-block
                  ${data.table === "VVIP ⭐⭐" ? "bg-gradient-to-r from-yellow-300 to-yellow-500 text-black" : ""}
                  ${data.table === "VIP ⭐" ? "bg-yellow-400 text-black" : ""}
                  ${data.table === "REGULAR" ? "bg-gray-700 text-white" : ""}`}>
                  {data.table}
                </span>
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
             <div ref={qrRef} className="bg-white p-4 rounded-lg inline-block">
                <QRCode
                  value={qrContent}
                  size={180}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm font-semibold text-yellow-400 border border-yellow-400 px-3 py-1 rounded-full shadow-md">Kode QR</p>
              </div>
              
            </div>

            <div className="border-t border-dashed border-gray-600 mx-6" />

            <div className="p-6 flex justify-between text-sm text-gray-400">
              <div>
                <p>Tanggal</p>
                <p>31 Mei 2025</p>
              </div>
              <div>
                <p>Waktu</p>
                <p>18:00 WIB</p>
              </div>
              <div>
                <p>Kode</p>
                <p className="text-yellow-400">{bookingCode}</p>
              </div>
            </div>
            
            <div className="p-6 flex justify-between text-sm text-yellow-400 font-semibold">
            <p>Harap Membawa Ticket Saat Ke Acara Pernikahan Karena QR Akan Di Scan Di Acara !!</p>
            </div>

            {/* <div className="ticket-rip" /> */}

            <div className="w-full -mt-1 overflow-hidden z-40">
            <svg
              className="w-full"
              viewBox="0 0 100 10 "
              preserveAspectRatio="none"
              height="30"
            >
               <defs>
      <pattern id="square-cut" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
        <rect x="2" y="2" width="5" height="10" fill="black" />
      </pattern>
    </defs>
    <rect width="100%" height="10" fill="url(#square-cut)" />
            </svg>
          </div>
            
          </div>

          <div className="bg-black px-6 py-4 rounded-xl space-y-4">
          {/* // tombol untuk proses download qr saja  */}
            <button
              onClick={handleDownload}
              className="w-full bg-yellow-400 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <FaDownload /> Simpan QR Saja
            </button>

                {/* // tombol untuk proses download full tiket  */}
              <button
                onClick={handleDownloadFullTicket}
                className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                🧾 Simpan Tiket Lengkap
              </button>


            <a
              href={generateOwnerWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              📤 Konfirmasi via WhatsApp
            </a>

            <button
              onClick={handleReset}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              🔁 Buat Tiket Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
