import { Outlet, NavLink } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-base-200 font-montserrat">
      {/* Navbar con DaisyUI */}
      <div className="navbar bg-base-100 shadow-md mb-8 px-4 sm:px-8">
        <div className="flex-1">
          <span className="text-xl font-bold text-primary">Tienda Prado</span>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1 gap-2">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => isActive ? "active bg-primary text-primary-content" : ""}
              >
                Portada
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/tarea-9"
                className={({ isActive }) => isActive ? "active bg-primary text-primary-content" : ""}
              >
                Galería (SWR)
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/carrusel"
                className={({ isActive }) => isActive ? "active bg-primary text-primary-content" : ""}
              >
                Carrusel
              </NavLink>
            </li>
          </ul>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
