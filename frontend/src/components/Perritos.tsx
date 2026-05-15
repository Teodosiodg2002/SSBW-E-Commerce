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
    <div className="flex flex-col items-center p-6 border-2 border-base-200 rounded-3xl shadow-lg bg-base-100 max-w-sm">
      <h2 className="text-xl font-bold mb-4 text-secondary font-montserrat">Perrito Aleatorio</h2>
      <div className="w-64 h-64 flex items-center justify-center bg-base-200 rounded-2xl overflow-hidden mb-4">
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        ) : (
          <img src={imageUrl!} alt="Perrito" className="object-cover w-full h-full" />
        )}
      </div>
      <button 
        onClick={fetchDog}
        className="btn btn-secondary"
      >
        ¡Otro perrito! <span> 🐶 </span>
      </button>
    </div>
  );
};

export default Perritos;
