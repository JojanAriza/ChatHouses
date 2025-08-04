import { BrowserRouter, Route, Routes } from "react-router";
import Index from "./views";
import Arrendatario from "./views/Arrendatario";
import Arrendador from "./views/Arrendador";

export default function Router() {
  return (
          <BrowserRouter>
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/arrendatario" element={<Arrendatario />} />
                <Route path="/arrendador" element={<Arrendador />} />
            </Routes>
          </BrowserRouter>
  )
}