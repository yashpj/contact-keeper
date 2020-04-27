const express = require('express');
const connectDB = require('./config/db');

const app = express();

//connect database
connectDB();

//Initial Middleware
app.use(express.json({extended:false}));

app.get('/',(req,res)=> res.send("API RUNNING"));

//My routes
app.use('/api/users',require('./routes/api/users'));
app.use('/api/auth',require('./routes/api/auth'));
app.use('/api/profile',require('./routes/api/profile'));
app.use('/api/posts',require('./routes/api/posts'));

const PORT = 3000;

app.listen(PORT,()=> console.log(`server is running at ${PORT}`));
