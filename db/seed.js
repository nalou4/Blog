
const { 
    client,
    getAllPosts,
    createPost,
    updatePost
} = require('./index');

//DROP ALL TABLES
async function dropTables(){
    try {
        console.log("Starting to drop tables...");
        await client.query(`
            DROP TABLE IF EXISTS posts;
        `);
        console.log("Finished dropping tables!");
    } catch (error) {
        console.log("Error dropping tables!");
        throw error;
    }
}

//CREATE ALL TABLES
async function createTables(){
    try {
        console.log("Starting to build tables...");
        await client.query(`
            CREATE TABLE posts (
                id SERIAL PRIMARY KEY,
                title varchar(255) UNIQUE NOT NULL,
                description TEXT NOT NULL,
                "imageURL" TEXT
            );
        `);
        console.log("Finished building tables!");
    } catch (error) {
        console.log("Error building tables!");
        throw error;
    }
}

//CREATE SEED POSTS
async function createInitialPosts(){
    try {
        console.log("Starting to create posts...");

        await createPost({title: 'post1', description: 'description1', imageURL: 'image1'});

        console.log("Finished creating posts!");
    } catch (error) {
        console.log("Error creating posts!");
        throw error;
    }
}

//REBUILD DATABASE:
async function rebuildDB() {
    try {
        client.connect();
        await dropTables();
        await createTables();
        await createInitialPosts();
    } catch (error) {
        console.error(error);
    }
}

//TEST DATABASE:
async function testDB() {
    try {
        console.log("Starting to test database...");

        console.log("Calling getAllPosts...");
        const posts = await getAllPosts();
        console.log('Result: ', posts);

        console.log("Calling updatePost...");
        const updatedPost = await updatePost(posts[0].id, {
            title: "new title",
            description: "new description"
        });
        console.log('Result: ', updatedPost);

        console.log("Finished testing database!");
    } catch (error) {
        console.log("Error testing database!");
        console.error(error);
    }
}

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());