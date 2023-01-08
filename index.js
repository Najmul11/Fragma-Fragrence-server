const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const categoryCollection=client.db('Product-resale').collection('category')
        const productsCollection=client.db('Product-resale').collection('products')
        const bookingCollection=client.db('Product-resale').collection('booking')


        
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

            if (user?.role && user?.usage) {
                res.send({ isAdmin: user?.role === 'admin', isSeller:  user?.usage === 'seller'});
            }else{
                if (user?.role) {
                    res.send({ isAdmin: user?.role === 'admin' });
                }else{
                    if (user?.usage) {
                        res.send({ isSeller: user?.usage === 'seller' });
                    }
                }       
            }  
        })

        // get all buyers/users 
        app.get('/users', async(req, res)=>{
            const query={ role: null, usage:null }
            const result=await usersCollection.find(query).toArray()
            res.send(result)
        })

        // get all sellers only
        app.get('/sellers', async(req, res)=>{
            const query={ role: null, usage:'seller' }
            const result=await usersCollection.find(query).toArray()
            res.send(result)
        })

         // delete buyer/seller as admin
         app.delete('/users/:id', async(req, res)=>{
            const id= req.params.id
            const filter= {_id:ObjectId(id)}
            const result =await usersCollection.deleteOne(filter)
            res.send(result)
        })


        // get categories to diplay in homepage
        app.get('/categories', async(req, res)=>{
            const query={}
            const result=await categoryCollection.find(query).toArray()
            res.send(result)
        })
        app.get('/category/:id', async(req, res)=>{
            const id=req.params.id
            const query={_id:ObjectId(id)}
            const result=await categoryCollection.findOne(query)
            res.send(result)
        })


         // get seller specific products and all products
         app.get('/products', async(req, res)=>{
            let query={}
            if (req.query.email) {
                query={sellerEmail:req.query.email}
            }
            const result=await productsCollection.find(query).toArray()
            res.send(result)
        })

          // delete a product as seller 
          app.delete('/products/:id', async(req, res)=>{
            const id= req.params.id
            const filter= {_id:ObjectId(id)}
            const result =await productsCollection.deleteOne(filter)
            res.send(result)
        }) 
 

        // get categoryWise products
        app.get('/categories/:id', async(req, res)=>{
            const id=req.params.id
            const query={categoryId:id}
            const result=await productsCollection.find(query).toArray()
            res.send(result)
        })

        

        // post product from add product page
        app.post('/products', async (req, res) =>{
            const product = req.body;

            const query={categoryName:product.categoryName}
            const findCategory=await categoryCollection.findOne(query)
            const categoryId=findCategory._id.toString()

            product.categoryId=categoryId
            product.status='unsold'

            const result = await productsCollection.insertOne(product);
            res.send(result);
        }) 

        // post order 

        app.post('/bookings', async (req, res) =>{
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })


    }
    finally{

    }  
}
run().catch(e=>{console.error(e)})
 

