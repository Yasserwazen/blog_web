//requirement library

const express = require('express');
const cors = require('cors');
const { DataBase } = require('./DataBase');
const jwt=require('jsonwebtoken');
const cookie_parser = require('cookie-parser');
const crypto=require('crypto');
const secret_key=crypto.randomBytes(64).toString('hex');

const app = express();
app.use(cookie_parser())
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:63342', // النطاق المسموح به
    credentials: true // السماح بإرسال بيانات المصادقة (مثل الكوكيز)
}));
app.use(express.static("assets"));

// authentication token
async function authenticateToken(request,response,next){
    //await console.log("token = "+request.cookies.authToken)
    const token=await request.cookies.authToken;
    //await console.log(token);
    if(!token) return response.status(401).json({ message: 'Access denied. No token provided.' })
    await jwt.verify(token,secret_key,(err,decoded)=>{
        if (err) return response.status(401).json({ message: 'Invalid token.' })
        request.user=decoded;
        next();
    })
}

app.post('/register', async (request, response) => {
    const { username, email, password } = await request.body;
    console.log(username)

    if (!username || !email || !password) {
        return response.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    const db = new DataBase();
    try {
        await db.connect();
        const verify = await db.Verify_user(username, password);

        if (verify[0] === 0 && verify[1] === 0) {
            await db.Add_user(username, email, password);
            response.json("it's ok");
        } else {
            response.json(" ");
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "حدث خطأ أثناء معالجة الطلب" });
    } finally {
        await db.close();
    }
});
app.post("/login",async (request,response)=>{
    const {email,password}=await request.body
    const db=new DataBase()
    try {
        await db.connect()
        const login=await db.login_user(email,password)
        if(login[0]===1){
            if (login[1]===0) response.json("p error")
            const [rows]=await db.get_id(email)
            const id=rows[0].id
            console.log(id)
            const token=await jwt.sign({id},secret_key,{expiresIn:'1h'})
            response.cookie("authToken",token,{
                httpOnly: true,
                secure: false, // ❗ اجعله true إذا كنت تستخدم HTTPS
                sameSite: 'lax', // ✓ يسمح بالإرسال على نفس النطاق
                maxAge: 3600000,
                path: '/', // ✓ يشمل جميع المسارات
                domain: 'localhost' })

                response.json('Logged in successfully')
                //response.sendFile(path.join(__dirname, '/assets/html', 'index.html')); // تغيير المسار حسب موقع ملف HTML
        }
        else response.json("e not ok")

    }catch (error){
        console.error(error)
    }finally {
        await db.close()
    }
})
app.post("/addpost", authenticateToken, async (request, response) => {
    const userid = await request.user.id;
    console.log("user id = ",userid)
    const { content, title } = request.body;

    // التحقق من صحة البيانات
    if (!title || !content) {
        return response.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    const db = new DataBase();
    try {
        await db.connect();
        const currentDate = new Date().toISOString().split('T')[0]; // تاريخ اليوم
        console.log(currentDate)
        await db.add_publication(userid, title, content, 0, currentDate);
        console.log("تمت إضافة المنشور بنجاح");
        response.json({ message: "تمت إضافة المنشور بنجاح" });
    } catch (error) {
        console.error("Database error:", error);
        response.status(500).json({
            error: "حدث خطأ أثناء معالجة الطلب",
            details: error.message
        });
    } finally {
        await db.close();
    }
});
app.get("/LoadPosts",async (request,response)=>{
    const db=new DataBase()
    try {
        await db.connect();
        const publications = await db.get_publication()
        response.json({publications})
        await db.close()
    }catch (error){
        console.error(error)
    }
})
app.post("/AddLike",async (request,response)=>{
    const db=new DataBase()
    try {
        await db.connect()
        const id=await request.body.id
        const likes=await db.add_like(id)
        await db.close()
        const likescount=likes[0][0].likes
        console.log("likes= ",likescount)
        response.json({success:true,likescount})
    }catch (error) {
        console.error(error)
    }

})
// تغيير المسار من "/Add_Comment" إلى "/AddComment"
app.post("/Add_Comment", authenticateToken, async (request, response) => {
    const db = new DataBase();
    console.log("hello")
    try {
        // تصحيح أسماء الحقول لتتطابق مع الطلب
        const { postId, comment } = request.body; // كان: id_publication, content
        const created_at = new Date().toISOString().split('T')[0];

        // التحقق من البيانات
        if (!postId || !comment) {
            return response.status(400).json({
                success: false,
                error: "بيانات ناقصة: يرجى إدخال معرف المنشور والمحتوى"
            });
        }

        // استخراج id_user من التوكن
        const id_user = request.user.id;
        console.log(id_user)
        await db.connect();
        await db.add_comment(id_user, postId, comment, created_at);

        response.status(201).json({ success: true });

    } catch (error) {
        console.error("حدث خطأ:", error);
        response.status(500).json({
            success: false,
            error: error.message || "حدث خطأ غير متوقع"
        });
    } finally {
        if (db.connection) {
            await db.close();
        }
    }
});app.post("/LoadComments", async (request, response) => {
    const db = new DataBase();
    try {
        await db.connect();
        const id_publication = request.body.postId;

        // التعديل: جلب التعليقات باستخدام postId الفعلي
        const comments = await db.get_comment(id_publication);

        // التعديل: إرسال المصفوفة مباشرة مع تغليفها في كائن إذا لزم الأمر
        response.json({
            success: true,
            comments: Array.isArray(comments) ? comments : []
        });

    } catch (error) {
        console.error("Error:", error);
        response.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    } finally {
        await db.close();
    }
});app.listen(3000, () => {
    console.log("الخادم يعمل على http://localhost:3000");
});