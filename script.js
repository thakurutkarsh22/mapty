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
        e.preventDefault();
        
        // clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
    
    
        // display marker

        const {lat, lng} = this.#mapEvent.latlng;
    
        L.marker([lat, lng])
        .addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup',
        }))
        .setPopupContent("Workout")
        .openPopup();
    }
}

const app = new App();
// app._getPosition();







