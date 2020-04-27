const express = require('express');
const router = express.Router();
const {check,validationResult} = require('express-validator');

const config = require('config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const User = require('../../models/User');

// @Route  POST /api/users
// @desc   Test users
// @access Public

router.post('/',[
    check('name','name is required').not().isEmpty(),
    check('email','email is not valid').isEmail(),
    check('password','password is small in length').isLength({min:6})
],
async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }

    const{name, email, password} = req.body;


    try {
        let user = await User.findOne({email});
        
        if(user)
        {
           return res.status(400).send({errors:[{msg:'user already exists'}]});
        }

        const avatar = gravatar.url(email,{
            s: '200',
            r: 'pg' ,//for verifying it is not awful 
            d: 'mm'  //default if doesnot has a gravatar
        });


        user = new User({
            name,
            email,
            avatar,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password,salt);

        await user.save();

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
