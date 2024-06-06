const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.json())

const mongoClient = require('mongoose')
const mongoUrl = `mongodb+srv://slowfinger00:${process.env.MONGO_PASSWORD}@fullstack.phdfxec.mongodb.net/?retryWrites=true&w=majority&appName=fullstack`
mongoClient.connect(mongoUrl)

const blogRouter = require('./controllers/blog')
const loginRouter = require('./controllers/login')
const userRouter = require('./controllers/user')

app.use('/api/blogs', blogRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)

module.exports = app