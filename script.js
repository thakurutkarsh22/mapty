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
    clicks = 0;
    constructor(coordinates, distance, duration) {
        this.cords = coordinates; // [lat lng]
        this.distance = distance; // km
        this.duration = duration; // min
    }

    _setDescription() {
        // prettier-ignore
        const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July'
        ,'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on 
        ${months[this.date.getMonth()]} ${this.date.getDate()}`;        
    }

    click() {
        this.clicks++;
    }
}

class Running extends Workout {
    type = 'running';
    constructor(coords, distance, duration, cadence){
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
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
        this.calcSpeed();
        this._setDescription();
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
    #mapZoomLevel = 13;
    #workouts = []
    constructor() {
        // get users position 
        this._getPosition();

        // get data from local storage
        this._getFromLocalStorage();

        // attach event handlers
        form.addEventListener('submit', this._newWorkOut.bind(this));
        inputType.addEventListener('change', this._toggleElevationField)
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
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
        
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // handeling click on map 
        this.#map.on('click', this._showForm.bind(this));

        this.#workouts.forEach(work => {
            this._renderWorkoutMarker(work);
        })
        
    }

    _showForm(mapE){
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();   
    }

    _hideForm() {
        // empty inputs 
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => {
            form.style.display = 'grid';
        }, 0);
    }

    _toggleElevationField(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkOut(e) {

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
        
        // render workout on map
        this._renderWorkoutMarker(workout);

        // render workout on list        
        this._renderWorkout(workout);
        
        // clear input fields and hide the form
        this._hideForm();

        // save the workout in local storage. 
        this._setLocalStorage();
    }

    _renderWorkoutMarker(workout) {
        L.marker(workout.cords)
        .addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`,
        }))
        .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️': '🚴‍♀️'} ${workout.description}`)
        .openPopup();
    }

    _renderWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id=${workout.id}>
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
                <span class="workout__icon">${workout.type === 'runner' ? '🏃‍♂️': '🚴‍♀️'}</span>
                <span class="workout__value">${workout.distance}</span>
                <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${workout.duration}</span>
                <span class="workout__unit">min</span>
            </div>
        `;

        if(workout.type === 'running') {
            html += `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value">${workout.pace.toFixed(1)}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value">${workout.cadence}</span>
                    <span class="workout__unit">m</span>
                </div>
            </li>            
            `;
        }

        if(workout.type === 'cycling') {
            html+= `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${workout.speed.toFixed(1)}</span>
                <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
                <span class="workout__icon">⛰</span>
                <span class="workout__value">${workout.elvinGain}</span>
                <span class="workout__unit">m</span>
          </div>
        </li>    
            `;
        }  

        form.insertAdjacentHTML('afterend', html);
    }

    _moveToPopup(event) {
        let workoutEl = event.target.closest('.workout');
        if(!workoutEl) return;

        const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id);

        this.#map.setView(workout.cords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1
            }
        });

        workout.click();
    }

    _setLocalStorage() {
        window.localStorage.setItem('workouts', JSON.stringify(this.#workouts));
        console.log(this.#workouts);
    }

    _getFromLocalStorage() {
        const data = JSON.parse(window.localStorage.getItem('workouts'));

        if(!data) {
            return;
        }

        this.#workouts = data;

        this.#workouts.forEach(work => {
            this._renderWorkout(work);
        })
    }

    reset() {
        localStorage.removeItem('workouts');
        location.reload();
    }
}

const app = new App();