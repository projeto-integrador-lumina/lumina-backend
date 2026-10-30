import mongoose from "mongoose";

const schema = new mongoose.Schema({
    id_paciente: {type: mongoose.Schema.Types.ObjectId, ref:"Paciente", required:true, index:true},
    id_fono: {type: mongoose.Schema.Types.ObjectId, ref:"Fonoaudiologo", required:true},
    texto: {type:String, required:true, trim:true, maxlength:3000}
}, {timestamps:true});

export default mongoose.model("NotaClinica", schema);