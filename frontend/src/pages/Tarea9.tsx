import Perritos from '../components/Perritos.tsx';
import Cuadros from '../components/Cuadros.tsx';

const Tarea9 = () => {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-center justify-center min-h-[70vh]">
      <Perritos />
      <Cuadros />
    </div>
  );
};

export default Tarea9;
