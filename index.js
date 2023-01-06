const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()


const app=express()
const port=process.env.PORT || 5000;


app.use(cors())
app.use(express.json())

app.get('/', (req, res)=>{
    res.send('Resale server connected')
})

app.listen(port,()=>{
    console.log('listening to port:', port);
})




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.u5tj5cw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        // collections
        const qnaCollection=client.db('Product-resale').collection('qna')
        const usersCollection=client.db('Product-resale').collection('users')


        
        app.get('/qna', async(req, res)=>{
            const query={}
            const result=await qnaCollection.find(query).toArray()
            res.send(result)
        })

        // store users
        app.post('/users', async (req, res) =>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })
        // mark as seller when login as seller
        app.put('/users/usertype/:email', async(req, res)=>{  
            const email=req.params.email
            const filter={email}
            const user = await usersCollection.findOne(filter);
            if (user?.usage) {
                return 
            }else{
                const options ={upsert:true}
                const updatedDoc={
                    $set:{
                        usage:'seller'
                    }   
                }
                const result= await usersCollection.updateOne(filter, updatedDoc, options )
                res.send(result)
            }    
        })
        // check seller or admin  by email to give access as seller or as admin
        app.get('/users/usertype/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            if (user?.role) {
                res.send({ isAdmin: user?.role === 'admin' });
            }
            if (user?.usage) {
                res.send({ isSeller: user?.usage === 'seller' });
            }
        })


    }
    finally{

    }  
}
run().catch(e=>{console.error(e)})
