//  Express & Mongoose Import
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

//  Mongoose Connection 
mongoose.connect('mongodb+srv://kasak:kasak1143@completecoding.mfpmgr8.mongodb.net/job-finder?retryWrites=true&w=majority&appName=CompleteCoding', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected');
}).catch((err) => {
    console.error('MongoDB Connection Error:', err);
});


//  EJS Setup & Static Files
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

//  Job Schema & Model
const jobSchema = new mongoose.Schema({
    title: String,
    company: String,
    location: String
});
const Job = mongoose.model('Job', jobSchema);

//  Home Route - Fetching Jobs from MongoDB
app.get('/', async (req, res) => {
    const jobs = await Job.find();
    res.render('home', { jobs });
});

//  Add Job Route (POST)
app.post('/add', async (req, res) => {
    const { title, company, location } = req.body;
    await Job.create({ title, company, location });
    res.redirect('/');
});

//  Delete Job Route (POST)
app.post('/delete', async (req, res) => {
    const jobId = req.body.id;
    await Job.findByIdAndDelete(jobId);
    res.redirect('/');
})
// search bar ko functionaliy bana ke liye h
app.get('/search', async (req, res) => {
    const query = req.query.query;
    const jobs = await Job.find({
        title: { $regex: query, $options: 'i' }
    });
    res.render('home', { jobs });
});



app.get('/apply/:id', async (req, res) => {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
        return res.status(404).send('Job Not Found');
    }
    res.render('apply', { job });
});

app.post('/apply/:id', (req, res) => {
    const { name, email, message } = req.body;
    console.log('Application Received:', name, email, message);
    res.send('Application Submitted Successfully!');
});

// 404 Page Route 
app.use((req, res) => {
    res.status(404).render('404');
});

// Server Listen
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
