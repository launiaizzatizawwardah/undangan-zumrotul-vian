import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GuestForm from "./components/GuestForm";
import QRScanner from "./components/QRScanner";
import Attendance from "./components/Attendance";
import TheWedding from "./components/TheWedding";
import ManualGuestForm from "./components/ManualGuestForm";
// import Website from "./components/Website";
import AttendanceVIP from "./components/AttendanceVIP"; // ganti path sesuai struktur Anda
import useLocalStorage from "./components/useLocalStorage"; // ganti path sesuai struktur Anda

function App() {
  const [attendees, setAttendees] = useLocalStorage("attendees", []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<TheWedding />} />
        <Route
          path="/QRScanner"
          element={<QRScanner setAttendees={setAttendees} attendees={attendees} />}
        />
        <Route path="/guest-Form" element={<GuestForm />} />
        <Route
          path="/attendance"
          element={<Attendance attendees={attendees} setAttendees={setAttendees} />}
        />
        <Route path="/manualGuestForm" element={<ManualGuestForm />} />
        {/* <Route path="/TheWedding" element={<TheWedding />} /> */}
        {/* <Route path="/contoh" element={<Website />} /> */}
        <Route path="attendancevip" element={<AttendanceVIP />} />
      </Routes>
    </Router>
  );
}

export default App;
