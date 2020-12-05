const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route GET api/profile/me
// @desc Get current user's profile
// @access Private - get the logged in user's profile
router.get('/me', auth, async (req, res) => {
  //this is a route used to fetch the profile of the logged in user
  //since user is logged in, it uses auth middleware as usual which sets the user in req.user
  //in the profile variable we want to get the name & avatar of the 'user', hence we use the populate method
  try {
    var profile = await Profile.findOne({ user: req.user.id }).populate(
      //brings only specified fields. remove and see what happens.
      'user',
      ['name', 'avatar']
    ); //remember user in model is set by 'ObjectId'
    if (!profile) {
      return res.status(400).json({ msg: 'No profile for this user' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route POST api/profile
// @desc Create/update current user's profile
// @access Private
router.post(
  '/',
  [
    auth,
    [
      //first the auth middleware, then the check middleware which has the fields to be checked as an array
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills are required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    //longest route - this will actually create or update a route
    //we will need to validate stuff that is posted so we require our express-validator and all
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); //the validator returns an array of errors
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //Build profile object
    const profileFields = {};
    profileFields.user = req.user.id; //the user you can get directly from user.id
    if (company) profileFields.company = company; //add the fields if they exist
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    //for skills, little skilful handling :p
    if (skills)
      profileFields.skills = skills.split(',').map((skill) => skill.trim()); //trim whitespace off of each skill
    //Build socials object
    if (twitter) profileFields.social.twitter = twitter;
    console.log(twitter);
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    //save the profile
    try {
      let profile = await Profile.findOne({ user: req.user.id }); //all mongoose methods return promises
      if (profile) {
        //Update it if already exists
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true } //return updated profile (by default not returned)
        );
        return res.json(profile);
      }
      //Create if does not exist
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
