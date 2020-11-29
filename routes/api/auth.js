const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const { check, validationResult } = require('express-validator');
const secret = config.get('jwtSecret');

// @route GET api/auth
// @desc Test route
// @access Private (means not anyone can access, auth necessary - use the auth middleware to authenticate)
router.get('/', auth, async (req, res) => {
  //now I have req.user with me - I display user info
  //to query dB I use async await
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Database connection failed' });
  }
});

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public (means anyone can access, auth not necessary)
router.post(
  //now this is for login instead of register, so just email and password here
  '/',
  [
    check('email', 'Email is not valid ').isEmail(),
    check('password', 'Password is required').exists(),
  ], //this second parameter is express validator middleware
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); //return to end processing
    }
    const { email, password } = req.body;

    try {
      //Check if user exists - User.findOne() returns a promise - so you can use .then().catch()
      //but we will use async await - which comes inside a try!

      let user = await User.findOne({ email: email }); //takes in a field to search by (the extracted email from req.body)
      if (!user) {
        // if user already exists; we want to match how the validator error is created above - that is an array of errors
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] }); //User invalid (Dont give this as msg, as then anyone can check if account already exists)
      }

      //Make sure password matches the matched user
      //compare - compares plaintext and encrypted password - and returns a Promise
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credentials' }] });
      }
      //Return jsonwebtoken - after creating user want him to be immediately logged in
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
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
