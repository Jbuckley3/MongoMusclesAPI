const mongoose = require('mongoose')

const exerciseSchema = new mongoose.Schema(
	{
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
        },
    description: { 
		type: String, 
		required: true 
	},
    duration: {
		 type: Number, 
		 required: true 
		},
    date: {
		 type: Date,
		  required: true 
		},
	},
	{
		timestamps: true,
	}
)

module.exports = mongoose.model('Exercise', exerciseSchema)
