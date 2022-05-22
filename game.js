var gameElement
// Global var to be able navigate it
var heroElement
var gravitationInterval

var platforms = []
var isHeroOnPlatform = false
var currentPlatform

function startGame(){
    removeElementsByClass("nojs")
    gameElement = document.getElementById('game');
    heroElement = createHero(gameElement)
    document.addEventListener('keydown', function(e) { heroNavigation(event); } , false)

    generatePlatforms(gameElement, 10);
    gravitationInterval = window.setInterval(gravitaton, 200, heroElement, 10);
}

function createHero(gameElement){
    var hero = document.createElement('div');
    hero.setAttribute("id", "hero");
    var content = document.createTextNode("<R>");
    hero.appendChild(content);
    gameElement.insertBefore(hero, gameElement.children[0]);

    return hero
}

function removeElementsByClass(className){
    const elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function gravitaton(heroElement, increment) {
    if (isHeroOnPlatform) {
        return
    }
    heroElement.style.position = "absolute";
    heroElement.style.top = heroElement.getBoundingClientRect().top + increment;

    for (let i = 0; i < platforms.length; i++) {
        if(isOnPlatform(heroElement, platforms[i])) {
            console.log("On platform!")
            isHeroOnPlatform = true
            currentPlatform = platforms[i]
            // adjust top
            debugger;
            heroElement.style.top = currentPlatform.getBoundingClientRect().top - heroElement.getBoundingClientRect().height;
            break
        }
      }

    if (didHeroFall(heroElement, gameElement)) {
        alert("game over");
        window.clearInterval(gravitationInterval)
        
    }
    // console.log("go down: " + heroElement.getBoundingClientRect().top)
}

function didHeroFall(heroElement, gameElement) {
    return heroElement.getBoundingClientRect().bottom >= gameElement.getBoundingClientRect().bottom
}

function heroNavigation(event) {
    if (event.code === 'ArrowRight') {
        heroElement.style.left = heroElement.getBoundingClientRect().left + 5;
    }

    if (event.code === 'ArrowLeft') {
        heroElement.style.left = heroElement.getBoundingClientRect().left - 5;
    }

    if (event.code === 'ArrowUp' && isHeroOnPlatform) {
        heroElement.style.top = heroElement.getBoundingClientRect().top - 50;
    }

    if (!isOnPlatform(heroElement, currentPlatform)) {
        isHeroOnPlatform = false
    }   
}

function isOnPlatform(heroElement, currentPlatform) {
    heroBottom = heroElement.getBoundingClientRect().bottom;
    heroLeft = heroElement.getBoundingClientRect().left;
    heroRight = heroElement.getBoundingClientRect().right;

    platformTop = currentPlatform.getBoundingClientRect().top;
    platformLeft = currentPlatform.getBoundingClientRect().left;
    platformRight = currentPlatform.getBoundingClientRect().right;

    return heroBottom >= platformTop - 5 && heroBottom <= platformTop + 5 &&
        heroLeft < platformRight &&
        heroRight > platformLeft
}

function generatePlatforms(gameElement, numberPlatforms) {
    for (var i=0; i<numberPlatforms;  i++) {
        platforms.push(createPlatform(gameElement))
    }
}

function createPlatform(gameElement){
    var platformElement = document.createElement('div');
    platformElement.style.position = "absolute";
    //add random values
    platformElement.style.top = gameElement.getBoundingClientRect().top + getRndInteger(100, 500);
    platformElement.style.left = gameElement.getBoundingClientRect().left + getRndInteger(100, 700);
    platformElement.setAttribute("class", "platform");

    gameElement.insertBefore(platformElement, gameElement.children[0]);

    return platformElement
}


function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }