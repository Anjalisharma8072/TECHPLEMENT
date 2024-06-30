const express = require('express');
const bodyparser = require('body-parser');
const app = express();


//middleware

app.use(express.urlencoded({extended : false}));
app.use(express.json());

//database connection

const { Client } = require('pg');
const client =  new Client({
    user:'postgres',
    database:'Dayquotes',
    host:'localhost',
    password:'5432',
    port:5432,
});

client.connect(function(err){
    if (err) throw err;
    console.log('connected');
});



//routes

//all quotes with all information

app.get('/' , (req,res) => {
    client.query("SELECT * FROM quotes",(error,results)=> {
        if(error) throw error;
        const quotes = results.rows
        res.json(quotes);
    })
    
})

//random quote

app.get('/api/quote' , (req,res) => {
    client.query("SELECT quotes FROM quotes",(error,results)=> {
        if(error) throw error;
        const quotes = results.rows
        res.json(quotes[Math.floor(Math.random() * quotes.length)]);
    })
    
})

//add quote

app.post("/api/quote",(req,res) => {
    const newQuote = req.body;
    let insertquery = 'INSERT INTO quotes(quotes,quote_author) VALUES ($1,$2)' ;
    const values = [newQuote.quotes , newQuote.quote_author];
    client.query(insertquery,values,(error,result) => {
        if(error) throw error;
        res.send("Insertion successfull");
    });
})

//update quote

app.put("/api/quote/:id",(req,res) =>{
    const id = req.params.id;
    const{quotes,quote_author} = req.body;
    client.query("UPDATE quotes SET quotes = $1,quote_author = $2 Where quote_id = $3 RETURNING *",
        [quotes,quote_author,id],
        (error,results)=>{
            if(error) throw error;
            if(results.rows.length == 0) return  res.send("No id Exist");
            res.json(results.rows)
        }
    )
} 
)


//delete quote

app.delete("/api/quote/:id",(req,res)=>{
    const id = req.params.id;
    client.query("DELETE FROM quotes WHERE quote_id = $1",[id],
        (error,results)=>{
            if(error) throw error;
            res.send(`Quote Deleted Successfully with id: ${id}`)
        }
    )
}
)

//Get quote by Author name

app.get("/api/quote/:author",(req,res)=>{
    const author = req.params.author;
    client.query("SELECT quotes FROM quotes WHERE quote_author = $1",[author],
        (error,results)=>{
            if(error) {
                throw error;
            };
            if(results.rows.length==0) {
                res.send("Author Not Found");
                return;
            }
            res.json(results.rows);
        }

    )
})


const port = process.env.PORT || 3000 ;
app.listen(port , () => {
    console.log(`Server is running  on port ${port}`);
})