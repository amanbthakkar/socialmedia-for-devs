const express = require('express');
const router = express.Router();

// @route GET api/posts
// @desc Test route
// @access Public (means anyone can access, auth not necessary)
router.get('/', (req, res) => {
  res.send('Posts route');
});

module.exports = router;
