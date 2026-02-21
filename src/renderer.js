const form = document.getElementById('entry-form');
const entriesBody = document.getElementById('entries-body');
const clearMonthBtn = document.getElementById('clear-month');
const monthFilter = document.getElementById('month-filter');

const totalExpenseEl = document.getElementById('total-expense');

const dateInput = document.getElementById('date');
const nameInput = document.getElementById('name');
const priceInput = document.getElementById('price');

let allEntries = [];

function formatCurrency(value) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value || 0);
}

function nowMonthString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

function selectedMonthEntries() {
  const selectedMonth = monthFilter.value;
  return allEntries.filter((entry) => entry.date.startsWith(selectedMonth));
}

function renderTable() {
  const entries = [...selectedMonthEntries()].sort((a, b) => b.date.localeCompare(a.date));
  entriesBody.innerHTML = '';

  if (entries.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="4" class="empty-state">No expenses for this month.</td>`;
    entriesBody.appendChild(row);
    return;
  }

  entries.forEach((entry) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.name}</td>
      <td>${formatCurrency(entry.price)}</td>
      <td class="actions-cell">
        <button data-id="${entry.id}">Delete</button>
      </td>
    `;

    const deleteBtn = row.querySelector('button');
    deleteBtn.addEventListener('click', async () => {
      allEntries = allEntries.filter((item) => item.id !== entry.id);
      await window.expensesApi.saveEntries(allEntries);
      renderAll();
    });

    entriesBody.appendChild(row);
  });
}

function renderSummary() {
  const totalExpense = selectedMonthEntries().reduce((sum, entry) => sum + Number(entry.price || 0), 0);

  totalExpenseEl.textContent = formatCurrency(totalExpense);
}

function renderAll() {
  renderSummary();
  renderTable();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const price = Number(priceInput.value);

  if (!name || Number.isNaN(price) || price < 0) {
    return;
  }

  const entry = {
    id: crypto.randomUUID(),
    date: dateInput.value,
    name,
    price,
    createdAt: new Date().toISOString()
  };

  allEntries.push(entry);
  await window.expensesApi.saveEntries(allEntries);

  form.reset();
  dateInput.value = new Date().toISOString().slice(0, 10);
  nameInput.focus();
  renderAll();
});

monthFilter.addEventListener('change', renderAll);

clearMonthBtn.addEventListener('click', async () => {
  const selectedMonth = monthFilter.value;
  const shouldDelete = confirm(`Delete all expenses for ${selectedMonth}?`);
  if (!shouldDelete) return;

  allEntries = allEntries.filter((entry) => !entry.date.startsWith(selectedMonth));
  await window.expensesApi.saveEntries(allEntries);
  renderAll();
});

async function init() {
  dateInput.value = new Date().toISOString().slice(0, 10);
  monthFilter.value = nowMonthString();

  const storedEntries = await window.expensesApi.loadEntries();
  allEntries = storedEntries.map((entry) => ({
    id: entry.id || crypto.randomUUID(),
    date: entry.date || (entry.createdAt ? entry.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)),
    name: entry.name || entry.category || 'Expense',
    price: Number(entry.price ?? entry.amount ?? 0),
    createdAt: entry.createdAt || new Date().toISOString()
  }));
  await window.expensesApi.saveEntries(allEntries);
  nameInput.focus();
  renderAll();
}

init();
