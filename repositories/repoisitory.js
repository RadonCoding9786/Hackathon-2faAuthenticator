import dao from './dao';

export class open {
    static async getUserByUsername(username) {
        return dao.get(`
            SELECT 
                users.user_id, 
                users.username, 
                users.email,
                user_profiles.first_name,
                user_profiles.last_name,
                user_profiles.description 
            FROM users
            JOIN user_profiles ON user_profiles.user_id = users.user_id 
            WHERE users.username = ?
        `, [username]);
    }

    static async getUserById(id) {
        return dao.get(`
            SELECT 
                users.user_id, 
                users.username, 
                users.email,
                user_profiles.first_name,
                user_profiles.last_name,
                user_profiles.description 
            FROM users
            JOIN user_profiles ON user_profiles.user_id = users.user_id 
            WHERE users.user_id = ?
        `, [id]);
    }

    static async searchUsers(q) {
        return dao.all(`
            SELECT
                users.user_id,
                users.username,
                user_profiles.first_name,
                user_profiles.last_name
            FROM 
            users 
            JOIN user_profiles ON user_profiles.user_id = users.user_id 
            WHERE (
                users.username LIKE ? OR
                user_profiles.first_name LIKE ? OR
                user_profiles.last_name LIKE ?
            )
        `, [q]);
    }

    static async getPosts(userID, offset, limit) {
        return dao.all(`
            SELECT 
                posts.post_id, 
                posts.user_id, 
                posts.text, 
                posts.date_published, 
                user_profiles.first_name, 
                user_profiles.last_name, 
                users.username, 
                post_images.filename, 
                (SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.post_id) AS total_likes,
                (SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.post_id AND post_likes.user_id = ?) AS is_liked_by_user,
                (SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = posts.post_id) AS total_comments
            FROM posts 
            JOIN user_profiles ON user_profiles.user_id = posts.user_id 
            JOIN users ON users.user_id = posts.user_id LEFT 
            JOIN post_images ON post_images.image_id = posts.image_id 
            ORDER BY date_published DESC
            LIMIT ? OFFSET ?
        `, [userID, limit, offset]);
    }

    static async getPostsByUsername(userID, username, offset, limit) {
        return dao.all(`
            SELECT 
                posts.post_id, 
                posts.user_id, 
                posts.text, 
                posts.date_published, 
                user_profiles.first_name, 
                user_profiles.last_name, 
                users.username, 
                post_images.filename, 
                (SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.post_id) AS total_likes,
                (SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.post_id AND post_likes.user_id = ?) AS is_liked_by_user,
                (SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = posts.post_id) AS total_comments
            FROM posts 
            JOIN user_profiles ON user_profiles.user_id = posts.user_id 
            JOIN users ON users.user_id = posts.user_id LEFT 
            JOIN post_images ON post_images.image_id = posts.image_id 
            WHERE users.username = ?
            ORDER BY date_published DESC
            LIMIT ? OFFSET ?
        `, [userID, username, limit, offset]);
    }

    static async getPostById(userID, postID) {
        return dao.get(`
            SELECT 
                posts.post_id, 
                posts.user_id, 
                posts.text, 
                posts.date_published, 
                user_profiles.first_name, 
                user_profiles.last_name, 
                users.username, 
                post_images.filename, 
                (SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.post_id) AS total_likes,
                (SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = posts.post_id AND post_likes.user_id = ?) AS is_liked_by_user,
                (SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = posts.post_id) AS total_comments
            FROM posts 
            JOIN user_profiles ON user_profiles.user_id = posts.user_id 
            JOIN users ON users.user_id = posts.user_id LEFT 
            JOIN post_images ON post_images.image_id = posts.image_id 
            WHERE post_id = ?
        `, [userID, postID]);
    }

    static async checkPostById(id) {
        return dao.get(`SELECT * FROM posts WHERE post_id = ?`, [id]);
    }

    static async insertPost(p_id, u_id, text, imageID, at) {
        return dao.run("INSERT INTO posts (post_id, user_id, text, image_id, date_published) VALUES (?, ?, ?, ?, ?)", [p_id, u_id, text, imageID, at]);
    }

    static async updatePost(id, text, image_id) {
        return dao.run("UPDATE posts SET text = ?, image_id = ? WHERE post_id = ?", [text, image_id, id]);
    }

    static async deletePost(postID) {
        return dao.run("DELETE FROM posts WHERE post_id =?", [postID]);
    }

    static async insertImage(id, filename) {
        return dao.run("INSERT INTO post_images (image_id, filename) VALUES (?, ?) ", [id, filename]);
    }

    static async removeImage(id) {
        return dao.run("DELETE FROM post_images  image_id = ?", [id]);
    }

    static async getTotalPostLikes(id) {
        return dao.get('SELECT (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) AS total_likes', [id]);
    }

    static async insertPostLikes(userID, postID, at) {
        return dao.run("INSERT INTO post_likes (user_id, post_id, committed_at) VALUES (?, ?, ?)", [userID, postID, at]);
    }

    static async removePostLikes(userID, postID) {
        return dao.run("DELETE FROM post_likes WHERE user_id = ? AND post_id = ?", [userID, postID]);
    }

    static async checkPostLikes(userID, postID) {
        return dao.get("SELECT like_id FROM post_likes WHERE user_id = ? AND post_id = ?", [userID, postID]);
    }

    static async getPostComments(postID) {
        return dao.all(`
            SELECT 
                comment_id,
                post_id, 
                post_comments.user_id, 
                text, 
                committed_at,
                user_profiles.first_name, 
                user_profiles.last_name, 
                users.username
            FROM post_comments 
            JOIN user_profiles ON user_profiles.user_id = post_comments.user_id
            JOIN users ON users.user_id = post_comments.user_id
            WHERE post_id = ?
        `, [postID]);
    }

    static async insertPostComments(userID, postID, text, at) {
        return dao.run("INSERT INTO post_comments (user_id, post_id, text, committed_at) VALUES (?, ?, ?, ?)", [userID, postID, text, at]);
    }

    static async removePostComments(id) {
        return dao.run("DELETE FROM post_comments WHERE comment_id = ?", [id]);
    }

    static async checkPostComments(id) {
        return dao.get("SELECT post_id FROM post_comments WHERE comment_id = ?", [id]);
    }
}

export class closed {
    static async getUserByUsername(username) {
        return dao.get("SELECT * FROM users WHERE username = ?", [username]);
    }

    static async getUserByEmail(email) {
        return dao.get("SELECT * FROM users WHERE email = ?", [email]);
    }

    static async getUserById(id) {
        return dao.get(`
        SELECT 
            *
        FROM users
        JOIN user_profiles ON user_profiles.user_id = users.user_id 
        WHERE users.user_id = ?
        `, [id]);
    }

    static async deleteUserById(id) {
        return dao.run("DELETE FROM users WHERE user_id = ?", [id]);
    }

    static async insertUser(id, usrnm, pswd, eml) {
        return dao.run("INSERT INTO users (user_id, username, email, password) VALUES (?, ?, ?, ?)", [id, usrnm, pswd, eml]);
    }

    static async updateUser(id, usrnm, eml, frstnm, lstnm, desc) {
        dao.run("UPDATE users SET username = ?, email = ? WHERE user_id = ?", [usrnm, eml, id]);
        return dao.run("UPDATE user_profiles SET first_name = ?, last_name = ?, description = ? WHERE user_id = ?", [frstnm, lstnm, desc, id]);
    }

    static async updatePassword(id, pass) {
        return dao.run("UPDATE users SET password = ? WHERE user_id = ?", [pass, id]);
    }

    static async logoutUserSessions(id) {
        dao.run("DELETE FROM access WHERE user_id = ?", [id]);
    }

    static async deleteToken(tkn) {
        return dao.run("DELETE FROM access WHERE token = ?", [tkn]);
    }

    static async checkToken(tkn) {
        return dao.get("SELECT * FROM access WHERE token = ?", [tkn]);
    }

    static async insertToken(usrid, tkn, crt, exp) {
        return dao.run("INSERT INTO access (user_id, token, created_at, expires_at) VALUES (?, ?, ?, ?)", [usrid, tkn, crt, exp]);
    }
}