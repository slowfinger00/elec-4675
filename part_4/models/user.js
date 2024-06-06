const mongoClient = require('mongoose')

const userSchema = new mongoClient.Schema({
    username: String,
    name: String,
    id: String,
    blogs: [
        {
          type: mongoClient.Schema.Types.ObjectId,
          ref: 'Blog'
        }
    ]
})

  userSchema.set('toJSON', {
  transform: (_, returned) => {
    returned.id = returned._id.toString()
    delete returned.__v
    delete returned._id
  }
})

module.exports = mongoClient.model('User', userSchema)