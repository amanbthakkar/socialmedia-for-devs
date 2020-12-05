//when we want our different routes to be in different files then we need to import express router
//we technically could do all of it in server.js, but this is a big app and then that file gets messy quickly
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const config = require('config');
const secret = config.get('jwtSecret');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User'); //import the user schema
// @route   POST api/users
// @desc    Register a user
// @access  Public (means anyone can access, auth not necessary)
router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(), //read documentation to find out different checks
    check('email', 'Email is not valid ').isEmail(),
    check('password', 'Password needs 6 or more characters').isLength({
      min: 6,
    }),
  ], //this second parameter is express validator middleware
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); //return to end processing
    }
    const { name, email, password } = req.body;

    try {
      //Check if user exists - User.findOne() returns a promise - so you can use .then().catch()
      //but we will use async await - which comes inside a try!

      let user = await User.findOne({ email: email }); //takes in a field to search by (the extracted email from req.body)
      if (user) {
        // if user already exists; we want to match how the validator error is created above - that is an array of errors
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] }); //array of errors like returned from validationResult
      }

      //Get user's gravatar - now we now he's a new user
      const avatar = gravatar.url(email, {
        s: '200', //size default 200
        r: 'pg', //rating is PG (no explicit images)
        d: 'mm', //default - return something even if no gravatar exists
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      }); //this creates a new instance of the user (doesn't save it to database yet) - remember User is the name of the model in this file

      //Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt); //add password attribute to user object
      let doc = await user.save(); //this actually saves the user to database, hence await
      
      //Return jsonwebtoken - after creating user want him to be immediately logged in
      //console.log('Doc is ' + doc);
      const payload = {
        user: {
          id: user.id,
        }, //Promise returned above with user having an id; mongoose uses an abstraction so no need of '_id'
      };
      jwt.sign(payload, secret, { expiresIn: 36000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error'); //general error for any of the code above
    }
  }
);

module.exports = router;
//don't forget to export the route
