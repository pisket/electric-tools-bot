import { Pool } from 'pg';

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "shop",
    password: "pass",
    port: 5432
})

export default pool;