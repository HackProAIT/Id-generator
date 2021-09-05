const express = require('express')
const userRouter = require('./routers/user')
require('./db/mongoose')

const port = process.env.PORT

const app = express()

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin","*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Request-With, Content-Type, Accept, Autherization"
    )
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
    next()
})

app.use(express.json())
app.use(userRouter)

app.listen(port, ()=> {
    console.log('server running on port',port)
})