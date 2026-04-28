import Perritos from './components/Perritos.tsx'
import Cuadros from './components/Cuadros.tsx'

function App() {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-center justify-center min-h-screen bg-gray-50 font-montserrat">
      <Perritos />
      <Cuadros />
    </div>
  )
}

export default App
