import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] Dealership API running on port ${PORT}`);
  console.log(`[Docs] API Swagger documentation available at http://localhost:${PORT}/api/docs`);
});
