
const {
    client,
    getAllPosts,
    createPost,
    updatePost,
    createTag,
    getAllTags
} = require('./index');

//DROP ALL TABLES
async function dropTables() {
    try {
        console.log("Starting to drop tables...");
        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
        `);
        console.log("Finished dropping tables!");
    } catch (error) {
        console.log("Error dropping tables!");
        throw error;
    }
}

//CREATE ALL TABLES
async function createTables() {
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

        await client.query(`
            CREATE TABLE tags (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL
            );
        
        `);

        await client.query(`
            CREATE TABLE post_tags (
            id SERIAL PRIMARY KEY,
            "postId" INTEGER REFERENCES posts(id),
            "tagId" INTEGER REFERENCES tags(id),
            UNIQUE ("postId", "tagId")
            );
        `);

        console.log("Finished building tables!");
    } catch (error) {
        console.log("Error building tables!");
        throw error;
    }
}

//SEED POSTS
async function createInitialPosts() {
    try {
        console.log("Starting to create posts...");

        await createPost({ title: 'post1', description: 'description1', imageURL: 'image1' });

        console.log("Finished creating posts!");
    } catch (error) {
        console.log("Error creating posts!");
        throw error;
    }
}

//SEED TAGS
async function createInitialTags(){
    try {
        console.log("Starting to create tags...");

        await createTag({content: "tag1"});
        await createTag({content: "tag2"});
        await createTag({content: "tag3"});

        console.log("Finished creating tags!");
    } catch (error) {
        console.log("Error creating tags!")
    }
}

//REBUILD DATABASE:
async function rebuildDB() {
    try {
        client.connect();
        await dropTables();
        await createTables();
        await createInitialPosts();
        await createInitialTags();
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

        console.log("Calling getAllTags...");
        const tags = await getAllTags();
        console.log('Result: ', tags);

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