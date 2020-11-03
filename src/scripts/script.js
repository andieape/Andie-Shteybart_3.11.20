
// add custom js below
const Handlebars = require("handlebars");
const baseUrl = 'http://my-json-server.typicode.com/moviedb-tech/movies/list/';

var moviesBuffer = new Array();
var favArray = new Array();

function getMovies(){  
  fetch(baseUrl)  
    .then(  
      (response) => {  
        if (response.status !== 200) {  
          console.log('Looks like there was a problem. Status Code: ' +  
            response.status);  
          return;  
        }
        
        response.json().then(function(data) {  
          moviesBuffer = data;
          renderMoviesList(data);
          addListeners();
          checkState();
          getGenres();
        });  
      }  
    )
    .then(()=>{
      
    })  
    .catch(function(err) {  
      console.log('Fetch Error :-S', err);  
    });
}

function getFavourites(favArr) {    

  let favourites = new Array();

  for (let k=0; k<moviesBuffer.length; k++){
      for (let z=0; z<favArr.length; z++){          
        if (favArr[z] == moviesBuffer[k].id){            
          favourites.push(moviesBuffer[k]);
        }
      }
      
  }

  renderFavs(favourites);

}

function getGenres() {
  let genres = new Array();  

  const capFirstLet = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };  
  
  moviesBuffer.forEach((movie)=>{
    movie.genres.forEach((genre)=>{
      if (!genres.includes(genre)){
        genres.push(capFirstLet(genre));
      }        
      
    })
  });
  
  renderGenres(genres);
}


var templateCheck = true;
let favsTemplateBuffer; 
var movieTemplateCheck = true;
let moviesTemplateBuffer; 

const filterGenres = (movies, genre) => {
    
    if (genre == 'none') return movies;

    var filteredMovies = movies.filter(function (mov) {        
        return mov.genres.toString().toLowerCase().split(',').includes(genre.toLowerCase());
    });    
    

    return filteredMovies;
    
}




function renderMoviesList(moviesArr) {
  
  var data = { movies: moviesArr };

  if (movieTemplateCheck){
    moviesTemplateBuffer = document.getElementById("movies-template");
    movieTemplateCheck = false;
  }
    
  document.getElementById("movies-list").append(moviesTemplateBuffer); 

  var source = document.getElementById("movies-template").innerHTML;
  var template = Handlebars.compile(source);
  var html   = template(data);  
  document.querySelector('#movies-list').innerHTML = html;

}

function renderFavs(favs) {

  let data = {favourites: favs};    

  if (templateCheck){
    favsTemplateBuffer = document.getElementById("favs-template");
    templateCheck = false;
  }
    
  document.getElementById("favs-list").append(favsTemplateBuffer);  

  var source = document.getElementById("favs-template").innerHTML;
  var template = Handlebars.compile(source);
  var html   = template(data);  
  document.querySelector('#favs-list').innerHTML = html;


  let removeButtons = document.querySelectorAll('.favourites-list-item-remove');
  
  for (let x=0; x<removeButtons.length; x++){
      removeButtons[x].addEventListener('click', function(e) {
        let id = e.target.id;

        document.querySelectorAll('.favorite-star').forEach((x)=>{
          if (id == x.getAttribute('data-movie')){
            handleFavorites(id, x);
          }
        });

      });
  }
}

function renderModal(modalData) {

  var data = modalData;
  
  var templateBuffer = document.getElementById("movies_modal_template");

  var source = document.getElementById("movies_modal_template").innerHTML;
  var template = Handlebars.compile(source);
  var html = template(data);
  document.getElementById('movies_modal').innerHTML = html;


  var closeModal = document.querySelector('.modal-close');

  closeModal.addEventListener('click', (e)=>{
    document.querySelector('#movies_modal').style.display = 'none';
    document.getElementById("movies_modal").appendChild(templateBuffer);
  })
  
}

function renderGenres(genres) {
  
  let data = {genres: genres};    
  

  var source = document.getElementById("genres-template").innerHTML;
  var template = Handlebars.compile(source);
  var html   = template(data);  
  document.querySelector('#genres-list').innerHTML = html;

  let genre;
  document.querySelector('#genres-list').addEventListener('change', (e)=>{
    genre = e.target.value;
    var filtered = filterGenres(moviesBuffer, genre);
    renderMoviesList(filtered);
  })

}

function addListeners(){

  let listItems = document.querySelectorAll('.movies-list-item');
  let favButtons = document.querySelectorAll('.favorite-star');

  let modalWindow = document.querySelector('#movies_modal');

  let movieId;
  let movieName;
  let currButton;

  for (let k = 0; k < favButtons.length; k++) {
    favButtons[k].addEventListener('click', function(e) {
      if (e.repeat) return;
      
      currButton = e.target;

      movieId = e.target.getAttribute('data-movie');     
      movieName = e.target.getAttribute('data-title');
      
      handleFavorites(movieId, currButton);

      e.stopImmediatePropagation();
      e.stopPropagation();

    });

  } 

  for (let i = 0; i < listItems.length; i++) {
    listItems[i].addEventListener('click', function(e) {      

     if (e.target.classList.contains('favorite-star')) return;

      modalWindow.style.display = 'block';
      movieId = e.currentTarget.getAttribute('data-bind');

      fetch(baseUrl + movieId)
        .then((response) => {  
          if (response.status !== 200) {  
            console.log('Looks like there was a problem. Status Code: ' +  
              response.status);  
            return;  
          }
          
          response.json().then(function(data) {              
            renderModal(data)           
          });  
        })
        .catch(function(err) {  
          console.log('Fetch Error :-S', err);  
        });
        
    });
  }  

}


function handleFavorites(id, btn) {

  if (btn.classList.contains('star-inactive')){

    btn.classList.add('star-active');
    btn.classList.remove('star-inactive');

    if (!favArray.includes(id)){
      favArray.push(id);
    }    
    
  } else {
    btn.classList.remove('star-active');
    btn.classList.add('star-inactive');

    if (favArray.includes(id)){
      favArray.splice(favArray.indexOf(id), 1);
    }

    
  }
  getFavourites(favArray);
}





function checkState() {
    let cacheFavs = localStorage.getItem('cache_favs');
    if (cacheFavs.length > 0){
      cacheFavs = cacheFavs.split(',');  
      getFavourites(cacheFavs);
      document.querySelectorAll('.favorite-star').forEach((x)=>{
        cacheFavs.forEach((el)=>{
          if (el == x.getAttribute('data-movie')){
            handleFavorites(el, x);
          }
        });
        
      });

    }
    
}

window.addEventListener("unload", function() {
  
  localStorage.setItem('cache_favs', favArray);
 
});



getMovies();