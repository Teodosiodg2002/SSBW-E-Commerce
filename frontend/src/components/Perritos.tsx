import { useState, useEffect } from 'react';

const Perritos = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDog = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://dog.ceo/api/breeds/image/random');
      const data = await response.json();
      setImageUrl(data.message);
    } catch (error) {
      console.error('Error fetching dog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDog();
  }, []);

  return (
    <div className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-3xl shadow-lg bg-white max-w-sm">
      <h2 className="text-xl font-bold mb-4 text-blue-600">Perrito Aleatorio</h2>
      <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-2xl overflow-hidden mb-4">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        ) : (
          <img src={imageUrl!} alt="Perrito" className="object-cover w-full h-full" />
        )}
      </div>
      <button 
        onClick={fetchDog}
        className="font-bold cursor-pointer bg-blue-500 p-4 rounded-2xl hover:bg-blue-600 text-white transition-colors"
      >
        ¡Otro perrito! <span> 🐶 </span>
      </button>
    </div>
  );
};

export default Perritos;
