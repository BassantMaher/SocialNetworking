const express = require('express');
const feedController = require('../controllers/feed');
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');

const router = express.Router();


// get request to : /feed/posts
router.get('/posts', isAuth, feedController.getPosts);

router.post('/post', isAuth, [
    body('title')
        .trim()
        .isLength({ min: 5 }),
    body('content')
    .trim()
    .isLength({ min: 5 })
], feedController.createPost);

router.get('/post/:postId', isAuth, feedController.getPost);

// to make the edit post work
// has a body to be sent
router.put('/post/:postId', isAuth, [
    body('title')
        .trim()
        .isLength({ min: 5 }),
    body('content')
    .trim()
    .isLength({ min: 5 })
], feedController.updatePost);

// has no body to be send
router.delete('/post/:postId', isAuth, feedController.deletePost);

// /feed/status
router.get('/status', isAuth, feedController.getStatus);

router.patch('/status', isAuth, [
    body('status')
        .trim()
        .not()
        .isEmpty()
], feedController.updateStatus);

module.exports = router;