const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
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


exports.createPost = (req, res, next) =>{
    const errors = validationResult(req);
    if( !errors.isEmpty() ){ // we have errors
        const error = new Error('validation failed!!, enter valid data');
        error.statusCode = 422;
        throw error;
    }
    if(!req.file){
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace(/\\/g, "/");
    let creator;
    // create post in db
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId,
    });
    post.save()
    .then(result => {
        //  add post to the list of posts of the user
        return User.findById(req.userId);
        
    })
    .then(user => {
        user.posts.push(post);
        return user.save();
    })
    .then(result => {
        res.status(201).json({
            message: 'Post created successfully!',
            post: post,
        });
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
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
    Post.findById(postId)
    .then(post => {
        if(!post){
            const error = new Error('Post not found');
            error.statusCode = 404;
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
        clearImage(post.imageUrl);
        return Post.findByIdAndDelete(postId);
    })
    .then(result => {
        console.log(result);
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

const clearImage = (filePath) => {
    filePath = path.join(__dirname, '..' ,filePath);
    fs.unlink(filePath, err => console.log(err));
};