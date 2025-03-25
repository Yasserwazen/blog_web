document.getElementById("register").addEventListener('submit', async (e) => {
    e.preventDefault(); // منع إعادة تحميل الصفحة

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const email = document.getElementById("email").value.trim();

    if (!username || !password || !email) {
        alert("جميع الحقول مطلوبة");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/register", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        //const resp = await response.json();
         if (await response.json() === "it's ok") {
            console.log("user is registered");
        } else {
            console.log("username already exists");
        }
    } catch (error) {
        console.error(error);
    }
});

