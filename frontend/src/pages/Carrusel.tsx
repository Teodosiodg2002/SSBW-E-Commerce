import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { useProductList } from '../hooks/useProducts';
import { Producto } from '../types';

const Carrusel = () => {
  const { productos, error, isLoading } = useProductList(10);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || productos.length === 0) {
    return (
      <div className="alert alert-error max-w-lg mx-auto mt-10 shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>Error al cargar las imágenes del carrusel. Asegúrate de que el servidor (puerto 3000) esté corriendo.</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-center mb-8 text-primary font-montserrat">
        Galería Destacada
      </h2>
      
      <div className="relative">
        {/* Carrusel Embla */}
        <div className="overflow-hidden rounded-3xl shadow-2xl bg-base-100" ref={emblaRef}>
          <div className="flex touch-pan-y flex-row h-96">
            {productos.map((prod: Producto) => (
              <div 
                key={prod.id} 
                className="flex-[0_0_100%] min-w-0 relative flex justify-center items-center p-8 bg-base-200"
              >
                <img 
                  src={`http://localhost:3000/public/imagenes/${prod.imagen}`} 
                  alt={prod.titulo} 
                  className="max-h-full max-w-full object-contain rounded-xl shadow-md transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <div className="inline-block bg-base-100/90 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg border border-base-300">
                    <p className="font-semibold text-base-content truncate max-w-xs">{prod.titulo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de Navegación */}
        <button 
          onClick={scrollPrev} 
          className="btn btn-circle btn-primary absolute left-[-20px] top-1/2 -translate-y-1/2 shadow-lg hidden sm:flex"
        >
          ❮
        </button>
        <button 
          onClick={scrollNext} 
          className="btn btn-circle btn-primary absolute right-[-20px] top-1/2 -translate-y-1/2 shadow-lg hidden sm:flex"
        >
          ❯
        </button>
      </div>

      {/* Indicadores (Dots) */}
      <div className="flex justify-center gap-2 mt-6">
        {productos.map((_: Producto, index: number) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === selectedIndex ? 'bg-primary scale-125' : 'bg-base-300 hover:bg-base-content/50'
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Ir a la diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carrusel;
