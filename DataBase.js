const mysql = require('mysql2/promise'); // استخدم mysql2/promise للدعم التلقائي للـ Promises

class DataBase {
    constructor() {
        this.connection = null; // تهيئة المتغير الخاص بالاتصال
    }

    async connect() {
        try {
            this.connection = await mysql.createConnection({
                host: your_database_host,
                user: your_database_user,
                password: your_database_password,
                database: your_database_name
            });
            console.log("Connected to database");
        } catch (error) {
            console.error("Error connecting to database:", error);
            throw error;
        }
    }
    async close() {
        if (this.connection) {
            await this.connection.end(); // إغلاق الاتصال بقاعدة البيانات
            console.log("Database connection closed");
        }
    }

    async Add_user(username, email, password) {
        try {
            // تأكد من أن الاتصال موجود
            if (!this.connection) {
                throw new Error("Database connection not established");
            }

            // تنفيذ الاستعلام
            const [result] = await this.connection.execute(
                [username, email, password],
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
            );
            console.log("User added successfully:", result);
            return result; // إرجاع النتيجة
        } catch (error) {
            console.error("Error adding user:", error);
            throw error;
        }
    }
    async Verify_user(username, password) {
        try {
            if (!this.connection) {
                throw new Error("Database connection not established");
            }

            // تنفيذ الاستعلام مع التحقق من اسم المستخدم وكلمة المرور
            const [result] = await this.connection.execute(
                "SELECT username, password FROM users WHERE username = ? ",
                [username,]
            );

            if (result.length > 0) {
                if (result[0].password === password){
                return [1,1]
                }
                else  return [1,0]
            }
   else {
                return [0,0]; // إرجاع null إذا لم يتم العثور على المستخدم
            }
        } catch (error) {
            console.error("Error verifying user:", error);
            throw error;
        }
    }
    async login_user(email, password) {
        try {
            if (!this.connection) {
                throw new Error("Database connection not established");
            }

            // تنفيذ الاستعلام مع التحقق من اسم المستخدم وكلمة المرور
            const [result] = await this.connection.execute(
                "SELECT email, password FROM users WHERE email = ? ",
                [email,]
            );

            if (result.length > 0) {
                if (result[0].password === password){
                    return [1,1]
                }
                else  return [1,0]
            }
            else {
                return [0,0]; // إرجاع null إذا لم يتم العثور على المستخدم
            }
        } catch (error) {
            console.error("Error verifying user:", error);
            throw error;
        }
    }
    async get_id(email){
        try {
            if(!this.connect()) {
                throw new Error("Database connection not established");
            }
            const id=await this.connection.execute("SELECT id FROM users WHERE email = ?", [email,]);
            return await id


        } catch (err){
            console.error(err)
            throw err;
        }

}
    async add_publication(user_id,title,content,likes,created_at){
        console.log(user_id,title,content,likes,created_at)

        try {
            if(!this.connect()) {
                throw new Error("Database connection not established");
            }
            await this.connection.execute("" +
                "INSERT INTO publications (user_id,title,content,likes,created_at) VALUES (?, ?, ?, ?, ?)",
                [user_id,title,content,likes,created_at]);

        } catch (error) {
            console.error(error)
            throw error;
        }
    }
    async add_like(id_publication){
        try {
            await this.connection.execute("UPDATE publications SET likes=likes+1 WHERE id = ?", [id_publication]);
            return await this.connection.execute("SELECT likes FROM publications  where id=?",[id_publication])
        }catch (error){
            console.error(error)
            throw error
        }

    }
    async add_comment(id_user, postId, comment, created_at) {
        try {
            if (!this.connection) throw new Error("الاتصال غير موجود");

            await this.connection.execute(
                "INSERT INTO comments (user_id, publication_id, comment, created_at) VALUES (?, ?, ?, ?)",
                [id_user, postId, comment, created_at]
            );

        } catch (error) {
            console.error('خطأ في إضافة التعليق:', error);
            throw error;
        }
    }
    async get_comment(id_publication) {
        try {
            if (!this.connection) throw new Error("الاتصال بقاعدة البيانات غير موجود");

            const [comments] = await this.connection.execute(
                "SELECT comment, created_at FROM comments WHERE publication_id = ?",
                [id_publication]
            );

            // التأكد من إرجاع مصفوفة حتى لو كانت فارغة
            return Array.isArray(comments) ? comments : [];

        } catch (error) {
            console.error('خطأ في جلب التعليقات:', error);
            return []; // إرجاع مصفوفة فارغة في حالة الخطأ
        }
    }
    async get_publication(){
        try {
            if(!this.connect()) throw new Error("Database connection not established")
            const [publications]=await this.connection.execute("SELECT id,content,title,likes FROM publications")
            return publications

        } catch (error) {
            console.error(error)
        }
    }

}
module.exports={DataBase}
// مثال لاستخدام الكلاس
/*(async () => {
    try {
        const db = new Database();
        await db.connect(); // الاتصال بقاعدة البيانات
        await db.Add_user("testuser000", "test000@example.com", "password123"); // إضافة مستخدم

        // التحقق من المستخدم
        const user = await db.Verify_user("testuser", "password123");
        if (user) {
            console.log("User verified:", user);
        } else {
            console.log("User verification failed");
        }
    } catch (error) {
        console.error("Failed:", error);
    } /*finally {
        await db.close(); // إغلاق الاتصال بقاعدة البيانات
    }*/
//})();