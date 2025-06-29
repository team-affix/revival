import { Router } from 'express';
import { getPackage } from '../controllers/package';

const router = Router();

router.get('/:name/:version', getPackage);

export default router;
