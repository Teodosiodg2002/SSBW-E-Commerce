import { useRandomProduct } from '../hooks/useProducts';

const Cuadros = () => {
  const { producto, error, isLoading, recargar } = useRandomProduct();

  return (
    <div className="flex flex-col items-center p-6 border-2 border-base-200 rounded-3xl shadow-lg bg-base-100 max-w-sm">
      <h3 className="text-xl font-bold mb-4 text-primary font-montserrat">Galeria de Tienda Prado</h3>
      <div className="w-64 h-64 flex items-center justify-center bg-base-200 rounded-2xl overflow-hidden mb-4">
        {isLoading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        ) : error ? (
          <div className="text-error text-center px-4">Error al cargar la imagen. ¿Está el servidor activo?</div>
        ) : producto ? (
          <img 
            src={`http://localhost:3000/public/imagenes/${producto.imagen}`} 
            alt={producto.titulo} 
            className="object-contain w-full h-full p-2" 
          />
        ) : null}
      </div>
      {producto && <p className="text-sm text-base-content/70 mb-4 text-center line-clamp-1">{producto.titulo}</p>}
      <button 
        onClick={recargar} 
        className="btn btn-primary"
      >
        ¡Otro! <span> 🎨 </span>
      </button>
    </div>
  );
};

export default Cuadros;
