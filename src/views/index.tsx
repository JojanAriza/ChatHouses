import React, { useState, useEffect, useRef, type ReactNode } from "react";
import Carousel from "../components/Carousel";
import Navbar from "../components/Navbar";
import SellingOptionsCard from "../components/SellingOptionsCard";

// Hook para detectar cuando un elemento entra en el viewport
const useIntersectionObserver = (
  ref: React.RefObject<HTMLDivElement | null>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1, ...options }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]);

  return isIntersecting;
};

// Componente de animación
interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  delay = 0,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

function Index() {
  return (
    <>
      <Navbar />
      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section Rediseñado */}
        <AnimatedSection>
          <section className="relative h-[90vh] flex items-center justify-center bg-gradient-to-br from-amber-400 via-orange-300 to-yellow-200">
            {/* Hero Content */}
            <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
              <span className="inline-block px-4 py-2 bg-white/80 text-amber-800 rounded-full text-sm font-medium mb-6 shadow">
                Tu hogar ideal te espera
              </span>

              <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 leading-tight">
                Encuentra la casa
                <br />
                que{" "}
                <span className="text-white relative bg-amber-500 px-2 py-1 rounded-lg shadow-md">
                  buscas
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                Descubre propiedades únicas en las mejores ubicaciones, cada una
                seleccionada especialmente para ti
              </p>
            </div>
          </section>
        </AnimatedSection>

        {/* Featured Properties Section */}
        <AnimatedSection delay={200}>
          <section className="py-20 px-6 bg-slate-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-amber-500 font-semibold text-sm uppercase tracking-wide">
                  Propiedades Destacadas
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 mt-2">
                  Nuestras Mejores Selecciones
                </h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                  Cada propiedad es cuidadosamente seleccionada para ofrecerte
                  lo mejor
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <Carousel />
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Services Section */}
        <AnimatedSection delay={400}>
          <section className="py-20 px-6 bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-amber-400 font-semibold text-sm uppercase tracking-wide">
                  Nuestros Servicios
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 mt-2">
                  Tu Éxito es Nuestro Objetivo
                </h2>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                  Servicios integrales para hacer realidad tus sueños
                  inmobiliarios
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
                <SellingOptionsCard />
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Why Choose Us Section */}
        <AnimatedSection delay={600}>
          <section className="py-20 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-amber-500 font-semibold text-sm uppercase tracking-wide">
                  ¿Por qué nosotros?
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 mt-2">
                  Experiencia que Marca la Diferencia
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="group text-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Propiedades Certificadas
                  </h3>
                  <p className="text-slate-600">
                    Verificación completa y documentación legal garantizada
                  </p>
                </div>

                <div className="group text-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Mejor Inversión
                  </h3>
                  <p className="text-slate-600">
                    Análisis de mercado y rentabilidad garantizada
                  </p>
                </div>

                <div className="group text-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Atención Personalizada
                  </h3>
                  <p className="text-slate-600">
                    Acompañamiento completo durante todo el proceso
                  </p>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Call to Action */}
        <AnimatedSection delay={800}>
          <section className="py-20 px-6 bg-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800 opacity-90"></div>
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Tu Nuevo Hogar te Está Esperando
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Déjanos ayudarte a encontrar la propiedad perfecta para ti y tu
                familia
              </p>
            </div>
          </section>
        </AnimatedSection>
      </main>
    </>
  );
}

export default Index;
