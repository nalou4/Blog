//DATABASE UTILITY FUNCTIONS
const { Client } = require('pg');
const client = new Client('postgres://localhost:5432/blog-dev');

//POST ADAPTERS
async function getAllPosts() {
    const { rows } = await client.query(
        `SELECT id, title, description, "imageURL"
        FROM posts;
    `);

    return rows;
}

async function createPost({title, description, imageURL}){
    try {
        const { rows } = await client.query(`
            INSERT INTO posts (title, description, "imageURL") 
            VALUES ($1, $2, $3)
            ON CONFLICT (title) DO NOTHING
            RETURNING *;
        `, [ title, description, imageURL ]);

        return rows;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    client,
    getAllPosts,
    createPost
}