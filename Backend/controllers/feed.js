const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const io = require('../socket');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 5;
    let totalItems;

    // First, count the total number of posts
    Post.find()
        .countDocuments()
        .then(counts => {
            totalItems = counts;
            // Fetch the actual posts, with the creator field populated
            return Post.find()
                .populate('creator', 'name')  // Populate the creator field with the name
                .sort({createdAt: -1})
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(posts => {
            // Return the posts along with the total count
            res.status(200).json({
                message: 'Posts fetched successfully!',
                posts: posts,
                totalItems: totalItems
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    if (!req.file) {
      const error = new Error('No image provided.');
      error.statusCode = 422;
      throw error;
    }
    let imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;
    imageUrl = imageUrl.replace(/\\/g, '/');
    const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      creator: req.userId
    });
    try {
      await post.save();
      const user = await User.findById(req.userId);
      user.posts.push(post);
      await user.save();
      io.getIO().emit('posts', {
        action: 'create',
        post: { ...post._doc, creator: { _id: req.userId, name: user.name } }
      });
      res.status(201).json({
        message: 'Post created successfully!',
        post: post,
        creator: { _id: user._id, name: user.name }
      });
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  };

  exports.getPost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        if( !post ){
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw error;
        }
        console.log(post.imageUrl);
        res.status(200).json({
            message: 'Posts found',
            post: post
        });
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if( !errors.isEmpty() ){ // we have errors
        const error = new Error('validation failed!!, enter valid updates');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if(req.file){
        imageUrl = req.file.path.replace(/\\/g, "/");   
    }
    if(!imageUrl){
        const error = new Error('NO IMage picked!');
        error.statusCode = 422;
        throw error;
    }
    Post.findById(postId).populate('creator')
    .then(post => {
        if(!post){
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator._id.toString() !== req.userId){
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }
        if(imageUrl !== post.imageUrl){
            // to delete the previous image from the images folder
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.content = content;
        post.imageUrl = imageUrl;
        return post.save();
    })
    .then(result => {
        io.getIO().emit('posts', {
            action: 'update',
            post: result 
          });
        res.status(200).json({
            message: 'post updated!',
            post: result
        });
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
    .then(post => {
        // check logged in user
        if(!post){
            const error = new Error('Post not found');
            error.statusCode = 404;
            throw error;
        }
        if(post.creator.toString() !== req.userId){
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }
        clearImage(post.imageUrl);
        return Post.findByIdAndDelete(postId);
    })
    .then(result => {
        return User.findById(req.userId);
    })
    .then(user => {
        user.posts.pull(postId);
        return user.save();
    })
    .then(result => {
        console.log(result);
        io.getIO().emit('posts', {
            action: 'delete',
            post: postId 
          });
        return res.status(200).json({
            message: 'post deleted'
        });
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.getStatus = (req, res, next) => {
    User.findById(req.userId)
    .then(user => {
        if(!user){
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        return res.status(200).json({
            status: user.status,
            name: user.name
        });
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
};
exports.updateStatus = (req, res, next) => {
    const newStatus = req.body.status;
    User.findById(req.userId)
    .then(user => {
        if(!user){
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        user.status = newStatus;
        user.save();
    })
    .then(result => {
        return res.status(200).json({
            message: 'status updated'
        });
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}



const clearImage = (filePath) => {
    filePath = path.join(__dirname, '..' ,filePath);
    fs.unlink(filePath, err => console.log(err));
};