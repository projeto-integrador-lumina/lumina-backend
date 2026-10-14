import mongoose from "mongoose";


const responsibleSchema = new.Schema({
    name: String,
    contato: String,
    cpf: String,
    telephone: String,
})

const patientSchema = new mongoose.Schema({
    name: String,
    surname: String,
    address: String,
    date_birth: Date,
    sex: String,
    level_gravity: String,
    photo_profile: String,
    active: String,
    responsible: responsibleSchema,
});

const Patient = mongoose.model('Patient', patientSchema);

export default Patient;