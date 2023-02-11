import { register , login, logout, refresh, verify } from '../controllers/auth.controller';
import * as express from 'express';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/verify', verify);


module.exports = router;