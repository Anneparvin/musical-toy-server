const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.port || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bshwcno.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)

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
  

   const toysCollection = client.db('toyMaster').collection('toys');
   const allToysCollection = client.db('toyMaster').collection('allToys');

  //  toy category
   app.get('/toys', async(req,res) => {
    const cursor = toysCollection.find();
    const result = await cursor.toArray();
    res.send(result);
   })

   app.get('/toys/:toyId', async(req, res)=> {
    const toyId = req.params.toyId;
    console.log(toyId)
    const selectedCard = await toysCollection.findOne({_id : new ObjectId(toyId)})
    console.log(selectedCard)
    res.send(selectedCard);
})

// alltoys 

 app.post('/allToys',async(req,res) => {
      const allToys = req.body;
      console.log(allToys);
      const result = await allToysCollection.insertOne(allToys);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  
  
  
  finally {
    
  }
}
run().catch(console.dir);


app.get('/',(req, res)=>{
    res.send('toy master is running')
})

app.listen(port, ()=>{
    console.log(`toy master server is running on port ${port}`)
})