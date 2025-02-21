

const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyparser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require('fs');

const routes = require("./Route/Route");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
app.use("/", routes);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadDir = 'public/images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "resume") {
      cb(null, 'uploads/');
    } else {
      cb(null, 'public/images/');
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });



// Database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "shantiautomation"
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Feedback form
app.get("/feedback", (req, res) => {
  const sql = "SELECT * FROM feedback";
  db.query(sql, (err, data) => {
    if (err) return res.json(err.message);
    return res.json(data);
  });
});

app.post("/submit-form", (req, res) => {
  const { name, email, number, message } = req.body;
  if (!name || !email || !number || !message) {
    return res.status(400).json({ message: "please fill all the fields" });
  }
  const sql = `INSERT INTO feedback (name, email, number, message) VALUES (?, ?, ?, ?)`;
  db.query(sql, [name, email, number, message], (err, result) => {
    if (err) {
      console.error("Couldn't insert feedback: ", err);
      return res.status(500).json({ message: "internal error", error: err.message });
    }
    return res.status(200).json({ message: "Feedback submitted successfully" });
  });
});

// Admin form
app.get("/admin", (req, res) => {
  const sql1 = "SELECT * FROM adminform";
  db.query(sql1, (err, data) => {
    if (err) return res.json(err.message);
    return res.json(data);
  });
});

app.post("/admin/admin-form", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }
  const sql2 = `INSERT INTO adminform (username, password) VALUES (?, ?)`;
  db.query(sql2, [username, password], (err, result) => {
    if (err) {
      console.error("Couldn't insert adminform: ", err);
      return res.status(500).json({ message: "Internal error", error: err.message });
    }
    return res.status(200).json({ message: "Admin form submitted successfully" });
  });
});

// User login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
           console.log(req.body)
  if (!email || !password) {
    return res.status(400).json({ error: 'Please fill all the fields' });
  }

  const sql = "SELECT * FROM log WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Error querying user:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    return res.status(200).json(results);
  });
});

  

// User signup
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
 
  const sql = "INSERT INTO log (name, email, password) VALUES (?, ?, ?)";
  db.query(sql, [name, email, password], (err, results) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'User registered successfully' });
  });
});
app.get("/sign/name",(req,res)=>
{
  const sql1= "SELECT name  FROM log  "
  db.query(sql1,(err,data)=>
  {
    if(err) return res.json(err.message);
    return res.json(data);
  })
})



// User interface - Add file
app.post("/addfile", upload.single('image'), (req, res) => {
  const image = req.file.filename;
  const sql = "INSERT INTO addfile (title, description, image) VALUES (?, ?, ?)";
  const values = [req.body.title, req.body.description, image];
  db.query(sql, values, (err, data) => {
    if (err) {
      console.error("Couldn't insert file data: ", err);
      return res.status(500).json("error");
    }
    return res.json({ Status: "Success" });
  });
});

// Admin images added data in product
app.get("/getfiles", (req, res) => {
  const sql5 = "SELECT * FROM addfile";
  db.query(sql5, (err, result) => {
    if (err) return res.json(err.message);
    return res.json(result);
  });
});

// Contact us details message
app.post("/contactmessage", (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ message: "please fill all the fields" });
  }
  const mysql3 = `INSERT INTO contact (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`;
  db.query(mysql3, [name, email, phone, subject, message], (err, result) => {
    if (err) return res.json(err.message);
    return res.json(result);
  });
});

// Job application
app.post('/api/job-application', upload.single('resume'), (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    position,
    education,
  } = req.body;

  const resume = req.file ? req.file.path : null;

  const query = `INSERT INTO jobapplication (first_name, last_name, email, phone, address, position, education, resume)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    query,
    [firstName, lastName, email, phone, address, position, education, resume],
    (err, results) => {
      if (err) {
        console.error('Error inserting job application:', err.stack);
        return res.status(500).json({ error: 'Failed to submit job application' });
      }
      res.status(201).json({ id: results.insertId });
    }
  );
});

// Server listening
app.listen(3213, () => {
  console.log("Server is running on port 3213");
});
