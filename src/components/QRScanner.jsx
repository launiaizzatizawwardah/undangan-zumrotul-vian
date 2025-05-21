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
    beepRef.current = new Audio("/beep.mp3");
  }, []);

  const processQRData = (decodedText) => {
    try {
      const data = JSON.parse(decodedText);
      const { uuid, name, phone, guests, table } = data;

      if (!uuid) return;

      if (scannedUUIDs.has(uuid)) {
        setError("❌ QR sudah pernah discan sebelumnya.");
        return;
      }

      const updatedUUIDs = new Set(scannedUUIDs);
      updatedUUIDs.add(uuid);
      setScannedUUIDs(updatedUUIDs);
      localStorage.setItem("scannedUUIDs", JSON.stringify([...updatedUUIDs]));

      const newGuest = {
        uuid,
        name,
        phone,
        guests,
        table,
        time: new Date().toLocaleString(),
      };

      setAttendees((prev) => {
        const updated = [...prev, newGuest];
        localStorage.setItem("attendees", JSON.stringify(updated));
        return updated;
      });

      if (beepRef.current) beepRef.current.play();
      setError(null);
      setSuccessMessage("✅ Scan berhasil!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e) {
      setError("QR tidak valid atau rusak");
      console.error("Parse error:", e);
    }
  };

  const startScanner = () => {
    const config = { fps: 10, qrbox: { width: 400, height: 400 } };

    if (!containerRef.current) return;
    const scanner = new Html5Qrcode(containerRef.current.id);
    scannerRef.current = scanner;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices.length) throw new Error("Tidak ada kamera ditemukan.");
        return scanner.start(
          devices[0].id,
          config,
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
      .then(() => {
        setIsCameraOn(true);
      })
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

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const html5QrCode = new Html5Qrcode("qr-reader-temp");
    html5QrCode
      .scanFile(file, true)
      .then(processQRData)
      .catch((err) => {
        console.error("Image scan error:", err);
        setError("Gagal membaca QR dari gambar");
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center text-green-700">
          Scan Kehadiran Tamu
        </h1>

        <div className="bg-white rounded-lg shadow-md p-4 relative">
          {successMessage && (
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
              ✅ {successMessage}
            </div>
          )}

          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            {!isCameraOn ? (
              <button
                onClick={startScanner}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                🎥 Nyalakan Kamera
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                ❌ Matikan Kamera
              </button>
            )}

            <button
              onClick={() => navigate("/attendance")}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              📋 Lihat Kehadiran
            </button>
          </div>

          <div
            id="qr-reader"
            ref={containerRef}
            className="relative w-full h-[400px] border border-green-500 rounded overflow-hidden"
          ></div>

          <div id="qr-reader-temp" style={{ display: "none" }}></div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-4 block"
          />

          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}


// kode terakhir
