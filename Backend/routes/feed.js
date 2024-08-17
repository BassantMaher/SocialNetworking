const express = require('express');
const feedController = require('../controllers/feed');
const { body } = require('express-validator');


const router = express.Router();


// get request to : /feed/posts
router.get('/posts', feedController.getPosts);

router.post('/post', [
    body('title')
        .trim()
        .isLength({ min: 5 }),
    body('content')
    .trim()
    .isLength({ min: 5 })
], feedController.createPost);

router.get('/post/:postId', feedController.getPost);

// to make the edit post work
// has a body to be sent
router.put('/post/:postId', [
    body('title')
        .trim()
        .isLength({ min: 5 }),
    body('content')
    .trim()
    .isLength({ min: 5 })
], feedController.updatePost);

// has no body to be send
router.delete('/post/:postId', feedController.deletePost);

module.exports = router;