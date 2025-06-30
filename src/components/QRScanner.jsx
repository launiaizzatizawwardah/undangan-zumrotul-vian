import { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";



export default function QRScanner({ attendees, setAttendees }) { 
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const beepRef = useRef(null);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("environment"); // "user" atau "environment"
  const [cameraList, setCameraList] = useState([]);

      // komponen untuk fetch data dari Supabase
      const processQRData = async (decodedText) => {
        if (isProcessing) return; // 💡 Abaikan jika sedang proses
        setIsProcessing(true);     // 🔄 Mulai proses
        let parsed;
      try {
        parsed = JSON.parse(decodedText);
      } catch {
        setError("❌ QR tidak valid!");
        setIsProcessing(false); // ⛔ Selesai proses karena gagal
        return;
      }
        
      const { uuid, name = "", phone = "", guests = 0, table = "" } = parsed;
      if (!uuid) {
        setError("❌ Data QR tidak lengkap.");
        setIsProcessing(false); // ⛔ Selesai proses karena gagal
        return;
      }

      // 🔎 Cek ke database supabase apakah UUID sudah pernah ada
      const { data: existing, error: checkError } = await supabase
        .from("guest_attendance")
        .select("uuid")
        .eq("uuid", uuid)
        .single(); // karena hanya 1 row yang dicari

      if (checkError && checkError.code !== "PGRST116") {
        setError("❌ Gagal cek database.");
        setIsProcessing(false); // ⛔ Selesai proses karena gagal
        return;
      }

      if (existing) {
        setError("⚠️ QR sudah pernah digunakan.");
        setTimeout(() => setError(null), 4000); // <--- untuk set timeout notifikasi error
        setIsProcessing(false); // ⛔ Selesai proses karena QR sudah dipakai
        return;
      }

      const newGuest = {
        uuid,
        name,
        phone,
        guests,
        table,
        time: new Date().toLocaleString(),
        source: 'qr', // ✅ tambahkan ini!
      };

      const { error } = await supabase.from("guest_attendance").insert([newGuest]);
      if (error) {
        setError("❌ Gagal simpan ke database.");
        setIsProcessing(false); // ⛔ Selesai proses karena gagal simpan
        return;
      }

      if (beepRef.current) beepRef.current.play(); // notifikasi suara 
      setSuccessMessage("✅ Scan berhasil!");
      // setError("null");
      setTimeout(() => setSuccessMessage(null), 3000);

      setIsProcessing(false); // ✅ Selesai proses
      };

      // 🔄 Start scanner saat komponen mount
      const startScanner = () => {
  if (!containerRef.current) return;

  const scanner = new Html5Qrcode(containerRef.current.id);
  scannerRef.current = scanner;

  Html5Qrcode.getCameras()
    .then((devices) => {
      if (!devices.length) throw new Error("Tidak ada kamera ditemukan.");
      setCameraList(devices);

      // Pilih kamera berdasarkan 'user' atau 'environment'
      let selectedCamera;
      if (devices.length === 1) {
        selectedCamera = devices[0].id;
      } else {
        selectedCamera = devices.find((device) =>
          cameraFacing === "user"
            ? device.label.toLowerCase().includes("front")
            : device.label.toLowerCase().includes("back") ||
              device.label.toLowerCase().includes("rear")
        )?.id || devices[0].id;
      }

      return scanner.start(
        { deviceId: { exact: selectedCamera } },
        { fps: 10, qrbox: { width: 300, height: 350 } },
        (decodedText) => {
          const now = Date.now();
          if (now - lastScanTimeRef.current < 1000) return;
          lastScanTimeRef.current = now;
          processQRData(decodedText);
        },
        (err) => {
          if (!String(err).includes("NotFoundException")) {
            console.warn("Scan error:", err);
          }
        }
      );
    })
    .then(() => setIsCameraOn(true))
    .catch((err) => {
      console.error("Gagal mulai kamera:", err);
      setError("Gagal menginisialisasi kamera.");
    });
};

      // 🔄 Stop scanner saat komponen unmount
      const stopScanner = () => {
        if (scannerRef.current) {
          scannerRef.current
            .stop()
            .then(() => {
              scannerRef.current.clear();
              scannerRef.current = null;
              setIsCameraOn(false);
            })
            .catch((err) => {
              console.warn("Stop error:", err);
              setError("Gagal mematikan kamera.");
            });
        }
      };

      // untuk menghandle upload gambar QR code
      const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
          setError("❌ Hanya gambar yang diperbolehkan.");
          return;
        }

        const html5QrCode = new Html5Qrcode("qr-reader-temp");
        html5QrCode
          .scanFile(file, true)
          .then(processQRData)
          .catch((err) => {
            console.error("Image scan error:", err);
            setError("❌ Gagal membaca QR dari gambar.");
          });
      };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-100 to-white p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-4xl font-serif text-center text-rose-700 mb-2">
          💍 Scan Kehadiran Tamu
        </h1>
        <p className="text-center text-gray-500 text-sm italic">Selamat datang di acara pernikahan, silakan scan tiket Anda 🎉</p>

        <div className="bg-white rounded-2xl shadow-lg p-6 relative border border-pink-200">
           {/* ✅ FEEDBACK */}
            {successMessage && (
              <div className="bg-green-500 text-white p-2 rounded text-center mb-4 shadow">
                {successMessage}
              </div>
            )}

          <div className="flex justify-center gap-3 mb-4 flex-wrap">
        {!isCameraOn ? (
          <button
            onClick={startScanner}
            className="px-6 py-3 bg-rose-600 text-white rounded-lg shadow-md hover:bg-rose-700 transition-all"
          >
            🎥 Nyalakan Kamera
          </button>
        ) : (
          <>
            <button
              onClick={stopScanner}
              className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all"
            >
              ❌ Matikan Kamera
            </button>

            {isCameraOn && cameraList.length > 1 && (
        <button
          onClick={() => {
            const nextFacing = cameraFacing === "user" ? "environment" : "user";
            setCameraFacing(nextFacing);
            stopScanner();
            setTimeout(() => startScanner(), 500);
          }}
          className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition-all"
        >
          🔁 Ganti ke Kamera {cameraFacing === "user" ? "Belakang" : "Depan"}
        </button>
      )}
    </>
  )}


            <button
              onClick={() => navigate("/attendance")}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg shadow-md hover:bg-gray-900 transition-all"
            >
              📋 Lihat Kehadiran
            </button>
          </div>

          {isCameraOn && (
            <p className="text-sm text-rose-600 text-center mb-2 font-semibold">
              Kamera aktif, arahkan ke QR code tiket Anda.
            </p>
          )}

          <div
            id="qr-reader"
            ref={containerRef}
            className="relative w-full h-[300px] border-4 border-dashed border-rose-400 rounded-xl overflow-hidden bg-gray-50 shadow-inner"
          ></div>

          {/* loading state */}
          {isProcessing && (
          <div className="text-center text-sm text-gray-500 my-2 animate-pulse">
            ⏳ Memproses data tamu...
          </div>
        )}

          <div id="qr-reader-temp" style={{ display: "none" }}></div>

          {/* <label className="mt-4 block w-full cursor-pointer text-center bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition-all">
            📁 Upload Gambar QR
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label> */}

          {error && (
            <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-md text-center font-semibold">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};