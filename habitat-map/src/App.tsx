
import './App.css'

import { Route, Routes, Navigate } from "react-router-dom";
import { MapView } from "./MapView";
import { About } from "./About";

function App() {
  return (
    <div className="h-full w-full">
      <Routes>
        <Route path="/" element={<Navigate to="/map" replace />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<div className="p-6">Not found</div>} />
      </Routes>
    </div>
  )
}

export default App
