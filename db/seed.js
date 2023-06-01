
const {
    client,
    getAllPosts,
    createPost,
    updatePost,
    getAllPostsByTag,
    getAllTags,
    createAdmin,
    getAllAdmins
} = require('./index');

//DROP ALL TABLES
async function dropTables() {
    try {
        console.log("Starting to drop tables...");
        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
            DROP TABLE IF EXISTS admins;
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
                content TEXT UNIQUE NOT NULL
            );
        
        `);

        await client.query(`
            CREATE TABLE post_tags (
                "postId" INTEGER REFERENCES posts(id) NOT NULL,
                "tagId" INTEGER REFERENCES tags(id) NOT NULL,
                UNIQUE ("postId", "tagId")
            );
        `);

        await client.query(`
            CREATE TABLE admins (
                id SERIAL PRIMARY KEY,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL
            );
        `);

        console.log("Finished building tables!");
    } catch (error) {
        console.log("Error building tables!");
        throw error;
    }
}

//SEED ADMINS
async function createInitialAdmin(){
    try {
        console.log("Starting to create admin...");

        await createAdmin({
            username: 'admin1',
            password: 'adminpass1'
        })

        console.log("Finished creating admin!");
    } catch (error) {
        console.log("Error creating admin!");
        throw error;
    }
}

//SEED POSTS
async function createInitialPosts() {
    try {
        console.log("Starting to create posts...");

        await createPost({ 
            title: 'post1', 
            description: 'description1', 
            imageURL: 'image1', 
            tags: ["#tagNumber1", "#tagNumber2"] 
        });

        await createPost({ 
            title: 'post2', 
            description: 'description2', 
            imageURL: 'image2', 
            tags: ["#tagNumber1", "#tagNumber2"] 
        });

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
        await createInitialAdmin();
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

        console.log("Calling updatePost on posts[1], only updating tags");
        const updatePostTagsResult = await updatePost(posts[1].id, {
            tags: ["#updatedTag1", "#updatedTag2", "#updatedTag3"]
        });
        console.log("Result:", updatePostTagsResult);
    

        console.log("Calling getAllPostsByTag, #tagNumber2...");
        const postsByTag = await getAllPostsByTag("#tagNumber2");
        console.log("Result: ", postsByTag);

        console.log("Calling getAllTags...");
        const allTags = await getAllTags();
        console.log("Result:", allTags);

        console.log("Calling createAdmin...");
        const admins = await getAllAdmins();
        console.log("Result: ", admins);

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