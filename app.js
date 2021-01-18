const express=require('express');
const mongoose=require('mongoose')
const app=express();
const PORT=process.env.PORT||5000
//5000 will work on the development side otherwise on the production side it wil use the port provided by hosting platform here heroku 
const {MONGOURI}=require('./config/keys')
//abhinav25pass
//console.log(MONGOURI)

mongoose.connect(MONGOURI,{useNewUrlParser:true,useUnifiedTopology:true,useFindAndModify:true},(error)=>{
if(!error){
    console.log("connected to database")
}
else{
    console.log(error)
}
})
app.use(express.json())
app.use(require('./routes/auth'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))
// const custommiddleware=(req,res,next)=>{
//     console.log("hi this is middleware");
//     next();
// }

// app.get('/',(req,res)=>{
//     console.log('jaha app use kiya hh wo midleware chlega and agr next likha toh y bhi chlega')
//     res.send("hi there")
// })

// app.get('/about',custommiddleware,(req,res)=>{
//     console.log("if u want to use the middleware for a specific route then right in above way or if for execute midleware for al  routes then use app.use(name of midlware) , this fun executes after middleware ")
//     res.send("here first middlw ware run on about route and age middle ware next use kiya hoge then req and res wala fun chlega")
// }) all routes are kept at auth inside the routes folder
//if we are on production side that is if app is deployed then serve the static file inside client build
//if client will make any request to the route then we need to tell the server that it will send index html file because it contain entire react code so it knows at which route what component should be loaded
//u also need to tell heroku to build and then run kyuki agr hm build folder and baki files
//dale toh change krne bad hame waps se nayi build krke dalne padegi but agr build hi herolu p krenge
//toh its not that problem so for that inside the package json we use script heoku build
//in which we write about that run build in client but before that we need to install the dependencies
if(process.env.NODE_ENV=="production"){
    app.use(express.static('client/build'))
    const path=require('path')
    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,'client','build','index.html'))
    })


}
app.listen(PORT,()=>{console.log("server started at port 5000 ")})