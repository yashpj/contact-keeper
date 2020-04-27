const jwt = require('jsonwebtoken');

const config = require('config');

module.exports = function(req,res,next){

    // Get token from header
    const token = req.header('x-auth-token');
    
    // check if token is valid
    if(!token)
    {
        return res.status(401).json({msg:'no token, no authorization'});
    }

    // verify the token
    try {
        const decode = jwt.verify(token,config.get('jwtSecret'));

        req.user = decode.user;
    
        next();
       
    } catch (err) {
        res.status(401).json({msg:'token is not valid'});
    }
}
