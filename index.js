const express = require('express');
const Joi = require("joi");
const app = express();

//pipeline and middleware
app.use(express.json());


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
    res.send(movies);
});

app.get('/api/v1/movies/:id', (req, res) => {
    const id = req.params.id;
    const movie = movies.find(movie => movie.id === parseInt(id));

    if (!movie) {
        res.status(404).send(`Movie with id ${id} was not found!`);
        return;
    }
    res.send(movie);
});

app.post('/api/v1/movies', (req, res) => {

    //req.body

    const schema = Joi.object({
        name: Joi.string().min(1).required(),
        description: Joi.string().min(5).required()
    });

    const validationObject = schema.validate(req.body);

    if (validationObject.error) {
        res.status(400).send(validationObject.error.details[0].message);
        return;
    }

    const movie = {
        ...req.body, id: movies.length + 1
    };

    movies.push(movie);

    res.send(movie);
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