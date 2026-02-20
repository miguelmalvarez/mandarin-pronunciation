import { Routes, Route } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { PracticePage } from "./pages/PracticePage";
import { TonePracticePage } from "./pages/TonePracticePage";

function App() {
  return (
    <div className="app">
      <NavBar />
      <Routes>
        <Route path="/" element={<PracticePage />} />
        <Route path="/tones" element={<TonePracticePage />} />
      </Routes>
    </div>
  );
}

export default App;
