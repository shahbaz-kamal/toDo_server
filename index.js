const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();
const corsOptions = {
  origin: [
    "https://to-do-list-by-shahbaz.netlify.app",
    "http://localhost:5173",
  ],
};

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Todo list is running");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jxshq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
    // *creating collection
    const userCollection = client.db("task-flow").collection("users");
    const taskCollection = client.db("task-flow").collection("tasks");

    // *users related api

    app.post("/users/:email", async (req, res) => {
      const email = req.params.email;
      const newUser = req.body;
      // checking if users exist
      const query = { email };
      const isExist = await userCollection.findOne(query);
      if (isExist) {
        const result = { message: "User already Exists in the Database" };
        res.send(result);
      } else {
        const result = await userCollection.insertOne({
          ...newUser,
          creationTime: Date.now(),
        });
        res.send(result);
      }
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // ?tasks related api
    app.get("/task/:email", async (req, res) => {
      const email = req.params.email;
      const query = { createdBy: email };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/task", async (req, res) => {
      const newTask = req.body;
      const result = await taskCollection.insertOne({
        ...newTask,
        createdAt: new Date(),
      });
      res.send(result);
    });

    app.delete("/task/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`ToDo website server is running on port :${port}`);
});
