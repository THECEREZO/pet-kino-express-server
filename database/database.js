import mongoose from "mongoose";

export async function db_connect() {
	try {
		console.log('Connection database initialize...');
	
		await mongoose.connect('mongodb://root:password@database_mongodb:27017/').then((res) => { console.log(res); return console.log('Connection to database created')})
	} catch (error) {
		console.log(error)
	}
}

const filmSchema = new mongoose.Schema({
	header: { type: String, required: true },
	description: { type: String, required: true },
	img: { type: String },
	video: { type: String, required: true },
	director: { type: String },
	year: { type: Number },
}, { versionKey: false })

export const Film = mongoose.model('film', filmSchema);