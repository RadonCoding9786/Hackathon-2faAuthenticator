export const errorMessage = (res, msg) => {
    res.status(401);
    return res.json({ 
        status: 'fail',
        message: msg 
    });
}