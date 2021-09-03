const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')

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
        unique : true,
        trim : true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value))
                throw new Error('invalid email address')
        }
    },
    mobile : {
        type : String,
        required : true,
        unique : true,
        trim : true,
        validate(value){
            if(value.length!=13)
                throw new Error('invalid phone no')
        }
    },
    age : {
        type : Number,
        default : 0
    },
    adhaar_no :{
        type : Number,
        unique : true
    },
    ver_tokens : [{
        token : {
            type : String
        }
    }],
    tokens : [{
        token : {
            type : String
        }
    }]
})

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.__v
    delete userObject.ver_tokens
    return userObject
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id : user._id.toString()}, process.env.SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.generateVerToken = async function(identity){
    const user = this
    const token = jwt.sign(identity,process.env.SECRET_VERIFY)
    user.ver_tokens = user.ver_tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCreds = async(email, password) => {
    const user = await User.findOne({email})
    if(!user)
        throw Error('unable to login')
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch)
        throw Error('unable to login')    
    else
        return user
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