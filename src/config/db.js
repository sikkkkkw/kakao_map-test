import mysql from 'mysql2';
import 'dotenv/config';

const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
};

//DB 연결

// 커넥션방식,커넥션 풀에 담가두는 방식(90%사용)-네트워크비용이 아까워서

//POOL(수영장)
const db = mysql.createPool(config).promise();

export default db;
