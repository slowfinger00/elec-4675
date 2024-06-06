const mongoClient = require('mongoose')

const blogSchema = new mongoClient.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number,
    user: {
      type: mongoClient.Schema.Types.ObjectId,
      ref: 'User'
    }
  })

  blogSchema.set('toJSON', {
  transform: (_, returned) => {
    returned.id = returned._id.toString()
    delete returned.__v
    delete returned._id
  }
})

module.exports = mongoClient.model('Blog', blogSchema)