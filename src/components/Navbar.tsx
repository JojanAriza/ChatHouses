// src/components/Navbar.tsx
import { FaHome } from "react-icons/fa";
import { useNavigate } from "react-router";

export default function Navbar() {
  const navigate = useNavigate()
  return (
    <nav className="h-[100px] px-6 py-4 flex justify-around items-center">
      {/* Lado izquierdo - ícono */}
      <div className="flex items-center gap-2">
        <FaHome className="text-blue-600 text-2xl" />
        <span className="font-bold text-lg text-gray-800">Mi Vivienda</span>
      </div>

      {/* Lado derecho - botones */}
      <div className="flex gap-4">
        <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer" onClick={() => navigate('/arrendatario')}>
          Arrendatario
        </button>
        <button className="px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition cursor-pointer" >
          Arrendador
        </button>
      </div>
    </nav>
  );
}
