const express = require('express');
const Joi = require("joi");
const mongoose=require('mongoose');
const app = express();

//pipeline and middleware
app.use(express.json());
mongoose.connect('mongodb://localhost/imdb')
.then(()=>console.log('connected to mongodb'))
.catch((err)=>console.log('exception occured',err));


const moviesSchema=new mongoose.Schema({
    name:String,
    description:String,
    boxOffice:Number,
    budget:Number,
    isHit:Boolean,
    actors:[String],
    releaseDate:Date
})
const Movie=mongoose.model('Movie',moviesSchema);
const movies = [{
    id: 1,
    name: 'Lagaan',
    description: 'Villagers vs Goras'
}, {
    id: 2,
    name: 'Titanic',
    description: 'was there enough space?'
}];

app.get('/api/v1/movies', (req, res) => {
    //Movie.find().then((movies)=>res.send(movies));
    //Movie.findOne().then((movies)=>res.send(movies));
    //Movie.find({isHit:true,budget:10}).sort({name:1}).select({name:1,description:1,releaseDate:1}).limit(5).then((movies)=>res.send(movies))
   // Movie.find().sort({name:1}).limit(10).select({name:1,description:1,releaseDate:1}).then((movies)=>res.send(movies));

  // Movie.find({budget:{$gte:10,$lte:20}}).sort({budget:1}).then((movies)=>res.send(movies));
 // Movie.find({name:"Venom"}).then((movies)=>res.send(movies));
 // Movie.find({name:/venom/i}).then((movies)=>res.send(movies));
 // Movie.find({budget: {$in:[10,15]}}).then((movies)=>res.send(movies));
Movie.find({actors: {$in:[/.*Manoj.*/,/.*Aamir*./]}}).then((movies)=>res.send(movies));
});

app.get('/api/v1/movies/:name', (req, res) => {
    const name = req.params.name;
    Movie.find({actors: {$in:[new RegExp(name,"i")]}}).then((movies)=>res.send(movies));
    
});

app.post('/api/v1/movies', (req, res) => {

    //req.body

    const {name,description,boxOffice,budget,isHit,actors,releaseDate}=req.body;
    //movie object===document
    const movie=new Movie({
        name:name,
        description:description,
        budget:budget,
        boxOffice:boxOffice,
        isHit:isHit,
        actors:actors,
        releaseDate:releaseDate
    });
    //save in mogodb
    movie.save().then((movie)=>res.send(movie));

    
});

app.put('/api/v1/movies/:id', (req, res) => {

    const id = req.params.id;

    //Validate
    const schema = Joi.object({
        name: Joi.string().min(1).required(),
        description: Joi.string().min(5).required()
    });

    const validationObject = schema.validate(req.body);

    if (validationObject.error) {
        res.status(400).send(validationObject.error.details[0].message);
        return;
    }


    //if id does not exist, create a new object in the array
    const movieIndex = movies.findIndex(movie => movie.id === parseInt(id));
    if (movieIndex === -1) {
        const movie = {...req.body, id: movies.length + 1};
        movies.push(movie);
        res.send(movie);
        return;
    }

    
    movies.splice(movieIndex, 1, {...req.body, id: req.params.id});

    res.send(movies[movieIndex]);
    return;
});


app.patch('/api/v1/movies/:id', (req, res) => {

    const id = req.params.id;
    //if id does not exist, return 404
    const movieIndex = movies.findIndex(movie => movie.id === parseInt(id));
    if (movieIndex === -1) {
        res.status(404).send("Movie not found");
        return;
    }
    
    //Validation
    if(!req.body.name) {
        res.status(400).send("Not a valid name!");
        return;
    }
    
    //Make the partial update
    movies[movieIndex].name = req.body.name;

    res.send(movies[movieIndex]);
});

app.delete('/api/v1/movies/:id', (req, res) => {
    const id = req.params.id;
    //if id does not exist, return 404
    const movieIndex = movies.findIndex(movie => movie.id === parseInt(id));
    if (movieIndex === -1) {
        res.status(404).send("Movie not found");
        return;
    }

    const movie = movies[movieIndex];
    movies.splice(movieIndex, 1);

    res.send(movie);
});

app.listen(3000, () => console.log('Listening'));