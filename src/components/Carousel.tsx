// src/components/Carousel.tsx
import Slider from "react-slick";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const slides = [
  {
    title: "Compra tu nuevo hogar",
    subtitle: "Tu inversión comienza aquí",
    description:
      "Encuentra las mejores oportunidades para comprar casas o apartamentos con asesoría personalizada y segura.",
    image: "/img/compra.jpg",
  },
  {
    title: "Vende tu propiedad fácil y rápido",
    subtitle: "Anúnciate sin complicaciones",
    description:
      "Publica tu casa o apartamento y llega a cientos de interesados. Te ayudamos a cerrar el trato ideal.",
    image: "/img/venta.jpg", 
  },
  {
    title: "Arrienda sin estrés",
    subtitle: "Tu espacio disponible, sin vacíos",
    description:
      "Publica tu propiedad para arriendo y nosotros nos encargamos de mostrarla a quienes buscan un nuevo lugar para vivir.",
    image: "/img/arrendamiento.jpg", 
  }
];


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function NextArrow(props: any) {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      className="absolute top-1/2 right-2 z-10 transform -translate-y-1/2 cursor-pointer bg-green-200 rounded-full p-2 hover:bg-green-300"
    >
      <FaChevronRight />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PrevArrow(props: any) {
  const { onClick } = props;
  return (
    <div
      onClick={onClick}
      className="absolute top-1/2 left-2 z-10 transform -translate-y-1/2 cursor-pointer bg-green-200 rounded-full p-2 hover:bg-green-300"
    >
      <FaChevronLeft />
    </div>
  );
}

export default function Carousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true, // 👈 Autoplay activado
    autoplaySpeed: 3000, // 4 segundos
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
  };

  return (
    <div className="max-w-6xl mx-auto relative">
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index}>
            <div className="flex flex-col md:flex-row items-center justify-between bg-gray-50 p-8 md:px-16 rounded-lg shadow gap-8">
              {/* Texto */}
              <div className="md:w-1/2 text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-800">
                  {slide.title}
                </h2>
                <h3 className="text-xl text-gray-500 mt-2">{slide.subtitle}</h3>
                <p className="mt-4 text-gray-600">{slide.description}</p>
              </div>

              {/* Imagen */}
              <div className="md:w-1/2 flex justify-center mt-6 md:mt-0">
                <img src={slide.image} alt={slide.title} className="h-64" />
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
