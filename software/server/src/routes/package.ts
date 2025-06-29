import { Router } from 'express';
import { getPackage } from '../controllers/package';

const router = Router();

router.get('/', getPackage);

export default router;
