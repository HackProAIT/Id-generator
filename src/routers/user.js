const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const {auth,verify_user} = require('../middleware/auth')

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
    try{
        const user = await User.findByCreds(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.status(200).send({user,token})
    }catch(e){
        res.status(400).send({[e.name]:e.message})
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
        const token = await user.generateVerToken(identity)
        res.send(token)
    }catch(e){
        res.send({"error" : "Invalid User"})
    }
})

router.get('/user/verify/:id', async(req,res)=>{
    const token = req.params.id
    res.send(verify_user(token))
})



module.exports = router