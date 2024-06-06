const dummy = () => {
    return 1
}

const totalLikes = (blogPosts) => {
    sum = 0
    blogPosts.forEach(blog => {
      sum = sum + blog.likes
    });
    return sum
}

const favoriteBlog = (blogPosts) => {

  blogChosen = null
  highestLike = -1

  blogPosts.forEach((blog) => {
    if (blog.likes > highestLike) {
      blogChosen = blog
      highestLike = blog.likes
    }
  })
  return {
      title: blogChosen.title,
      author: blogChosen.author,
      likes: blogChosen.likes
  }
}

const mostBlogs = (blogs) => {
  if (!blogs.length) return null;

  const authorCounts = blogs.reduce((counts, { author }) => {
    counts[author] = (counts[author] || 0) + 1;
    return counts;
  }, {});

  const topAuthor = Object.keys(authorCounts).reduce((a, b) =>
    authorCounts[a] > authorCounts[b] ? a : b
  );

  return {
    author: topAuthor,
    blogs: authorCounts[topAuthor]
  };
};

const mostLikes = (blogs) => {
  if (!blogs.length) return null;

  const likesCounts = blogs.reduce((counts, { author, likes }) => {
    counts[author] = (counts[author] || 0) + likes;
    return counts;
  }, {});

  const topAuthor = Object.keys(likesCounts).reduce((a, b) =>
    likesCounts[a] > likesCounts[b] ? a : b
  );

  return {
    author: topAuthor,
    likes: likesCounts[topAuthor]
  };
};


module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}