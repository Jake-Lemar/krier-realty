import { handle } from 'hono/vercel';
import app from './app.js';

export const config = { runtime: 'nodejs20.x' };

// Export for Vercel serverless
export default handle(app);
