const Portada = () => {
  return (
    <div className="hero min-h-[70vh] bg-base-200 rounded-3xl overflow-hidden shadow-xl">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-primary">Tienda Prado</h1>
          <p className="py-6 text-base-content/80">
            Bienvenido a la nueva interfaz de la Tienda del Museo del Prado, 
            construida con React, Vite, Tailwind CSS y DaisyUI. Explora nuestras 
            secciones para ver las diferentes implementaciones.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/tarea-9" className="btn btn-primary">Ver Galería (Tarea 9)</a>
            <a href="/carrusel" className="btn btn-outline btn-secondary">Ver Carrusel</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portada;
