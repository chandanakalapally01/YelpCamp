const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

router.get("/", forwardAuthenticated, (req, res) => {
    res.render('users/welcome')
})

router.get("/login", forwardAuthenticated, (req, res) => {
    res.render('users/login')
})

router.get("/register", forwardAuthenticated, (req, res) => {
    res.render('users/register')
})

router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errorsAuth = [];

    if (!name || !email || !password || !password2) {
        req.flash("error_msg", "All the fields are required");
        return res.render('users/register', {
            name,
            email,
            password,
            password2
        });
    }

    if (password != password2) {
        req.flash("error_msg", 'Passwords do not match');
        return res.render('users/register', {
            name,
            email,
            password,
            password2
        });
    }
    let regExp = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{6,}$/;
    if (!regExp.test(password)) {
        req.flash("error_msg", 'Password must contain at least six characters, one number, both lower and uppercase letters and special characters');
        return res.render('users/register', {
            name,
            email,
            password,
            password2
        });
    }
    else {
        User.findOne({ email: email }).then(user => {
            if (user) {
                req.flash("error_msg", 'Email already exists');
                return res.render('users/register', {
                    name,
                    email,
                    password,
                    password2
                });
            } else {
                const newUser = new User({
                    name,
                    email,
                    password
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => {
                                req.flash(
                                    'success_msg',
                                    'You are now registered and can log in'
                                );
                                res.redirect('/login');
                            })
                            .catch(err => console.log(err));
                    });
                });
            }
        });
    }
});

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/campgrounds',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
});


module.exports = router