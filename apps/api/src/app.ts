import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import adminRoutes from './routes/admin.routes';
import * as path from 'path';

// Swagger UI Docs
import swaggerUi from 'swagger-ui-express';
import * as YAML from 'yamljs';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routing Mount
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api', adminRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

export default app;
