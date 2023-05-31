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

async function createPost({
    title,
    description,
    imageURL
}) {
    try {
        const { rows: [post] } = await client.query(`
            INSERT INTO posts (title, description, "imageURL") 
            VALUES ($1, $2, $3)
            ON CONFLICT (title) DO NOTHING
            RETURNING *;
        `, [title, description, imageURL]);

        return post;
    } catch (error) {
        throw error;
    }
}

async function updatePost(id, fields = {}) {
    //build setString
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ')

    //return early if this is called without fields
    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [post] } = await client.query(`
            UPDATE posts
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
        `, Object.values(fields));

        return post;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    client,
    getAllPosts,
    createPost,
    updatePost
}