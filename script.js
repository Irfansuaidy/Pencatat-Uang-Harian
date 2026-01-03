let accounts = [];
let transactions = [];
let budget = 0;
let currentCalendarDate = new Date();
function loadData() {
    const savedAccounts = localStorage.getItem('accounts');
    const savedTransactions = localStorage.getItem('transactions');
    const savedBudget = localStorage.getItem('budget');
    
    if (savedAccounts) accounts = JSON.parse(savedAccounts);
    if (savedTransactions) transactions = JSON.parse(savedTransactions);
    if (savedBudget) budget = parseFloat(savedBudget);
    
    document.getElementById('transactionDate').valueAsDate = new Date();
    
    updateUI();
    renderCalendar();
}
function saveData() {
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('budget', budget);
}
function formatRupiah(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
}
function toggleBudgetForm() {
    const form = document.getElementById('budgetForm');
    form.classList.toggle('hidden');
    if (!form.classList.contains('hidden')) {
        document.getElementById('budgetAmount').value = budget || '';
    }
}
function setBudget() {
    const amount = parseFloat(document.getElementById('budgetAmount').value);
    if (!amount || amount <= 0) {
        alert('Mohon isi budget dengan nilai yang valid!');
        return;
    }
    budget = amount;
    toggleBudgetForm();
    saveData();
    updateUI();
}
function updateBudgetDisplay() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const monthExpenses = transactions.filter(t => {
        const tDate = new Date(t.dateValue);
        return t.type === 'expense' && tDate >= startOfMonth && tDate <= endOfMonth;
    }).reduce((sum, t) => sum + t.amount, 0);
    if (budget > 0) {
        const percentage = (monthExpenses / budget) * 100;
        const remaining = budget - monthExpenses;
        
        document.getElementById('budgetText').textContent = 
            `Budget Bulan Ini: ${formatRupiah(budget)}`;
        
        const progressContainer = document.getElementById('budgetProgressContainer');
        progressContainer.style.display = 'block';
        
        const progressBar = document.getElementById('budgetProgress');
        progressBar.style.width = Math.min(percentage, 100) + '%';
        progressBar.textContent = percentage.toFixed(1) + '%';
        
        if (percentage >= 100) {
            progressBar.className = 'h-full transition-all duration-300 flex items-center justify-center text-xs font-bold text-white bg-red-600';
        } else if (percentage >= 80) {
            progressBar.className = 'h-full transition-all duration-300 flex items-center justify-center text-xs font-bold text-white bg-orange-500';
        } else if (percentage >= 60) {
            progressBar.className = 'h-full transition-all duration-300 flex items-center justify-center text-xs font-bold text-white bg-yellow-500';
        } else {
            progressBar.className = 'h-full transition-all duration-300 flex items-center justify-center text-xs font-bold text-white bg-green-500';
        }
        
        const remainingText = document.getElementById('budgetRemaining');
        if (remaining >= 0) {
            remainingText.textContent = `Sisa budget: ${formatRupiah(remaining)}`;
            remainingText.className = 'text-xs text-green-600 mt-2 font-medium';
        } else {
            remainingText.textContent = `⚠️ Melebihi budget: ${formatRupiah(Math.abs(remaining))}`;
            remainingText.className = 'text-xs text-red-600 mt-2 font-bold';
        }
        
        if (percentage >= 80 && percentage < 100) {
            remainingText.textContent += ' - Mendekati limit!';
        }
    } else {
        document.getElementById('budgetText').textContent = 'Budget belum diatur';
        document.getElementById('budgetProgressContainer').style.display = 'none';
        document.getElementById('budgetRemaining').textContent = '';
    }
}
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    document.getElementById('calendarMonth').textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    let calendarHTML = dayNames.map(day => 
        `<div class="text-center font-semibold text-gray-600 text-sm py-2">${day}</div>`
    ).join('');

    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="text-center p-2"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTransactions = transactions.filter(t => t.dateValue === dateStr);
        
        const income = dayTransactions.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = dayTransactions.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const today = new Date();
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        
        let dayClass = 'text-center p-2 border rounded cursor-pointer hover:bg-indigo-50 transition';
        if (isToday) dayClass += ' bg-indigo-100 border-indigo-400 font-bold';
        
        calendarHTML += `
            <div class="${dayClass}" onclick="filterByDate('${dateStr}')">
                <div class="text-sm font-semibold">${day}</div>
                ${dayTransactions.length > 0 ? `
                    <div class="text-xs mt-1">
                        ${income > 0 ? `<div class="text-green-600">+${(income/1000).toFixed(0)}k</div>` : ''}
                        ${expense > 0 ? `<div class="text-red-600">-${(expense/1000).toFixed(0)}k</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    calendar.innerHTML = calendarHTML;
}
function previousMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
}
function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
}
function filterByDate(dateStr) {
    document.getElementById('periodFilter').value = 'custom';
    document.getElementById('dateFrom').value = dateStr;
    document.getElementById('dateTo').value = dateStr;
    updateFilteredTransactions();
    window.scrollTo({ top: document.getElementById('transactionsList').offsetTop - 100, behavior: 'smooth' });
}
function getFilteredTransactions() {
    const period = document.getElementById('periodFilter').value;
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;
    const accountFilter = document.getElementById('accountFilter').value;
    
    let filtered = [...transactions];
    
    if (accountFilter !== 'all') {
        filtered = filtered.filter(t => t.accountId === parseInt(accountFilter));
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (period === 'today') {
        filtered = filtered.filter(t => {
            const tDate = new Date(t.dateValue);
            return tDate >= today;
        });
    } else if (period === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(t => {
            const tDate = new Date(t.dateValue);
            return tDate >= weekAgo;
        });
    } else if (period === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(t => {
            const tDate = new Date(t.dateValue);
            return tDate >= monthStart;
        });
    } else if (period === 'custom' && dateFrom && dateTo) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59);
        filtered = filtered.filter(t => {
            const tDate = new Date(t.dateValue);
            return tDate >= from && tDate <= to;
        });
    }
    
    return filtered;
}
function updateFilteredTransactions() {
    const filtered = getFilteredTransactions();
    
    const income = filtered.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    document.getElementById('filterStats').textContent = 
        `${filtered.length} transaksi | Pemasukan: ${formatRupiah(income)} | Pengeluaran: ${formatRupiah(expense)}`;
    
    renderTransactionsList(filtered);
}
function renderTransactionsList(transactionsToShow) {
    const listContainer = document.getElementById('transactionsList');
    
    if (transactionsToShow.length === 0) {
        listContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Tidak ada transaksi ditemukan.</p>';
        document.getElementById('exportBtn').disabled = true;
    } else {
        document.getElementById('exportBtn').disabled = false;
        listContainer.innerHTML = transactionsToShow.map(t => {
            const account = accounts.find(a => a.id === t.accountId);
            const accountName = account ? account.name : 'Rekening Terhapus';
            
            return `
            <div class="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition">
                <div class="flex-1">
                    <div class="flex items-center gap-3 flex-wrap">
                        <span class="px-2 py-1 rounded text-xs font-medium ${
                            t.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }">
                            ${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                        <span class="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            ${t.category}
                        </span>
                        <span class="px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                            🏦 ${accountName}
                        </span>
                    </div>
                    <p class="font-medium text-gray-800 mt-2">${t.description}</p>
                    <p class="text-sm text-gray-500">${t.date}</p>
                </div>
                <div class="flex items-center gap-4">
                    <p class="text-xl font-bold ${
                        t.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }">
                        ${t.type === 'income' ? '+' : '-'}${formatRupiah(t.amount)}
                    </p>
                    <button onclick="deleteTransaction(${t.id})" class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition">
                        🗑️
                    </button>
                </div>
            </div>
        `}).join('');
    }
}
function toggleAccountForm() {
    const form = document.getElementById('accountForm');
    form.classList.toggle('hidden');
}
function addAccount() {
    const name = document.getElementById('accountName').value;
    const balance = parseFloat(document.getElementById('accountBalance').value) || 0;
    if (!name) {
        alert('Mohon isi nama rekening!');
        return;
    }
    accounts.push({
        id: Date.now(),
        name: name,
        initialBalance: balance,
        currentBalance: balance
    });
    document.getElementById('accountName').value = '';
    document.getElementById('accountBalance').value = '';
    toggleAccountForm();
    
    saveData();
    updateUI();
}
function deleteAccount(id) {
    if (!confirm('Yakin ingin menghapus rekening ini? Transaksi terkait akan ikut terhapus.')) return;
    
    accounts = accounts.filter(a => a.id !== id);
    transactions = transactions.filter(t => t.accountId !== id);
    saveData();
    updateUI();
}
function addTransaction() {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const dateValue = document.getElementById('transactionDate').value;
    const accountId = parseInt(document.getElementById('accountSelect').value);
    const type = document.getElementById('type').value;
    const category = document.getElementById('category').value;
    if (!description || !amount || !dateValue || isNaN(accountId) || !type) {
        alert('Mohon isi semua field dengan benar!');
        return;
    }
    transactions.push({
        id: Date.now(),
        description: description,
        amount: amount,
        date: new Date(dateValue).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
        dateValue: dateValue,
        accountId: accountId,
        type: type,
        category: category
    });

    const account = accounts.find(a => a.id === accountId);
    if (account) {
        if (type === 'income') {
            account.currentBalance += amount;
        } else {
            account.currentBalance -= amount;
        }
    }
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('transactionDate').valueAsDate = new Date();
    document.getElementById('accountSelect').value = '';
    document.getElementById('type').value = 'expense';
    document.getElementById('category').value = 'Makanan';
    saveData();
    updateUI();
}
function deleteTransaction(id) {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
        const account = accounts.find(a => a.id === transaction.accountId);
        if (account) {
            if (transaction.type === 'income') {
                account.currentBalance -= transaction.amount;
            } else {
                account.currentBalance += transaction.amount;
            }
        }
    }
    
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    updateUI();
}
function updateUI() {
    const accountsList = document.getElementById('accountsList');
    if (accounts.length === 0) {
        accountsList.innerHTML = '<p class="col-span-full text-gray-500 text-center py-4">Belum ada rekening. Tambahkan rekening pertama Anda!</p>';
    } else {
        accountsList.innerHTML = accounts.map(a => `
            <div class="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition relative">
                <button onclick="deleteAccount(${a.id})" class="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition">
                    🗑️
                </button>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">${a.name}</h3>
                <p class="text-2xl font-bold text-indigo-600">${formatRupiah(a.currentBalance)}</p>
                <p class="text-sm text-gray-500 mt-1">Saldo Awal: ${formatRupiah(a.initialBalance)}</p>
            </div>
        `).join('');
    }

    const accountSelect = document.getElementById('accountSelect');
    const accountFilter = document.getElementById('accountFilter');
    accountSelect.innerHTML = '<option value="">Pilih Rekening</option>' + 
        accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    accountFilter.innerHTML = '<option value="all">Semua Rekening</option>' + 
        accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);
    document.getElementById('totalBalance').textContent = formatRupiah(totalBalance);
    updateBudgetDisplay();
    updateFilteredTransactions();
    renderCalendar();
}
window.onload = loadData;