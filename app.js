require('dotenv').config(); // Load .env
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Models
const User = require('./Models/User');
const Job = require('./Models/job');

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // form data
app.use(express.json()); // json data

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Make user available in all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/', authRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// ======= HOME PAGE =======
app.get('/', async (req, res) => {
  const jobs = await Job.find();
  res.render('home', { jobs });
});

// ======= ADD JOB (EMPLOYER ONLY) =======
app.post('/add', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'employer') {
    return res.status(403).send('Access Denied');
  }
  const { title, company, location } = req.body;
  await Job.create({ title, company, location });
  res.redirect('/');
});

// ======= DELETE JOB (EMPLOYER ONLY) =======
app.post('/delete', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'employer') {
    return res.status(403).send('Access Denied');
  }
  const jobId = req.body.id;
  await Job.findByIdAndDelete(jobId);
  res.redirect('/');
});

// ======= SEARCH JOBS =======
app.get('/search', async (req, res) => {
  const query = req.query.query;
  const jobs = await Job.find({ title: { $regex: query, $options: 'i' } });
  res.render('home', { jobs });
});

// ======= APPLY TO JOB =======
app.get('/apply/:id', async (req, res) => {
  const jobId = req.params.id;
  const job = await Job.findById(jobId);
  if (!job) return res.status(404).send('Job Not Found');
  res.render('apply', { job });
});

app.post('/apply/:id', (req, res) => {
  const { name, email, message } = req.body;
  console.log('Application Received:', name, email, message);
  res.send('Application Submitted Successfully!');
});

// ======= 404 PAGE =======
app.use((req, res) => {
  res.status(404).render('404');
});

// ======= START SERVER =======
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

