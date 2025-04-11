let foodDatabase = [];
let foodLog = [];
let goals = { calories: 0, protein: 0 };
let selectedPortion = 1;

document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.getAttribute('data-tab');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    button.classList.add('active');
    document.getElementById(tabId).classList.add('active');
    updateDropdown();
    updateGoalsDisplay();
  });
});

function updateDropdown() {
  const dropdown = document.getElementById('foodSelect');
  dropdown.innerHTML = '<option value="">Select Item</option>';
  foodDatabase.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = item.name;
    dropdown.appendChild(option);
  });
}

function addEntry() {
  const foodIndex = document.getElementById('foodSelect').value;
  const quantity = parseFloat(document.getElementById('quantity').value) || 1;
  if (foodIndex === "") return;

  const food = foodDatabase[foodIndex];
  const entry = {
    ...food,
    quantity: quantity * selectedPortion
  };

  foodLog.push(entry);
  renderLog();
}

function resetLog() {
  foodLog = [];
  renderLog();
}

function renderLog() {
  const tbody = document.getElementById('logBody');
  tbody.innerHTML = "";

  let totalCalories = 0;
  let totalProtein = 0;

  foodLog.forEach((item, index) => {
    const row = document.createElement('tr');
    const calories = item.calories * item.quantity;
    const protein = item.protein * item.quantity;

    totalCalories += calories;
    totalProtein += protein;

    row.innerHTML = `
      <td>${item.name}</td>
      <td>${calories.toFixed(1)}</td>
      <td>${protein.toFixed(1)}</td>
      <td>${item.quantity}</td>
      <td><button onclick="removeEntry(${index})">X</button></td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('totalCalories').textContent = totalCalories.toFixed(1);
  document.getElementById('totalProtein').textContent = totalProtein.toFixed(1);
  document.getElementById('remainingCalories').textContent = (goals.calories - totalCalories).toFixed(1);
  document.getElementById('remainingProtein').textContent = (goals.protein - totalProtein).toFixed(1);
}

function removeEntry(index) {
  foodLog.splice(index, 1);
  renderLog();
}

function addFoodAndReturn() {
  const name = document.getElementById('newFoodName').value;
  const calories = parseFloat(document.getElementById('newCalories').value);
  const protein = parseFloat(document.getElementById('newProtein').value);
  if (!name || isNaN(calories) || isNaN(protein)) return;

  foodDatabase.push({ name, calories, protein });
  document.getElementById('newFoodName').value = '';
  document.getElementById('newCalories').value = '';
  document.getElementById('newProtein').value = '';
  updateDropdown();
  updateDatabaseTable();
  document.querySelector('.tab-btn[data-tab="trackerTab"]').click();
}

function updateDatabaseTable() {
  const tbody = document.getElementById('foodDatabaseBody');
  tbody.innerHTML = "";
  foodDatabase.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.calories}</td>
      <td>${item.protein}</td>
      <td><button onclick="deleteFood(${index})">X</button></td>
    `;
    tbody.appendChild(row);
  });
}

function deleteFood(index) {
  foodDatabase.splice(index, 1);
  updateDropdown();
  updateDatabaseTable();
}

function saveGoals() {
  goals.calories = parseFloat(document.getElementById('goalCaloriesInput').value) || 0;
  goals.protein = parseFloat(document.getElementById('goalProteinInput').value) || 0;
  updateGoalsDisplay();
  document.querySelector('.tab-btn[data-tab="trackerTab"]').click();
}

function updateGoalsDisplay() {
  document.getElementById('goalCalories').textContent = goals.calories;
  document.getElementById('goalProtein').textContent = goals.protein;
  renderLog();
}

// Barcode scanner
let scanner;

function startScanner() {
  scanner = new Html5Qrcode("reader");
  Html5Qrcode.getCameras().then(devices => {
    const backCamera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
    if (backCamera) {
      scanner.start(
        backCamera.id,
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          alert("Scanned: " + decodedText);
          scanner.stop();
        },
        (error) => { console.warn(error); }
      );
    }
  });
}

// Portion Popup
function showPortionPopup() {
  document.getElementById('portionPopup').style.display = 'block';
}

function setPortionType(type) {
  selectedPortion = type === 'portion' ? 1 : 0.01;
  document.getElementById('portionPopup').style.display = 'none';
  addEntry();
}

function customPortion() {
  document.getElementById('customPortionInput').style.display = 'inline';
  document.getElementById('customPortionBtn').style.display = 'inline';
}

function confirmCustomPortion() {
  const grams = parseFloat(document.getElementById('customPortionInput').value);
  if (!isNaN(grams) && grams > 0) {
    selectedPortion = grams / 100;
    document.getElementById('portionPopup').style.display = 'none';
    document.getElementById('customPortionInput').style.display = 'none';
    document.getElementById('customPortionBtn').style.display = 'none';
    addEntry();
  }
}
