const express = require('express')
const Campground = require('../models/campground')
const Review = require('../models/review')

const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')

const router = express.Router()

router.get("/", async (req, res) => {
    const camps = await Campground.find({})
    res.render('campgrounds/campgrounds.ejs', { campgrounds: camps })
})

router.post("/", catchAsync(async (req, res) => {
    if (!req.body.campground) throw new ExpressError('Invalid campground data', 400)
    const camp = new Campground(req.body.campground)
    await camp.save()
    res.redirect(`/campgrounds/${camp._id}`)
}))

router.get("/create", catchAsync(async (req, res) => {
    res.render('campgrounds/createCampground.ejs')
}))

router.get("/:id", catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id).populate('reviews')
    res.render('campgrounds/campground.ejs', { campground: camp })
}))

router.put("/:id", catchAsync(async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${camp._id}`)
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

router.get("/:id/edit", catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id)
    res.render('campgrounds/editCampground.ejs', { campground: camp })
}))

module.exports = router