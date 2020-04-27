const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const User = require('../../models/User');

const {check,validationResult} = require('express-validator');

const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// @Route  GET /api/users
// @desc   Test users
// @access Public
//to make it a protected route we will add the auth function in the middle of router function


router.get('/',auth,async (req,res)=>{
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user); 
    } catch (err) {
    console.err(err.message);
    res.status(500).send("Server error")        
    }
});


// @Route  POST /api/users
// @desc   to log in users
// @access Public

router.post('/',[
    check('email','email is not valid').isEmail(),
    check('password','password is required').exists()
],
async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }

    const{ email, password} = req.body;

    try {
        let user = await User.findOne({email});
        
        if(!user)
        {
           return res.status(400).send({errors:[{msg:'invalid credentials'}]});
        }

        const isMagic = await bcrypt.compare(password, user.password);

        if(!isMagic)
        {
            return res.status(400).send({errors:[{msg:'invalid credentials'}]});
        }

        const payload= {
            user:{
                id:user.id
            }
        };

        jwt.sign(payload,
            config.get('jwtSecret'),
            {expiresIn: 360000},
            (err, token)=>{
                if(err) throw err
                res.json({token})
            });
        
    } catch (err) {
        console.err(err.message);
        res.staus(500).send('Server Error');
    }
});

module.exports = router;