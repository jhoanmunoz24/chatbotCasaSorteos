import 'dotenv/config'
import pkg from '@builderbot/database-postgres'
const { PostgreSQLAdapter } = pkg 

export const adapterDB = new PostgreSQLAdapter({
    host: process.env.POSTGRES_DB_HOST,
    user: process.env.POSTGRES_DB_USER,
    database: process.env.POSTGRES_DB_NAME,
    password: String(process.env.POSTGRES_DB_PASSWORD),
    port: Number(process.env.POSTGRES_DB_PORT),
})