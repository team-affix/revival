import express from 'express';
import packageRoutes from './routes/package';
import { errorHandler } from './middleware/error-handler';

const app = express();

app.use(express.json());

// Routes
app.use('/package', packageRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
