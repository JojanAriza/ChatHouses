// import { useQuery } from '@tanstack/react-query';
// import { getCasas } from './services/arcGisApi';
import Carousel from "../components/Carousel";
import Navbar from "../components/Navbar";
import SellingOptionsCard from "../components/SellingOptionsCard";
import VideoBackground from "../components/VideoBackground";

function index() {
 
  return (
    <>
    <VideoBackground />
      <Navbar />
      <main className="p-6 text-center flex flex-col items-center gap-10">
        <Carousel />
        <SellingOptionsCard />
      </main>
    </>
  );
}

export default index;
