const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')

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

router.post('/generateId', async(req,res)=>{    
    try{
        const user = await User.findById(req.body.id)
        const Identity={}
        for(val in req.body)
            Identity[val]=user[val]
        res.send(Identity)
    }catch(e){
        res.send({"error" : "Invalid User"})
    }
})



module.exports = router