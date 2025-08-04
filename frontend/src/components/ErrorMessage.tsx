import { AlertCircle } from "lucide-react";

export default function ErrorMessage({error}: {error: string | null}) {
  return (
    <div className="flex justify-start">
            <div className="bg-red-500/20 backdrop-blur-md text-red-200 border border-red-500/20 rounded-2xl px-4 py-3 max-w-[80%]">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          </div>
  )
}