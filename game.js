// Константы
var jumpSize = 50
var gravitationIncrement = 5
var numberOfPlatforms = 20

// Глобалные переменные нужны для доступа к ним из функций куда их передать не получается
var gravitationInterval

var heroElement

// Флаг, что герой на платформе
var isHeroOnPlatform

// Храним платформу на которой стоит герой
var currentPlatform

// Плавный прыжок
var impulse = 0

// Плавное передвижение
var movingRight = false
var movingLeft = false

var maxTop, maxBottom, maxLeft, maxRight 

function cleanState(){
    //Удаляем старое
    window.clearInterval(gravitationInterval)

    removeElementsByClass("hero")
    removeElementsByClass("platform")

    movingRight = false
    movingLeft = false
    impulse = 0

    currentPlatform = null
    isHeroOnPlatform = false
}

// Функция запускаемая в начале из HTML файла
function startGame(){
    cleanState()

    // Находим игровое поле
    gameElement = document.getElementById('game');

    // Значения поля
    maxTop = gameElement.getBoundingClientRect().top 
    maxBottom = gameElement.getBoundingClientRect().bottom 
    maxLeft = gameElement.getBoundingClientRect().left 
    maxRight = gameElement.getBoundingClientRect().right 
    
    // Создаем объект для героя в поле игры
    heroElement = createHero(gameElement)
    
    // Добавляем функцию обработчик для нажатия клавиш
    document.addEventListener('keydown', function(e) { keydownEvent(event); } , false)
    document.addEventListener('keyup', function(e) { keyupEvent(event); } , false)

    // Создаем платформы
    // Массив сосзданных платформ
    var platforms =  generatePlatforms(gameElement, numberOfPlatforms);

    // "Включаем" гравитацию
    gravitationInterval = window.setInterval(gravitation, 30, heroElement, gameElement, platforms, gravitationIncrement);
}

// Создаем героя
function createHero(gameElement){
    var hero = document.createElement('div');
    hero.setAttribute("id", "hero");
    hero.style.position = "absolute";
    hero.style.left = gameElement.getBoundingClientRect().left + (gameElement.getBoundingClientRect().right-gameElement.getBoundingClientRect().left)/2
    hero.setAttribute("class", "hero right");
    gameElement.insertBefore(hero, gameElement.children[0]);   

    return hero
}

// Удаляем объект по его классу
function removeElementsByClass(className){
    const elements = document.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function gravitation(heroElement, gameElement, platforms, increment) {
    var heroWidth = 34;
    var nextPositionOnRight = heroElement.getBoundingClientRect().left + 3 
    var nextPositionOnLeft = heroElement.getBoundingClientRect().left - 3 
    
    if (movingRight && nextPositionOnRight < maxRight - heroWidth) {
        heroElement.style.left = heroElement.getBoundingClientRect().left + 3;
        // Свалились с платформы?
        if (isHeroOnPlatform && !isOnPlatform(heroElement, currentPlatform)) {
            isHeroOnPlatform = false
        }  
    } else if (movingLeft && nextPositionOnLeft > maxLeft) {
        heroElement.style.left = heroElement.getBoundingClientRect().left - 3; 
         // Свалились с платформы?
        if (isHeroOnPlatform && !isOnPlatform(heroElement, currentPlatform)) {
            isHeroOnPlatform = false
        }  
        
    }

    // импульс прыжка
    if (impulse > 0) {
        heroElement.style.top = heroElement.getBoundingClientRect().top - increment;
        impulse-=increment;
        isHeroOnPlatform=false
        return
    }

    // если герой уже на платформе то ничего не делаем
    if (!!isHeroOnPlatform) {
        // console.log("Hero is on a platform");
        return
    }

    heroElement.style.top = heroElement.getBoundingClientRect().top + increment;

    // Проверяем на приземление на платформу
    for (let i = 0; i < platforms.length; i++) {
        if(isOnPlatform(heroElement, platforms[i])) {
            // console.log("Checking if hero is on a platform");
            isHeroOnPlatform = true
            currentPlatform = platforms[i]
            // Корректировка расположения героя соотвевственно платформы
            heroElement.style.top = currentPlatform.getBoundingClientRect().top - heroElement.getBoundingClientRect().height;
            break
        }
    }

      // Если упали в огонь то конец игре и останавливаем "гравитацию"
    if (didHeroFall(heroElement, gameElement)) {
        alert("game over");
        window.clearInterval(gravitationInterval)
    }
}

// Проверяет достигли герой дна
function didHeroFall(heroElement, gameElement) {
    return heroElement.getBoundingClientRect().bottom >= gameElement.getBoundingClientRect().bottom
}

// Управление героем по нажатию клавиш
function keyupEvent(event) {
    if (event.code === 'ArrowRight') {
        movingRight = false
    }

    if (event.code === 'ArrowLeft') {
        movingLeft = false
    }
}

function keydownEvent(event) {
    if (event.code === 'ArrowRight') {
        movingRight = true
        heroElement.classList.remove("left");
        heroElement.classList.add("right");
    }

    if (event.code === 'ArrowLeft') {
        movingLeft = true
        heroElement.classList.remove("right");
        heroElement.classList.add("left");
    }

    // Прыгаем только если на платформе
    if (event.code === 'Space' && !!isHeroOnPlatform) {
        impulse = jumpSize
        isHeroOnPlatform = false
    } 
    // console.log("Pressed button: " + event.code)
}

// Проверяем если герой на платформе
function isOnPlatform(heroElement, platform) {
    
    heroBottom = heroElement.getBoundingClientRect().bottom;
    heroLeft = heroElement.getBoundingClientRect().left;
    heroRight = heroElement.getBoundingClientRect().right;

    platformTop = platform.getBoundingClientRect().top;
    platformLeft = platform.getBoundingClientRect().left;
    platformRight = platform.getBoundingClientRect().right;

    return heroBottom >= platformTop - 5 && heroBottom <= platformTop + 5 &&
        heroLeft < platformRight &&
        heroRight > platformLeft
}

// Создание нескольких платформ
function generatePlatforms(gameElement, numberPlatforms) {
    var platforms = []
    for (var i=0; i<numberPlatforms;  i++) {
        platforms.push(createPlatform(gameElement))
    }
    return platforms
}

// Cоздаем новую платформу в игре
function createPlatform(gameElement){
    var platformHeight = 10;
    var platformWidth = 80;
    var fireHeight = 20;
    var platformElement = document.createElement('div');
    platformElement.style.position = "absolute";
    
    platformElement.style.top = gameElement.getBoundingClientRect().top + getRndInteger(maxTop, maxBottom - platformHeight - fireHeight)
    platformElement.style.left = gameElement.getBoundingClientRect().left + getRndInteger(0, maxRight - platformWidth - gameElement.getBoundingClientRect().left)
    platformElement.setAttribute("class", "platform");

    gameElement.insertBefore(platformElement, gameElement.children[0]);

    return platformElement
}


// Случайне число в диапазоне
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }