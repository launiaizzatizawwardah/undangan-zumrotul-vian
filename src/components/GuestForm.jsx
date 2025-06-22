import { useState, useRef } from "react";
import { useEffect } from "react";
import QRCode from "react-qr-code";
import domtoimage from "dom-to-image-more";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom"; 
import { v4 as uuidv4 } from "uuid";
import '../App.css';
import {
  FaDownload,
  FaQrcode,
  FaUser,
  FaPhone,
  FaUsers,
  FaMapMarkerAlt,
  FaTicketAlt,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [data, setData] = useState({
    name: "",
    phone: "",
    guests: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [uuid, setUuid] = useState(uuidv4());
  const ticketRef = useRef(null);
  const qrRef = useRef(null); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: name === "guests" ? parseInt(value) : value,
    }));
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!data.name || !data.phone || !data.guests) {
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
      const createdLog = JSON.parse(localStorage.getItem("createdGuests")) || [];
      const newEntry = {
        uuid,
        name: data.name,
        phone: data.phone,
        guests: data.guests,
        category: 'reguler',
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

  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const targetDate = new Date("2025-07-06T18:00:00");
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

  const handleDownload = async () => {
    if (!qrRef.current) return;

    try {
      const dataUrl = await domtoimage.toPng(qrRef.current, {
        quality: 1,
        pixelRatio: 3,
        bgcolor: "#ffffff", 
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

  const handleDownloadFullTicket = async () => {
    if (!ticketRef.current) return;

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

  const handleReset = () => {
    setData({
      name: "",
      phone: "",
      guests: "",
    });
    setUuid(uuidv4());
    setSubmitted(false);
    toast.info("Form telah direset!", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const qrDataMinimal = {
    uuid,
    name: data.name,
    phone: data.phone,
    guests: data.guests,
    category: 'reguler',
  };
  const qrContent = JSON.stringify(qrDataMinimal);

  const bookingCode = "WED-" + uuid.slice(0, 6).toUpperCase();

  const generateOwnerWhatsAppLink = () => {
    const ownerPhone = "6285155060927";
    const pesan = `Konfirmasi Kehadiran 🎉

Nama: *${data.name}*
No. HP: *${data.phone}*
Jumlah Tamu: *${data.guests}*
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
          className="bg-gray-900 p-4 sm:p-6 md:p-8 rounded-3xl w-full max-w-xl space-y-6 shadow-xl border border-gray-800"
        >
          <div className="text-center mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
               Wedding Book
            </h1>
            {/* <div className="text-sm text-yellow-400 font-mono mb-2 animate-pulse">
              ⏳ Menuju Acara: {countdown}
            </div> */}
            <div className="flex items-center justify-center">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400 mb-2 text-center">
                Andhito & Dini
              </h1>
            </div>
            <p className="text-sm text-gray-400 font-bold">06 Juli 2025</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:gap-3 bg-gray-800 p-4 rounded-2xl">
            {/* <FaUser className="text-yellow-400 text-xl sm:text-2xl" /> */}
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

          <div className="flex flex-col sm:flex-row sm:gap-3 bg-gray-800 p-4 rounded-2xl">
            {/* <FaPhone className="text-yellow-400 text-xl sm:text-2xl" /> */}
            <input
              type="number"
              name="phone"
              required
              placeholder="No. HP"
              className="w-full bg-transparent outline-none ring-0 focus:outline-none focus:ring-0 placeholder-gray-400 text-white text-lg"
              value={data.phone}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:gap-3 bg-gray-800 p-4 rounded-2xl">
            {/* <FaUsers className="text-yellow-400 text-xl sm:text-2xl" /> */}
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

          {/* <button
            type="button"
            onClick={() => navigate("/manualGuestForm")}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            📋 Isi Form Manual
          </button> */}

          <div className="text-center text-sm pt-2">
            <a
              href="https://maps.app.goo.gl/b43k9xYgdStqRzL26"
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
              <h3 className="font-bold text-1xl flex items-center gap-2">
                <FaTicketAlt /> WEDDING PASS
              </h3>
              {/* <span className="text-sm font-semibold">{bookingCode}</span> */}
            </div>

            <div className="p-6 flex flex-col sm:flex-row sm:justify-between items-center">
              <div className="space-y-2 text-base sm:text-lg text-center sm:text-left">
                <p>
                  <span className="text-gray-400 uppercase font-bold">Nama :</span> <span className="font-semibold uppercase">{data.name}</span>
                </p>
                <p>
                  <span className="text-gray-400 uppercase font-bold">No Handphone :</span> <span className="font-semibold">{data.phone}</span>
                </p>
                <p>
                  <span className="text-gray-400 uppercase font-bold">Jumlah Tamu :</span> <span className="font-bold">{data.guests}</span> <span className="font-semibold uppercase">tamu</span>
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div ref={qrRef} className="bg-white p-4 rounded-lg inline-block mt-8">
                  <QRCode
                    value={qrContent}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-sm font-semibold text-yellow-400 border border-yellow-400 px-3 py-1 rounded-full shadow-md mt-8">Kode QR</p>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-600 mx-6" />

            <div className="p-6 flex justify-between text-sm text-gray-400">
              <div>
                <p>Tanggal</p>
                <p>06 Juli 2025</p>
              </div>
              <div>
                <p>Waktu</p>
                <p>14:00 WIB</p>
              </div>
              <div>
                <p>Kode</p>
                <p className="text-yellow-400">{bookingCode}</p>
              </div>
            </div>

            <div className="p-6 flex justify-between text-xs text-yellow-400 font-semibold">
              <p>Harap Membawa Ticket Saat Ke Acara Pernikahan Karena QR Akan Di Scan Di Acara !!</p>
            </div>

            <div className="w-full -mt-1 overflow-hidden z-40">
              <svg
                className="w-full"
                viewBox="0 0 100 10 "
                preserveAspectRatio="none"
                height="60"
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
            {/* <button
              onClick={handleDownload}
              className="w-full bg-yellow-400 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <FaDownload /> Simpan QR Saja
            </button> */}

            <button
              onClick={handleDownloadFullTicket}
              className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              🧾 Simpan Tiket 
            </button>

            {/* <a
              href={generateOwnerWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              📤 Konfirmasi via WhatsApp
            </a> */}

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
