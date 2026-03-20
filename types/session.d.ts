// Extensión de los tipos de express-session para TypeScript
// Permite que req.session tenga tipado para el carrito.
import 'express-session';

declare module 'express-session' {
    interface SessionData {
        carrito: { id: number; cantidad: number }[];
        total_carrito: number;
    }
}
