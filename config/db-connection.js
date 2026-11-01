import dotenv from 'dotenv';
dotenv.config();

import mongoose from "mongoose";

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;


const connect = () => {
    mongoose.connect(
        //`mongodb+srv://${dbUser}:${dbPassword}@cluster0.qxxqdxd.mongodb.net/api-lumina?appName=Cluster0`
        `mongodb://${dbUser}:${dbPassword}@ac-cbkziex-shard-00-00.oygkfnt.mongodb.net:27017,ac-cbkziex-shard-00-01.oygkfnt.mongodb.net:27017,ac-cbkziex-shard-00-02.oygkfnt.mongodb.net:27017/api-lumina?ssl=true&replicaSet=atlas-13hp2n-shard-0&authSource=admin`
    );

    const connection = mongoose.connection;

    connection.on("error", () => {
        console.log("Erro ao conectar com o mongoDB.");
    });

    connection.on("open", () => {
        console.log("Conectado ao mongoDB com sucesso!");
    });
};

connect();

export default mongoose;