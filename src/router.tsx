import { BrowserRouter, Route, Routes } from "react-router";
import Index from "./views";
import Arrendatario from "./views/Arrendatario";

export default function Router() {
  return (
          <BrowserRouter>
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/arrendatario" element={<Arrendatario />} />
            </Routes>
          </BrowserRouter>
  )
}