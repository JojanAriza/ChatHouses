// src/components/SellingOptionsWithImage.tsx
import { motion } from "framer-motion";
import { FaHome, FaHandshake, FaKey } from "react-icons/fa";

const services = [
  {
    icon: <FaHome className="text-white text-xl" />,
    title: "Compra de Vivienda",
    description: "Encuentra y adquiere tu hogar ideal con asesoría profesional.",
  },
  {
    icon: <FaHandshake className="text-white text-xl" />,
    title: "Venta de Propiedades",
    description: "Publica y vende tu casa o apartamento de forma rápida y segura.",
  },
  {
    icon: <FaKey className="text-white text-xl" />,
    title: "Arriendo de Inmuebles",
    description: "Arrienda tu propiedad o encuentra un espacio perfecto para vivir.",
  },
];

export default function SellingOptionsWithImage() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 bg-white p-8 rounded-2xl shadow-md max-w-6xl mx-auto">
      
      {/* Imagen */}
      <motion.img
        src="/img/real-estate.jpg" 
        alt="Real Estate"
        className="w-full md:w-1/2 max-h-[400px] object-contain rounded-lg"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Tarjeta */}
      <div className="bg-blue-50 p-6 rounded-2xl w-full md:w-1/2">
        <h2 className="text-2xl font-bold text-gray-800">
          Encuentra la opción ideal para tu propiedad
        </h2>

        <div className="mt-6 flex flex-col gap-4">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.2 }}
              className="flex items-center gap-4"
            >
              <div className="bg-blue-400 p-3 rounded-full shadow-md">
                {service.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{service.title}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
