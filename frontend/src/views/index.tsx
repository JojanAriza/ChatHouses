import React, { useState, useEffect, useRef, type ReactNode } from "react";
import Carousel from "../components/Carousel";
import Navbar from "../components/Navbar";
import SellingOptionsCard from "../components/SellingOptionsCard";
import { useNavigate } from "react-router";

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

// Componente de animación mejorado
interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  delay = 0,
  direction = 'up'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref);

  const getTransformClass = () => {
    const baseClass = "transition-all duration-1000 ease-out";
    if (isVisible) return `${baseClass} opacity-100 translate-x-0 translate-y-0 scale-100`;
    
    switch (direction) {
      case 'up': return `${baseClass} opacity-0 translate-y-8 scale-95`;
      case 'down': return `${baseClass} opacity-0 -translate-y-8 scale-95`;
      case 'left': return `${baseClass} opacity-0 translate-x-8 scale-95`;
      case 'right': return `${baseClass} opacity-0 -translate-x-8 scale-95`;
      default: return `${baseClass} opacity-0 translate-y-8 scale-95`;
    }
  };

  return (
    <div
      ref={ref}
      className={`${getTransformClass()} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

function Index() {
  const navigate = useNavigate()
  return (
    <>
      <Navbar />
      {/* Main Content */}
      <main className="relative z-10 overflow-hidden">
        {/* Hero Section Rediseñado con colores fríos */}
        <AnimatedSection>
          <section className="relative h-[100vh] flex items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-300 rounded-full blur-3xl"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-20 text-center px-6 max-w-6xl mx-auto">
              <AnimatedSection delay={200} direction="down">
                <span className="inline-block px-6 py-3 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full text-sm font-semibold mb-8 shadow-2xl">
                  ✨ Tu hogar ideal te espera
                </span>
              </AnimatedSection>

              <AnimatedSection delay={400}>
                <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight tracking-tight">
                  Encuentra la casa
                  <br />
                  que{" "}
                  <span className="relative">
                    <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                      buscas
                    </span>
                    <div className="absolute -inset-2 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-2xl blur-xl"></div>
                  </span>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={600}>
                <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-4xl mx-auto leading-relaxed font-light">
                  Descubre propiedades únicas en las mejores ubicaciones, cada una
                  seleccionada especialmente para ti con tecnología de vanguardia
                </p>
              </AnimatedSection>

              <AnimatedSection delay={800}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button className="group px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-1 transition-all duration-300 hover:scale-105" onClick={() => navigate('/arrendatario')}>
                    <span className="flex items-center gap-2">
                      Explorar Propiedades
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </button>
                </div>
              </AnimatedSection>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
                <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Featured Properties Section */}
        <AnimatedSection delay={200}>
          <section className="py-24 px-6 bg-gradient-to-br from-slate-50 to-blue-50 relative">
            {/* Patrón de fondo sutil */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59, 130, 246) 1px, transparent 0)`,
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            <div className="max-w-7xl mx-auto relative">
              <div className="text-center mb-20">
                <AnimatedSection delay={300} direction="down">
                  <span className="text-blue-600 font-bold text-sm uppercase tracking-widest bg-blue-100 px-4 py-2 rounded-full">
                    Propiedades Destacadas
                  </span>
                </AnimatedSection>
                <AnimatedSection delay={400}>
                  <h2 className="text-5xl md:text-6xl font-black text-slate-800 mb-6 mt-4 bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text">
                    Nuestras Mejores Selecciones
                  </h2>
                </AnimatedSection>
                <AnimatedSection delay={500}>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                    Cada propiedad es cuidadosamente seleccionada para ofrecerte
                    lo mejor en diseño, ubicación y tecnología
                  </p>
                </AnimatedSection>
              </div>

              <AnimatedSection delay={600}>
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-blue-100 hover:shadow-blue-500/10 transition-all duration-500">
                  <Carousel />
                </div>
              </AnimatedSection>
            </div>
          </section>
        </AnimatedSection>

        {/* Services Section */}
        <AnimatedSection delay={400}>
          <section className="py-24 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Efectos de fondo */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
              <div className="text-center mb-20">
                <AnimatedSection delay={500} direction="down">
                  <span className="text-cyan-400 font-bold text-sm uppercase tracking-widest bg-cyan-400/10 px-4 py-2 rounded-full border border-cyan-400/20">
                    Nuestros Servicios
                  </span>
                </AnimatedSection>
                <AnimatedSection delay={600}>
                  <h2 className="text-5xl md:text-6xl font-black text-white mb-6 mt-4">
                    Tu Éxito es Nuestro{" "}
                    <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                      Objetivo
                    </span>
                  </h2>
                </AnimatedSection>
                <AnimatedSection delay={700}>
                  <p className="text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
                    Servicios integrales para hacer realidad tus sueños
                    inmobiliarios con la última tecnología
                  </p>
                </AnimatedSection>
              </div>

              <AnimatedSection delay={800}>
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/10 hover:border-cyan-400/20 transition-all duration-500">
                  <SellingOptionsCard />
                </div>
              </AnimatedSection>
            </div>
          </section>
        </AnimatedSection>

        {/* Why Choose Us Section */}
        <AnimatedSection delay={600}>
          <section className="py-24 px-6 bg-gradient-to-br from-white via-blue-50 to-cyan-50">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                <AnimatedSection delay={700} direction="down">
                  <span className="text-blue-600 font-bold text-sm uppercase tracking-widest bg-blue-100 px-4 py-2 rounded-full">
                    ¿Por qué nosotros?
                  </span>
                </AnimatedSection>
                <AnimatedSection delay={800}>
                  <h2 className="text-5xl md:text-6xl font-black text-slate-800 mb-6 mt-4 bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text">
                    Experiencia que Marca la Diferencia
                  </h2>
                </AnimatedSection>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <AnimatedSection delay={900} direction="left">
                  <div className="group text-center p-10 bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-blue-100 hover:border-blue-200">
                    <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <svg
                        className="w-12 h-12 text-white relative z-10"
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
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">
                      Propiedades Certificadas
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Verificación completa y documentación legal garantizada con tecnología blockchain
                    </p>
                  </div>
                </AnimatedSection>

                <AnimatedSection delay={1000}>
                  <div className="group text-center p-10 bg-gradient-to-br from-white to-emerald-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-emerald-100 hover:border-emerald-200">
                    <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <svg
                        className="w-12 h-12 text-white relative z-10"
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
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">
                      Mejor Inversión
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Análisis de mercado con IA y rentabilidad garantizada
                    </p>
                  </div>
                </AnimatedSection>

                <AnimatedSection delay={1100} direction="right">
                  <div className="group text-center p-10 bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-purple-100 hover:border-purple-200">
                    <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                      <svg
                        className="w-12 h-12 text-white relative z-10"
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
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">
                      Atención Personalizada
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Acompañamiento completo durante todo el proceso con soporte 24/7
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {/* Call to Action */}
        <AnimatedSection delay={800}>
          <section className="py-24 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
            {/* Efectos de fondo animados */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            
            <div className="relative z-10 max-w-5xl mx-auto text-center">
              <AnimatedSection delay={900}>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">
                  Tu Nuevo Hogar te Está{" "}
                  <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
                    Esperando
                  </span>
                </h2>
              </AnimatedSection>
              
              <AnimatedSection delay={1000}>
                <p className="text-xl text-blue-200 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Déjanos ayudarte a encontrar la propiedad perfecta para ti y tu
                  familia con nuestra tecnología de vanguardia
                </p>
              </AnimatedSection>

              <AnimatedSection delay={1100}>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <button className="group px-10 py-5 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-cyan-500/30 transform hover:-translate-y-2 transition-all duration-300 hover:scale-105" onClick={() => navigate('/arrendatario')}>
                    <span className="flex items-center gap-3">
                      Comienza Ahora
                      <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </button>
                </div>
              </AnimatedSection>
            </div>
          </section>
        </AnimatedSection>
      </main>
    </>
  );
}

export default Index;