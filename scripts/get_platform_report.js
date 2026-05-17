function formatCurrency(amount) {
    if (amount >= 1000000) return '$' + (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000)    return '$' + (amount / 1000).toFixed(1) + 'K';
    return '$' + Number(amount).toLocaleString();
}

const PERIOD_LABELS = {
    daily:   'Today',
    weekly:  'Last 7 days',
    monthly: 'Last 30 days',
};

let currentPeriod = 'daily';
let chartInstance  = null;
let lastData       = null;

// ── Render stats ───────────────────────────────────────────────────────────────
function renderStats(stats, period) {
    const sub = PERIOD_LABELS[period] || 'This period';

    document.getElementById('stat-raised').textContent    = formatCurrency(stats.total_raised);
    document.getElementById('stat-users').textContent     = stats.new_users;
    document.getElementById('stat-active').textContent    = stats.active_campaigns;
    document.getElementById('stat-visits').textContent    = stats.activity_visits.toLocaleString();
    document.getElementById('stat-campaigns').textContent = stats.new_campaigns;
    document.getElementById('stat-avg').textContent       = formatCurrency(stats.avg_raised);

    document.getElementById('stat-raised-sub').textContent    = sub;
    document.getElementById('stat-users-sub').textContent     = sub;
    document.getElementById('stat-campaigns-sub').textContent = sub;
    document.getElementById('stat-avg-sub').textContent       = sub;
}

// ── Render chart ───────────────────────────────────────────────────────────────
function renderChart(chartData) {
    const labels = chartData.map(d => d.title.length > 18 ? d.title.slice(0, 16) + '…' : d.title);
    const values = chartData.map(d => d.view_count);

    const ctx = document.getElementById('rpt-chart').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Activity Visits',
                data: values,
                backgroundColor: 'rgba(201, 107, 107, 0.25)',
                borderColor:     'rgba(201, 107, 107, 0.85)',
                borderWidth: 2,
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => chartData[items[0].dataIndex]?.title || '',
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, font: { family: 'Nunito' } },
                    grid: { color: 'rgba(0,0,0,0.05)' },
                },
                x: {
                    ticks: { font: { family: 'Nunito', size: 11 } },
                    grid: { display: false },
                }
            }
        }
    });
}

// ── Load report ────────────────────────────────────────────────────────────────
async function loadReport(period) {
    try {
        const res = await fetch(`http://127.0.0.1:8000/platform/report?period=${period}`, {
            credentials: 'include'
        });
        if (res.status === 401 || res.status === 403) { window.location.href = 'login.html'; return; }
        if (!res.ok) throw new Error('Failed to load report');

        const data = await res.json();
        lastData = data;

        document.getElementById('dropdown-username').textContent = data.username || '';
        document.getElementById('dropdown-role').textContent     = 'Platform Mgmt';

        renderStats(data.stats, period);
        renderChart(data.chart_data || []);

    } catch (err) {
        console.error('Report load error:', err);
    }
}

loadReport(currentPeriod);

// ── Period tabs ────────────────────────────────────────────────────────────────
document.querySelectorAll('.report-period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.report-period-btn').forEach(b => b.classList.remove('report-period-active'));
        btn.classList.add('report-period-active');
        currentPeriod = btn.dataset.period;
        loadReport(currentPeriod);
    });
});

// ── Export report (CSV) ────────────────────────────────────────────────────────
document.getElementById('rpt-export-btn').addEventListener('click', () => {
    if (!lastData) return;
    const s = lastData.stats;
    const period = PERIOD_LABELS[currentPeriod] || currentPeriod;
    const rows = [
        ['Period', period],
        ['Total Raised', s.total_raised],
        ['New Users', s.new_users],
        ['Active Campaigns', s.active_campaigns],
        ['Activity Visits', s.activity_visits],
        ['New Campaigns', s.new_campaigns],
        ['Avg Raised / Campaign', s.avg_raised],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `platform_report_${currentPeriod}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
});

// ── Gear dropdown ─────────────────────────────────────────────────────────────
const gearBtn  = document.getElementById('hub-gear-btn');
const dropdown = document.getElementById('hub-settings-dropdown');
gearBtn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('hidden'); });
document.addEventListener('click', () => dropdown.classList.add('hidden'));
dropdown.addEventListener('click', (e) => e.stopPropagation());
document.getElementById('hub-logout-btn').addEventListener('click', async () => {
    try { await fetch('http://127.0.0.1:8000/logout', { method: 'POST', credentials: 'include' }); } catch (_) {}
    window.location.href = 'login.html';
});
