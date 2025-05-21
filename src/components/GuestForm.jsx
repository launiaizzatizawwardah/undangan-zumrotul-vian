import { useState, useRef } from "react";
import QRCode from "react-qr-code";
import { toPng } from "html-to-image";
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaUser,
  FaPhone,
  FaUsers,
  FaRegClipboard,
  FaDownload,
  FaWhatsapp,
  FaTrashAlt,
  FaPlus,
  FaQrcode,
} from "react-icons/fa";

function App() {
  const [forms, setForms] = useState([
    {
      id: Date.now(),
      uuid: uuidv4(),
      data: { name: "", phone: "", guests: "", table: "" },
      submitted: false,
      color: "#000000",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const qrRefs = useRef({});

  const handleChange = (id, e) => {
    const { name, value } = e.target;
    setForms((prev) =>
      prev.map((form) =>
        form.id === id
          ? {
              ...form,
              data: {
                ...form.data,
                [name]: name === "guests" ? parseInt(value) : value,
              },
            }
          : form
      )
    );
  };

  const handleColorChange = (id, newColor) => {
    setForms((prev) =>
      prev.map((form) =>
        form.id === id ? { ...form, color: newColor } : form
      )
    );
  };

  const handleSubmit = (e, id) => {
    e.preventDefault();
    setForms((prev) =>
      prev.map((form) =>
        form.id === id ? { ...form, submitted: true } : form
      )
    );
  };

  const handleRemoveForm = (id) => {
    setForms((prev) => prev.filter((form) => form.id !== id));
  };

  const handleDownload = async (id, name) => {
    if (!qrRefs.current[id]) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 100)); // delay render
      const dataUrl = await toPng(qrRefs.current[id]);
      const link = document.createElement("a");
      link.download = `${name}_qr.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal mengunduh QR Code:", err);
    }
  };

  const handleAddForm = () => {
    setForms((prev) => [
      ...prev,
      {
        id: Date.now(),
        uuid: uuidv4(),
        data: { name: "", phone: "", guests: "", table: "" },
        submitted: false,
        color: "#000000",
      },
    ]);
  };

  const handleGenerateQR = (id) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("QR Code berhasil dibuat!");
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <h1 className="text-4xl font-semibold text-center text-indigo-800">
          Wedding Guest Book
        </h1>
        <p className="text-center font-medium text-gray-600">
          Digital Check-In System for Our Attendance
        </p>

        {forms.map((form) => {
          const { id, data, submitted, color, uuid } = form;
          const qrContent = JSON.stringify({ ...data, uuid });

          return (
            <div
              key={id}
              className="bg-white rounded-3xl shadow-lg p-8 space-y-6 transform transition-all hover:scale-105 hover:shadow-xl"
            >
              <h2 className="text-2xl font-semibold text-center text-gray-700">
                Generate QR Code for Guests
              </h2>

              <form onSubmit={(e) => handleSubmit(e, id)} className="space-y-5">
                <div className="flex items-center space-x-3">
                  <FaUser className="text-indigo-600 text-xl" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    required
                    value={data.name}
                    onChange={(e) => handleChange(id, e)}
                    className="w-full px-4 py-3 rounded-2xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <FaPhone className="text-indigo-600 text-xl" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    required
                    value={data.phone}
                    onChange={(e) => handleChange(id, e)}
                    className="w-full px-4 py-3 rounded-2xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <FaUsers className="text-indigo-600 text-xl" />
                  <input
                    type="number"
                    name="guests"
                    max="10"
                    placeholder="Guests"
                    required
                    value={data.guests}
                    onChange={(e) => handleChange(id, e)}
                    className="w-full px-4 py-3 rounded-2xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <FaRegClipboard className="text-indigo-600 text-xl" />
                  <select
                    name="table"
                    value={data.table}
                    onChange={(e) => handleChange(id, e)}
                    className="w-full px-4 py-3 rounded-2xl border focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  >
                    <option value="" disabled>
                      Select Table Type
                    </option>
                    <option value="VIP">VIP ⭐</option>
                    <option value="VVIP">VVIP ⭐⭐</option>
                  </select>
                </div>

                <button
                  type="submit"
                  onClick={() => handleGenerateQR(id)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-2xl hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  <FaQrcode /> Generate QR Code
                </button>
              </form>

              {submitted && (
                <div className="text-center space-y-6">
                  <div
                    ref={(el) => (qrRefs.current[id] = el)}
                    style={{
                      backgroundColor: "white",
                      padding: "20px",
                      borderRadius: "12px",
                      display: "inline-block",
                    }}
                    className="shadow-md mx-auto"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-8 h-8 border-4 border-t-4 border-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-indigo-600">Processing...</span>
                      </div>
                    ) : (
                      <QRCode value={qrContent} size={250} fgColor={color} />
                    )}
                  </div>

                  <div className="flex justify-center items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">QR Color:</label>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(id, e.target.value)}
                      className="w-12 h-10 p-0 border-none bg-transparent"
                    />
                  </div>

                  <div className="text-left p-4 bg-gray-100 rounded-xl w-full max-w-lg mx-auto">
                    <h3 className="font-semibold text-xl text-gray-700 mb-3">Guest Information</h3>
                    <p><strong>👤 Name:</strong> {data.name}</p>
                    <p><strong>📱 Phone:</strong> {data.phone}</p>
                    <p><strong>👥 Guests:</strong> {data.guests}</p>
                    <p><strong>📍 Table:</strong> {data.table}</p>
                    <p><strong>🆔 QR Code ID:</strong> {uuid}</p>
                  </div>

                  <button
                    onClick={() => handleDownload(id, data.name)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl w-full flex items-center justify-center gap-2"
                  >
                    <FaDownload /> Download QR Code
                  </button>

                  <a
                    href={`https://wa.me/6285155060927?text=${encodeURIComponent(
                      `Hello, I am ${data.name}, I have booked the wedding invitation guest.\n\nDetails:\n📱 Phone: ${data.phone}\n👥 Guests: ${data.guests}\n📍 Table: ${data.table}\n🆔 UUID: ${uuid}\n\nQR Code will be shown upon attending the event.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl text-center flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp /> Send Konfirmasi via WhatsApp
                  </a>
                </div>
              )}

              <div className="text-right">
                <button
                  onClick={() => handleRemoveForm(id)}
                  className="text-white bg-red-500 hover:bg-red-600 text-sm rounded-xl px-4 py-2 flex items-center gap-2"
                >
                  <FaTrashAlt /> Remove Form
                </button>
              </div>
            </div>
          );
        })}

        <div className="text-center">
          <button
            onClick={handleAddForm}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl transition flex items-center justify-center gap-2"
          >
            <FaPlus /> Add New Form
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
