import { Bot, LogOut } from "lucide-react";
import { useNavigate } from "react-router";

export default function Header() {
  const navigate = useNavigate();
  return (
    <div className="bg-black/20 backdrop-blur-md border-b border-blue-500/20 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Asistente de Casas IA</h1>
          <p className="text-blue-300 text-sm">
            Encuentra tu hogar ideal con ayuda de IA
          </p>
        </div>
      </div>
      
      <button 
        onClick={() => navigate("/")} 
        className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 hover:text-red-200 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Salir</span>
      </button>
    </div>
  );
}