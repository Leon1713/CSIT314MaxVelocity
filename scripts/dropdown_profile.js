(async function loadDropdownAvatar() {
    try {
        const res = await fetch('http://127.0.0.1:8000/profile', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.profile_picture_url) return;

        const img  = document.getElementById('dropdown-avatar-img');
        const icon = document.getElementById('dropdown-avatar-icon');
        if (img) {
            img.src = data.profile_picture_url;
            img.classList.remove('hidden');
            if (icon) icon.classList.add('hidden');
        }
    } catch (_) {}
})();
