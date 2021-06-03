const express = require('express')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const path = require('path')
const methodOverride = require('method-override')
const Campground = require('./models/campground')
const Review = require('./models/review')

mongoose.connect('mongodb+srv://chandana:chandana123@cluster0.flemu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).catch(err => console.log(err))

const db = mongoose.connection;
db.once("open", () => {
    console.log("Database connected")
})

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.get("/", (req, res) => {
    res.render('home.ejs')
})
//To add dummy data multiple times
// app.get("/makecampground", async (req, res) => {
//     const camp = new Campground({
//         title: "Camps Desert",
//         price: "5000000",
//         description: "Dinner with a valentine kinda day"
//     });
//     await camp.save()
//     res.send(camp)
// })

app.get("/campgrounds", async (req, res) => {
    const camps = await Campground.find({})
    res.render('campgrounds/campgrounds.ejs', { campgrounds: camps })
})

app.post("/campgrounds", async (req, res) => {
    const camp = new Campground(req.body.campground)
    await camp.save()
    res.redirect(`/campgrounds/${camp._id}`)
})

app.get("/campgrounds/create", async (req, res) => {
    res.render('campgrounds/createCampground.ejs')
})

app.get("/campgrounds/:id", async (req, res) => {
    const camp = await Campground.findById(req.params.id).populate('reviews')
    res.render('campgrounds/campground.ejs', { campground: camp })
})

app.put("/campgrounds/:id", async (req, res) => {
    const { id } = req.params
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${camp._id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.get("/campgrounds/:id/edit", async (req, res) => {
    const camp = await Campground.findById(req.params.id)
    res.render('campgrounds/editCampground.ejs', { campground: camp })
})

app.post("/campgrounds/:id/review", async (req, res) => {
    const review = new Review(req.body.review)
    await review.save()
    const campground = await Campground.findById(req.params.id)
    campground.reviews.push(review)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete("/campgrounds/:id/reviews/:rid", async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.rid } })
    await Review.findByIdAndDelete(req.params.rid)
    res.redirect(`/campgrounds/${req.params.id}`)
})

app.listen(3000, () => {
    console.log("Serving on port 3000")
})