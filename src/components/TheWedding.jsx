import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaVolumeMute, FaVolumeUp, } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient'; // atau sesuaikan path-nya

function CopyRekening({ number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Gagal salin:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-2 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-all"
    >
      {copied ? "✅ Disalin!" : "📋 Salin Nomor"}
    </button>
  );
}

const handleSubmitWish = async () => {
  const { data, error } = await supabase.from("wishes").insert([
    { name: guestName, message: wishInput }
  ]);

  if (error) {
    console.error("❌ Gagal kirim ucapan:", error);
    alert("Error: " + error.message);
  } else {
    console.log("✅ Ucapan berhasil:", data);
    setGuestName("");
    setWishInput("");
    fetchWishes();
  }
};


export default function WeddingInvitation() {
  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  // const [countdown, setCountdown] = useState('');
  const audioRef = useRef(null);
  const [wishes, setWishes] = useState([]); 
  const [guestName, setGuestName] = useState('');
  const [wishInput, setWishInput] = useState('');
  const audioRefIntro = useRef(null); // Audio untuk intro
  const audioRefMain = useRef(null); // Audio untuk musik utama
  const [audioBlocked, setAudioBlocked] = useState(false);
  // const [currentPage, setCurrentPage] = useState(1);
  // const wishesPerPage = 5; // Jumlah per halaman
  // const indexOfLastWish = currentPage * wishesPerPage;
  // const indexOfFirstWish = indexOfLastWish - wishesPerPage;
  // const [showModal, setShowModal] = useState(false);
  // const [showRSVP,  setShowRSVP]  = useState(false); 
  // const [isPlaying, setIsPlaying] = useState(false);
  // const [bgIndex, setBgIndex] = useState(0);
  // const [hasInteracted, setHasInteracted] = useState(false);

  


  const profiles = [
  { id: 'primary',   name: 'You',      avatar: '/Netflix-avatar.png' },];
  const [phase, setPhase] = useState('intro'); // intro | profile | main
  const [selectedProfile, setSelectedProfile] = useState(null);

// Slideshow effect
// useEffect(() => {
//   let interval;
//   if (isPlaying) {
//     interval = setInterval(() => {
//       setBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
//     }, 3000); // ganti gambar setiap 3 detik
//   } else {
//     clearInterval(interval);
//   }
//   return () => clearInterval(interval);
// }, [isPlaying]);

 useEffect(() => {
  if (showIntro && audioRefIntro.current) {
    audioRefIntro.current.muted = isMuted;
    audioRefIntro.current.play().catch((e) =>
      console.log("Autoplay blocked:", e)
    );
  }
}, [showIntro, isMuted]);

useEffect(() => {
  if (showIntro) {
    const timer = setTimeout(() => {
      setShowIntro(false);
      setPhase('profile');  // langsung ke profile scene!
    }, 3500);
    return () => clearTimeout(timer);
  }
}, [showIntro]);

useEffect(() => {
  if (phase === "main" && audioRefMain.current) {
    audioRefMain.current
      .play()
      .then(() => {
        console.log("🎵 Musik dimulai otomatis");
        setAudioBlocked(false);
      })
      .catch((err) => {
        console.warn("🔇 Autoplay gagal:", err);
        setAudioBlocked(true); // Tombol akan muncul
      });
  }
}, [phase]);


//   // Play audio on intro
//  useEffect(() => {
//   if (showIntro && audioRef.current) {
//     audioRef.current.muted = isMuted;
//     audioRef.current.play().catch((e) =>
//       console.log("Autoplay blocked:", e)
//     );
//   }
// }, [showIntro]);


  // Scroll detection to hide poster
  useEffect(() => {
    const handleScroll = () => {
      const posterEl = document.getElementById('opening-poster');
      if (posterEl && window.scrollY > posterEl.offsetHeight * 0.6) {
        setShowPoster(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // useEffect(() => {
  //   console.log("audioRef:", audioRef.current); 
  // }, []);

  // Fungsi untuk menangani klik pada profil dan memulai musik
  const handleProfileClick = (profile) => {
    setSelectedProfile(profile);
    setPhase('main'); 

    // console.log("audioRef:", audioRef.current);

  //  if (audioRef.current) {
  //   console.log("Audio is playing..."); 
  //   audioRef.current.play().catch((e) => console.log("Autoplay blocked:", e)); 
  // } else {
  //   console.log("Audio element not found"); 
  // }
  };

 const toggleMute = () => {
  setIsMuted((prev) => {
    const newMuteState = !prev;
    if (audioRefIntro.current) audioRefIntro.current.muted = newMuteState;
    if (audioRefMain.current) audioRefMain.current.muted = newMuteState;
    return newMuteState;
  });
};

  // useEffect(() => {
  //   if (showIntro && audioRef.current) {
  //     audioRef.current.muted = isMuted; 
  //     audioRef.current.play().catch((e) => console.log("Autoplay blocked:", e)); 
  //   }
  // }, [showIntro, isMuted]);

  const scrollToHero = () => {
    const el = document.getElementById('hero');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setShowPoster(false);
  };

  const [isDark, setIsDark] = useState(true);

    useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    }, [isDark]);



    
// Saat Kirim Ucapan
const handleSubmitWish = async () => {
  const newWish = {
    name: guestName.trim(),
    message: wishInput.trim(),
  };

  const { data, error } = await supabase
    .from('wishes')
    .insert([newWish])
    .select();

  if (error) {
    console.error('❌ Gagal menyimpan ke Supabase:', error.message);
  } else {
    setWishes((prev) => [data[0], ...prev]);
    setWishInput('');
    setGuestName('');
  }
};

// Fetch wishes awal
useEffect(() => {
  const fetchWishes = async () => {
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setWishes(data);
  };

  fetchWishes();
}, []);


// Realtime update (opsional)
useEffect(() => {
  const channel = supabase
    .channel('realtime-wishes')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'wishes',
    }, (payload) => {
      setWishes((prev) => [payload.new, ...prev]);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}, []);

// Ambil semua wish saat pertama load
// useEffect(() => {
//   const fetchWishes = async () => {
//     const { data, error } = await supabase.from('wishes').select('*').order('created_at', { ascending: false });
//     if (error) {
//       console.error('Gagal fetch wishes:', error.message);
//     } else {
//       setWishes(data);
//     }
//   };

//   if (isGuestConfirmed) {
//     fetchWishes();
//   }
// }, [isGuestConfirmed]);

// untuk auto reload wishes realtime
// useEffect(() => {
//   if (!isGuestConfirmed) return;

//   const channel = supabase
//     .channel('realtime-wishes')
//     .on('postgres_changes', {
//       event: 'INSERT',
//       schema: 'public',
//       table: 'wishes',
//     }, (payload) => {
//       setWishes((prev) => [payload.new, ...prev]);
//     })
//     .subscribe();

//   return () => {
//     supabase.removeChannel(channel);
//   };
// }, [isGuestConfirmed]);

// Saat Kirim Doa
// const handleSubmitWish = async () => {
//   if (!wishInput.trim()) return;

//   const newWish = {
//     name: guestName || 'Tamu',
//     message: wishInput.trim(),
//     emoji: emojis[Math.floor(Math.random() * emojis.length)],
//   };

//   const { data, error } = await supabase
//     .from('wishes')
//     .insert([newWish])
//     .select();

//   if (error) {
//     console.error('❌ Gagal menyimpan ke Supabase:', error.message);
//   } else {
//     setWishes((prev) => [data[0], ...prev]); // ⬅️ langsung tambahkan ke UI
//     setWishInput('');
//   }
// };



  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans overflow-x-hidden relative scroll-smooth">
      <audio ref={audioRefMain} src="/sound/adera.mp3" preload="auto" />
      <AnimatePresence>
      {phase === 'profile' && (
        <motion.section
          className="fixed inset-0 bg-black flex flex-col items-center justify-center z-40 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-semibold text-white mb-12 text-center">Who's Invited ?</h1>
          <div className="w-full flex justify-center">
            <div className={`mb-8 ${
              profiles.length === 1
                ? "flex justify-center"
                : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8"
            }`}>
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    handleProfileClick(p);
                    setPhase('main'); // <-- Langsung ke halaman main!
                  }}
                  className={`
                    flex flex-col items-center space-y-2
                    focus:outline-none transition-transform hover:scale-105
                  `}
                >
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-24 h-24 rounded-md object-cover"
                  />
                  <span className="text-xl text-gray-200 font-bold">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.section>
      )}


{phase === 'main' && (
// Di dalam WeddingInvitation.jsx setelah pilih profile
 <section className="relative w-full h-screen scrollbar-hide overflow-hidden">
  {/* Tombol Musik */}
   {audioBlocked && (
  <button
    onClick={() => {
      if (audioRefMain.current) {
        audioRefMain.current.play();
        setAudioBlocked(false);
      }
    }}
    className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full z-[99] shadow-lg"
  >
    🔊 Mainkan Musik
  </button>
)}
  {/* Gambar sebagai latar belakang fullscreen */}
  <img
    src="/background.jpg" // ← ganti dengan gambar kamu
    alt="Poster Prewed"
    className="absolute inset-0 w-full h-full object-cover object-top z-0"
  />

  {/* Overlay hitam transparan agar teks tetap terbaca */}
  <div className="absolute inset-0 bg-black/55 md:bg-black/75  z-10"></div>

  {/* Konten di atas gambar */}
  <div className="relative z-20 flex flex-col items-start justify-end h-full px-6 md:px-20 pb-16 text-left text-white">

 {/* NIKAHFIX - SVG curved */}
 <div className="-mb-2 lg:-mb-2 md:ml-0 lg:-ml-8">
  <svg viewBox="0 0 400 51" className="w-40 h-20 md:w-56 md:h-20 lg:w-64 lg:h-28">
    <defs>
      <path id="curve" d="M20,90 Q200,0 400,80" fill="transparent" />
        {/* Filter untuk bayangan */}
      <filter id="textShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="1" dy="2" stdDeviation="2" flood-color="black" flood-opacity="0.4"/>
      </filter>
    </defs>
    <text
      fontSize="140"
      className="fill-red-600 font-black tracking-wide font-bebas"
    >
      <textPath href="#curve" startOffset="48%" textAnchor="middle">
        NIKFLIX
      </textPath>
    </text>
  </svg>
</div>

    <h1 className="text-3xl md:text-5xl font-extrabold leading-tigh lg:-ml-8">
      Zumrotul & Alvian: <br /> Sebelum Hari H
    </h1>

    <div className="flex items-center gap-3 mt-3 lg:-ml-8">
      <span className="bg-red-600 text-white text-xs md:text-sm px-3 py-1 rounded-full font-semibold shadow">
        Coming soon
      </span>
      <span className="text-sm"> 09 Oktober  2025</span>
    </div>
     {/* Kontrol Volume */}
      <div className="absolute top-4 right-4 z-20">
          <button onClick={toggleMute} className="text-white">
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
      </div>

    {/* Tagar */}
    <div className="flex gap-2 mt-4 flex-wrap justify-start md:justify-start text-xs md:text-sm text-white/80 lg:-ml-8">
      {['#Romantic', '#Getmarried', '#Family', '#Documenter'].map((tag, idx) => (
        <span
          key={idx}
          className="bg-gray-600 px-3 py-1 rounded-full border border-white/20 backdrop-blur-sm font-semibold"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
</section>
)}


{/* section 2 */}
<section className="relative w-full text-white py-20 px-6 md:px-20 overflow-hidden">
  {/* Background Parallax */}
  <div
    className="absolute inset-0 bg-fixed bg-center bg-cover z-0"
    style={{ backgroundImage: "url('/background.jpg')" }}
  >
    <div className="w-full h-full bg-black/80"></div> {/* Overlay */}
  </div>

  {/* Konten di atas background */}
  <motion.div
    className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row items-start gap-8"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, ease: 'easeOut' }}
    viewport={{ once: true }}
  >
    {/* Gambar Kanan */}
    <motion.div
      className="w-full md:w-1/2 rounded-xl overflow-hidden shadow-2xl"
      initial={{ opacity: 0, x: -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.2 }}
    >
      <img
        src="/background.jpg"
        alt="Poster"
        className="w-full h-auto object-cover ease-in-out duration-300 hover:scale-105 rounded-lg shadow-lg"
      />
    </motion.div>

    {/* Konten Tulisan */}
    <motion.div
      className="w-full md:w-1/2 space-y-4"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.4 }}
    >
      <p className="uppercase text-red-500 text-sm font-semibold tracking-wide">Documenter</p>
      <h2 className="text-3xl md:text-4xl font-extrabold leading-snug">Alvian & Zumrotul: Sebelum Hari H</h2>

      <div className="flex items-center gap-4 text-sm text-white/80">
        <span className="text-green-400 font-semibold">100% Match</span>
        <span className="bg-white text-black px-2 rounded text-xs font-bold">SU</span>
        <span>2025</span>
        <span>1h 26m</span>
      </div>

      <div className="bg-red-600 text-white w-fit px-4 py-1 rounded-full text-sm font-semibold shadow-md">
        Coming soon on 09 Oktober 2025
      </div>

      <p className="text-sm md:text-base text-white/80">
        Dengan kuasa Allah SWT., Zumrotul & alvian  dipertemukan dalam situasi yang tepat. Arus membawa mereka ke jenjang yang lebih serius ketika keduanya bertekat untuk saling mengikat, menyempurnakan separuh agama.

      </p>

      <p className="text-xs italic text-white/50 border-t border-white/10 pt-2">
        "Segala sesuatu Kami ciptakan berpasang-pasangan agar kamu mengingat (kebesaran Allah)" – (Q.S Az-Zariyat: 49)
      </p>
    </motion.div>
  </motion.div>
</section>

{/* section 3 breaking news */}
<section className="relative w-full bg-black text-white px-6 py-16 md:py-24">
  <motion.div
    className="max-w-3xl mx-auto flex flex-col items-center"
    initial={{ opacity: 0, x: 100 }}  // Mulai dari luar layar kanan
    whileInView={{ opacity: 1, x: 0 }}  // Masuk ke posisi normal
    exit={{ opacity: 0, x: 100 }}  // Keluar dan pergi ke kanan
    transition={{ duration: 1 }}
    viewport={{ once: false }}  // Efek animasi saat keluar dan masuk kembali
  >
    <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center w-full">
      Breaking News 📺
    </h3>

    {/* Gambar dengan overlay teks */}
    <motion.div
      className="w-full aspect-[3/2] md:aspect-video rounded-xl overflow-hidden relative shadow-xl"
      initial={{ opacity: 0, x: 100 }}  // Gambar mulai dari kanan
      whileInView={{ opacity: 1, x: 0 }}  // Gambar bergerak ke posisi normal saat digulir
      transition={{ duration: 0.8 }}
    >
      <img
        src="/biru1.jpg"
        alt="Pengumuman"
        className="w-full h-full object-cover ease-in-out duration-300 hover:scale-105"
      />
    </motion.div>

    {/* Teks */}
    <motion.div
      className="mt-6 text-left space-y-4 text-base leading-relaxed"
      initial={{ opacity: 0, x: 100 }}  // Teks mulai dari kanan
      whileInView={{ opacity: 1, x: 0 }}  // Teks bergerak ke posisi normal saat digulir
      transition={{ duration: 1 }}
    >
      <p>
        <strong>We’re Getting Married!</strong>
      </p>
      <p>
        Dengan segala kerendahan hati, kami mengundang <strong>Bapak/Ibu, sahabat, keluarga, serta
        kerabat terkasih </strong>untuk hadir dan memberikan doa restu pada acara pernikahan kami.
        Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu berkenan hadir.
      </p>
      <p>
        Mohon doanya agar acara kami diberi kelancaran dan keberkahan. 🤍
      </p>
    </motion.div>
  </motion.div>
</section>

{/* section 4 */}
<section className="bg-black text-white py-16 px-6 md:px-20">
  <motion.div
    className="max-w-5xl mx-auto"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    viewport={{ once: false }} // Animasi tetap terjadi saat digulir tanpa refresh
  >
    <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center">Bride and Groom 💐</h3>

    <div className="grid grid-cols-2 gap-6 md:gap-10">
      
      {/* Mempelai Wanita - Animasi Masuk dari Kiri */}
      <motion.div
        className="flex flex-col items-center text-center space-y-3"
        initial={{ opacity: 0, x: -100 }}  // Mulai dari luar layar kiri
        whileInView={{ opacity: 1, x: 0 }}  // Masuk ke posisi normal
        transition={{ duration: 1, delay: 0.1 }}
        viewport={{ once: false }}
      >
        <img
          src="/rotul.jpg"
          alt="Alya Fadilah M.R"
          className="w-48 h-48 object-cover rounded-xl shadow-lg"
        />
        <motion.h4
          className="text-lg md:text-xl font-semibold mt-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: false }}
        >
          Zumrotul Khasanah,S.Sos
        </motion.h4>
        <motion.p
          className="text-sm text-white/80"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          viewport={{ once: false }}
        >
          Putri Pertama Dari <span className='font-semibold text-yellow-500'>Bapak Sutarmanto</span> & <span className='font-semibold text-yellow-500'>Ibu Mustomah</span>
        </motion.p>
      </motion.div>

      {/* Mempelai Pria - Animasi Masuk dari Kanan */}
      <motion.div
        className="flex flex-col items-center text-center space-y-3"
        initial={{ opacity: 0, x: 100 }}  // Mulai dari luar layar kanan
        whileInView={{ opacity: 1, x: 0 }}  // Masuk ke posisi normal
        transition={{ duration: 1, delay: 0.2 }}
        viewport={{ once: false }}
      >
        <img
          src="/vian.jpg"
          alt="Yohan Putra Nugraha"
          className="w-48 h-48 object-cover rounded-xl shadow-lg"
        />
        <motion.h4
          className="text-lg md:text-xl font-semibold mt-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: false }}
        >
           Muhammad Alvian Dwijaya
        </motion.h4>
        <motion.p
          className="text-sm text-white/80"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          viewport={{ once: false }}
        >
          Putra dari <span className='font-semibold text-yellow-500'>Bpk Sahri (Alm)</span> & <span className='font-semibold text-yellow-500'>Ibu Siti Kholinah</span>
        </motion.p>
        
      </motion.div>

    </div>
  </motion.div>
</section>

{/* Section Akad */}
<section className="bg-black text-white py-16 px-6 md:px-20">
  <div className="max-w-3xl mx-auto text-center">
    <h2 className="text-3xl font-bold mb-6">Akad Nikah</h2>
    <p className="mb-4 text-lg">
      Dengan penuh rasa syukur, kami mengundang Anda untuk menyaksikan akad pernikahan kami.
    </p>
    <p className="mb-2">
      🗓️ Tanggal: 09 Oktober 2025
    </p>
    <p className="mb-6">
      ⏰ Waktu: 10.00 WIB s/d selesai
    </p>
  </div>
</section>

{/* Section Tasyakuran */}
<section className="bg-black text-white py-16 px-6 md:px-20">
  <div className="max-w-3xl mx-auto text-center">
    <h2 className="text-3xl font-bold mb-6">Tasyakuran</h2>
    <p className="mb-4 text-lg">
      Bersama keluarga besar, kami mengundang Anda untuk hadir dalam acara tasyakuran pernikahan kami.
    </p>
    <p className="mb-2">
      🗓️ Tanggal: 08 Oktober 2025
    </p>
    <p className="mb-6">
      ⏰ Waktu: 08.00 WIB s/d selesai
    </p>
   
  </div>
</section>








{/* section 5 */}
<section className="bg-black text-white py-16 px-6 md:px-20">
  <motion.div
    className="max-w-4xl mx-auto"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    viewport={{ once: false }}  // Animasi aktif saat scroll masuk dan keluar dari tampilan
  >
    <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center">Location 🗺️</h3>

    {/* Grid 2 kolom di semua ukuran */}
    <div className="grid grid-cols-2 gap-4 items-start">
      
      {/* Map - Animasi Masuk dari Kiri */}
      <motion.div
        className="rounded-xl overflow-hidden shadow-lg"
        initial={{ opacity: 0, x: -100 }}  // Mulai dari kiri luar
        whileInView={{ opacity: 1, x: 0 }}  // Bergerak ke posisi normal
        transition={{ duration: 0.8 }}
        viewport={{ once: false }}  // Animasi aktif setiap kali digulir
      >
        <iframe
          title="Lokasi Warna-Warni Resto"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.2643955185345!2d106.7594484!3d-6.488165899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c3837c7a5057%3A0x5f75423673ba0355!2sRumah%20Pak%20Feri!5e0!3m2!1sen!2sid!4v1750087025165!5m2!1sen!2sid"
          width="100%"
          height="200"
          allowFullScreen=""
          loading="lazy"
          className="w-full h-full border-0"
        ></iframe>
      </motion.div>

      {/* Deskripsi Lokasi - Animasi Masuk dari Kanan */}
      <motion.div
        className="text-left"
        initial={{ opacity: 0, x: 100 }}  // Mulai dari kanan luar
        whileInView={{ opacity: 1, x: 0 }}  // Bergerak ke posisi normal
        transition={{ duration: 0.8 }}
        viewport={{ once: false }}  // Animasi aktif setiap kali digulir
      >
        <h4 className="text-base md:text-lg font-semibold mb-1">Rumah Mempelai wanita</h4>
        <p className="text-xs md:text-sm text-white/80 mb-3 leading-snug">
          RT01/07,Baleraksa, <br />
          Kec.Karangmoncol , Kabupaten Purbalingga
        </p>
        <a
          href="https://maps.app.goo.gl/kXNExiDotN8jskQP8"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-white text-black px-4 py-1.5 rounded-full text-xs font-medium hover:bg-red-600 hover:text-white transition"
        >
          Show location
        </a>
      </motion.div>
    </div>

    {/* Note Section */}
    <motion.div
      className="mt-10 text-center"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: false }}
    >
      <blockquote className="text-xl md:text-base text-white/80 italic">
        "Mohon gunakan alas kaki yang nyaman karena acara akan berlangsung di area taman "
      </blockquote>
    </motion.div>
  </motion.div>
</section>


{/* section 6 */}
<section className="bg-black text-white py-16 px-6 md:px-20">
  <motion.div
    className="max-w-6xl mx-auto"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    viewport={{ once: false }}
  >
    <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center animate__animated animate__fadeInUp">
      Our Story Episodes 🎬
    </h3>

    <div className="space-y-10">
      {[
        {
          title: "Episode 1: Pertemuan Pertama",
          image: "/e1.jpg",
          description:
            "Tidak ada yang kebetulan didunia ini, semua sudah tersusun rapi oleh sang maha kuasa. Kita tidak bisa memilih kepada siapa kita jatuh cinta. Uniknya kami berkenalan di sosial media dan pada akhirnya kami memutuskan untuk bertemu tatap muka pada bulan oktober 2024. Tidak ada yang pernah menyangka bahwa pertemuan didunia maya itu membawa kami pada suatu ikatan cinta yang suci ini",
          badge: "Eps 1",
          badgeColor: "bg-red-600",
        },
        {
          title: "Episode 2: Kencan Pertama",
          image: "/e2.jpg",
          description:
            "Katanya cinta tumbuh dengan kebersamaan. Seiring berjalannya waktu kami semakin dekat, saling bertukar cerita, saling support satu sama lain, dan alam seakan terus berkonspirasi untuk menyatukan kami berdua..",
           
          badge: "Eps 2",
          badgeColor: "bg-blue-600",
        },
        {
          title: "Episode 3: Restu Keluarga",
          image: "/e3.jpg",
          description:
            "Kehendaknya menuntun kami pada sebuah pertemuan yang tak pernah disangka hingga akhirnya membawa kami pada sebuah ikatan suci yang dicintainya, kami melangsungkan acara lamaran dibulan januari 2025 lalu...",

          badge: "Eps 3",
          badgeColor: "bg-green-600",
        },
        {
          title: "Episode 4: The End of Beginning",
          image: "/e4.jpg",
          description:
            "Percayalah, bukan karna bertemu lalu berjodoh tapi karna berjodohlah kami dipertemukan, kami memutuskan untuk mengikrarkan janji suci pernikahan kami di bulan ini inshalloh sebagaimana yang pernah dikatakan oleh sayidina ali bin abi thalib 'apa yang menjadi takdirmu akan menemukan jalannya untuk menemukanmu'...",
          badge: "Eps 4",
          badgeColor: "bg-yellow-600",
        },
      ].map((episode, idx) => (
        <motion.div
          key={idx}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-zinc-900 to-gray-800 p-4 rounded-2xl shadow-2xl ring-1 ring-white/10 md:bg-transparent md:p-0 md:shadow-none md:ring-0"
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: idx * 0.2 }}
          viewport={{ once: false }}
        >
          {/* Gambar (kiri) */}
          <motion.div
            className="w-full rounded-xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: idx * 0.2 }}
            whileHover={{
              scale: 1.05,
              rotateY: 10,
              rotateX: 10,
              boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
              transition: { duration: 0.5 },
            }}
          >
            <img
              src={episode.image}
              alt={episode.title}
              className="w-full h-full object-cover rounded-lg transition duration-300"
            />
          </motion.div>

          {/* Penjelasan Episode (kanan) */}
          <motion.div
            className="w-full flex flex-col justify-center"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: idx * 0.2 }}
            viewport={{ once: false }}
          >
            <motion.span
              className={`inline-block w-fit px-4 py-1 rounded-full text-white text-xs font-bold ${episode.badgeColor} animate-bounce mb-3`}
              whileHover={{
                scale: 1.1,
                rotate: 8,
                textShadow: "0 0 12px white",
              }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {episode.badge}
            </motion.span>

            <motion.h4
              className="text-xl font-bold mb-2 text-shadow-md"
              whileHover={{ scale: 1.03, color: "#facc15" }}
            >
              {episode.title}
            </motion.h4>

            <motion.p
              className="text-base text-white/80 leading-relaxed"
              whileHover={{
                scale: 1.02,
                color: "#f9fafb",
                textShadow: "0 0 10px rgba(255,255,255,0.5)",
              }}
            >
              {episode.description}
            </motion.p>
          </motion.div>
        </motion.div>
      ))}
    </div>
  </motion.div>
</section>

{/* section 7 */}
<section className="text-white py-16 px-6 md:px-20">
  <motion.div
    className="max-w-6xl mx-auto"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    viewport={{ once: false }} // ✅ Animasi aktif setiap scroll
  >
    <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center">
      Top 10 Moment Favorit
    </h3>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {[
        { img: '/2.png', badge: 'Eksklusif', badgeColor: 'bg-red-500' },
        { img: '/3.png', badge: 'Premium 👑', badgeColor: 'bg-red-500' },
        { img: '/4.png', badge: 'Top 10', badgeColor: 'bg-red-500' },
        { img: '/5.png', badge: 'Premium 👑', badgeColor: 'bg-red-500' },
        { img: '/6.png', badge: 'Our Favorite', badgeColor: 'bg-red-500' },
        { img: '/7.png', badge: 'Eksklusif 10', badgeColor: 'bg-red-500' },
        { img: '/8.png', badge: 'Top 5', badgeColor: 'bg-red-500' },
        { img: '/9.png', badge: 'Top 3', badgeColor: 'bg-red-700' },
        { img: '/10.png', badge: 'Top 2', badgeColor: 'bg-pink-700' },
        { img: '/1.jpg', badge: 'Top 1', badgeColor: 'bg-pink-500' },
      ].map((item, idx) => (
        <motion.div
          key={idx}
          className="relative rounded-xl overflow-hidden shadow-xl group cursor-pointer bg-zinc-900/40 backdrop-blur-md perspective-1000"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.07, duration: 0.5 }}
          viewport={{ once: false }} // ✅ animasi bisa muncul tiap scroll
          whileHover={{
            scale: 1.05,
            rotateX: -5,
            rotateY: 8,
            transition: { duration: 0.4, ease: 'easeOut' },
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <img
            src={item.img}
            alt={item.title}
            className="w-full h-full object-cover aspect-[3/4] transform group-hover:scale-105 transition duration-300 rounded-lg"
          />

          {/* Overlay judul */}
          <div className="absolute inset-0 flex items-end p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
            <h4 className="text-sm font-bold group-hover:text-yellow-400 transition">
              {item.title}
            </h4>
          </div>

          {/* Badge */}
          {item.badge && (
            <motion.div
              className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold text-white ${item.badgeColor}`}
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            >
              {item.badge}
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  </motion.div>
</section>

{/* section 8 */}
{/* <section className="bg-black text-white py-16 px-6 md:px-20">
  <motion.div
    className="max-w-xl mx-auto text-center"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    viewport={{ once: true }}
  >
    <h3 className="text-2xl md:text-3xl font-bold mb-6">Daftar Kehadiranmu 💌</h3>
    <p className="text-sm md:text-base text-white/80 mb-6 leading-relaxed">
      Kami sangat senang bisa berbagi momen spesial ini bersama kamu.
      Mohon konfirmasi kehadiranmu melalui link berikut ya! ✨
    </p>

    <button
      onClick={() => window.location.href = 'https://theweddingofdinidhito.vercel.app/guest-form'} // Ganti dengan link RSVP kamu
      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full shadow transition duration-300"
    >
      Konfirmasi Kehadiran
    </button>
  </motion.div>
</section> */}

{/* section 8 */}
<section className="bg-black text-white py-16 px-6 md:px-20">
  <motion.div
    className="max-w-xl mx-auto text-center"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    viewport={{ once: true }}
  >
    <h3 className="text-2xl md:text-3xl font-bold mb-6">Nomor Rekening 💳</h3>
    <p className="text-sm md:text-base text-white/80 mb-6 leading-relaxed">
      Untuk yang ingin memberikan tanda kasih, berikut nomor rekening kami.
      Terima kasih banyak atas perhatian dan doa restunya ✨
    </p>

    {/* Nomor Rekening */}
    <div className="bg-white text-black p-4 rounded-lg shadow mb-4">
      <p className="text-lg font-semibold">BNI</p>
      <p className="text-xl font-bold tracking-wider">1232516014</p>
      <p className="text-sm text-gray-600">a.n Zumrotul khasanah</p>
      <p className="text-lg font-semibold">BRI</p>
      <p className="text-xl font-bold tracking-wider">041001021839506</p>
      <p className="text-sm text-gray-600">a.n Zumrotul khasanah</p>
      <p className="text-lg font-semibold">BCA</p>
      <p className="text-xl font-bold tracking-wider">2310228071</p>
      <p className="text-sm text-gray-600">a.n M Alvian dwijaya</p>
      
     
     
    </div>


    {/* Alamat Kirim Hadiah */}
    <div className="bg-gray-800 text-left p-6 rounded-lg shadow-lg mt-8">
      <h4 className="text-lg font-bold mb-3">🎁 Alamat Kirim Hadiah</h4>
      <p className="text-sm text-white/90 leading-relaxed">
        Nama Penerima: <span className="font-semibold">Zumrotul khasanah</span>
        <br />
        Alamat: Baleraksa RT01/07, kec.karangmoncol, kabupaten purbalingga
        provinsi jawa tengah,53355
        <br />
        No. HP: 0821-3190-7116
      </p>
      <button
        onClick={() => {
          navigator.clipboard.writeText(
            "Nama: Zumrotul khasanah\nAlamat:Baleraksa RT01/07, kec.karangmoncol, kabupaten purbalingga provinsi jawa tengah,53355\nNo. HP: 0821-3190-7116"
          );
          alert("Alamat hadiah berhasil disalin!");
        }}
        className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-full shadow transition duration-300"
      >
        Salin Alamat
      </button>
    </div>
  </motion.div>
</section>


{/* section 10 Form Ucapan & Daftar Wishes */}
 <section className="bg-black px-6 py-10 text-white text-center">
  <h3 className="text-2xl font-bold mb-6">Wish For The Couple </h3>
  <form
    onSubmit={(e) => {
      e.preventDefault();
      if (!guestName || !wishInput.trim()) return;
      handleSubmitWish(); // Fungsi kirim ke Supabase
    }}
    className="flex flex-col gap-4 max-w-xl mx-auto"
  >
    <input
      type="text"
      placeholder="Nama kamu"
      className="px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-400"
      value={guestName}
      onChange={(e) => setGuestName(e.target.value)}
      required
    />
    <textarea
      placeholder="Ucapan atau doa kamu..."
      className="px-4 py-3 rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-400"
      rows={4}
      value={wishInput}
      onChange={(e) => setWishInput(e.target.value)}
      required
    />
    <button
      type="submit"
      className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded text-white font-semibold shadow"
    >
      Kirim Ucapan
    </button>
  </form> 

 {/* Recent Wishes */}
 <div className="mt-10 max-w-2xl mx-auto">
  <div className="max-h-96 overflow-y-scroll pr-2 space-y-4 ">
    {wishes.map((wish, i) => (
      <div
        key={i}
        className="bg-gray-800 px-4 py-3 rounded-lg border border-gray-700"
      >
        <p className="text-sm text-gray-300">
          Dari: <span className="font-semibold text-white">{wish.name}</span>
        </p>
        <p className="mt-1 text-base text-white italic">“{wish.message}”</p>
      </div>
    ))}
  </div>
</div> 
</section>



{/* section 11 penutup */}
<section
  className="relative w-full text-white py-20 px-6 md:px-20 bg-center bg-cover overflow-hidden
             bg-scroll md:bg-fixed"
  style={{ backgroundImage: "url(/background.jpg')" }} // ganti dengan file final
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/70 z-0" />

  {/* Konten */}
  <motion.div
    className="relative z-10 max-w-xl mx-auto text-center"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1 }}
    viewport={{ once: true }}
  >
    <h3 className="text-2xl md:text-3xl font-bold mb-6">Sampai Jumpa di Hari Bahagia Kami 🌟</h3>
    <p className="text-sm md:text-base text-white/90 leading-relaxed">
      Terima kasih telah menjadi bagian dari cerita cinta kami. <br />
      Dengan penuh rasa syukur, kami menantikan kehadiranmu di hari yang sangat berarti ini.
    </p>
    <p className="mt-6 italic text-xs text-white/60">
      “Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu…” <br />
      – (Q.S. Ar-Rum: 21)
    </p>
  </motion.div>
</section>












        {showIntro && (
          <motion.div
            key="intro"
            className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 5 }}
            transition={{ duration: 1 }}
          >
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-30 blur-sm animate-float"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${3 + Math.random() * 5}s`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
            <motion.h1
              className="text-8xl lg:text-8xl font-bold text-red-600 z-10 font-bebas"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              NIKFLIX
            </motion.h1>
            <audio
              ref={audioRefIntro}
              src="/sound/netflix_sound.mp3"
              preload="auto"
            />
              {introFinished && (
              <motion.button
                onClick={scrollToHero}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full text-2xl z-50 shadow-xl"
              >
                <FaPlay />
              </motion.button>
            )}
            <button
              onClick={toggleMute}
              className="absolute top-4 right-4 text-white text-xl z-10"
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>





      {/* CSS */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        .animate-float {
          animation: float infinite ease-in-out;
        }
        .animate-fadeOut {
        opacity: 0;
        transition: opacity 1s ease-out;
        }
        @keyframes roll {
        0% { top: 100%; }
        100% { top: -150%; }
        }
        .animate-roll {
        animation: roll 25s linear infinite;
         }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      .scrollbar-hide {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
      }
      .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;     /* Firefox */
  }
    /* styles/global.css atau di tailwind layer base */
body::-webkit-scrollbar {
  width: 0.4em;
}
body::-webkit-scrollbar-track {
  background: transparent;
}
body::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
      
      `}</style>
    </div>
  );
}
