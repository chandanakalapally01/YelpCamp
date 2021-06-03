const express = require('express')
const Campground = require('../models/campground')
const Review = require('../models/review')

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const Joi = require('joi')
const { campgroundSchema } = require('../schemas.js')

const router = express.Router()

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next()
    }
}

router.get("/", async (req, res) => {
    const camps = await Campground.find({})
    res.render('campgrounds/campgrounds.ejs', { campgrounds: camps })
})

router.post("/", validateCampground, catchAsync(async (req, res) => {
    const camp = new Campground(req.body.campground)
    await camp.save()
    req.flash('success', 'Successfully added a new Campground!')
    res.redirect(`/campgrounds/${camp._id}`)
}))

router.get("/create", catchAsync(async (req, res) => {
    res.render('campgrounds/createCampground.ejs')
}))

router.get("/:id", catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id).populate('reviews')
    res.render('campgrounds/campground.ejs', { campground: camp })
}))

router.put("/:id", validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success', 'Successfully updated a Campground!')
    res.redirect(`/campgrounds/${camp._id}`)
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a Campground!')
    res.redirect('/campgrounds');
}))

router.get("/:id/edit", catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id)
    res.render('campgrounds/editCampground.ejs', { campground: camp })
}))

module.exports = router