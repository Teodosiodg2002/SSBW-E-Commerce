import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.tsx';
import Portada from './pages/Portada.tsx';
import Tarea9 from './pages/Tarea9.tsx';
import Carrusel from './pages/Carrusel.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Portada />} />
          <Route path="tarea-9" element={<Tarea9 />} />
          <Route path="carrusel" element={<Carrusel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
