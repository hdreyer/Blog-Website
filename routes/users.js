var express = require('express');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');


router.get('/', function (req, res, next) {
  res.send('Please sign up or login');
});

router.get('/signup', function (req, res, next) {
  res.render('signup');
});

router.post('/signup', function (req, res, next) {
  models.users
    .findOrCreate({
      where: {
        Username: req.body.userName
      },
      defaults: {
        FirstName: req.body.firstName,
        LastName: req.body.lastName,
        Email: req.body.email,
        Password: authService.hashPassword(req.body.password)
      }
    })
    .spread(function (result, created) {
      if (created) {
        res.render('login');
      } else {
        res.send('This user already exists');
      }
    });
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', function (req, res, next) {
  models.users.findOne({
    where: {
      Username: req.body.username
    }
  }).then(user => {
    if (!user) {
      console.log('User not found')
      return res.status(401).json({
        message: "Login Failed"
      });
    } else {
      let passwordMatch = authService.comparePasswords(req.body.password, user.Password);
      if (passwordMatch) {
        let token = authService.signUser(user);
        res.cookie('jwt', token);
        res.render('profile', {
          FirstName: user.FirstName,
          LastName: user.LastName,
          PostTitle: user.PostTitle,
          PostBody: user.PostBody
        });
      } else {
        console.log('Wrong password');
        res.send('Wrong password');
      }
    }
  });
});

router.get('/logout', function (req, res, next) {
  res.cookie('jwt', "", {
    expires: new Date(0)
  });
  res.send('Logged out');
});

router.get('/profile', function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user) {
          models.users.findAll({
              where: {
                UserId: user.UserId
              },
              include: [{
                model: models.posts
              }]
            })
            .then(result => {
              res.render('profile', {
                FirstName: user.FirstName,
                LastName: user.LastName,
                PostTitle: user.postTitle,
                PostBody: user.postBody
              });
            });
        } else {
          res.status(401);
          res.send('Invalid authentication token');
        }
      });
  } else {
    res.status(401);
    res.send('Must be logged in');
  }
});

router.get('/admin', function(req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user.Admin) {
        models.users
        models.posts
        .findAll({ where: { Deleted: false }, raw: true })
        .then(result => res.render('adminView',
         { FirstName: user.FirstName,
          LastName: user.LastName }))
      } else {
        res.send('You are unauthorized.');
      }
    });
  } else {
    res.send('You are not a registered user.')
  }
});


router.get('/admin/editUser/:id', function(req, res, next) {
  let userId = parseInt(req.params.id)
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user.Admin) {
        models.users
        .findAll({ where: { userId: UserId}})
        .then(userFound => res.render('editUser', {user: userFound }))
      } else {
        res.send('You are unauthorized.');
      }
    });
  } else {
    res.send('You are not a registered user.')
  }
});

router.delete('admin/deleteUser/:id', function(req, res, next) {
  let userId = parseInt(req.params.id)
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user.Admin) {
        models.users
        .update(
          { Deleted: true },
          {
            where: { UserId: userId }
          }
        )
        .then(result => res.redirect('/admin', 
        {FirstName: user.FirstName,
        LastName: user.LastName}
        ));
      } else {
        res.send('You are unauthorized.');
      }
    });
  } else {
    res.send('You are not a registered user.')
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