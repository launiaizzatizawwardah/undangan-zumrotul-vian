import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

function UcapanDoa() {
  const [nama, setNama] = useState("");
  const [ucapan, setUcapan] = useState("");
  const [dataUcapan, setDataUcapan] = useState([]);

  // 🔥 Ambil data realtime dari Firestore
  useEffect(() => {
    const q = query(collection(db, "ucapan"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setDataUcapan(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // 🔥 Simpan data ke Firestore
  const kirimUcapan = async (e) => {
    e.preventDefault();
    if (!nama || !ucapan) return alert("Isi nama dan ucapan dulu!");

    await addDoc(collection(db, "ucapan"), {
      nama,
      ucapan,
      createdAt: serverTimestamp(),
    });

    setNama("");
    setUcapan("");
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl space-y-8">
      {/* Form Input */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-center">💌 Ucapan & Doa</h2>
        <form onSubmit={kirimUcapan} className="space-y-3">
          <input
            type="text"
            placeholder="Nama kamu"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Tulis ucapan terbaikmu..."
            value={ucapan}
            onChange={(e) => setUcapan(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
          >
            Kirim Ucapan
          </button>
        </form>
      </div>

      {/* List Ucapan */}
      <div>
        <h3 className="font-semibold mb-2">Ucapan dari teman-teman:</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {dataUcapan.length === 0 ? (
            <p className="text-gray-500">Belum ada ucapan 💭</p>
          ) : (
            dataUcapan.map((d) => (
              <div
                key={d.id}
                className="border p-3 rounded bg-gray-50 shadow-sm"
              >
                <p className="font-bold">{d.nama}</p>
                <p>{d.ucapan}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default UcapanDoa;
