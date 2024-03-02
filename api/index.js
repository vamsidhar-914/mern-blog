require('dotenv').config()
const express = require("express")
const mongoose = require('mongoose')
const app = express()
const AuthRoutes = require('./routes/auth')

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log('mongoDB is connected')
})
.catch((err) => {
    console.log(err)
})


// middleware
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.listen(3000,() => {
    console.log("server is running on port 3000");
})


// app.use("/api/user" , userRoutes)
app.use("/api/auth" , AuthRoutes)


// middleware for error handler
app.use((err,req,res,next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error"
    res.status(statusCode).json({
        success : false,
        statusCode,
        message
    })
})