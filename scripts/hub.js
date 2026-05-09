const ROLE_NAMES = {
    1: 'User Admin',
    2: 'Fundraiser',
    3: 'Donee',
    4: 'Platform Mgmt',
};

const ROLE_BUTTONS = {
    1: [ // user_admin — sees all roles
        { icon: 'bi-cash-stack',    label: 'Fundraiser',    href: 'fundraiser_dashboard.html' },
        { icon: 'bi-heart-fill',    label: 'Donee',         href: 'donee_dashboard.html' },
        { icon: 'bi-people-fill',   label: 'User Admin',    href: 'admin_dashboard.html' },
        { icon: 'bi-speedometer2',  label: 'Platform Mgmt', href: 'platform_dashboard.html' },
    ],
    2: [ // fund_raiser
        { icon: 'bi-cash-stack', label: 'Fundraiser', href: 'fundraiser_dashboard.html' },
    ],
    3: [ // donee
        { icon: 'bi-hand-heart', label: 'Donee', href: 'donee_dashboard.html' },
    ],
    4: [ // platform_mgmt
        { icon: 'bi-speedometer2', label: 'Platform Mgmt', href: 'platform_dashboard.html' },
    ],
};

async function loadHub() {
    try {
        const res = await fetch('http://127.0.0.1:8000/session', {
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

        const buttons = ROLE_BUTTONS[data.role_id] || []; // need to fetch permissions to get role
        const container = document.getElementById('hub-buttons');
        buttons.forEach(btn => {
            const a = document.createElement('a');
            a.href = btn.href;
            a.className = 'hub-btn';
            a.innerHTML = `<i class="bi ${btn.icon}"></i>${btn.label}`;
            container.appendChild(a);
        });

        // Populate settings dropdown
        document.getElementById('dropdown-username').textContent = data.username;
        document.getElementById('dropdown-role').textContent = ROLE_NAMES[data.role_id] || '';

        document.getElementById('hub-loader').classList.add('hidden');
        document.getElementById('hub-page').classList.remove('hidden');

        setupDropdown();

    } catch (err) {
        window.location.href = 'login.html';
    }
}

function setupDropdown() {
    const gearBtn = document.getElementById('hub-gear-btn');
    const dropdown = document.getElementById('hub-settings-dropdown');

    gearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        dropdown.classList.add('hidden');
    });

    dropdown.addEventListener('click', (e) => e.stopPropagation());

    document.getElementById('hub-logout-btn').addEventListener('click', async () => {
        try {
            await fetch('http://127.0.0.1:8000/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (_) {}
        window.location.href = 'login.html';
    });
}

loadHub();
