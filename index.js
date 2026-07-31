const addBtn = document.getElementById("add-btn");
const expenseList = document.getElementById("expense-list");
const expenseForm = document.getElementById("expense-form");
const totalDisplay = document.getElementById("total-display");
const highestDisplay = document.getElementById("highest-display");
const barChartBtn = document.getElementById("bar-chart-btn");
const pieChartBtn = document.getElementById("pie-chart-btn");

let myChart = null;
let currentCategoryTotals = {};

const chartColors = [
  "#FF6384", "#36A2EB", "#FFCE56", 
  "#4BC0C0", "#9966FF", "#FF9F40"
];

addBtn.addEventListener("click", () => {
  const newRow = document.createElement("div");
  newRow.className = "expense-row";
  
  newRow.innerHTML = `
    <select class="category">
      <option value="None" selected>-- Select Category --</option>
      <option value="Food">Food</option>
      <option value="Transportation">Transportation</option>
      <option value="Entertainment">Entertainment</option>
      <option value="Shopping">Shopping</option>
      <option value="Others">Others</option>
    </select>
    <input 
      type="number" 
      class="expense-amount" 
      placeholder="Enter amount" 
      min="0" 
      step="0.01" 
    />
    <button type="button" class="remove-btn">✕</button>
  `;

  
  newRow.querySelector(".remove-btn").addEventListener("click", () => {
    newRow.remove();
  });

  expenseList.appendChild(newRow);
});

function getHighestCategory(categoryTotals) {
  let maxAmount = 0;
  let highestCategories = [];

  for (const amount of Object.values(categoryTotals)) {
    if (amount > maxAmount) {
      maxAmount = amount;
    }
  }

  if (maxAmount > 0) {
    for (const [category, amount] of Object.entries(categoryTotals)) {
      if (amount === maxAmount) {
        highestCategories.push(category);
      }
    }
  }

  return { 
    highestCategories: highestCategories.join(", "), 
    maxAmount 
  };
}

function renderChart(type) {
  const labels = Object.keys(currentCategoryTotals);
  const data = Object.values(currentCategoryTotals);

  if (labels.length === 0) {
    alert("Please calculate totals with valid expenses first!");
    return;
  }

  const ctx = document.getElementById("expense-chart").getContext("2d");

  if (myChart) {
    myChart.destroy();
  }

  const pluginsList = typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : [];

  myChart = new Chart(ctx, {
    type: type, // 'bar' or 'pie'
    plugins: pluginsList, //
    data: {
      labels: labels,
      datasets: [{
        label: 'Expenses (৳)',
        data: data,
        backgroundColor: chartColors.slice(0, labels.length),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: type === 'pie' 
        },
        datalabels: {
          display: type === 'pie',
          color: '#ffffff',
          font: { weight: 'bold', size: 13 },
          formatter: (value, context) => {
            const dataset = context.chart.data.datasets[0];
            const sum = dataset.data.reduce((acc, val) => acc + val, 0);
            return ((value / sum) * 100).toFixed(1) + "%";
          }
        }
      },
      scales: type === 'bar' ? {
        y: {
          beginAtZero: true
        }
      } : {}
    }
  });
}

expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let grandTotal = 0;
  const categories = document.querySelectorAll(".category");
  const amounts = document.querySelectorAll(".expense-amount");
  currentCategoryTotals = {};

  categories.forEach((catSelect, index) => {
    const category = catSelect.value;
    const amount = parseFloat(amounts[index].value) || 0;

    if (category !== "None" && amount > 0) {
      grandTotal += amount;
      currentCategoryTotals[category] = (currentCategoryTotals[category] || 0) + amount;
    }
  });

  const { highestCategories, maxAmount } = getHighestCategory(currentCategoryTotals);

  if (totalDisplay) {
    totalDisplay.textContent = `Total Expense: ৳${grandTotal.toFixed(2)}`;
  }

  if (highestDisplay) {
    if (highestCategories) {
      highestDisplay.textContent = `Highest Expense: ${highestCategories} (৳${maxAmount.toFixed(2)})`;
    } else {
      highestDisplay.textContent = `Highest Expense: None`;
    }
  }

  if (grandTotal > 0) {
    renderChart("bar");
  }
});

barChartBtn.addEventListener("click", () => renderChart("bar"));
pieChartBtn.addEventListener("click", () => renderChart("pie"));