// دالة لجلب المقالات من قاعدة البيانات
async function loadPosts() {
    try {
        const response = await fetch('http://localhost:3000/LoadPosts', {
            method: 'GET',
            credentials: 'include',
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) {
            throw new Error("فشل في جلب المقالات.");
        }
        const data=await response.json()
        return data.publications;
    } catch (error) {
        console.error("حدث خطأ أثناء جلب المقالات:", error);
        return [];
    }
}
async function AddLike(id){
  try {
      console.log(id);
      const response = await fetch('http://localhost:3000/AddLike', {
          method:'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({id})
      });
      if (!response.ok) {
          throw new Error("error send request")
      }

      const data=await response.json()
      if(data.success){
          const likeCountElement = document.querySelector(`.article[data-id="${id}"] .like-count`);
          if (likeCountElement) {
              likeCountElement.textContent = data.likescount; // تحديث عدد الإعجابات
          }
      }

  }catch (error) {
      console.error(error)
  }
}
async function AddComment(postId) {
    try {

        const textarea = document.getElementById(`comment-text-${postId}`);
        const errorDiv = document.getElementById(`error-${postId}`);
        const formContainer = document.getElementById(`comment-form-container-${postId}`);

        if (!textarea || !errorDiv || !formContainer) {
            throw new Error('العناصر المطلوبة غير موجودة');
        }
        console.log("hello fetch http://localhost:3000/Add_Comment")
        const response = await fetch('http://localhost:3000/Add_Comment', {
            method: 'POST',
            credentials:'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                postId: postId, // التأكد من تطابق الاسم مع السيرفر
                comment: textarea.value // كان: content
            })
        });

        const result = await response.json();

        if (result.success) {
            await toggleComments(postId);
            formContainer.style.display = 'none';
            textarea.value = '';
            errorDiv.textContent = '';
        } else {
            errorDiv.textContent = result.error || '❌ فشل إضافة التعليق';
        }

    } catch (error) {
        console.error('Error:', error);
        document.getElementById(`error-${postId}`).textContent = '⚠️ حدث خطأ في الإرسال';
    }
}
async function toggleComments(postId) {
    const commentSection = document.getElementById(`comment-section-${postId}`);
    const commentsList = document.getElementById(`comments-list-${postId}`);
    const button = document.querySelector(`[onclick="toggleComments(${postId})"]`);

    try {
        if (commentSection.style.display === 'none') {
            const response = await fetch('http://localhost:3000/LoadComments', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId: postId })
            });

            if (!response.ok) throw new Error('فشل تحميل التعليقات');

            const result = await response.json();

            // التعديل: استخراج المصفوفة من الكائن
            const comments = result.comments || [];

            if (!Array.isArray(comments)) {
                throw new Error('تنسيق التعليقات غير صحيح');
            }

            commentsList.innerHTML = comments.map(comment => `
                <div class="comment">
                    <p>${comment.comment}</p>
                </div>
            `).join('');
        }

        commentSection.style.display = commentSection.style.display === 'none' ? 'block' : 'none';
        button.textContent = commentSection.style.display === 'none' ? '💬 عرض التعليقات' : '✖ إغلاق التعليقات';

    } catch (error) {
        console.error('حدث خطأ:', error);
//        commentsList.innerHTML = `<div class="error">${error.message}</div>`;
    }
}
function displayPosts(posts) {
    const articlesContainer = document.getElementById('articles-container');
    if (!articlesContainer) {
        console.error("العنصر 'articles-container' غير موجود");
        return;
    }

    articlesContainer.innerHTML = posts.map(post => `
        <article class="article" data-id="${post.id}">
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            
            <div class="actions">
                <button class="like-button" onclick="AddLike(${post.id})">
                    👍 <span class="like-count">${post.likes}</span>
                </button>
                
                <button class="comment-button" onclick="toggleComments(${post.id})">
                    💬 عرض التعليقات
                </button>
                
                <!-- زر إضافة تعليق جديد -->
                <button class="add-comment-button" onclick="showCommentForm(${post.id})">
                    ➕ إضافة تعليق
                </button>
            </div>

            <!-- قسم التعليقات المخفي -->
            <div id="comment-section-${post.id}" class="comment-section" style="display: none;">
                <div class="comments-list" id="comments-list-${post.id}"></div>
            </div>

            <!-- نموذج إضافة التعليق (مخفي بشكل افتراضي) -->
<div id="comment-form-container-${post.id}" class="comment-form-container" style="display: none;">
    <form class="comment-form" onsubmit="event.preventDefault(); AddComment(${post.id})">
        <!-- حقل النص -->
        <div class="form-group">
            <textarea 
                id="comment-text-${post.id}" 
                class="comment-input"
                placeholder="اكتب تعليقك هنا..."
                rows="4"
                required
            ></textarea>
            <div class="input-border"></div>
        </div>

        <!-- أزرار التحكم -->
        <div class="form-controls">
            <button type="submit" class="btn btn-primary">
                <span class="btn-icon">✉️</span>
                <span class="btn-text">نشر التعليق</span>
            </button>
            
            <button type="button" class="btn btn-ghost" onclick="hideCommentForm(${post.id})">
                <span class="btn-icon">❌</span>
                <span class="btn-text">إلغاء</span>
            </button>
        </div>

        <!-- رسائل الخطأ -->
        <div class="error-message" id="error-${post.id}"></div>
    </form>
</div>
        </article>
    `).join('');
}

// دالة لإظهار نموذج التعليق
function showCommentForm(postId) {
    const formContainer = document.getElementById(`comment-form-container-${postId}`);
    formContainer.style.display = 'block';
}

// دالة لإخفاء نموذج التعليق
function hideCommentForm(postId) {
    const formContainer = document.getElementById(`comment-form-container-${postId}`);
    formContainer.style.display = 'none';
    document.getElementById(`comment-text-${postId}`).value = '';
}



    // عرض كل مقال (عنوان ومحتوى فقط)


// تهيئة التطبيق
document.addEventListener("DOMContentLoaded", async () => {
    // تحميل المقالات من الخادم
    const posts = await loadPosts();
    displayPosts(posts);
});