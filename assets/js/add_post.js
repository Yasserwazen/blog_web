document.getElementById("postForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const content = document.getElementById("postContent").value.trim();
    const title = document.getElementById("postTitle").value.trim();

    if (!title || !content) {
        alert("جميع الحقول مطلوبة");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/addpost", {
            method: 'POST',
            credentials: 'include', // إرسال ملفات تعريف الارتباط تلقائيًا
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, title })
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage || "حدث خطأ أثناء معالجة الطلب");
        }

        const resp = await response.json();
        if (resp.message === "تمت إضافة المنشور بنجاح") {
            console.log(resp);
            alert("تمت إضافة المنشور بنجاح!");
            window.location.href="/blog/assets/html/index.html"

            document.getElementById("postForm").reset(); // إعادة تعيين النموذج
        }
    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء إضافة المنشور. يرجى المحاولة لاحقًا.");
    }
});