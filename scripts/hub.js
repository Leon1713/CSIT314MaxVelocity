function getButtonsByPermission(data) {
    let buttons = [
        [data.can_access_admin_dashboard, { icon: 'bi-people-fill',   label: 'User Admin',    href: 'admin_dashboard.html' }],
        [data.can_access_fr_dashboard,{ icon: 'bi-cash-stack', label: 'Fundraiser', href: 'fundraiser_dashboard.html' } ],
        [data.can_access_donee_dashboard,{icon: 'bi-hand-heart', label: 'Donee', href: 'donee_dashboard.html'}],
        [data.can_access_platform_mgt_dashboard, {icon: 'bi-speedometer2', label: 'Platform Mgmt', href: 'platform_dashboard.html'}]]
        return buttons;
}
async function loadHub() {
    try {
        const res = await fetch('http://127.0.0.1:8000/hub', {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) throw new Error('Session check failed');

        const data = await res.json();

        if (!data.success) {
            window.location.href = 'login.html';
            return;
        }

        document.getElementById('hub-username').textContent = data.username;
        const buttons = getButtonsByPermission(data);
        const container = document.getElementById('hub-buttons');
        buttons.forEach(([condition, btn]) => {
            if(!condition)
                return;

            const a = document.createElement('a');
            a.href = btn.href;
            a.className = 'hub-btn';
            a.innerHTML = `<i class="bi ${btn.icon}"></i>${btn.label}`;
            container.appendChild(a);
        });

        // Populate settings dropdown
        document.getElementById('dropdown-username').textContent = data.username;
        document.getElementById('dropdown-role').textContent = data.role_name || '';

        document.getElementById('hub-loader').classList.add('hidden');
        document.getElementById('hub-page').classList.remove('hidden');

        setupDropdown();

    } catch (err) {
        window.location.href = 'login.html';
    }
}

function setupDropdown() {
    const gearBtn  = document.getElementById('hub-gear-btn');
    const dropdown = document.getElementById('hub-settings-dropdown');

    gearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => dropdown.classList.add('hidden'));
    dropdown.addEventListener('click', (e) => e.stopPropagation());

    document.getElementById('hub-logout-btn').addEventListener('click', async () => {
        try {
            await fetch('http://127.0.0.1:8000/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (_) { }
        window.location.href = 'login.html';
    });
}

loadHub();
