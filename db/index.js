//DATABASE UTILITY FUNCTIONS
const { Client } = require('pg');
const client = new Client('postgres://localhost:5432/blog-dev');

//CREATE HELPER FUNCTION
async function addTagsToPost(postId, tagList) {
    try {
        const createPostTagPromises = tagList.map(
            tag => createPostTag(postId, tag.id)
        );

        await Promise.all(createPostTagPromises);

        return await getPostById(postId);
    } catch (error) {
        throw error;
    }
}

//CREATE
async function createPost({
    title,
    description,
    imageURL,
    tags = []
}) {
    try {
        const { rows: [post] } = await client.query(`
            INSERT INTO posts (title, description, "imageURL") 
            VALUES ($1, $2, $3)
            ON CONFLICT (title) DO NOTHING
            RETURNING *;
        `, [title, description, imageURL]);

        const tagList = await createTags(tags);

        return await addTagsToPost(post.id, tagList);
    } catch (error) {
        throw error;
    }
}

async function createTags(tagList) {
    if (tagList.length === 0) {
        return;
    }

    //take something like: $1), ($2), ($3
    const insertValues = tagList.map(
        (_, index) => `$${index + 1}`).join('), (');

    //need something like: $1, $2, $3
    const selectValues = tagList.map(
        (_, index) => `$${index + 1}`).join(', ');

    try {
        await client.query(`
            INSERT INTO tags (content)
            VALUES (${insertValues})
            ON CONFLICT (content) DO NOTHING;
        `, tagList)

        const { rows } = await client.query(`
            SELECT * FROM tags
            WHERE content 
            IN (${selectValues})
        `, tagList)

        return rows;
    } catch (error) {
        throw error;
    }
}

async function createPostTag(
    postId,
    tagId
) {
    try {
        await client.query(`
            INSERT INTO post_tags ("postId", "tagId")
            VALUES ($1, $2)
            ON CONFLICT ("postId", "tagId") DO NOTHING;
        `, [postId, tagId])

    } catch (error) {
        throw error;
    }
}

async function createAdmin({
    username,
    password
}){
    try {
        const {rows: [user]} = await client.query(`
            INSERT INTO admins (username, password)
            VALUES ($1, $2)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
        `, [username, password]);

        return user;
    } catch (error) {
        throw error;
    }
}

//READ
async function getPostById(postId) {
    try {
        const { rows: [post] } = await client.query(`
            SELECT *
            FROM posts
            WHERE id=$1;
        `, [postId]);

        const { rows: tags } = await client.query(`
            SELECT tags.*
            FROM tags
            JOIN post_tags ON tags.id=post_tags."tagId"
            WHERE post_tags."postId"=$1;
        `, [postId])

        post.tags = tags;

        return post;
    } catch (error) {
        throw error;
    }
}

async function getAllPosts() {
    try {
        const { rows: postIds } = await client.query(`
            SELECT id
            FROM posts;
        `);

        const posts = await Promise.all(postIds.map(
            post => getPostById(post.id)
        ));

        return posts;
    } catch (error) {
        throw error;
    }
}

async function getAllPostsByTag(tagName) {
    try {
        const { rows: postIds } = await client.query(`
            SELECT posts.id
            FROM posts
            JOIN post_tags ON posts.id=post_tags."postId"
            JOIN tags ON tags.id=post_tags."tagId"
            WHERE tags.content=$1;
        `, [tagName]);

        return await Promise.all(postIds.map(
            post => getPostById(post.id)
        ));
    } catch (error) {
        throw error;
    }
}

async function getAllTags() {
    const { rows } = await client.query(`
        SELECT id, content
        FROM tags;
    `);

    return rows;
}

async function getAllAdmins(){
    const {rows: users} = await client.query(`
        SELECT id, username
        FROM admins;
    `,);

    return users;
}

//UPDATE
async function updatePost(postId, fields = {}) {
    // read off the tags & remove that field 
    const { tags } = fields; // might be undefined
    delete fields.tags;

    // build the set string
    const setString = Object.keys(fields).map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    try {
        // update any fields that need to be updated
        if (setString.length > 0) {
            await client.query(`
                UPDATE posts
                SET ${setString}
                WHERE id=${postId}
                RETURNING *;
            `, Object.values(fields));
        }

        // return early if there's no tags to update
        if (tags === undefined) {
            return await getPostById(postId);
        }

        // make any new tags that need to be made
        const tagList = await createTags(tags);
        const tagListIdString = tagList.map(
            tag => `${tag.id}`
        ).join(', ');

        // delete any post_tags from the database which aren't in that tagList
        await client.query(`
            DELETE FROM post_tags
            WHERE "tagId"
            NOT IN (${tagListIdString})
            AND "postId"=$1;
        `, [postId]);

        // and create post_tags as necessary
        await addTagsToPost(postId, tagList);

        return await getPostById(postId);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    client,
    createPost,
    getAllPosts,
    getAllPostsByTag,
    updatePost,
    getAllTags,
    createAdmin,
    getAllAdmins
}