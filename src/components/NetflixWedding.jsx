import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaVolumeMute, FaVolumeUp, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient'; // atau sesuaikan path-nya

export default function WeddingInvitation() {
  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [countdown, setCountdown] = useState('');
  const audioRef = useRef(null);
  const [wishes, setWishes] = useState([]); 
  const [guestName, setGuestName] = useState('');
  const [wishInput, setWishInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const wishesPerPage = 5; // Jumlah per halaman
  const indexOfLastWish = currentPage * wishesPerPage;
  const indexOfFirstWish = indexOfLastWish - wishesPerPage;
  const [showModal, setShowModal] = useState(false);
  // const [showRSVP,  setShowRSVP]  = useState(false); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);


  const profiles = [
  { id: 'primary',   name: 'Dito & Dini',      avatar: '/Netflix-avatar.png' },];
  const [phase, setPhase] = useState('intro'); // intro | profile | main
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Gambar-gambar background
const backgroundImages = [
  { url: "/dito2.jpg", object: "object-[50%_10%]" },
  { url: "/prewed2.jpg", object: "object-[60%_20%]" },
  { url: "/prewed3.jpg", object: "object-center" },
  { url: "/prewed4.jpg", object: "object-center" },
];

// Slideshow effect
useEffect(() => {
  let interval;
  if (isPlaying) {
    interval = setInterval(() => {
      setBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 3000); // ganti gambar setiap 3 detik
  } else {
    clearInterval(interval);
  }
  return () => clearInterval(interval);
}, [isPlaying]);


useEffect(() => {
  if (showIntro) {
    const timer = setTimeout(() => {
      setShowIntro(false);
      setPhase('profile');  // langsung ke profile scene!
    }, 3500);
    return () => clearTimeout(timer);
  }
}, [showIntro]);


  // Play audio on intro
 useEffect(() => {
  if (showIntro && audioRef.current) {
    audioRef.current.muted = isMuted;
    audioRef.current.play().catch((e) =>
      console.log("Autoplay blocked:", e)
    );
  }
}, [showIntro]);


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

  const toggleMute = () => {
    setIsMuted((prev) => {
      if (audioRef.current) audioRef.current.muted = !prev;
      return !prev;
    });
  };

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
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans overflow-hidden relative scroll-smooth">
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
                    setSelectedProfile(p);
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
                  <span className="text-sm text-gray-200">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
           {/* Add "You" text with white border */}
          <div className="mt-2 border-2 border-white rounded-xl px-6 py-2 text-white font-semibold h">
            You
          </div>
        </motion.section>
      )}


{phase === 'main' && (
  <section className="relative w-full min-h-[100vh] flex items-end md:items-center overflow-hidden bg-black">
    {/* RSVP Button */}
    <div className="absolute top-4 left-4 z-50">
      <a
    href="https://forms.gle/YOUR_FORM_LINK"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white text-black px-4 py-2 rounded font-semibold shadow inline-block"
  >
    📅 RSVP
  </a>
    </div>
  {/* Background image */}
  <img
    src={backgroundImages[bgIndex].url}
    alt="The Story of Dito & Dini"
    className={`absolute inset-0 w-full h-full object-cover ${backgroundImages[bgIndex].object} scale-105 transition-all duration-700 ease-in-out`}
    style={{ zIndex: 0 }}
  />
  {/* Netflix black gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-transparent" style={{ zIndex: 1 }} />
  
  {/* Kiri: Konten */}
  <div className="relative z-20 max-w-xl md:max-w-2xl px-8 py-14 md:py-0 text-white flex flex-col gap-3 md:gap-6 mt-44 ">
    <h1 className="text-3xl md:text-5xl font-black leading-tight drop-shadow-lg">The Story of<br />Dito & Dini</h1>
    <div className="flex items-center gap-2">
      <span className="text-red-500 text-lg md:text-xl">★★★★★</span>
      <span className="text-sm md:text-base">5.0</span>
    </div>
    <p className="text-base md:text-lg font-light drop-shadow-lg">
      Setelah melewati banyak cerita, suka duka, dan tawa bersama, akhirnya Dito dan Dini melangkah ke babak baru kehidupan. Mari rayakan momen ini bersama!
    </p>
   <div className="flex gap-4 mt-3">
      {/* Tombol PLAY */}
  <button
    onClick={() => setIsPlaying(!isPlaying)}
    className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white font-semibold shadow border border-white"
  >
    {isPlaying ? "⏸ Pause" : "▶️ Play"}
  </button>
  <button
    onClick={() => setShowModal(true)}
    className="bg-gray-400/60 hover:bg-gray-700 px-7 py-2 rounded text-lg font-semibold border border-gray-300 shadow"
  >
    More Info
  </button>
</div>





{/* pop up untuk munculin episode */}
<AnimatePresence>
  {showModal && (
    <motion.div
      key="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-900 text-black dark:text-white w-full max-w-2xl rounded-xl overflow-y-auto max-h-[90vh] shadow-xl relative scrollbar-hide"
      >
        {/* Close button */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-2xl z-10"
        >
          ×
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-300 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-center"> Daftar Episode</h2>
        </div>

        {/* Episode List - Netflix Style */}
        <div className="p-6 space-y-6">
  {[
     {
      title: "Andhito Diaz Revanza & Andi Ummu Aulia Aiundini Tenrigangka",
      image: "/ditodini.jpeg",
      desc: "Langkah pertama menuju hidup bersama. Terima kasih telah menjadi bagian dari kisah kami. Evansyah & Ibu Dhyanchandra Patria Novimarmadewi",
      badge: "Eps 1",
      time: "Lamaran",
    },
    {
      title: "Andhito Diaz Revanza",
      time: "Putra dari",
      image: "/dito1.jpg",
      desc: "Bapak Evansyah & Ibu Dhyanchandra Patria Novimarmadewi",
      badge: "Eps 2",
    },
    {
      title: "Andi Ummu Aulia Aiundini Tenrigangka",
      time: "Putri dari",
      image: "/dini1.jpg",
      desc: "Bapak Aferi Syamsidar Fudail & Ibu Onny Tenriyana",
      badge: "Eps 3",

    },
    {
      title: "Location",
      time: "06 Juli 2025",
      desc: "14:00 - 16:00",
      badge: "Eps 4",
      mapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.2643955185345!2d106.7594484!3d-6.4881659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c3837c7a5057%3A0x5f75423673ba0355!2sRumah%20Pak%20Feri!5e0!3m2!1sid!2sid!4v1749895143437!5m2!1sid!2sid",
    },
  ].map((ep, i) => (
    <div key={i} className="relative flex gap-4 items-start bg-[#141c2f] p-4 rounded-xl">
      <div className="w-32 h-32 rounded-lg overflow-hidden">
        {ep.mapUrl ? (
          <iframe
            src={ep.mapUrl}
            title="Lokasi"
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        ) : (
          <img
            src={ep.image}
            alt={ep.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-bold">{ep.title}</h3>
        <p className="text-sm text-yellow-600 dark:text-yellow-300 border border-yellow-500 dark:border-yellow-300 px-3 py-1 rounded-full inline-block font-semibold shadow-sm bg-yellow-100/20 dark:bg-yellow-900/20 mt-2 mb-2">
          {ep.time}
        </p>
        {ep.place && (
          <p className="text-sm text-gray-600 dark:text-gray-300">{ep.place}</p>
        )}
        <p className="text-sm text-gray-500 italic mt-1">{ep.desc}</p>
        <span className="text-xs text-gray-400 whitespace-nowrap">{ep.duration}</span>

        {/* Optional External Link for Google Maps */}
        {ep.mapUrl && (
          <a
            href={`https://maps.app.goo.gl/fdnCTiYCmNkuCdDe7`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 dark:text-blue-400 underline mt-1 inline-block"
          >
            📍 Buka di Google Maps
          </a>
        )}
        {ep.badge && (
        <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-md z-10">
          {ep.badge}
        </div>
        )}
      </div>
    </div>
  ))}
</div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  </div>
</section>
)}





 {/* Top 10 Section */}
<h3 className="text-xl text-white ml-10 mt-5 -mb-5 font-bold">Top 10 Momen Favorit Kami</h3>
<div className="bg-black py-8">
  <div className="flex gap-6 overflow-x-auto px-8 scrollbar-hide">
    {[
      { img: "/AdaApaDengan Cinta.png", title: "Ada Apa Dengan Cinta", desc: "Momen penuh nostalgia dan cinta." },
      { img: "/CrashLandingOnYou.png", title: "Crash Landing", desc: "Pertemuan tak terduga yang manis." },
      { img: "/DDThe Explorer.png", title: "DD The Explorer", desc: "Petualangan seru dan penuh tawa." },
      { img: "/DuaLatarBiru.png", title: "Dua Latar Biru", desc: "Romansa yang tenang dan dalam." },
      { img: "/KeluargaCemara.png", title: "Keluarga Cemara", desc: "Hangatnya kebersamaan keluarga." },
      { img: "/LaLaLand.png", title: "La La Land", desc: "Drama musikal yang menginspirasi." },
      { img: "/NantiKitaCeritaTentangHariIni.png", title: "NKCTHI", desc: "Cerita tentang keluarga dan luka lama." },
      { img: "/PernikahanDini.png", title: "Pernikahan Dini", desc: "Awal kisah cinta mereka." },
      { img: "/ReadyOrNot.png", title: "Ready or Not", desc: "Cinta dan kekacauan menyatu." },
      { img: "/WhenLifeGivesYouTangerines.png", title: "When Life Gives You Tangerines", desc: "Cinta dan Restu Orang Tua." },
    ].map((item, idx) => (
      <div
        key={idx}
        className="relative w-44 h-64 flex-shrink-0 group overflow-hidden rounded-xl border-2 border-black shadow-lg hover:shadow-red-500 transition-all duration-300"
      >
        {/* Background image */}
        <img
          src={item.img}
          alt={item.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

        {/* Detail Text */}
       <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 z-20 opacity-0 group-hover:opacity-100 transform translate-y-8 group-hover:translate-y-0 transition-all duration-300 ease-in-out">
          <h4 className="text-white text-sm font-bold">{item.title}</h4>
          <p className="text-gray-300 text-xs mt-1">{item.desc}</p>
        </div>

        {/* Badge Premium */}
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full shadow">
          PREMIUM
        </div>
      </div>
    ))}
  </div>
</div>


{/* Form Ucapan & Daftar Wishes */}
<section className="bg-black px-6 py-10 text-white text-center">
  <h3 className="text-2xl font-bold mb-6">Tulis Ucapan & Doa</h3>
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
    <h4 className="text-xl font-semibold mb-4">Ucapan Terbaru 💌</h4>
    <ul className="space-y-4">
      {wishes.map((wish, i) => (
        <li
          key={i}
          className="bg-gray-800 px-4 py-3 rounded-lg border border-gray-700"
        >
          <p className="text-sm text-gray-300">Dari: <span className="font-semibold text-white">{wish.name}</span></p>
          <p className="mt-1 text-base text-white italic">“{wish.message}”</p>
        </li>
      ))}
    </ul>
  </div>
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
              className="text-8xl font-bold text-red-600 z-10 font-bebas"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              NIKFLIX
            </motion.h1>
            <audio
              ref={audioRef}
              src="/netflix_sound.mp3"
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
      
      `}</style>
    </div>
  );
}
