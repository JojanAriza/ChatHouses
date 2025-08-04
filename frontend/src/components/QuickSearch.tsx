import { Home, Search } from "lucide-react";

type QuickSearchProps = {
    handleQuickSearch: (searchText: string) => void
}

export default function QuickSearch({handleQuickSearch} : QuickSearchProps) {
      const quickSearchButtons = [
    { text: "Casas con 2 piezas", icon: <Home className="w-4 h-4" /> },
    { text: "Casas con garage", icon: <Search className="w-4 h-4" /> },
    { text: "Casas amobladas", icon: <Home className="w-4 h-4" /> },
    { text: "Casas cerca del hospital", icon: <Search className="w-4 h-4" /> },
  ];
  return (
          <div className="px-6 py-4 bg-black/10 backdrop-blur-sm border-b border-blue-500/10">
        <p className="text-blue-300 text-sm mb-2">Búsquedas rápidas:</p>
        <div className="flex flex-wrap gap-2">
          {quickSearchButtons.map((button, index) => (
            <button
              key={index}
              onClick={() => handleQuickSearch(button.text)}
              className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-sm transition-colors"
            >
              {button.icon}
              <span>{button.text}</span>
            </button>
          ))}
        </div>
      </div>
  )
}