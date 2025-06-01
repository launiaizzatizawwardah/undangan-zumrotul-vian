import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

export default function QRScanner({ attendees, setAttendees }) {
  const [scannedUUIDs, setScannedUUIDs] = useState(new Set());
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const scannerRef = useRef(null);
  const containerRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const beepRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const savedUUIDs = JSON.parse(localStorage.getItem("scannedUUIDs")) || [];
    setScannedUUIDs(new Set(savedUUIDs));

    try {
      beepRef.current = new Audio("/beep.mp3");
    } catch {
      console.warn("Beep sound not found.");
    }
  }, []);

  const processQRData = (decodedText) => {
    let parsed;
    try {
      parsed = JSON.parse(decodedText);
    } catch {
      setError("❌ QR tidak valid!");
      return;
    }

    const { uuid, name = "", phone = "", guests = 0, table = "" } = parsed;

    if (!uuid) {
      setError("❌ Data QR tidak lengkap.");
      return;
    }

    if (scannedUUIDs.has(uuid)) {
      setError("❌ QR sudah pernah discan.");
      return;
    }

    const newGuest = {
      uuid,
      name,
      phone,
      guests,
      table,
      time: new Date().toLocaleString(),
    };

    const updatedUUIDs = new Set(scannedUUIDs);
    updatedUUIDs.add(uuid);
    setScannedUUIDs(updatedUUIDs);
    localStorage.setItem("scannedUUIDs", JSON.stringify([...updatedUUIDs]));

    setAttendees((prev) => {
      const updated = [...prev, newGuest];
      localStorage.setItem("attendees", JSON.stringify(updated));
      return updated;
    });

    if (beepRef.current) beepRef.current.play();
    setSuccessMessage("✅ Scan berhasil!");
    setError(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const startScanner = () => {
    if (!containerRef.current) return;

    const scanner = new Html5Qrcode(containerRef.current.id);
    scannerRef.current = scanner;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices.length) throw new Error("Tidak ada kamera ditemukan.");
        return scanner.start(
          devices[0].id,
          { fps: 10, qrbox: { width: 300, height: 350 } },
          (decodedText) => {
            const now = Date.now();
            if (now - lastScanTimeRef.current < 3000) return;
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
          {successMessage && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
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
              <button
                onClick={stopScanner}
                className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all"
              >
                ❌ Matikan Kamera
              </button>
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

          <div id="qr-reader-temp" style={{ display: "none" }}></div>

          <label className="mt-4 block w-full cursor-pointer text-center bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 transition-all">
            📁 Upload Gambar QR
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => navigate("/log")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center w-full mt-4"
          >
            🕒 Riwayat Scan
          </button>

          {/* <div className="text-center text-sm"> */}
          <button
            onClick={() => navigate("/created-log")}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-blue-700 text-center w-full mt-4"
          >
            🎲 Riwayat Pembuat QR
          </button>
        {/* </div> */}


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