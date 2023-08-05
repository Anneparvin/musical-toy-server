const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
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

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if(!authorization){
      return res.status(401).send({error: true, message: 'unauthorized access'});
  }
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
      if(err){
          return res.status(401).send({error: true, message: 'unauthorized access'})
      }
      req.decoded = decoded;
      next();
  })
}

async function run() {
  try {
    client.connect();

   const toysCollection = client.db('toyMaster').collection('toys');
   const bookingToysCollection = client.db('toyMaster').collection('bookingToys');

   // jwt
    app.post('/jwt',(req,res)=>{
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: '1h' 
      });
      res.send({token});
    })

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

// bookingToys 

 app.post('/bookingToys', async(req,res) => {
      const bookingToys = req.body;
      console.log(bookingToys);
      const result = await bookingToysCollection.insertOne(bookingToys);
      res.send(result);
    })

    app.get('/bookingToys',async(req,res)=> {
    //   const decoded = req.decoded;
      
    //   console.log('come back after verify', decoded);
    //   if(decoded.email !== req.query.email){
    //     return res.status(403).send({error: 1, message:'forbidden access'})
    //   }
    //   let query ={};

    // if(req.query?.email){
    //   query = {email: req.query.email}
    // }
      const result = await bookingToysCollection.find().toArray();
      res.send(result);
    })

    app.patch('/bookingToys/:id', async(req, res)=> {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id) };
      const updatedBooking = req.body;
      console.log(updatedBooking);
    const updateDoc = {
      $set: {
        status: updatedBooking.status
      },
    };
    const result = await bookingToysCollection.updateOne(filter, updateDoc);
    res.send(result);

    })

    app.delete('/bookingToys/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await bookingToysCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/alltoys', async(req,res)=> {
      const result = await bookingToysCollection.find().limit(20).toArray();
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