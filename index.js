const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8kdu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();



    const userCollection = client.db('TaskFlow').collection('users');
    const taskCollection = client.db('TaskFlow').collection('tasks')

    // user related apis
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    //task related apis
    app.get('/tasks', async (req, res) => {
      const email = req.query.email;

      let query = {};

      if (email) {
        query = { email: email };
      }

      const result = await taskCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await taskCollection.findOne(query);
      res.send(result)
    })

    app.post('/tasks', async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    })

    app.delete('/tasks/:id', async (req, res) => {
      const id = req.params;
      const filter = { _id: new ObjectId(id) }
      const result = await taskCollection.deleteOne(filter);
      res.send(result)
    })

    app.patch('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const taskInfo = req.body;
      const filter = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: taskInfo
      }
      const options = { upsert: true }

      const result = await taskCollection.updateOne(filter, updatedDoc, options);
      res.send(result)
    })

    app.put('/tasks/:id', async (req, res) => {
      const taskId = req.params.id;
      const { category } = req.body;

      try {
        const result = await taskCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { category: category } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Task not found" });
        }

        res.send({ message: "Task updated successfully", result });
      } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).send({ message: "Server error" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
  
  app.get("/", (req, res) => {
    res.send("TaskFlow server is running");
  });
  
  app.listen(port, () => {
    console.log(`TaskFlow server is running on port ${port}`);
  });
  
