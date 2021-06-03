const express = require('express')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const path = require('path')
const methodOverride = require('method-override')
const Campground = require('./models/campground')
const Review = require('./models/review')
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')
const Joi = require('joi')

const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')

const flash = require('connect-flash')
const session = require('express-session')

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

const sessionConfig = {
    secret: 'thisshouldbethebettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash())

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

app.use("/campgrounds", campgrounds)
app.use("/campgrounds/:id/reviews", reviews)


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something went wrong!'
    res.status(statusCode).render('error.ejs', { err })
})

app.listen(3000, () => {
    console.log("Serving on port 3000")
})