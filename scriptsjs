// --- CLASSES ---
class Car {
  constructor(carId, carName, carYear, carPrice) {
    this.carId = carId;
    this.carName = carName;
    this.carYear = carYear;
    this.carPrice = carPrice;
  }

  carAge() {
    return new Date().getFullYear() - this.carYear;
  }
}

class CarModel extends Car {
  constructor(carId, carName, carModel, carYear, carPrice) {
    super(carId, carName, carYear, carPrice);
    this.carModel = carModel;
  }
}

// --- CLASS MAP ---
const classMap = {
  car: Car,
  carModel: CarModel,
};

function createTypedInstance(item) {
  if (item.$type === "carModel") {
    return new CarModel(
      item.carId,
      item.carName,
      item.carModel,
      item.carYear,
      item.carPrice
    );
  } else {
    return new Car(item.carId, item.carName, item.carYear, item.carPrice);
  }
}

// --- ADD CAR (POST) ---
async function addCar(e) {
  e.preventDefault();
  const carName = document.getElementById("carName").value.trim();
  const carModel = document.getElementById("carModel").value.trim();
  const carYear = parseInt(document.getElementById("carYear").value);
  const carPrice = parseFloat(document.getElementById("carPrice").value);

  if (!carName || isNaN(carYear) || isNaN(carPrice)) {
    alert("Udfyld venligst alle krævede felter.");
    return;
  }

  // Lav en midlertidig klasseinstans med carId = 0 (API vil returnere rigtig ID)
  const newCarInstance = carModel
    ? new CarModel(0, carName, carModel, carYear, carPrice)
    : new Car(0, carName, carYear, carPrice);

  // Tilføj til UI med det samme
  CarArray.push(newCarInstance);
  renderCars(CarArray);

  try {
    const res = await fetch(
      `${API_URL}?userName=${encodeURIComponent(userName)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          $type: carModel ? "carModel" : "car",
          carId: 0,
          carName,
          carModel: carModel || undefined,
          carYear,
          carPrice,
        }),
      }
    );
    if (!res.ok) throw new Error(res.status);

    const addedCar = await res.json();
    // Opdater den midlertidige instans med det rigtige ID fra API
    newCarInstance.carId = addedCar.carId;
    console.log("✅ Car added with real ID:", addedCar.carId);
  } catch (err) {
    console.error("⚠️ Error adding car:", err);
    alert("Error adding car. Se konsol.");
    // Fjern midlertidig instans ved fejl
    CarArray = CarArray.filter((c) => c !== newCarInstance);
    renderCars(CarArray);
  }

  document.getElementById("add-car-form").reset();
}

// --- SAVE EDIT (PUT) ---
async function saveEdit(e) {
  e.preventDefault();
  const carId = parseInt(document.getElementById("editCarId").value);
  const carName = document.getElementById("editCarName").value.trim();
  const carModel = document.getElementById("editCarModel").value.trim();
  const carYear = parseInt(document.getElementById("editCarYear").value);
  const carPrice = parseFloat(document.getElementById("editCarPrice").value);

  if (!carName || isNaN(carYear) || isNaN(carPrice)) {
    alert("Udfyld venligst alle krævede felter.");
    return;
  }

  // Find eksisterende instans i CarArray
  const index = CarArray.findIndex((c) => c.carId === carId);
  if (index === -1) return;

  // Opdater midlertidig klasseinstans med de nye værdier
  const updatedInstance = carModel
    ? new CarModel(carId, carName, carModel, carYear, carPrice)
    : new Car(carId, carName, carYear, carPrice);

  CarArray[index] = updatedInstance;
  renderCars(CarArray);
  cancelEdit();

  try {
    const res = await fetch(
      `${API_URL}/${carId}?userName=${encodeURIComponent(userName)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          $type: carModel ? "carModel" : "car",
          carId,
          carName,
          carModel: carModel || undefined,
          carYear,
          carPrice,
        }),
      }
    );
    if (!res.ok) throw new Error(res.status);
    console.log("✅ Car updated successfully");
  } catch (err) {
    console.error("⚠️ Error updating car:", err);
    alert("Error updating car. Se konsol.");
  }
}
// --- DELETE CAR (DELETE) ---
async function deleteCar(carId) {
  if (!confirm("Er du sikker på, at du vil slette denne bil?")) return;

  try {
    const res = await fetch(
      `${API_URL}/${carId}?userName=${encodeURIComponent(userName)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!res.ok) throw new Error(res.status);

    CarArray = CarArray.filter((c) => c.carId !== carId);
    renderCars(CarArray);
  } catch (err) {
    console.error("⚠️ Error deleting car:", err);
    alert("Error deleting car. Se konsol.");
  }
}
// --- EDIT FORM HANDLERS ---
function openEditForm(car) {
  document.getElementById("editCarId").value = car.carId;
  document.getElementById("editCarName").value = car.carName;
  document.getElementById("editCarModel").value = car.carModel || "";
  document.getElementById("editCarYear").value = car.carYear;
  document.getElementById("editCarPrice").value = car.carPrice;
  document.getElementById("edit-car-form").classList.remove("hidden");
}
function cancelEdit() {
  document.getElementById("edit-car-form").classList.add("hidden");
}

// --- EVENT LISTENERS ---
document.getElementById("add-car-form").addEventListener("submit", addCar);
document.getElementById("edit-car-form").addEventListener("submit", saveEdit);
document
  .getElementById("cancel-edit-btn")
  .addEventListener("click", cancelEdit);
document.getElementById("toggle-view-btn").addEventListener("click", () => {
  carContainer.classList.toggle("list-view");
  renderCars(CarArray);
});

// --- GLOBAL VARIABLES ---
const MAIN_URL = "https://car.buchwaldshave34.dk";
const API_URL = MAIN_URL + "/api/CarFamily";
const HUB_URL = MAIN_URL + "/TodoHub";
const userName = "WayHigh";
const carContainer = document.getElementById("car-container");
let CarArray = [];

// --- SIGNALR SETUP ---
const connection = new signalR.HubConnectionBuilder()
  .withUrl(HUB_URL)
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

connection.on("CarAdded", (car) => {
  const typedCar = createTypedInstance(car);
  CarArray.push(typedCar);
  renderCars(CarArray);
});

connection.on("CarUpdated", (car) => {
  const typedCar = createTypedInstance(car);
  const index = CarArray.findIndex((c) => c.carId === typedCar.carId);
  if (index !== -1) CarArray[index] = typedCar;
  renderCars(CarArray);
});

connection.on("CarDeleted", (carId) => {
  CarArray = CarArray.filter((c) => c.carId !== carId);
  renderCars(CarArray);
});

async function startConnectionAndFetchCars() {
  try {
    await connection.start();
    console.log("✅ SignalR connected");
    fetchCars(); // Fetch cars only after SignalR is connected
  } catch (err) {
    console.error("❌ SignalR failed:", err);
    setTimeout(startConnectionAndFetchCars, 5000);
  }
}

// --- FETCH CARS ---
async function fetchCars() {
  try {
    const res = await fetch(
      `${API_URL}?userName=${encodeURIComponent(userName)}`
    );
    if (!res.ok) throw new Error("API error: " + res.status);

    const rawData = await res.json();
    // Map API objects to class instances
    CarArray = rawData.map((item) => createTypedInstance(item));
    renderCars(CarArray);
  } catch (err) {
    console.error("Fetch failed:", err);
    if (carContainer) carContainer.innerHTML = "<p>⚠️ Could not load cars.</p>";
  }
}

// --- RENDER CARS ---
function renderCars(cars) {
  if (!carContainer) return;

  const isListView = carContainer.classList.contains("list-view");
  carContainer.innerHTML = "";

  cars.forEach((car) => {
    const card = document.createElement("div");
    card.className = "car-card";
    if (isListView) card.classList.add("list-view");

    if (isListView) {
      card.innerHTML = `
        <div class="list-row">
          <div>${car.carName}</div>
          <div class="button-group">
            <button class="edit-btn">✏️ Edit</button>
            <button class="delete-btn">🗑️ Delete</button>
          </div>
        </div>
        <div class="list-row">
          <div>${car.carModel ?? ""} - ${car.carYear}</div>
          <div>${car.carPrice.toLocaleString()} DKK</div>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="car-title">${car.carName} ${car.carModel ?? ""}</div>
        <div class="car-details">
          <p><strong>Year:</strong> ${car.carYear}</p>
          <p><strong>Price:</strong> ${car.carPrice.toLocaleString()} DKK</p>
          <p><strong>Age:</strong> ${car.carAge()} years</p>
        </div>
        <div class="button-group-card">
          <button class="edit-btn">✏️ Edit</button>
          <button class="delete-btn">🗑️ Delete</button>
        </div>
      `;
    }

    card
      .querySelector(".edit-btn")
      ?.addEventListener("click", () => openEditForm(car));
    card
      .querySelector(".delete-btn")
      ?.addEventListener("click", () => deleteCar(car.carId));

    carContainer.appendChild(card);
  });
}

// --- INIT ---
startConnectionAndFetchCars();
