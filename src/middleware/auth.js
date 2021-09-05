const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req,res,next) =>{
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token,process.env.SECRET)
        const user = await User.findOne({_id:decoded._id,'tokens.token':token})
        if(!user)
            throw new Error('could not find this user')
        req.user = user
        req.token = token
        next()
    }
    catch(e){
        res.status(403).send({ 'error' : 'please authenticate'})
    }
}

const verify_user = async (token) => {
    try{
        const decoded = jwt.verify(token,process.env.SECRET_VERIFY)
        const user = await User.findOne({_id : decoded._id, 'ver_tokens.token':token})
        
        if(!user)
            throw new Error('not verified')
        return {'message' : 'user verified'}
    }
    catch(e){
        return {'error':'user not verified'}
    }
}

module.exports = {auth,verify_user}