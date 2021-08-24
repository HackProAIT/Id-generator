const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')

const userSchema = mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    password : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        // unique : true,
        trim : true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value))
                throw new Error('invalid email address')
        }
    },
    age : {
        type : Number,
        default : 0
    },
    tokens : [{
        token : {
            type : String
        }
    }]
})

userSchema.statics.findByCreds = async(email, password) => {
    const user = await User.findOne({email})
    if(!user)
        throw Error('unable to login')
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch)
        return user
    else
        throw Error('unable to login')    
}

userSchema.pre('save', async function(next) {
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

const User = mongoose.model(('user'), userSchema)

module.exports = User