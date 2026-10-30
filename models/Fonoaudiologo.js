import mongoose from "mongoose";

const fonoSchema = new mongoose.Schema({
    id_login: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true, unique: true },
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    crfa: { type: String, required: true, trim: true, unique: true },
    telefone: { type: String, required: true, trim: true },
    foto_perfil: String,
    configuracoes: {
      modo_escuro: {type:Boolean,default:false},
      notificacoes: {type:Boolean,default:true},
      backup_automatico: {type:Boolean,default:true},
      sessao_automatica: {type:Boolean,default:false},
      idioma: {type:String,enum:["pt-BR"],default:"pt-BR"},
      tempo_padrao: {type:Number,enum:[15,30,45,60],default:30},
      nivel_inicial: {type:Number,min:1,default:1},
      formato_relatorio: {type:String,enum:["PDF"],default:"PDF"}
    }
}, { timestamps: true });

const Fonoaudiologo = mongoose.model('Fonoaudiologo', fonoSchema);

export default Fonoaudiologo;
