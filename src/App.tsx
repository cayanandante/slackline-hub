import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PhysicsCalculator from "./pages/PhysicsCalculator";
import KnowledgeLibrary from "./pages/KnowledgeLibrary";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/tools/physics" element={<PhysicsCalculator />} />
        <Route path="/knowledge" element={<KnowledgeLibrary />} />
      </Routes>
    </BrowserRouter>
  );
}