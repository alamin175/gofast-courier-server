const express = require("express");
const cors = require("cors");
require("dotenv").config();
var jwt = require("jsonwebtoken");

const app = express();
// using middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const authorization = req.headers.authorization;
    // console.log(authorization, "headers");
    if (!authorization) {
      res.status({ error: true, message: "Forbidden Access" });
    }
    const token = authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized Access" });
      }
      req.decoded = decoded;
      next();
    });
  };

  try {
    app.get("/", (req, res) => {
      res.send("GoFast courier data is coming");
    });
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    app.post("/jwt", (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = jwt.sign(user, process.env.JWT_TOKEN, {
        expiresIn: "1h",
      });
      res.send({ token });
    });

    app.get("/topRider", async (req, res) => {
      const result = await topRiderCollection.find().toArray();
      res.send(result);
    });

    // parcel related api

    app.get("/myparcels/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.findOne(query);
      res.send(result);
    });

    app.get("/myParcels", verifyToken, async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res
          .status(401)
          .send({ error: true, message: "Forbidden Access" });
      }
      const query = { email: email };
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    app.patch("/myParcels/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const parcel = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          email: parcel.email,
          parcelType: parcel.parcelType,
          parcelWeight: parcel.parcelWeight,
          receiverName: parcel.receiverName,
          receiverNumber: parcel.receiverNumber,
          collectionAmount: parcel.collectionAmount,
          receiverAddress: parcel.receiverAddress,
          parcelCost: parcel.parcelCost,
          status: "pending",
          date: parcel.date,
        },
      };
      const result = await bookingCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.post("/booking", verifyToken, async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
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
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("Port is listening ", port);
});
