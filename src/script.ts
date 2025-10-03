// Fortæl TypeScript at signalR eksisterer globalt (kommer fra <script> i HTML)
declare var signalR: any;

// --- INTERFACES ---
interface ICar {
  carId: number;
  carName: string;
  carYear: number;
  carPrice: number;
}

interface ICarModel extends ICar {
  carModel: string;
}

type ApiCar = (ICar & { $type: "car" }) | (ICarModel & { $type: "carModel" });

// --- CLASSES ---
class Car implements ICar {
  constructor(
    public carId: number,
    public carName: string,
    public carYear: number,
    public carPrice: number
  ) {}

  carAge(): number {
    return new Date().getFullYear() - this.carYear;
  }
}

class CarModel extends Car implements ICarModel {
  constructor(
    carId: number,
    carName: string,
    public carModel: string,
    carYear: number,
    carPrice: number
  ) {
    super(carId, carName, carYear, carPrice);
  }
}

// --- CLASS MAP ---
const classMap = {
  car: Car,
  carModel: CarModel,
};

function createTypedInstance(item: ApiCar): Car | CarModel {
  if (item.$type === "carModel") {
    return new CarModel(
      item.carId,
      item.carName,
      item.carModel,
      item.carYear,
      item.carPrice
    );
  }
  return new Car(item.carId, item.carName, item.carYear, item.carPrice);
}

// --- GLOBAL VARIABLES ---
const MAIN_URL = "https://car.buchwaldshave34.dk";
const API_URL = MAIN_URL + "/api/CarFamily";
const HUB_URL = MAIN_URL + "/TodoHub";
const userName = "WayHigh";
const carContainer = document.getElementById("car-container") as HTMLElement;
let CarArray: (Car | CarModel)[] = [];

// --- ADD CAR (POST) ---
async function addCar(e: Event) {
  e.preventDefault();

  const carName = (document.getElementById("carName") as HTMLInputElement).value.trim();
  const carModel = (document.getElementById("carModel") as HTMLInputElement).value.trim();
  const carYear = parseInt((document.getElementById("carYear") as HTMLInputElement).value);
  const carPrice = parseFloat((document.getElementById("carPrice") as HTMLInputElement).value);

  if (!carName || isNaN(carYear) || isNaN(carPrice)) {
    alert("Udfyld venligst alle krævede felter.");
    return;
  }

  // Midlertidig instans
  const newCarInstance: Car | CarModel = carModel
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

    if (!res.ok) throw new Error(res.status.toString());

    const addedCar: ICar | ICarModel = await res.json();
    newCarInstance.carId = addedCar.carId;
    console.log("✅ Car added with real ID:", addedCar.carId);
  } catch (err) {
    console.error("⚠️ Error adding car:", err);
    alert("Error adding car. Se konsol.");
    CarArray = CarArray.filter((c) => c !== newCarInstance);
    renderCars(CarArray);
  }

  (document.getElementById("add-car-form") as HTMLFormElement).reset();
}

// --- SAVE EDIT (PUT) ---
async function saveEdit(e: Event) {
  e.preventDefault();

  const carId = parseInt((document.getElementById("editCarId") as HTMLInputElement).value);
  const carName = (document.getElementById("editCarName") as HTMLInputElement).value.trim();
  const carModel = (document.getElementById("editCarModel") as HTMLInputElement).value.trim();
  const carYear = parseInt((document.getElementById("editCarYear") as HTMLInputElement).value);
  const carPrice = parseFloat((document.getElementById("editCarPrice") as HTMLInputElement).value);

  if (!carName || isNaN(carYear) || isNaN(carPrice)) {
    alert("Udfyld venligst alle krævede felter.");
    return;
  }

  const index = CarArray.findIndex((c) => c.carId === carId);
  if (index === -1) return;

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
    if (!res.ok) throw new Error(res.status.toString());
    console.log("✅ Car updated successfully");
  } catch (err) {
    console.error("⚠️ Error updating car:", err);
    alert("Error updating car. Se konsol.");
  }
}

// --- DELETE CAR (DELETE) ---
async function deleteCar(carId: number) {
  if (!confirm("Er du sikker på, at du vil slette denne bil?")) return;

  try {
    const res = await fetch(`${API_URL}/${carId}?userName=${encodeURIComponent(userName)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(res.status.toString());

    CarArray = CarArray.filter((c) => c.carId !== carId);
    renderCars(CarArray);
  } catch (err) {
    console.error("⚠️ Error deleting car:", err);
    alert("Error deleting car. Se konsol.");
  }
}

// --- EDIT FORM HANDLERS ---
function openEditForm(car: Car | CarModel) {
  (document.getElementById("editCarId") as HTMLInputElement).value = car.carId.toString();
  (document.getElementById("editCarName") as HTMLInputElement).value = car.carName;
  (document.getElementById("editCarModel") as HTMLInputElement).value =
    (car as CarModel).carModel ?? "";
  (document.getElementById("editCarYear") as HTMLInputElement).value = car.carYear.toString();
  (document.getElementById("editCarPrice") as HTMLInputElement).value = car.carPrice.toString();
  document.getElementById("edit-car-form")?.classList.remove("hidden");
}

function cancelEdit() {
  document.getElementById("edit-car-form")?.classList.add("hidden");
}

// --- EVENT LISTENERS ---
(document.getElementById("add-car-form") as HTMLFormElement).addEventListener("submit", addCar);
(document.getElementById("edit-car-form") as HTMLFormElement).addEventListener("submit", saveEdit);
document.getElementById("cancel-edit-btn")?.addEventListener("click", cancelEdit);
document.getElementById("toggle-view-btn")?.addEventListener("click", () => {
  carContainer.classList.toggle("list-view");
  renderCars(CarArray);
});

// --- SIGNALR SETUP ---
const connection = new signalR.HubConnectionBuilder()
  .withUrl(HUB_URL)
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

connection.on("CarAdded", (car: ApiCar) => {
  const typedCar = createTypedInstance(car);
  CarArray.push(typedCar);
  renderCars(CarArray);
});

connection.on("CarUpdated", (car: ApiCar) => {
  const typedCar = createTypedInstance(car);
  const index = CarArray.findIndex((c) => c.carId === typedCar.carId);
  if (index !== -1) CarArray[index] = typedCar;
  renderCars(CarArray);
});

connection.on("CarDeleted", (carId: number) => {
  CarArray = CarArray.filter((c) => c.carId !== carId);
  renderCars(CarArray);
});

async function startConnectionAndFetchCars() {
  try {
    await connection.start();
    console.log("✅ SignalR connected");
    fetchCars();
  } catch (err) {
    console.error("❌ SignalR failed:", err);
    setTimeout(startConnectionAndFetchCars, 5000);
  }
}

// --- FETCH CARS ---
async function fetchCars() {
  try {
    const res = await fetch(`${API_URL}?userName=${encodeURIComponent(userName)}`);
    if (!res.ok) throw new Error("API error: " + res.status);

    const rawData: ApiCar[] = await res.json();
    CarArray = rawData.map((item) => createTypedInstance(item));
    renderCars(CarArray);
  } catch (err) {
    console.error("Fetch failed:", err);
    if (carContainer) carContainer.innerHTML = "<p>⚠️ Could not load cars.</p>";
  }
}

// --- RENDER CARS ---
function renderCars(cars: (Car | CarModel)[]) {
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
          <div>${(car as CarModel).carModel ?? ""} - ${car.carYear}</div>
          <div>${car.carPrice.toLocaleString()} DKK</div>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="car-title">${car.carName} ${(car as CarModel).carModel ?? ""}</div>
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

    card.querySelector(".edit-btn")?.addEventListener("click", () => openEditForm(car));
    card.querySelector(".delete-btn")?.addEventListener("click", () => deleteCar(car.carId));

    carContainer.appendChild(card);
  });
}

// --- INIT ---
startConnectionAndFetchCars();
