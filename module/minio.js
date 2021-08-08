const Minio = require("minio");
// const uuid = require("uuid").v4;
// const path = require("path")
require('dotenv').config();

exports.minioClient = new Minio.Client({
    endPoint: process.env.MINIO_HOST,
    port: Number(process.env.MINIO_PORT),
    useSSL: false,
    accessKey: process.env.MINIO_ACCES_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});