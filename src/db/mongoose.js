const mongoose = require('mongoose')

console.log(process.env.MONGODB_CONN)
mongoose.connect(process.env.MONGODB_CONN,{
    useNewUrlParser : true,
    useCreateIndex : true
})