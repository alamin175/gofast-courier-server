const express = require("express");
const cors = require("cors");
require("dotenv").config();
var jwt = require("jsonwebtoken");

const app = express();
// using middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion } = require("mongodb");
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@<cluster-url>?retryWrites=true&writeConcern=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kflht43.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  /* Collection Name */
  const topRiderCollection = client.db("gofast-courier").collection("topRider");
  const usersCollection = client.db("gofast-courier").collection("users");
  const bookingCollection = client.db("gofast-courier").collection("bookings");

  const verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    // console.log(token, "headers");
    if (!token) {
      res.status({ error: true, message: "Forbidden Access" });
    }
  };

  try {
    app.get("/", (req, res) => {
      res.send("GoFast courier data is coming");
    });
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.post("/jwt", (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.JWT_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    app.get("/topRider", verifyToken, async (req, res) => {
      const result = await topRiderCollection.find().toArray();
      res.send(result);
    });

    app.post("/user", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "users already exists" });
      }
      // console.log("user", user);
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Port is listening ", port);
});
