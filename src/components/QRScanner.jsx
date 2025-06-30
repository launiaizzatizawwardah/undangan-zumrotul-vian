import { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function QRScanner() {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraList, setCameraList] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  const scannerRef = useRef(null);
  const containerRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const beepRef = useRef(null);
  const navigate = useNavigate();

  const processQRData = async (decodedText) => {
    if (isProcessing) return;
    setIsProcessing(true);

    let parsed;
    try {
      parsed = JSON.parse(decodedText);
    } catch {
      setError("❌ QR tidak valid!");
      setIsProcessing(false);
      return;
    }

    const { uuid, name = "", phone = "", guests = 0, table = "" } = parsed;
    if (!uuid) {
      setError("❌ Data QR tidak lengkap.");
      setIsProcessing(false);
      return;
    }

    const { data: existing, error: checkError } = await supabase
      .from("guest_attendance")
      .select("uuid")
      .eq("uuid", uuid)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      setError("❌ Gagal cek database.");
      setIsProcessing(false);
      return;
    }

    if (existing) {
      setError("⚠️ QR sudah pernah digunakan.");
      setTimeout(() => setError(null), 4000);
      setIsProcessing(false);
      return;
    }

    const newGuest = {
      uuid,
      name,
      phone,
      guests,
      table,
      time: new Date().toLocaleString(),
      source: "qr",
    };

    const { error: insertError } = await supabase
      .from("guest_attendance")
      .insert([newGuest]);

    if (insertError) {
      setError("❌ Gagal simpan ke database.");
      setIsProcessing(false);
      return;
    }

    if (beepRef.current) beepRef.current.play();
    setSuccessMessage("✅ Scan berhasil!");
    setTimeout(() => setSuccessMessage(null), 3000);
    setIsProcessing(false);
  };

  const startScanner = () => {
    if (!containerRef.current) return;

    const scanner = new Html5Qrcode(containerRef.current.id);
    scannerRef.current = scanner;

    Html5Qrcode.getCameras()
      .then((devices) => {
        console.log("📸 Kamera tersedia:", devices);
        if (!devices.length) throw new Error("Tidak ada kamera ditemukan.");
        setCameraList(devices);

        const selectedCamera = devices[currentCameraIndex] || devices[0];
        console.log("🎯 Memulai kamera:", selectedCamera.label || selectedCamera.id);

        return scanner.start(
          { deviceId: { exact: selectedCamera.id } },
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
        console.error("❌ Gagal start kamera:", err);
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

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-100 to-white p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-4xl font-serif text-center text-rose-700 mb-2">
          💍 Scan Kehadiran Tamu
        </h1>
        <p className="text-center text-gray-500 text-sm italic">
          Selamat datang di acara pernikahan, silakan scan tiket Anda 🎉
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-6 relative border border-pink-200">
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

                {cameraList.length > 1 && (
                  <button
                    onClick={() => {
                      const nextIndex = (currentCameraIndex + 1) % cameraList.length;
                      const selectedCamera = cameraList[nextIndex];
                      console.log("🔁 Berpindah ke kamera:", selectedCamera.label || selectedCamera.id);
                      stopScanner();
                      setTimeout(() => {
                        setCurrentCameraIndex(nextIndex);
                        const scanner = new Html5Qrcode(containerRef.current.id);
                        scannerRef.current = scanner;
                        scanner
                          .start(
                            { deviceId: { exact: selectedCamera.id } },
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
                          )
                          .then(() => setIsCameraOn(true))
                          .catch((err) => {
                            console.error("❌ Gagal ganti kamera:", err);
                            setError("Gagal ganti kamera.");
                          });
                      }, 500);
                    }}
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition-all"
                  >
                    🔁 Ganti Kamera
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

          {isProcessing && (
            <div className="text-center text-sm text-gray-500 my-2 animate-pulse">
              ⏳ Memproses data tamu...
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-md text-center font-semibold">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
