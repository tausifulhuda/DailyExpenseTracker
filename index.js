const addBtn = document.getElementById("add-btn");
const expenseList = document.getElementById("expense-list");
const expenseForm = document.getElementById("expense-form");
const totalDisplay = document.getElementById("total-display");
const highestDisplay = document.getElementById("highest-display");

// 1. Function to add a new row when clicking "+ Add Expense"
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

  // Attach a delete listener to the individual remove button
  newRow.querySelector(".remove-btn").addEventListener("click", () => {
    newRow.remove();
  });

  expenseList.appendChild(newRow);
});

function getHighestCategory(categoryTotals) {
  let maxAmount = 0;
  let highestCategories = [];

  // Pass 1: Find the maximum spending amount
  for (const amount of Object.values(categoryTotals)) {
    if (amount > maxAmount) {
      maxAmount = amount;
    }
  }

  // Pass 2: Collect all categories that match the maximum amount
  if (maxAmount > 0) {
    for (const [category, amount] of Object.entries(categoryTotals)) {
      if (amount === maxAmount) {
        highestCategories.push(category);
      }
    }
  }

  return { 
    highestCategories: highestCategories.join(", "), // Join ties with commas
    maxAmount 
  };
}

// 2. Handle Form Submission & Calculate Total
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevents page reload

  let grandTotal = 0;
  const categories = document.querySelectorAll(".category");
  const amounts = document.querySelectorAll(".expense-amount");
  const categoryTotals = {};

  categories.forEach((catSelect, index) => {
    const category = catSelect.value;
    const amount = parseFloat(amounts[index].value) || 0;

    if (category !== "None" && amount > 0) {
      grandTotal += amount;
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    }

  });
  const { highestCategories, maxAmount } = getHighestCategory(categoryTotals);
  totalDisplay.textContent = `Total Expense: ৳${grandTotal.toFixed(2)}`;
  if (grandTotal>0){
    highestDisplay.textContent= `Highest Expense: ${highestCategories}`;
  }
});