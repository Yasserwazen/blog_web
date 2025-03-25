document.getElementById("login").addEventListener('submit',async (e)=>{
    e.preventDefault();
    const email=document.getElementById("email_login").value.trim()
    const password=document.getElementById("password_login").value.trim()
    try {
        const response = await fetch("http://localhost:3000/login", {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        const resp=await response.json();
        if (resp==="Logged in successfully") {
            console.log("user is logged in successfully")
            window.location.href="/blog/assets/html/index.html"
            //console.log(token)
        }
        else if (resp==="e not ok") console.log("email not ok")

    }catch (error){
        console.error(error)
        throw error
    }

})