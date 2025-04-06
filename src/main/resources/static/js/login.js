function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    try {
        const response = await fetch('/api/loginRole', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
            const user = await response.json();
            
            // Assign shopId based on email for ShopOwner role
            if (user.role === 'ShopOwner') {
                // Map specific emails to shop IDs
                const shopEmailMap = {
                    'tronghp@gmail.com  ': 2,
                    'tvi@gmail.com': 3
                };
                
                // If email exists in map, assign shopId, otherwise use a default
                if (shopEmailMap[email]) {
                    user.shopId = shopEmailMap[email];
                } else {
                    // Extract numbers from email as fallback (e.g. owner2@domain.com → shopId: 2)
                    const numMatch = email.match(/\d+/);
                    user.shopId = numMatch ? parseInt(numMatch[0]) : 1;
                }
                
                console.log('Assigned shopId:', user.shopId, 'to user:', user.email);
            }
            
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(user));
            
            // Chuyển hướng dựa trên vai trò
            switch(user.role) {
                case 'Admin':
                    window.location.href = '/admin';
                    break;
                case 'ShopOwner':
                    window.location.href = '/shopOwner';
                    break;
                case 'Staff':
                    window.location.href = '/staff';
                    break;
                case 'Customer':
                    window.location.href = '/customer';
                    break;
                default:
                    window.location.href = '/';
            }
        } else {
            errorMessage.textContent = 'Email hoặc mật khẩu không đúng';
            errorMessage.classList.remove('hidden');
        }
    } catch (error) {
        errorMessage.textContent = 'Có lỗi xảy ra, vui lòng thử lại';
        errorMessage.classList.remove('hidden');
    }
    
    return false;
} 