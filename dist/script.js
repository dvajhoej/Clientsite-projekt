"use strict";
var _a, _b;
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
        return new CarModel(item.carId, item.carName, item.carModel, item.carYear, item.carPrice);
    }
    return new Car(item.carId, item.carName, item.carYear, item.carPrice);
}
// --- GLOBAL VARIABLES ---
const MAIN_URL = "https://car.buchwaldshave34.dk";
const API_URL = MAIN_URL + "/api/CarFamily";
const HUB_URL = MAIN_URL + "/TodoHub";
const userName = "WayHigh";
const carContainer = document.getElementById("car-container");
let CarArray = [];
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
    // Midlertidig instans
    const newCarInstance = carModel
        ? new CarModel(0, carName, carModel, carYear, carPrice)
        : new Car(0, carName, carYear, carPrice);
    CarArray.push(newCarInstance);
    renderCars(CarArray);
    try {
        const res = await fetch(`${API_URL}?userName=${encodeURIComponent(userName)}`, {
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
        });
        if (!res.ok)
            throw new Error(res.status.toString());
        const addedCar = await res.json();
        newCarInstance.carId = addedCar.carId;
        console.log("✅ Car added with real ID:", addedCar.carId);
    }
    catch (err) {
        console.error("⚠️ Error adding car:", err);
        alert("Error adding car. Se konsol.");
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
    const index = CarArray.findIndex((c) => c.carId === carId);
    if (index === -1)
        return;
    const updatedInstance = carModel
        ? new CarModel(carId, carName, carModel, carYear, carPrice)
        : new Car(carId, carName, carYear, carPrice);
    CarArray[index] = updatedInstance;
    renderCars(CarArray);
    cancelEdit();
    try {
        const res = await fetch(`${API_URL}/${carId}?userName=${encodeURIComponent(userName)}`, {
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
        });
        if (!res.ok)
            throw new Error(res.status.toString());
        console.log("✅ Car updated successfully");
    }
    catch (err) {
        console.error("⚠️ Error updating car:", err);
        alert("Error updating car. Se konsol.");
    }
}
// --- DELETE CAR (DELETE) ---
async function deleteCar(carId) {
    if (!confirm("Er du sikker på, at du vil slette denne bil?"))
        return;
    try {
        const res = await fetch(`${API_URL}/${carId}?userName=${encodeURIComponent(userName)}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });
        if (!res.ok)
            throw new Error(res.status.toString());
        CarArray = CarArray.filter((c) => c.carId !== carId);
        renderCars(CarArray);
    }
    catch (err) {
        console.error("⚠️ Error deleting car:", err);
        alert("Error deleting car. Se konsol.");
    }
}
// --- EDIT FORM HANDLERS ---
function openEditForm(car) {
    var _a, _b;
    document.getElementById("editCarId").value = car.carId.toString();
    document.getElementById("editCarName").value = car.carName;
    document.getElementById("editCarModel").value =
        (_a = car.carModel) !== null && _a !== void 0 ? _a : "";
    document.getElementById("editCarYear").value = car.carYear.toString();
    document.getElementById("editCarPrice").value = car.carPrice.toString();
    (_b = document.getElementById("edit-car-form")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
}
function cancelEdit() {
    var _a;
    (_a = document.getElementById("edit-car-form")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
}
// --- EVENT LISTENERS ---
document.getElementById("add-car-form").addEventListener("submit", addCar);
document.getElementById("edit-car-form").addEventListener("submit", saveEdit);
(_a = document.getElementById("cancel-edit-btn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", cancelEdit);
(_b = document.getElementById("toggle-view-btn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
    carContainer.classList.toggle("list-view");
    renderCars(CarArray);
});
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
    if (index !== -1)
        CarArray[index] = typedCar;
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
        fetchCars();
    }
    catch (err) {
        console.error("❌ SignalR failed:", err);
        setTimeout(startConnectionAndFetchCars, 5000);
    }
}
// --- FETCH CARS ---
async function fetchCars() {
    try {
        const res = await fetch(`${API_URL}?userName=${encodeURIComponent(userName)}`);
        if (!res.ok)
            throw new Error("API error: " + res.status);
        const rawData = await res.json();
        CarArray = rawData.map((item) => createTypedInstance(item));
        renderCars(CarArray);
    }
    catch (err) {
        console.error("Fetch failed:", err);
        if (carContainer)
            carContainer.innerHTML = "<p>⚠️ Could not load cars.</p>";
    }
}
// --- RENDER CARS ---
function renderCars(cars) {
    if (!carContainer)
        return;
    const isListView = carContainer.classList.contains("list-view");
    carContainer.innerHTML = "";
    cars.forEach((car) => {
        var _a, _b, _c, _d;
        const card = document.createElement("div");
        card.className = "car-card";
        if (isListView)
            card.classList.add("list-view");
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
          <div>${(_a = car.carModel) !== null && _a !== void 0 ? _a : ""} - ${car.carYear}</div>
          <div>${car.carPrice.toLocaleString()} DKK</div>
        </div>
      `;
        }
        else {
            card.innerHTML = `
        <div class="car-title">${car.carName} ${(_b = car.carModel) !== null && _b !== void 0 ? _b : ""}</div>
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
        (_c = card.querySelector(".edit-btn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => openEditForm(car));
        (_d = card.querySelector(".delete-btn")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => deleteCar(car.carId));
        carContainer.appendChild(card);
    });
}
// --- INIT ---
startConnectionAndFetchCars();
