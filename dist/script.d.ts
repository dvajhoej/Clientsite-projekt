interface ICar {
    carId: number;
    carName: string;
    carYear: number;
    carPrice: number;
}
interface ICarModel extends ICar {
    carModel: string;
}
type ApiCar = (ICar & {
    $type: "car";
}) | (ICarModel & {
    $type: "carModel";
});
declare class Car implements ICar {
    carId: number;
    carName: string;
    carYear: number;
    carPrice: number;
    constructor(carId: number, carName: string, carYear: number, carPrice: number);
    carAge(): number;
}
declare class CarModel extends Car implements ICarModel {
    carModel: string;
    constructor(carId: number, carName: string, carModel: string, carYear: number, carPrice: number);
}
declare const classMap: {
    car: typeof Car;
    carModel: typeof CarModel;
};
declare function createTypedInstance(item: ApiCar): Car | CarModel;
declare const MAIN_URL = "https://car.buchwaldshave34.dk";
declare const API_URL: string;
declare const HUB_URL: string;
declare const userName = "WayHigh";
declare const carContainer: HTMLElement;
declare let CarArray: (Car | CarModel)[];
declare function addCar(e: Event): Promise<void>;
declare function saveEdit(e: Event): Promise<void>;
declare function deleteCar(carId: number): Promise<void>;
declare function openEditForm(car: Car | CarModel): void;
declare function cancelEdit(): void;
declare const connection: any;
declare function startConnectionAndFetchCars(): Promise<void>;
declare function fetchCars(): Promise<void>;
declare function renderCars(cars: (Car | CarModel)[]): void;
//# sourceMappingURL=script.d.ts.map