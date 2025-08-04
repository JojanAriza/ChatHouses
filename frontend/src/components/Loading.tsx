import { Bot, Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-md text-white border border-blue-500/20 rounded-2xl px-4 py-3 max-w-[80%]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Procesando...</span>
                </div>
              </div>
            </div>
          </div>
  )
}