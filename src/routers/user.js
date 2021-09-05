const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const {auth,verify_user} = require('../middleware/auth')
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

router.post('/user/signup', async(req,res)=>{
    const user = new User(req.body)
    user.adhaar_no = Math.floor(Math.random()*899999999999 + 100000000000)
    try{
        await user.save()
        res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/user/login', async(req,res)=>{
    if(req.body.otp_verification)
    {
        try{
            const adhaar_no = req.body.adhaar_no
            const user = await User.findOne({adhaar_no})
            
            if(!user)
                throw Error('not a valid user')
            
            const service_sid = process.env.TWILIO_SERVICE_SID
            if(!req.body.otp)
            {            
                // console.log('sending otp...')    
                const verification = await client.verify.services(service_sid)
                .verifications
                .create({to: user.mobile, channel: 'sms'})
                
                // console.log(verification)
                res.status(200).send({'message' : 'please verify otp'})                
            }else {
                const verification_check = await client.verify.services(service_sid)
                .verificationChecks
                .create({to: user.mobile, code: req.body.otp})

                // console.log(verification_check.status)
                if(verification_check.status === 'approved'){
                    const token = await user.generateAuthToken()
                    res.status(200).send({user,token})
                } else {
                    res.status(400).send({'error' : 'invalid otp'})
                }            
            }
        }
        catch(e){
            res.status(400).send({'error':'invalid user'})
        }
    } else {
        try
        {
                const user = await User.findByCreds(req.body.email, req.body.password)
                const token = await user.generateAuthToken()
                res.status(200).send({user,token})
        }catch(e){
            console.log(e)
            res.status(400).send({'error' : 'wrong credentials'})
        }
    }
})


router.patch('/user/me', auth, async(req,res) => {
    const allowedUpdates = ["name", "email", "age"]
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every((update)=>allowedUpdates.includes(update))
   
    if(!isValidOperation)
        return res.status(400).send({"error":"Invalid Updates!"})

    try{
        const user = req.user
        updates.forEach((update)=>user[update]=req.body[update])
        await user.save()
        res.send(user)
    }catch(e){
        res.status(400).send({"error":"unable to update user"})
    }
})

router.get('/user/me', auth, async(req,res)=>{
    res.send(req.user)
})

router.post('/user/logout', auth, async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.forEach((token) =>{
            return token.token!==req.token
        })
        await req.user.save()
        res.send({"Message" : "logged out successfully"})
    }catch(e){
        res.status(500).send()
    }
})

router.post('/user/generateId', auth, async(req,res)=>{    
    try{
        const user = req.user
        const identity={}
        for(val in req.body)
            identity[val]=user[val]
        identity._id=user._id
        const token = await user.generateVerToken(identity)
        res.send(token)
    }catch(e){
        res.send({"error" : "Invalid User"})
    }
})

router.get('/user/verify/:id', async(req,res)=>{
    const token = req.params.id
    res.send(await verify_user(token))
})



module.exports = router