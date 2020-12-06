const express  = require('express');
const app = express();
const axios = require('axios');
const redis = require('redis');
const { response } = require('express');
const port  = 9700;

const client = redis.createClient({
    host: 'localhost',
    port: 6379
})

app.get('/data',(req,res) =>{
     var userinput = (req.query.country).trim();
     const url = `https://en.wikipedia.org/w/api.php?action=parse&format=json&section=0&page=${userinput}`

     //search in redis
     return client.get(`wiki:${userinput}`,(err,result) =>{
        if(result){
            const output = JSON.parse(result)
            res.send(output)
        }else{
            //make a api call
            console.log("I am in api call")
            return axios.get(url)
            .then((response) =>{
                const output = response.data;
                //first save in redis for next time
                client.setex(`wiki:${userinput}`,3600,JSON.stringify({source:'Redis',output}))
                //send api response
                return res.send({source:'Api',output})
            })
        }
     })
})

app.listen(port,(err) =>{
    console.log(`Server is running on port ${port}`)
});
 