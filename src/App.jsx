import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GuestForm from "./components/GuestForm";
import QRScanner from "./components/QRScanner";
import Attendance from "./components/Attendance";
import NetflixWedding from "./components/NetflixWedding";
import ManualGuestForm from "./components/ManualGuestForm";
import useLocalStorage from "./components/useLocalStorage"; // ganti path sesuai struktur Anda

function App() {
  const [attendees, setAttendees] = useLocalStorage("attendees", []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<QRScanner setAttendees={setAttendees} attendees={attendees} />}
        />
        <Route path="/guest-Form" element={<GuestForm />} />
        <Route
          path="/attendance"
          element={<Attendance attendees={attendees} setAttendees={setAttendees} />}
        />
        <Route path="/manualGuestForm" element={<ManualGuestForm />} />
        <Route path="/NetflixWedding" element={<NetflixWedding />} />
      </Routes>
    </Router>
  );
}

export default App;
