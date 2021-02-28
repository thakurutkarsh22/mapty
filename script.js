'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    constructor(coordinates, distance, duration) {
        this.cords = coordinates; // [lat lng]
        this.distance = distance; // km
        this.duration = duration; // min
    }

    
}

class Running extends Workout {
    type = 'running';
    constructor(coords, distance, duration, cadence){
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace() {
        // min / km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}


class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elvinGain) {
        super(coords, distance, duration);
        this.elvinGain = elvinGain;
    }

    calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration/60);
        return this.speed;
    }
}

const run1 = new Running([39,-12], 5.2, 20,178);
const cycle1 = new Cycling([39,-12], 27, 95,523);

//APP 
class App {
    #map;
    #mapEvent;
    #workouts = []
    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkOut.bind(this));
        inputType.addEventListener('change', this._toggleElevationField)
    }

    _getPosition() {
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),()=> {
            alert('could not get your position');
        })
    }

    _loadMap(position) {   
        const { latitude, longitude} = position.coords;
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`, position)

        const coords = [latitude, longitude];
        
        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        L.marker(coords)
        .addTo(this.#map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();

        // handeling click on map 
        this.#map.on('click', this._showForm.bind(this));
        
    }

    _showForm(mapE){
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();   
    }

    _toggleElevationField(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkOut(e){

        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const checkForPositive = (...inputs) => inputs.every(inp => inp > 0);
        e.preventDefault();

        // get data from form 

        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat, lng} = this.#mapEvent.latlng;
        let workout;
        // check and validate form data
        // fi activity running : create running object

        if(type === 'running') {
            const cadance = + inputCadence.value;
            if(!validInputs(distance, duration, cadance) || !checkForPositive(distance,duration,cadance))
                return alert('inputs have to be positive numbers!');
            workout = new Running([lat,lng], distance, duration, cadance);            
        }

        // if activity cycling: create cycling object

        if(type === 'cycling') {
            const elevation = + inputElevation.value;
            if(!validInputs(distance,duration,elevation) || !checkForPositive(distance,duration)) {
                return alert('inputs have to be positive numbers!');
            }
            workout = new Cycling([lat,lng], distance, duration, elevation);            
        }
        // push new object to workout array
        this.#workouts.push(workout);
        console.log(workout);  
        
        this.renderWorkoutMarker(workout);

        // hide form + clear input fields
        
        // clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    }

    renderWorkoutMarker(workout) {
        L.marker(workout.cords)
        .addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`,
        }))
        .setPopupContent(workout.distance + '')
        .openPopup();
    }
}

const app = new App();