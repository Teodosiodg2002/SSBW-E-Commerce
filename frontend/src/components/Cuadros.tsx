import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Cuadros = () => {
  const url = 'http://localhost:3000/api/productos/random';
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  const Recarga = () => { mutate(); };

  return (
    <div className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-3xl shadow-lg bg-white max-w-sm">
      <h3 className="text-xl font-bold mb-4 text-emerald-700 font-montserrat">Galeria de Tienda Prado</h3>
      <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-2xl overflow-hidden mb-4">
        {isLoading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        ) : error ? (
          <div className="text-red-500 text-center px-4">Error al cargar la imagen. ¿Está el servidor activo?</div>
        ) : (
          <img 
            src={`http://localhost:3000/public/imagenes/${data.imagen}`} 
            alt={data.titulo} 
            className="object-contain w-full h-full p-2" 
          />
        )}
      </div>
      {data && <p className="text-sm text-gray-600 mb-4 text-center line-clamp-1">{data.titulo}</p>}
      <button 
        onClick={Recarga} 
        className="font-bold cursor-pointer bg-emerald-500 p-4 rounded-2xl hover:bg-emerald-600 text-white transition-colors"
      >
        ¡Otro! <span> 🎨 </span>
      </button>
    </div>
  );
};

export default Cuadros;
