var express = require('express');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');



router.get('/', function(req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user) {
        models.posts.findAll({
          where: { UserId: user.UserId, Deleted: false }
        })
        .then(result => res.render('posts', {posts: result }));
      } else {
        res.status(401);
        res.send('Invalid authentication token');
      }
    });
  } else {
    res.status(401);
    res.send('No authentication token found - please sign in to continue.')
  }
});


router.post("/", function(req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user) {
        models.posts
          .findOrCreate({
            where: {
              UserId: user.UserId,
              PostTitle: req.body.postTitle,
              PostBody: req.body.postBody
            }
          })
          .spread((result, created) => res.redirect("/posts"));
      } else {
        res.status(401);
        res.send("Invalid authentication token");
      }
    });
  } else {
    res.status(401);
    res.send("Must be logged in");
  }
});

router.put('/edit', function (req, res, next) {
  let postId = parseInt(req.params.id)
  let token = req.cookies.jwt
  if (token) {
    authService.verifyUser(token).then( models.posts.update(
          { PostTitle: req.body.postTitle,
          PostBody: req.body.postBody },
          { where: { PostId: postId }}
        ))
     .then(result => res.redirect('/'));   
    
  } else {
    res.send('Please login to continue');
  }
});

router.delete('/:id', function(req, res, next) {
  let postId = parseInt(req.params.id); 
  models.posts
    .update(
      { Deleted: true },
      {
        where: { PostId: postId }
      }
    )
    .then(result => res.redirect('/'));
});


module.exports = router;
