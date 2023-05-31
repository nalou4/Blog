//DATABASE UTILITY FUNCTIONS
const { Client } = require('pg');
const client = new Client('postgres://localhost:5432/blog-dev');

//POST ADAPTERS (METHODS)

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

async function getAllPosts() {
    const { rows } = await client.query(
        `SELECT id, title, description, "imageURL"
        FROM posts;
    `);

    return rows;
}

async function getAllPostsByTag({tagId}){
    const {rows: postTags} = await client.query(`
        SELECT * FROM post_tags
        WHERE "postId" = $1;
    `, [tagId])

    if (postTags.length === 0){
        return null;
    }

    return postTags;
}

//TAGS ADAPTERS (METHODS)
async function createTag({ content }){
    try {
        const {rows: [tag]} = await client.query(`
            INSERT INTO tags (content)
            VALUES ($1);
        `, [content])

        return tag;
    } catch (error) {
        throw error;
    }
}

async function updateTag(id, fields = {}){
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ')

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [tag] } = await client.query(`
            UPDATE tags
            SET ${setString}
            WHERE id=${id}
            RETURNING *;
        `, Object.values(fields));

        return tag;
    } catch (error) {
        throw error;
    }
}

async function getAllTags() {
    const { rows } = await client.query(
        `SELECT id, content
        FROM tags;
    `);

    return rows;
}

module.exports = {
    client,
    getAllPosts,
    createPost,
    updatePost,
    createTag,
    updateTag,
    getAllTags,
    getAllPostsByTag
}