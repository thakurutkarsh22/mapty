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







