//when we want our different routes to be in different files then we need to import express router
//we technically could do all of it in server.js, but this is a big app and then that file gets messy quickly
const express = require('express');
const router = express.Router();

// @route   GET api/users
// @desc    Test route
// @access  Public (means anyone can access, auth not necessary)
router.get('/', (req, res) => {
  res.send('User test route');
});

module.exports = router;
//don't forget to export the route
