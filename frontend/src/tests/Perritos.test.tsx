import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Perritos from '../components/Perritos';

// Mock simple para global.fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ message: 'https://images.dog.ceo/breeds/hound-english/n02089973_1.jpg', status: 'success' }),
  })
) as ReturnType<typeof vi.fn>;

describe('Perritos Component', () => {
  it('Debería renderizar un estado de carga inicial', () => {
    render(<Perritos />);
    expect(screen.getByText('Perrito Aleatorio')).toBeInTheDocument();
  });

  it('Debería cargar la imagen después del fetch', async () => {
    render(<Perritos />);
    
    // Esperar a que la imagen aparezca en el DOM
    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://images.dog.ceo/breeds/hound-english/n02089973_1.jpg');
    });
  });
});
