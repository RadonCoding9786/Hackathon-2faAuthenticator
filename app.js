import express from 'express';
import dao from './repositories/dao';
import { authenticated, authMiddleware } from './controllers/auth.controller';
import { authRoutes} from './routes';
import { generatePasscode, getUserPasscode, refreshUserPasscode } from './utils/passcodeGenerator';

const path = require('path');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
export const app = express();
var expressWs = require('express-ws')(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static(__dirname + '/public'));
app.use(cookieParser({
    origin: 'https://neem.gq/',
    credentials: true,
}));
app.use(cors());
app.use(authMiddleware);

dao.setupDbForDev();

// const apiLimiter = rateLimit({
//     windowMs: 5 * 60 * 1000,
//     max: 1
// });
app.get('/verify', function(req, res) {
  res.sendFile(path.join(__dirname, './pages/index.html'));
});

app.ws('/', function(ws, req) {
  let user = null;
  let int = null;
  let passcodeExists = false;

  const response = () => {
    if(!user) return
    let passcode;
    if(passcodeExists) {
      passcode = refreshUserPasscode(user.user_id)
    } else {
      passcode = generatePasscode(user.user_id)
    }
    
    ws.send(passcode)
  }

  int = setInterval(response, 30000)

  ws.on('message', async function (token) {
    user = await dao.get("SELECT * FROM users WHERE token = ?", [token]);
    if(!user) return ws.close()
    let passcode = getUserPasscode(user.user_id)
    if(passcode !== undefined) passcodeExists = true
    response()
  });

  ws.on('close', function() {
    clearInterval(int)
  });
});

app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
    const error = new Error(`Cannot find ${req.originalUrl} on this server!`);
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
        status: 'fail',
        message: error.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 3080;
app.listen(PORT, () => console.log(`Server listening on the port:: ${PORT}`));