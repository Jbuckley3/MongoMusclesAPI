const mongoose = require('mongoose');
const exercise = require('./exercise')
const db = require('../../config/db')

const startExercises = [
    {
        name: 'Josh',
        description: 'Jogging',
        duration: 30,
        date: new Date(),
      },
      {
        name: 'Timm',
        description: 'Weightlifting',
        duration: 45,
        date: new Date(),
      },
]


mongoose.connect(db, { useNewUrlParser: true })
    .then(() => {
        exercise.deleteMany({ owner: null })
            .then(deletedExercises => {
                console.log('Deleted exercises in seed script:', deletedExercises);

                exercise.create(startExercises)
                    .then(newExercises => {
                        console.log('New exercises added to db:\n', newExercises);
                        mongoose.connection.close();
                    })
                    .catch(error => {
                        console.log('An error has occurred:\n', error);
                        mongoose.connection.close();
                    });
            })
            .catch(error => {
                console.log('An error has occurred:\n', error);
                mongoose.connection.close();
            })
    })
    .catch(error => {
        console.log('An error has occurred:\n', error);
        mongoose.connection.close();
    });


