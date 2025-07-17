import { Bot } from "lucide-react";

export default function Header() {
  return (
    <div className="bg-black/20 backdrop-blur-md border-b border-blue-500/20 px-6 py-4 flex items-center space-x-3">
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
  );
}
