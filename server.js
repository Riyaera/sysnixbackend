const express= require("express");
const mysql= require("mysql")
const cors=require("cors");
const bodyparser=require("body-parser");
const routes= require("./Route/Route");
const multer=require("multer");
const path = require("path");


const app=express();
app.use(express.json())

app.use(cors());
app.use(express.static('public'))

app.use("/",routes);



app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
// Ensure uploads directory exists
const uploadDir = 'public/images';
// Serve the static image files
// app.use("/images", express.static(path.join(__dirname, "public/images")));
// const fs = require('fs');
// if (!fs.existsSync(uploadDir)){
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

const storage= multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null, 'public/images')
    },
    filename: (req,file,cb)=>{
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({
    storage: storage
})

// comnection establishment
const db= mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "shantiautomation"
})

// feedbach form
app.get("/feedback",(req,res)=>{
    const sql= "SELECT * FROM feedback";
    db.query(sql,(err,data)=>
    {
        if(err) return res.json(err.message);
        return res.json(data);
    })
}) 
app.post("/submit-form",(req, res)=>
{
    const {name,email,number,message} = req.body;
    console.log(req.body);
    if(!name || !email || !number || !message )
        {
            return res.status(400).json({
                message: "please fill all the fields"
            })
        }
        const sql= `INSERT INTO feedback (name,email,number,message) VALUES ('${name}','${email}','${number}','${message}')`;
        db.query(sql, [name,email,number,message], (err,result) =>
        {
            if(err){
                console.error("Couldn't insert feedback: ", err);
                return res.status(500).json({
                    message: "internal error",
                    error: err.message
                })
            }
            return res.status(200).json({
                message: "Feedback submitted successfully"
            })
        })
})
// admin form
app.get("/admin",(req,res)=>{
    const sql1= "SELECT * FROM adminform";
    db.query(sql1,(err,data)=>
    {
        if(err) return res.json(err.message);
        return res.json(data);
    })
}) 
app.post("/admin/admin-form", (req, res) => {
    const { username, password } = req.body;
    console.log("Received data:", req.body);  // Add this line

    if (!username || !password) {
        return res.status(400).json({
            message: "Please fill all the fields"
        });
    }

    const sql2 = `INSERT INTO adminform (username, password) VALUES (?, ?)`;
    db.query(sql2, [username, password], (err, result) => {
        if (err) {
            console.error("Couldn't insert alogin: ", err);
            return res.status(500).json({
                message: "Internal error",
                error: err.message
            });
        }
        return res.status(200).json({
            message: "alogin submitted successfully",
        });
    });
});

// user login
app.post("/user", (req, res) => {
    const sq2 = "SELECT * FROM log WHERE `email` = ? AND `password` = ?";
    db.query(sq2, [req.body.email, req.body.password], (err, data) => {
      if (err) {
        return res.json(console.log(err.message));
        
      }
      if (data.length > 0) {
        return res.json("success");
      } else {
        return res.json("failed");
      }
    });
  });
// user interface
app.post("/signup", (req, res) => 
{
    const sq1= "INSERT INTO log (`name`, `email`, `password`) VALUES (?)";
    const values=[
        req.body.name,
        req.body.email,
        req.body.password
    ]
    db.query(sq1,[values],(err,data)=>
    {
        if(err)
            {
                return res.json("error");
            }
            return res.json(data);
    })
})


// userinterfACE user 
app.post("/addfile", upload.single('image'), (req, res) => {
    console.log(req.file);
    const image = req.file.filename;
    const sql = "INSERT INTO addfile (`title`, `description`, `image`) VALUES (?, ?, ?)";
    const values = [req.body.title, req.body.description, image];
    db.query(sql, values, (err, data) => {
        if (err) {
            console.error("Couldn't insert file data: ", err);
            return res.status(500).json("error");
        }
        return res.json({Status: "Success"});
    });
});

//   admin images added data in product
app.get("/getfiles",(req,res)=>{

    const sql5= "SELECT * FROM addfile";
    db.query(sql5,(err,result)=>
    {
        if(err) return res.json(err.message);
        return res.json(result);
    })
})

// contact us details message
app.post("/contactmessage",(req,res)=>
{
    const {name,email,phone,subject,message} = req.body;
    console.log(req.body);
    if(!name ||!email ||!phone ||!subject ||!message )
        {
            return res.status(400).json({
                message: "please fill all the fields"
            })
        }
      
  const  mysql3= `INSERT INTO contact (name, email,phone,subject,message) VALUES('${name}','${email}','${phone}','${subject}','${message}')`;

  console.log(message)
    db.query(mysql3,[name,email,phone,subject,message],(err,result)=>
    {
        if(err) return res.json(err.message);
        return res.json(result);
       
    })
})









  
  



// porting
app.listen(3213,()=>
{
    console.log("server is running on port 3213");
})