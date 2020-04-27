const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Posts');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @Route  POST api/posts
// @desc   Create a post
// @access Private

router.post('/', [auth , [
    check('text', 'Text is not required')
    .not()
    .isEmpty()
] ] ,
    async (req,res)=>{
    
        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
            return res.status(400).json({errors:errors.array()});
        }

        const users = await User.findById(req.user.id).select('-password');

        try {

            const newPost = {
                text: req.user.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            }

            const post = await newPost.save();

            res.json(post);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server-Error');
        }
});


// @Route  GET api/posts
// @desc   GET all posts
// @access Private

router.get('/' , auth , async(req,res)=> {
    try {
        const posts = await Post.find().sort({date: -1});
        res.json(posts);
    } catch (error) {
        console.error(err.message);
        res.status(500).send('Server-Error');
    }
});

// @Route  GET api/posts/:id
// @desc   GET posts by Id
// @access Private

router.get('/:id' , auth , async(req,res)=> {
    try {
        const post = await Post.find(req.params.id);

        if(!post)
        {
            return res.status(404).json({msg:'post not found'});
        }
        res.json(post);
    } catch (err) {
        console.error(err.message);
        if(err.kind==='ObjectId')
        {
            return res.status(404).json({msg:'post not found'});
        }
        res.status(500).send('Server-Error');
    }
});

// @Route  DELETE api/posts/:id
// @desc   DELETE a post
// @access Private

router.get('/:id' , auth , async(req,res)=> {
    try {
        const post = await Post.find(req.params.id);

        if(!post)
        {
            return res.status(404).json({msg:'post not found'});
        }

        //check if the post to be delted is of the same user or not
        if(post.user.toString() !==  req.params.id)
        {
            return res.status(401).json({msg:'User not authorised'});
        }

        await post.remove();

        res.json({msg: 'Post removed'});
        
    } catch (error) {
        console.error(err.message);
        if(err.kind==='ObjectId')
        {
            return res.status(404).json({msg:'post not found'});
        }
        res.status(500).send('Server-Error');
    }
});

// @route   PUT api/posts/like/:id
// @desc    Like post
// @access  Private
router.put(
    '/like/:id',
    auth,
    async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
                if (
                  post.likes.filter(like => like.user.toString() === req.user.id)
                    .length > 0
                ) {
                  return res
                    .status(400)
                    .json({ alreadyliked: 'User already liked this post' });
                }
      
                // Add user id to likes array
                post.likes.unshift({ user: req.user.id });
      
                await post.save();

                res.json(post.likes);
            
        } catch (err) {
                console.error(err.message);
                res.status(500).send('Server Error');
        }
    });

// @route   PUT api/posts/like/:id
// @desc    Like post
// @access  Private
router.put(
    '/like/:id',
    auth,
    async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
                if (
                  post.likes.filter(like => like.user.toString() === req.user.id)
                    .length > 0
                ) {
                  return res
                    .status(400)
                    .json({ alreadyliked: 'User already liked this post' });
                }
      
                // Add user id to likes array
                post.likes.unshift({ user: req.user.id });
      
                await post.save();

                res.json(post.likes);
            
        } catch (err) {
                console.error(err.message);
                res.status(500).send('Server Error');
        }
    });

// @route   PUT api/posts/unlike/:id
// @desc    Like post
// @access  Private
router.put(
    '/unlike/:id',
    auth,
    async (req, res) => {
        try {
            const post = await Post.findById(req.params.id);
                if (
                  post.likes.filter(like => like.user.toString() === req.user.id)
                    .length=== 0
                ) {
                  return res
                    .status(400)
                    .json({ alreadyliked: 'User did not liked this post' });
                }  

                // GET remove index
                const removeIndex = post.likes.map(like=> like.user.toString()).indexOf(req.user.id);
                post.likes.splice(removeIndex, 1);
                
                await post.save();

                res.json(post.likes);
            
        } catch (err) {
                console.error(err.message);
                res.status(500).send('Server Error');
        }
    });

// @Route  POST api/posts/comments/:id
// @desc   write a comment
// @access Private

router.delete('/comment/:id', [auth , [
    check('text', 'Text is not required')
    .not()
    .isEmpty()
] ] ,

    async (req,res)=>{
    
        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
            return res.status(400).json({errors:errors.array()});
        }

        const users = await User.findById(req.user.id).select('-password');
        const post  = await Post.findById(req.params.id);

        try {

            const newComment = {
                text: req.user.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            };

            post.comments.unshift(newComment);

            await Post.save();

            res.json(post.comments);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server-Error');
        }
});

// @Route  DELETE api/posts/comments/:id
// @desc   delete a comment
// @access Private

router.delete('/comment/:id/:comment_id', auth ,
    async (req,res)=>{
        try {
            const post = await Post.findById(req.params.id);

            //Pull out comment
            const comment = post.comments.find(comment => comment.id === req.params.comment_id);

            //Make sure comments exists
            if(!comment)
            {
                return res.status(404).json({msg: 'Comment does not exist'});
            }

            //Check user
            if(comment.user.toString() !== req.user.id)
            {
                return res.status(404).json({msg: 'User not authorised'});
            }

                            // GET remove index
                            const removeIndex = post.comments.map(comment=> comment.user.toString()).indexOf(req.user.id);
                            post.comments.splice(removeIndex, 1);
                            
                            await post.save();
            
                            res.json(post.comments);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server-Error');            
        }
    
module.exports = router;
