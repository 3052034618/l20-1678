import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { Works } from "@/pages/Works";
import { Feed } from "@/pages/Feed";
import { Urge } from "@/pages/Urge";
import { Celebrate } from "@/pages/Celebrate";
import { NavBar } from "@/components/NavBar";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/works" element={<Works />} />
          <Route path="/feed/:workId" element={<Feed />} />
          <Route path="/urge/:workId" element={<Urge />} />
          <Route path="/celebrate/:workId" element={<Celebrate />} />
        </Routes>
        <NavBar />
      </div>
    </Router>
  );
}
