import { handle } from 'hono/vercel';
import app from './app.js';

export const config = { runtime: 'edge' };

// Export for Vercel serverless
export default handle(app);
