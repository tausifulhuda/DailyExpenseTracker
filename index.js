const addBtn = document.getElementById("add-btn");
const expenseList = document.getElementById("expense-list");
const expenseForm = document.getElementById("expense-form");
const totalDisplay = document.getElementById("total-display");
const highestDisplay = document.getElementById("highest-display");
const allowanceInput = document.getElementById("daily-allowance");
const allowanceStatusDisplay = document.getElementById("allowance-status-display");

const barChartBtn = document.getElementById("bar-chart-btn");
const pieChartBtn = document.getElementById("pie-chart-btn");

const savingTip = document.getElementById("saving-tip");
const newTipBtn = document.getElementById("new-tip-btn");

const futureSimulatorCard = document.getElementById("future-simulator-card");
const futureSimulatorContent = document.getElementById("future-simulator-content");

const moodAnalyticsCard = document.getElementById("mood-analytics-card");
const moodAnalyticsContent = document.getElementById("mood-analytics-content");

const stepViews = {
  1: document.getElementById("step-1-view"),
  2: document.getElementById("step-2-view"),
  3: document.getElementById("step-3-view")
};

const stepTabs = {
  1: document.getElementById("step-tab-1"),
  2: document.getElementById("step-tab-2"),
  3: document.getElementById("step-tab-3")
};

const backToStep1Btn = document.getElementById("back-to-step1-btn");
const goToStep3Btn = document.getElementById("go-to-step3-btn");
const restartBtn = document.getElementById("restart-btn");

let myChart = null;
let currentCategoryTotals = {};
let currentGrandTotal = 0;
let selectedMood = "Neutral";

const savingTips = [

"Track every expense, even small ones.",

"Cook meals at home instead of eating out.",

"Set a daily spending limit before leaving home.",

"Wait 24 hours before making non-essential purchases.",

"Compare prices before buying anything expensive.",

"Use public transport whenever possible.",

"Carry a reusable water bottle instead of buying drinks.",

"Save at least 10% of your income every month.",

"Avoid impulse shopping during sales.",

"Review your expenses every week to identify unnecessary spending."

];

const chartColors = [
  "#FF6384", "#36A2EB", "#FFCE56", 
  "#4BC0C0", "#9966FF", "#FF9F40"
];

function switchStep(stepNum) {
  [1, 2, 3].forEach(num => {
    if (stepViews[num]) {
      stepViews[num].classList.toggle("hidden", num !== stepNum);
    }
    if (stepTabs[num]) {
      stepTabs[num].classList.toggle("active", num <= stepNum);
    }
  });
}

Object.keys(stepTabs).forEach(step => {
  stepTabs[step].addEventListener("click", () => {
    const targetStep = parseInt(step);
    if (targetStep === 1 || (targetStep === 2 && currentGrandTotal > 0) || (targetStep === 3 && currentGrandTotal > 0)) {
      switchStep(targetStep);
    }
  });
});

const FuturePredictorAPI = {
  catalog: [
    { name: "Bestselling Book Collection", price: 1200, icon: "fa-book" },
    { name: "Artist Watercolor & Sketching Set", price: 1800, icon: "fa-palette" },
    { name: "Wireless Bluetooth Earbuds", price: 2500, icon: "fa-headphones" },
    { name: "Carbon Fiber Badminton Racket", price: 2800, icon: "fa-table-tennis-paddle-ball" },
    { name: "Specialty Coffee Machine", price: 3000, icon: "fa-mug-hot" },
    
    { name: "Acoustic Guitar", price: 8500, icon: "fa-guitar" },
    { name: "Fitness Smartwatch", price: 12000, icon: "fa-stopwatch" },
    { name: "Retro Handheld Gaming Console", price: 15000, icon: "fa-gamepad" },
    { name: "Ergonomic Mesh Office Chair", price: 18000, icon: "fa-chair" },
    { name: "Vlog Action Camera", price: 24000, icon: "fa-camera" },

    { name: "Premium Mountain Bike", price: 38000, icon: "fa-bicycle" },
    { name: "Next-Gen Smartphone", price: 42000, icon: "fa-mobile-screen-button" },
    { name: "Cox's Bazar & Saint Martin Resort Trip", price: 45000, icon: "fa-umbrella-beach" },
    { name: "High-Performance Student Laptop", price: 65000, icon: "fa-laptop" },
    { name: "PS5 Gaming Console", price: 68000, icon: "fa-gamepad" },

    { name: "MacBook Pro / Pro Gaming Rig", price: 165000, icon: "fa-desktop" },
    { name: "International Vacation to Thailand/Dubai", price: 180000, icon: "fa-plane-departure" },
    { name: "Electric Commuter Motorcycle", price: 220000, icon: "fa-motorcycle" },
    { name: "Emergency & Wealth Seed Fund", price: 300000, icon: "fa-vault" }
  ],

  calculateProjections(categoryTotals, grandTotal) {
    const annualGrandTotal = grandTotal * 365;
    const fiveYearGrandTotal = annualGrandTotal * 5;

    return {
      annualGrandTotal,
      fiveYearGrandTotal
    };
  },

  findMilestoneMatches(dailyAmount) {
    if (!dailyAmount || dailyAmount <= 0) return [];
    
    const weeklySaving = dailyAmount;
    const annualSaving = weeklySaving * 52;

    return this.catalog
      .map(item => {
        const monthsNeeded = Math.ceil((item.price / annualSaving) * 12);
        return { ...item, monthsNeeded };
      })
      .filter(item => item.monthsNeeded >= 1 && item.monthsNeeded <= 60)
      .sort((a, b) => a.monthsNeeded - b.monthsNeeded);
  },

  generateSimulationReport(categoryTotals, grandTotal) {
    const { fiveYearGrandTotal } = this.calculateProjections(categoryTotals, grandTotal);

    let topCategory = "Expenses";
    let topAmount = grandTotal;
    let maxCatAmt = 0;

    for (const [cat, amt] of Object.entries(categoryTotals)) {
      if (amt > maxCatAmt) {
        maxCatAmt = amt;
        topCategory = cat;
        topAmount = amt;
      }
    }

    const topFiveYear = topAmount * 365 * 5;
    const matches = this.findMilestoneMatches(topAmount);
    
    let milestoneHTML = "";
    if (matches.length > 0) {
      const bestMatch = matches[Math.floor(matches.length / 2)] || matches[0];
      milestoneHTML = `
        <div class="milestone-box">
          <div class="milestone-icon"><i class="fa-solid ${bestMatch.icon}"></i></div>
          <div class="milestone-text">
            <strong>Habit Swap Milestone:</strong><br/>
            Skipping your top daily purchase (৳${topAmount.toFixed(2)}) once a week would pay for your next <strong>${bestMatch.name}</strong> (৳${bestMatch.price.toLocaleString()}) in <strong>${bestMatch.monthsNeeded} months</strong>!
          </div>
        </div>
      `;
    }

    return `
      <div class="simulation-headline">
        <i class="fa-solid fa-hourglass-half"></i>
        <span>If you continue spending like this for 5 years, you'll spend approximately <strong>৳${topFiveYear.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong> on <strong>${topCategory}</strong> alone.</span>
      </div>
      <div class="simulation-stats">
        <div class="sim-stat-pill">
          <span class="label">1-Year Horizon</span>
          <span class="val">৳${(grandTotal * 365).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
        </div>
        <div class="sim-stat-pill highlight">
          <span class="label">5-Year Horizon</span>
          <span class="val">৳${fiveYearGrandTotal.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
        </div>
      </div>
      ${milestoneHTML}
    `;
  }
};

const MoodAnalyticsAPI = {
  moodMultipliers: {
    Stressed: 1.42,
    Angry: 1.35,
    Bored: 1.25,
    Happy: 1.10,
    Neutral: 1.00
  },

  analyzeCorrelation(grandTotal, mood) {
    const mult = this.moodMultipliers[mood] || 1.00;
    const diffPct = Math.round((mult - 1.00) * 100);

    let insightText = "";
    if (diffPct > 0) {
      insightText = `You tend to spend <strong>${diffPct}% more</strong> when you're <strong>${mood}</strong> compared to neutral days!`;
    } else {
      insightText = `Your spending remains balanced and baseline when you feel <strong>${mood}</strong>.`;
    }

    return `
      <div class="mood-insight-alert">
        <i class="fa-solid fa-lightbulb"></i>
        <span>${insightText}</span>
      </div>
      <div class="simulation-stats">
        <div class="sim-stat-pill">
          <span class="label">Tagged Mood</span>
          <span class="val" style="color: #2563eb;">${mood}</span>
        </div>
        <div class="sim-stat-pill ${diffPct > 20 ? 'highlight' : ''}">
          <span class="label">Emotional Multiplier</span>
          <span class="val">${diffPct > 0 ? '+' + diffPct + '%' : 'Baseline'}</span>
        </div>
      </div>
    `;
  }
};

function getValidExpenseSum() {
  let currentSum = 0;
  if (!expenseList) return currentSum;

  const rows = expenseList.querySelectorAll(".expense-row");
  rows.forEach(row => {
    const categorySelect = row.querySelector(".category");
    const amountInput = row.querySelector(".expense-amount");

    const category = categorySelect ? categorySelect.value : "None";
    const amount = parseFloat(amountInput ? amountInput.value : 0) || 0;

    
    if (category !== "None" && category !== "" && amount > 0) {
      currentSum += amount;
    }
  });

  return currentSum;
}

function updateBudgetProgressBar(totalSpent) {
  const allowanceVal = parseFloat(allowanceInput.value) || 0;

  const step1Wrapper = document.getElementById("step1-budget-wrapper");
  const step1Label = document.getElementById("step1-budget-label");
  const step1Pct = document.getElementById("step1-budget-pct");
  const step1Fill = document.getElementById("step1-budget-fill");

  const step3Wrapper = document.getElementById("step3-budget-wrapper");
  const step3Label = document.getElementById("step3-budget-label");
  const step3Pct = document.getElementById("step3-budget-pct");
  const step3Fill = document.getElementById("step3-budget-fill");

  if (allowanceVal <= 0) {
    if (step1Wrapper) step1Wrapper.classList.add("hidden");
    if (step3Wrapper) step3Wrapper.classList.add("hidden");
    return;
  }

  const rawPct = Math.round((totalSpent / allowanceVal) * 100);
  const capPct = Math.min(rawPct, 100);

  let stateClass = "normal";
  if (rawPct >= 100) stateClass = "overspent";
  else if (rawPct > 75) stateClass = "warning";

  if (step1Wrapper && step1Fill) {
    step1Wrapper.classList.remove("hidden");
    step1Fill.style.width = `${capPct}%`;
    step1Fill.className = `budget-progress-fill ${stateClass}`;
    if (step1Label) step1Label.textContent = `Spent: ৳${totalSpent.toFixed(2)} / ৳${allowanceVal.toFixed(2)}`;
    if (step1Pct) step1Pct.textContent = `${rawPct}%`;
  }

  if (step3Wrapper && step3Fill) {
    step3Wrapper.classList.remove("hidden");
    step3Fill.style.width = `${capPct}%`;
    step3Fill.className = `budget-progress-fill ${stateClass}`;
    if (step3Label) step3Label.textContent = `Budget Consumed (৳${totalSpent.toFixed(2)} of ৳${allowanceVal.toFixed(2)})`;
    if (step3Pct) step3Pct.textContent = `${rawPct}%`;
  }
}

function calculateAllowanceStatus(grandTotal) {
  const allowanceVal = parseFloat(allowanceInput.value) || 0;

  updateBudgetProgressBar(grandTotal);

  if (allowanceVal <= 0 || !allowanceStatusDisplay) {
    if (allowanceStatusDisplay) allowanceStatusDisplay.classList.add("hidden");
    return;
  }

  allowanceStatusDisplay.classList.remove("hidden");

  const remaining = allowanceVal - grandTotal;
  if (remaining >= 0) {
    allowanceStatusDisplay.className = "allowance-status success";
    allowanceStatusDisplay.innerHTML = `
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 10px; border-radius: 8px; font-weight: 600; margin-top: 10px;">
        <i class="fa-solid fa-circle-check"></i> Within Budget! Remaining Allowance: <strong>৳${remaining.toFixed(2)}</strong> (Out of ৳${allowanceVal.toFixed(2)})
      </div>
    `;
  } else {
    const overspent = Math.abs(remaining);
    allowanceStatusDisplay.className = "allowance-status warning";
    allowanceStatusDisplay.innerHTML = `
      <div style="background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; padding: 10px; border-radius: 8px; font-weight: 600; margin-top: 10px;">
        <i class="fa-solid fa-triangle-exclamation"></i> Overspent Warning! You are over your allowance by <strong>৳${overspent.toFixed(2)}</strong>!
      </div>
    `;
  }
}

if (allowanceInput) {
  allowanceInput.addEventListener("input", () => {
    // Uses the function that checks for valid categories first!
    updateBudgetProgressBar(getValidExpenseSum());
  });
}

function handleRemoveAction(targetBtn) {
  const row = targetBtn.closest(".expense-row");
  const isFirstRow = row === expenseList.firstElementChild;

  if (isFirstRow) {
    const categorySelect = row.querySelector(".category");
    const amountInput = row.querySelector(".expense-amount");

    if (categorySelect) categorySelect.value = "None";
    if (amountInput) amountInput.value = "";
  } else {
    row.remove();
  }

  updateBudgetProgressBar(getValidExpenseSum());
}

if (expenseList) {
  expenseList.addEventListener("input", (e) => {
    if (e.target.classList.contains("expense-amount") || e.target.classList.contains("category")) {
      updateBudgetProgressBar(getValidExpenseSum());
    }
  });

  expenseList.addEventListener("change", (e) => {
    if (e.target.classList.contains("category")) {
      updateBudgetProgressBar(getValidExpenseSum());
    }
  });

  expenseList.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      handleRemoveAction(e.target);
    }
  });
}

addBtn.addEventListener("click", () => {
  const newRow = document.createElement("div");
  newRow.className = "expense-row";
  
  newRow.innerHTML = `
    <div class="expense-field">
      <select class="category">
        <option value="None" selected>-- Select Category --</option>
        <option value="Food">Food</option>
        <option value="Transportation">Transportation</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Shopping">Shopping</option>
        <option value="Others">Others</option>
      </select>
    </div>
    <div class="expense-field row-actions-group">
      <input 
        type="number" 
        class="expense-amount" 
        placeholder="Amount (৳)" 
        min="0" 
        step="0.01" 
      />
      <button type="button" class="remove-btn" title="Remove Expense">✕</button>
    </div>
  `;

  expenseList.appendChild(newRow);
  expenseList.scrollLeft = expenseList.scrollWidth;
});


function showRandomTip() {

    const randomIndex = Math.floor(Math.random() * savingTips.length);

    savingTip.textContent = savingTips[randomIndex];

}

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

  if (labels.length === 0) return;

  const ctx = document.getElementById("expense-chart").getContext("2d");

  if (myChart) {
    myChart.destroy();
  }

  const pluginsList = typeof ChartDataLabels !== 'undefined' ? [ChartDataLabels] : [];

  myChart = new Chart(ctx, {
    type: type,
    plugins: pluginsList,
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

  if (grandTotal <= 0) {
    alert("Please enter at least one valid expense category and amount!");
    return;
  }

  currentGrandTotal = grandTotal;

  switchStep(2);
});

const moodBadges = document.querySelectorAll(".mood-badge");
moodBadges.forEach(badge => {
  badge.addEventListener("click", () => {
    moodBadges.forEach(b => b.classList.remove("active"));
    badge.classList.add("active");
    selectedMood = badge.getAttribute("data-value");
  });
});

backToStep1Btn.addEventListener("click", () => switchStep(1));

goToStep3Btn.addEventListener("click", () => {
  const { highestCategories, maxAmount } = getHighestCategory(currentCategoryTotals);

  if (totalDisplay) {
    totalDisplay.textContent = `Total Expense: ৳${currentGrandTotal.toFixed(2)}`;
  }

  if (highestDisplay) {
    if (highestCategories) {
      highestDisplay.textContent = `Highest Expense: ${highestCategories} (৳${maxAmount.toFixed(2)})`;
    } else {
      highestDisplay.textContent = `Highest Expense: None`;
    }
  }

  calculateAllowanceStatus(currentGrandTotal);

  if (futureSimulatorCard && futureSimulatorContent) {
    futureSimulatorContent.innerHTML = FuturePredictorAPI.generateSimulationReport(currentCategoryTotals, currentGrandTotal);
  }

  if (moodAnalyticsCard && moodAnalyticsContent) {
    moodAnalyticsContent.innerHTML = MoodAnalyticsAPI.analyzeCorrelation(currentGrandTotal, selectedMood);
  }

  renderChart("bar");

  switchStep(3);
});

function resetTracker() {
  currentCategoryTotals = {};
  currentGrandTotal = 0;
  selectedMood = "Neutral";

  if (expenseForm) expenseForm.reset();
  if (allowanceInput) allowanceInput.value = "";
  updateBudgetProgressBar(currentGrandTotal)
  if (allowanceStatusDisplay) {
    allowanceStatusDisplay.classList.add("hidden");
    allowanceStatusDisplay.innerHTML = "";
  }
  
  if (expenseList) {
    expenseList.innerHTML = `
      <div class="expense-row">
        <div class="expense-field">
          <select class="category">
            <option value="None" selected>-- Select Category --</option>
            <option value="Food">Food</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Others">Others</option>
          </select>
        </div>
        <div class="expense-field row-actions-group">
          <input 
            type="number" 
            class="expense-amount" 
            placeholder="Amount (৳)" 
            min="0" 
            step="0.01" 
          />
          <button type="button" class="remove-btn" title="Remove Expense">✕</button>
        </div>
      </div>
    `;

    expenseList.querySelector(".expense-amount").addEventListener("input", () => {
      let currentSum = 0;
      document.querySelectorAll(".expense-amount").forEach(inp => {
        currentSum += parseFloat(inp.value) || 0;
      });
      updateBudgetProgressBar(currentSum);
    });
  }

  moodBadges.forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-value") === "Neutral");
  });

  if (myChart) {
    myChart.destroy();
    myChart = null;
  }

  switchStep(1);
}

restartBtn.addEventListener("click", () => {
  resetTracker();
});

barChartBtn.addEventListener("click", () => renderChart("bar"));
pieChartBtn.addEventListener("click", () => renderChart("pie"));

newTipBtn.addEventListener("click", showRandomTip);

showRandomTip();