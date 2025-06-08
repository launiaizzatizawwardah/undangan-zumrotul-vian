import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaVolumeMute, FaVolumeUp, FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { supabase } from '../lib/supabaseClient'; // atau sesuaikan path-nya

export default function WeddingInvitation() {
  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [showPoster, setShowPoster] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [countdown, setCountdown] = useState('');
  const audioRef = useRef(null);
  const [guestName, setGuestName] = useState('');
  const [isGuestConfirmed, setIsGuestConfirmed] = useState(false);
  const [wishes, setWishes] = useState([]);
  const [wishInput, setWishInput] = useState('');
  const emojis = ['😀', '🥰', '🎉', '💖', '💍', '😇', '😍', '🙌', '🎊', '✨'];
  const [currentPage, setCurrentPage] = useState(1);
  const wishesPerPage = 5; // Jumlah per halaman
  const indexOfLastWish = currentPage * wishesPerPage;
    const indexOfFirstWish = indexOfLastWish - wishesPerPage;
    const currentWishes = wishes.slice(indexOfFirstWish, indexOfLastWish);
    const totalPages = Math.ceil(wishes.length / wishesPerPage);
    



  // Intro Timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      setIntroFinished(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);


  // Play audio on intro
  useEffect(() => {
  if (showIntro && audioRef.current) {
    audioRef.current.muted = true;
    audioRef.current.play().catch(() => {});
  }
}, [showIntro]);

  // Countdown
  useEffect(() => {
    const targetDate = new Date('2025-09-21T11:00:00+07:00');
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;
      if (diff <= 0) {
        setCountdown('Acara telah dimulai!');
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown(`${days} hari ${hours} jam ${minutes} menit ${seconds} detik`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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


// fetching ke supabase 
// Ambil semua wish saat pertama load
useEffect(() => {
  const fetchWishes = async () => {
    const { data, error } = await supabase.from('wishes').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Gagal fetch wishes:', error.message);
    } else {
      setWishes(data);
    }
  };

  if (isGuestConfirmed) {
    fetchWishes();
  }
}, [isGuestConfirmed]);

// untuk auto reload wishes realtime
useEffect(() => {
  if (!isGuestConfirmed) return;

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

  return () => {
    supabase.removeChannel(channel);
  };
}, [isGuestConfirmed]);

// Saat Kirim Doa
const handleSubmitWish = async () => {
  if (!wishInput.trim()) return;

  const newWish = {
    name: guestName || 'Tamu',
    message: wishInput.trim(),
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
  };

  const { data, error } = await supabase
    .from('wishes')
    .insert([newWish])
    .select();

  if (error) {
    console.error('❌ Gagal menyimpan ke Supabase:', error.message);
  } else {
    setWishes((prev) => [data[0], ...prev]); // ⬅️ langsung tambahkan ke UI
    setWishInput('');
  }
};






const introContainerRef = useRef(null); // ⬅️ Tambahkan ini di atas

const handleGuestConfirm = () => {
  if (!guestName) return;

   // ✨ 1. Buat efek fade-out dulu
  if (introContainerRef.current) {
    introContainerRef.current.classList.add("animate-fadeOut");
  }

  // ✨ 2. Setelah 1 detik (durasi animasi), scroll ke hero & update state
  setTimeout(() => {
    setIsGuestConfirmed(true);
    const heroEl = document.getElementById("hero");
    if (heroEl) {
      heroEl.scrollIntoView({ behavior: "smooth" });
    }
  }, 1000);
};

// slider
const [sliderRef, instanceRef] = useKeenSlider({
    loop: true,
    renderMode: "performance",
    mode: "free-snap",
    slides: {
      perView: 3,
      spacing: 15,
    },
    created(s) {
      setInterval(() => {
        if (s) s.next();
      }, 3000); // auto-scroll every 3s
    },
  });

  


  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans overflow-hidden relative scroll-smooth">
        <button
            onClick={() => setIsDark(!isDark)}
            className="fixed top-4 left-4 z-50 bg-white dark:bg-black text-black dark:text-white px-4 py-2 rounded-full shadow transition"
            >
            {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
      <audio
        ref={audioRef}
        src="/backsound.mp3"
        autoPlay
        loop
        muted={isMuted}
      />

      {/* Intro */}
      <AnimatePresence>
        {introFinished && !isGuestConfirmed && (
        <section 
        ref={introContainerRef}
        className="fixed inset-0 bg-white dark:bg-black dark:text-black text-black flex flex-col items-center justify-center z-40">
    <h1 className="text-4xl font-bold mb-4 text-red-600">NIKAHFIX</h1>
    <p className="text-lg mb-6">Who's Invited?</p>

    {/* Avatar + Input */}
    <div className="flex flex-col items-center mb-4">
      <img
        src="/dito2.jpg"
        alt="Netflix Avatar"
        className="w-24 h-24 rounded-md"
      />
      <input
        type="text"
        value={guestName}
        onChange={(e) => setGuestName(e.target.value)}
        placeholder="Type your name..."
        className="mt-4 px-4 py-2 rounded-md bg-gray-500 dark:bg-white text-black w-64"
      />
    </div>

    <button
      onClick={handleGuestConfirm}
      disabled={!guestName}
      className={`mt-2 px-6 py-2 rounded-full text-white font-semibold ${
        guestName ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 cursor-not-allowed'
      }`}
    >
      Next
    </button>
  </section>
)}
        {showIntro && (
          <motion.div
            key="intro"
            className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
              className="text-5xl font-bold text-red-600 z-10"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              NIKAHFIX
            </motion.h1>
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

      {/* Poster ala Netflix */}
      <AnimatePresence>
        {showPoster && introFinished && (
          <motion.section
            key="poster"
            id="opening-poster"
            className="relative h-screen bg-black text-white overflow-hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <img
              src="/dito2.jpg"
              alt="Poster Dito & Dini"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
            <div className="relative z-10 flex flex-col justify-end items-start h-full p-6 md:p-16 text-left">
              <motion.span
                className="text-5xl font-bold text-red-600 z-10"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5 }}
              >
                NIKAHFIX
              </motion.span>
              <h1 className="text-4xl md:text-5xl font-bold mt-2">
                Dito & Dini:<br />Sebelum Hari H
              </h1>
              <p className="text-sm text-white mt-4 font-bold">
                <span className="bg-red-600 px-3 py-1 rounded text-sm text-white">Coming soon</span> • 26 Oktober 2024
              </p>
              <button
                onClick={scrollToHero}
                className="mt-10 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-full text-lg shadow-lg"
              >
                Lihat Selengkapnya <FaChevronDown className="inline ml-2" />
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

    {isGuestConfirmed && (
        <>
        {/* ✅ Tambahkan teks sambutan di pojok kanan atas */}
        <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-4 right-4 z-40 bg-white dark:bg-black text-black dark:text-white text-xs px-4 py-2 rounded-full shadow">
        Selamat datang, {guestName}! 
        </motion.div>
          
        {/* Hero */}
        {/* <section id="hero" className="bg-white dark:bg-black text-white pt-20 pb-10 px-6 dark:text-white"> */}
            {/* Video Trailer */}
            {/* <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-xl">
                <video
                className="w-full h-auto object-cover"
                src="/video-prewed.mp4"
                poster="/thumbnail-prewed.jpg"
                controls
                /> */}
            {/* </div> */}



        {/* Detail Info ala Netflix */}
        {/* <div className="max-w-4xl mx-auto mt-10 bg-white dark:bg-black dark:text-white text-black">
                <p className="text-red-500 font-semibold text-sm mb-1">N <span className="text-gray-400">DOCUMENTARY</span></p>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Dhito & Dini: Sebelum Hari H</h1>

                <div className="flex flex-wrap gap-4 items-center text-sm text-gray-400 mb-4">
                <span className="text-green-400 font-semibold">100% match</span>
                <span className="border border-gray-400 px-1">SU</span>
                <span>2024</span>
                <span>1h 26m</span>
                <span className="border border-gray-400 px-1">4K</span>
                <span className="border border-gray-400 px-1">HDR</span>
                </div>

                <p className="bg-red-600 inline-block text-white px-4 py-1 rounded mb-4 font-semibold">
                Coming soon on Saturday, 26 October 2024
                </p>

                <p className="text-black dark:text-white leading-relaxed mb-6">
                Setelah Yohan dan Alya dipertemukan dalam situasi yang tepat, di mana keduanya telah siap untuk
                memulai hubungan bersama, tibalah mereka di awal perjalanan baru menuju pernikahan.
                </p>

                <p className="text-sm italic text-gray-500 text-center border-t pt-4">
                "Segala sesuatu Kami ciptakan berpasang-pasangan agar kamu mengingat (kebesaran Allah)"<br />
                <span className="text-xs">– Q.S. Az-Zariyah: 49</span>
                </p>
        </div>
        </section> */}
        {/* poster prewed */}
        <section className="bg-white dark:bg-black text-black dark:text-white px-6 py-16">
      {/* <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">🎬 Koleksi Poster Prewed</h2> */}
      <div ref={sliderRef} className="keen-slider">
        {[
          "/AdaApaDenganCinta.jpg",
          "/PernikahanDini.jpg",
          "/ReadyorNot.jpg",
          "/renang-renangketepian.jpg",
          "/senyumadalahibadah.jpg",
        ].map((src, idx) => (
          <div
            key={idx}
            className="keen-slider__slide rounded-xl overflow-hidden transform transition-transform duration-300 hover:scale-105"
          >
            <img src={src} alt={`Poster ${idx + 1}`} className="w-full h-full object-cover aspect-[2/3]" />
          </div>
        ))}
      </div>
        </section>

        {/* Breaking News Section */}
        <section className="bg-white dark:bg-black text-black dark:text-white px-6 py-16">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">🗞️ Breaking News</h2>

        {/* Gambar & Caption */}
        <div className="relative overflow-hidden rounded-xl mb-6">
                <motion.img
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    src="/dito2.jpg"
                    alt="Breaking Announcement"
                    className="w-full h-auto object-cover"
                />
        </div>

        {/* Isi Pesan */}
        <div className="space-y-5 text-black dark:text-white leading-relaxed text-sm sm:text-base">
                <p>
                    Halo! Kami ingin informasikan bahwa kami akan segera menikah, dan kamu jadi 1 dari 100 orang
                    yang kami undang untuk hadir di hari bahagia kami!
                </p>
                <p>
                    Perlu diketahui, karena bersifat <span className="italic">intimate wedding</span> dan hanya
                    mengundang orang terdekat, maka dari itu kami harapkan untuk tidak menyebarluaskan
                    informasi detail terkait hari pernikahan kami (misalnya, lokasi dan waktu acara).
                </p>
                <p>
                    Kami tunggu kedatangannya di hari bahagia kami ya!
                </p>
                <p className="mt-6 text-white font-semibold">Dengan penuh cinta,</p>
        </div>
        </div>
        </section>

        {/* Bride and Groom Section */}
        <section className="bg-white dark:bg-black text-black dark:text-white px-6 py-20 ">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-center text-2xl md:text-3xl font-semibold mb-12">
                <span role="img" aria-label="love">💐</span> Bride and Groom
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 text-center">

                {/* Bride */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="overflow-hidden rounded-2xl group">
                    <img
                        src="/dini1.jpg"
                        alt="Andi Ummu Aulia Aiundini Tenrigangka"
                        className="w-full h-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-400 mt-4">
                    Andi Ummu Aulia Aiundini Tenrigangka
                    </h3>
                    <p className="text-sm text-black dark:text-white mt-1">
                    Putri dari <span className='text-yellow-400'>Bapak Akri Syamsidar Fudail & Ibu Onny Tenriyana</span>
                    </p>
                </motion.div>

                {/* Groom */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <div className="overflow-hidden rounded-2xl group">
                    <img
                        src="/dito1.jpg"
                        alt="Andhito Diaz Revandra"
                        className="w-full h-full aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    </div>
                    <h3 className="text-lg font-semibold text-yellow-400 mt-4">
                    Andhito Diaz Revandra
                    </h3>
                    <p className="text-sm text-black dark:text-white mt-1">
                    Putra dari <span className='text-yellow-400'>Bapak Karansyah & Ibu Dhiyanchandra Patria Novianamadawi</span>
                    </p>
                </motion.div>
                </div>
            </div>
        </section>

        {/* Location Section */}
        <section className="bg-white dark:bg-black text-black dark:text-white px-4 md:px-6 py-20">
        <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">📍 Location</h2>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* Google Maps */}
            <div className="w-full max-w-md h-52 sm:h-56 md:h-60 lg:h-64 rounded-xl overflow-hidden shadow-lg">
                <iframe
                title="Lokasi Warna-Warni Resto"
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.2643955185345!2d106.7594484!3d-6.488165899999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69c3837c7a5057%3A0x5f75423673ba0355!2sRumah%20Pak%20Feri!5e0!3m2!1sen!2sid!4v1749287229226!5m2!1sen!2sid"
                ></iframe>
            </div>

            {/* Alamat */}
            <div className="text-center lg:text-left max-w-md">
                <h3 className="text-xl font-bold mb-2">Rumah Pak Feri</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                Jl. Tonjong, Tajur Halang,<br />
                Bogor Regency,<br />
                West Java 16320, Indonesia
                </p>
                <a
                href="https://maps.app.goo.gl/fdnCTiYCmNkuCdDe7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full transition"
                >
                Buka di Google Maps
                </a>
            </div>
            </div>
        </div>
        </section>

        {/* Prewed Movie Poster Section */}
        <section className="bg-white dark:bg-black text-black dark:text-white px-4 py-20">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">🎬 Prewed Movie Posters</h2>
            <p className="text-center text-gray-700 dark:text-gray-300 mb-10 text-sm md:text-base">
            Foto-foto prewedding kami dengan sentuhan poster film favorit 🎥✨
            </p>

            {/* Responsive Grid */}
            <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 justify-center">
            {[
                {   img: "/AdaApaDenganCinta.png", label: "Groom's Favorite" },
                { img: "/CrashLandingOnYou.png", label: "Romantice" },
                { img: "/DDTheExplorer.png", label: "TOP 10" },
                { img: "/KeluargaCemara.png", label: "TOP 1" },
                { img: "/ReadyOrNot.png", label: "Our Favorite " },
                { img: "/Renang-RenangKetepian.png", label: " Family" },
                { img: "/TheProposal.jpg", label: "Wedding" },
                { img: "/PernikahanDini.png", label: "TOP 5" },
                { img: "/LaLaLand.png", label: "Bride's Favorite" },
                { img: "/NantiKitaCeritaHariIni.png", label: "Bride's Favorite" },
            ].map((item, idx) => (
                <div
                key={idx}
                className="relative rounded-xl overflow-hidden shadow-md hover:scale-[1.03] transition-transform duration-300"
                >
                <img
                    src={item.img}
                    alt={item.label || `Poster ${idx + 1}`}
                    className="w-full h-auto object-cover aspect-[2/3]"
                />
                {item.label && (
                    <span className="absolute bottom-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow">
                    {item.label}
                    </span>
                )}
                </div>
            ))}
            </motion.div>
        </div>
        </section>

        {/* Episode Timeline */}
        <section className="bg-white dark:bg-black text-black dark:text-white px-6 py-20">
  <h2 className="text-3xl font-bold text-center mb-10">📺 Episode Timeline</h2>
  <div className="grid gap-6 md:grid-cols-3">
    {[
      {
        title: "🎬 Episode 1: Akad",
        date: "Minggu, 21 September 2025",
        time: "Pukul 10:00 WIB",
        place: "Plataran Dharmawangsa, Jakarta",
        image: "/akad.png", // ganti ke image kamu
      },
      {
        title: "🎉 Episode 2: Resepsi",
        date: "Minggu, 21 September 2025",
        time: "Pukul 11:30 WIB",
        place: "Plataran Dharmawangsa, Jakarta",
        image: "/resepsi.png", // ganti ke image kamu
      },
      {
        title: "📺 Episode 3: Live Streaming",
        date: "Tonton dari mana saja",
        time: "YouTube & Zoom Link (segera)",
        place: "",
        image: "/livestreaming.png", // ganti ke image kamu
      },
    ].map((ep, i) => (
      <div
        key={i}
        className="relative rounded-xl overflow-hidden group h-64 shadow-lg"
      >
        <img
          src={ep.image}
          alt={ep.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black bg-opacity-60 p-6 flex flex-col justify-end transition duration-300">
          <h3 className="text-lg font-bold mb-1">{ep.title}</h3>
          <p className="text-sm text-gray-300">{ep.date}</p>
          <p className="text-sm text-gray-400">{ep.time}</p>
          {ep.place && <p className="text-sm text-gray-400">{ep.place}</p>}
        </div>
      </div>
    ))}
  </div>
        </section>

         {/* Confirmation Section */}
        <section className="bg-white dark:bg-black text-black dark:text-white px-6 py-20">
        <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">📝 Konfirmasi Kehadiran</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
            Kami sangat berharap kehadiranmu di hari bahagia kami. Silakan isi form konfirmasi kehadiran berikut:
            </p>
            <a
            href="http://localhost:5173/guest-form" // GANTI DENGAN LINK FORM KAMU
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full text-lg shadow-lg transition"
            >
            Isi Form Kehadiran Dan Buat Ticket QR 
            </a>
        </div>
        </section>

        {/* Save the Date Section */}
        <section className="bg-white dark:bg-black text-black dark:text-white px-6 py-20">
  <div className="max-w-3xl mx-auto text-center">
    <h2 className="text-2xl md:text-3xl font-bold mb-6">📅 Save the Date</h2>
    <p className="mb-4 text-gray-700 dark:text-gray-300">
      Jangan lupa simpan tanggal pernikahan kami di kalender kamu, ya!
    </p>
    <a
      href="https://www.google.com/calendar/render?action=TEMPLATE&text=Akad+Pernikahan+Dito+%26+Dini&dates=20250921T030000Z/20250921T050000Z&details=Acara+Akad+Pernikahan+Andhito+dan+Dini+di+Plataran+Dharmawangsa&location=Plataran+Dharmawangsa,+Jakarta&sf=true&output=xml"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full text-lg transition"
    >
      Tambahkan ke Google Calendar
    </a>
  </div>
        </section>

        {/* Wish for the Couple */}
        <section className="bg-white dark:bg-black text-black dark:text-white px-4 py-20">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">💌 Wish for the Couple</h2>
              <div className="flex items-start gap-3 mb-8">
                <div className="text-2xl">😀</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">{guestName || "Tamu"}</p>
                  <textarea
                    value={wishInput}
                    onChange={(e) => setWishInput(e.target.value)}
                    placeholder="Tulis doa terbaik kamu di sini..."
                    className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-black dark:text-white"
                    rows={3}
                  />
                  <button
                    onClick={handleSubmitWish}
                    disabled={!wishInput.trim()}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:bg-gray-400"
                  >
                    Kirim Doa
                  </button>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                {currentWishes.map((wish, idx) => (
                  <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }} 
                  className="flex items-start gap-3"
                  >
                    <div className="text-2xl">{wish.emoji}</div>
                    <div>
                      <p className="font-semibold">{wish.name}</p>
                      <p className="text-gray-700 dark:text-gray-300">{wish.message}</p>
                    </div>
                  </motion.div>
                ))}

                
                {/* pagination wishe */}
                <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                        currentPage === i + 1
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-black dark:text-white'
                    }`}
                    >
                    {i + 1}
                    </button>
                ))}
                </div>
              </div>
            </div>
        </section>

        {/* 🎞️ Credit Scene */}
       <section className="bg-white dark:bg-black text-black dark:text-white py-20 overflow-hidden">
  <div className="w-full flex justify-center">
    <div className="w-full max-w-xl text-center">
      <h2 className="text-3xl font-bold mb-6">🎬 Cast & Crew</h2>

      <div className="relative h-72 md:h-96 overflow-hidden">
        <div
          className="absolute animate-credit-scroll text-base md:text-lg leading-loose space-y-2 w-full"
          style={{ animationDuration: "40s" }}
        >
          <p>👰🏻‍♀️ Bride: <strong>Dini Amanda</strong></p>
          <p>🤵🏻 Groom: <strong>Andhito Prakoso</strong></p>
          <p>🎥 Videographer: <strong>@cinematic.id</strong></p>
          <p>📸 Photographer: <strong>@dokumentasi.hariini</strong></p>
          <p>🪄 Wedding Organizer: <strong>@wo_specialday</strong></p>
          <p>👗 Makeup Artist: <strong>@muabrideglow</strong></p>
          <p>🎶 Music: <strong>@soundoflove</strong></p>
          <p>🌷 Dekorasi: <strong>@dekor.lavie</strong></p>
          <p>🍽️ Catering: <strong>@tasteandjoy</strong></p>

          <br />
          <p className="text-yellow-400 font-bold text-xl">✨ Special Thanks To</p>
          <p>👨‍👩‍👧 Keluarga Besar Dito & Dini</p>
          <p>🫶 Sahabat Sejati</p>
          <p>🎉 Seluruh Tamu Undangan</p>
          <p>🙏 Yang sudah mendoakan</p>

          <br />
          <p className="text-sm italic text-gray-400">NIKAHFIX Productions – All Rights Reserved</p>
        </div>
      </div>
    </div>
  </div>

  <style jsx>{`
    @keyframes credit-scroll {
      0% {
        transform: translateY(100%);
      }
      100% {
        transform: translateY(-100%);
      }
    }
    .animate-credit-scroll {
      animation-name: credit-scroll;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  `}</style>
       </section>

        {/* Jika tidak bisa hadir */}
       {/* <section className="bg-white dark:bg-black text-black dark:text-white py-16 px-6">
  <div className="max-w-xl mx-auto text-center">
    <h2 className="text-3xl font-bold mb-4">🎁 Tidak Bisa Hadir</h2>
    <p className="text-gray-600 dark:text-gray-300 mb-6">
      Jika Tidak Bisa Hadir Anda Bisa Transfer Ke Rekening Kami Dan Membuat Pesan Konfirmasi 💝
    </p>

    <img
      src="/qris.png" // Ganti dengan QRIS-mu
      alt="QR Code"
      className="w-60 mx-auto mb-4 border shadow-md rounded-lg"
    />

    <p className="text-sm mb-6 text-gray-500 dark:text-gray-400">
      Atas nama: <strong>Andhito Prakoso</strong> <br />
      Bank: BCA / eWallet lainnya
    </p>

    <div className="mb-4">
      <textarea
        placeholder="Tulis pesan/ucapanmu di sini..."
        className="w-full p-3 rounded-md border dark:border-gray-600 dark:bg-gray-800"
        rows={3}
      />
    </div>

    <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full transition">
      ✅ Saya sudah transfer
    </button>
  </div>
</section> */}



        



        </>
      )}

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
      `}</style>
    </div>
  );
}
