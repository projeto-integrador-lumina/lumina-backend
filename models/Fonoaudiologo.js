import mongoose from "mongoose";

const fonoSchema = new mongoose.Schema({
    name: String,
    email: String,
    crfa: String,
    telephone: String,
    photo_profile: String
});

const Fonoaudiologo = mongoose.model('Fonoaudiologo', fonoSchema);

export default Fonoaudiologo;