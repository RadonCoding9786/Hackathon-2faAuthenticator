import { closed } from '../repositories/repoisitory';
import dao from '../repositories/dao';
import jwt from 'jsonwebtoken';
import {errorMessage} from "../error.js";

const bcrypt = require('bcrypt');
const crypto = require("crypto");

const saltRounds = 10;

// need to add functions for refershing the 2fa token, sending the message to the client about login success so the 2fa page is displayed

// message to display to the user if they succeeded the 2fa authentication or not

export const authMiddleware = async (req, res, next) => {
    const token = req.header('Access-Token');
    if(!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, (err, dec) => { if(!err) return dec });
        const { user_id } = decoded;
        const user = await closed.getUserById(user_id);
        if(user) {
            req.user_id = user_id;
        }
    } catch (e) {
        console.error(e);
        return next();
    }
    
    next();
}

export const authenticated = (req, res, next) => {
    if(req.user_id) {
        return next();
    }

    res.status(401);
    res.json({ 
        status: 'fail',
        message: 'You are not authenticated'
    });
}

export const register = async (req, res) => {
    const {
        username,
        email,
        password,
        //dont need token from client
    } = req.body;

    bcrypt.hash(password, saltRounds, async (err, hash) => {
        if(!err) {
            let userID = crypto.randomBytes(16).toString("hex");
            closed.insertUser(userID, username, email, hash).then(() => {
                    return res.json({ status: 'success' });
                })
        } else {
            errorMessage();
        }
    });

    res.status(200);
}

export const verify = async (req, res) => {
    const token = req.params.token;

    try {
        const decoded = jwt.verify(token, VERIFICATION_TOKEN_SECRET, (err, dec) => { if(!err) return dec });
        const { user_id } = decoded;
        const user = await closed.getUserById(user_id);
        if(user && !user.verification) {
            await closed.setUserVerified(user_id, 1);
            return res.redirect('https://neem.gq/');
        }
    } catch (e) {
        console.error(e);
        return next();
    }
}

export const login = async (req, res) => {
    const { username, email, password } = req.body;

    let user;
    if(username !== undefined) {
        user = await closed.getUserByUsername(username);
    } else if (email !== undefined) {
        user = await closed.getUserByEmail(email);
    }

    const match = await bcrypt.compare(password, user.password);

    if(!match){
        errorMessage();
    }
    console.log(user);

    let token = createToken(user.user_id);

    console.log(token);

    res.json({
        status: 'success',
        token: token,
    });

    res.status(200);
}


const createToken = (userID) => {
    
    let token = crypto.randomBytes(16).toString("hex");

    console.log(token);
    console.log(userID);

    closed.insertToken(userID,token);

    //tell client the token value
    return token;
}



export const logout = async (req, res) => {
    const refreshToken = req.cookies['refresh_token'];

    let isToken = await closed.checkToken(refreshToken);
    await closed.deleteToken(refreshToken);

    res.json({
        status: 'success',
        message: 'User has been logged out successfully'
    });
    
    res.status(200);
}

export const refresh = async (req, res) => {
    const refreshToken = req.cookies['refresh_token'];
    
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);

        const accessToken = jwt.sign({ user_id: user.user_id }, ACCESS_TOKEN_SECRET, { expiresIn: `${ACCESS_TOKEN_EXPIRES}m` });
        res.json({
            status: 'success',
            access_token: accessToken,
            access_token_expiry: Math.floor(new Date().getTime() + (ACCESS_TOKEN_EXPIRES * 60 * 1000))
        });
    })

    res.status(200);
}