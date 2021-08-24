const express = require('express')
const router = new express.Router()
const User = require('../models/user')

router.post('/SignUp', async(req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/login', async(req,res)=>{
    try{
        const user = await User.findByCreds(req.body.email, req.body.password)
        res.send(user)
    }catch(e){
        res.status(400).send({[e.name]:e.message})
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
        res.send('Invalid User')
    }
})

router.post('/')

module.exports = router