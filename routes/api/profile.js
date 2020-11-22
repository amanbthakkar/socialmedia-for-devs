const express = require('express');
const router = express.Router();

// @route GET api/auth
// @desc Test route
// @access Public (means anyone can access, auth not necessary)
router.get('/', (req, res) => {
  res.send('Profile route');
});

module.exports = router;
