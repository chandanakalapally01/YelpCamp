const express = require('express')
const Campground = require('../models/campground')
const Review = require('../models/review')

const catchAsync = require('../utils/catchAsync')

const router = express.Router({ mergeParams: true })

router.post("/", async (req, res) => {
    const review = new Review(req.body.review)
    await review.save()
    const campground = await Campground.findById(req.params.id)
    campground.reviews.push(review)
    await campground.save()
    req.flash('success', 'Successfully added your review')
    res.redirect(`/campgrounds/${campground._id}`)
})

router.delete("/:rid", async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.rid } })
    await Review.findByIdAndDelete(req.params.rid)
    req.flash('success', 'Successfully deleted your review')
    res.redirect(`/campgrounds/${req.params.id}`)
})

module.exports = router