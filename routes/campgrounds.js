const express = require('express')
const Campground = require('../models/campground')
const Review = require('../models/review')

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const Joi = require('joi')
const { campgroundSchema } = require('../schemas.js')

const { ensureAuthenticated } = require('../config/auth');

const router = express.Router()

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        // throw new ExpressError(msg, 400)
        req.flash("error", msg)
        return res.redirect('/campgrounds')
    }
    else {
        next()
    }
}

router.get("/", ensureAuthenticated, async (req, res) => {
    const camps = await Campground.find({})
    res.render('campgrounds/campgrounds.ejs', { campgrounds: camps })
})

router.post("/", ensureAuthenticated, validateCampground, catchAsync(async (req, res) => {
    const camp = new Campground(req.body.campground)
    camp.author = req.user._id
    await camp.save()
    req.flash('success', 'Successfully added a new Campground!')
    res.redirect(`/campgrounds/${camp._id}`)
}))

router.get("/create", ensureAuthenticated, catchAsync(async (req, res) => {
    res.render('campgrounds/createCampground.ejs')
}))

router.get("/:id", ensureAuthenticated, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id).populate({ path: 'reviews', populate: { path: 'author' } }).populate('author')
    res.render('campgrounds/campground.ejs', { campground: camp })
}))

router.put("/:id", ensureAuthenticated, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    if (currentUser._id.equals(campground.author)) {
        req.flash('error', 'You do not have the permission to do that!')
        return res.redirect(`/campgrounds/${camp._id}`)
    }
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success', 'Successfully updated a Campground!')
    res.redirect(`/campgrounds/${camp._id}`)
}))

router.delete('/:id', ensureAuthenticated, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (currentUser._id.equals(campground.author)) {
        req.flash('error', 'You do not have the permission to do that!')
        return res.redirect(`/campgrounds/${camp._id}`)
    }
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a Campground!')
    res.redirect('/campgrounds');
}))

router.get("/:id/edit", ensureAuthenticated, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (currentUser._id.equals(campground.author)) {
        req.flash('error', 'You do not have the permission to do that!')
        return res.redirect(`/campgrounds/${camp._id}`)
    }
    const camp = await Campground.findById(req.params.id)
    res.render('campgrounds/editCampground.ejs', { campground: camp })
}))

module.exports = router