const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const bodyParser = require("body-parser");

 // "start": "node index.js",
    // "start-dev": "nodemon index.js" //package.json

// for env variable//
require("dotenv").config();

const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//configure mongodb////////////////////

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.raiw9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const articlesCollection = client.db("newsDB").collection("articles");
  const adminsCollection = client.db("newsDB").collection("admins");
  console.log("Database connection established!");

  //creating API to add service from admin (Create) //
  app.post("/addArticle", (req, res) => {
    const newArticle = req.body;
    console.log("adding a new article by admin", newArticle);
    articlesCollection.insertOne(newArticle).then((result) => {
      res.send(result.insertedCount > 0);
      console.log(result.insertedCount);
    });
  });

  //read data for showing all the created services to UI
  app.get("/articles", (req, res) => {
    articlesCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  //   // read more now onclick get articles data//
  app.get("/article/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    articlesCollection.find({ _id: id }).toArray((err, documents) => {
      console.log(documents);
      res.send(documents[0]); // must//
    });
  });

  //////////////////// MAKE ADMIN SECTION//////////////////////////////////
  app.post("/makeAdmin", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    console.log("adding new admin", email, password);
    //{email} because it's a part of the whole body//
    adminsCollection.insertOne({ email, password }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // VIP Service only for admins :p //
  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminsCollection.find({ email: email }).toArray((err, admins) => {
      console.log(admins);
      res.send(admins.length > 0);
    });
  });
  //   client.close();
});

app.get("/", (req, res) => {
  res.send("Hello NewsDB!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
