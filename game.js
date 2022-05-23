// Глобалные переменные нужны для доступа к ним из функций куда их передать не получается
var gravitationInterval

var heroElement

// Флаг, что герой на платформе
var isHeroOnPlatform = false

// Храним платформу на которой стоит герой
var currentPlatform

// Функция запускаемая в начале из HTML файла
function startGame(){
    // Удаляем предупреждение их HTML
    removeElementsByClass("nojs")

    // Находим игровое поле
    gameElement = document.getElementById('game');
    
    // Создаем объект для героя в поле игры
    heroElement = createHero(gameElement)
    
    // Добавляем функцию обработчик для нажатия клавиш
    document.addEventListener('keydown', function(e) { heroNavigation(event); } , false)

    // Создаем платформы
    // Массив сосзданных платформ
    var platforms =  generatePlatforms(gameElement, 10);

    // "Включаем" гравитацию
    gravitationInterval = window.setInterval(gravitation, 200, heroElement, gameElement, platforms, 10);
}

// Создаем героя
function createHero(gameElement){
    var hero = document.createElement('div');
    hero.setAttribute("id", "hero");
    var content = document.createTextNode("<H>");
    hero.appendChild(content);
    hero.style.position = "absolute";
    hero.style.left = gameElement.getBoundingClientRect().left + (gameElement.getBoundingClientRect().right-gameElement.getBoundingClientRect().left)/2

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
    // если на платформе ничего не делаем
    if (isHeroOnPlatform) {
        return
    }

    heroElement.style.top = heroElement.getBoundingClientRect().top + increment;

    // Проверяем на приземление на платформу
    for (let i = 0; i < platforms.length; i++) {
        if(isOnPlatform(heroElement, platforms[i])) {
            isHeroOnPlatform = true
            currentPlatform = platforms[i]
            // Корректировка расположения героя соотвевственно платформы
            heroElement.style.top = currentPlatform.getBoundingClientRect().top - heroElement.getBoundingClientRect().height;
            break
        }
      }

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
function heroNavigation(event) {
    if (event.code === 'ArrowRight') {
        heroElement.style.left = heroElement.getBoundingClientRect().left + 5;
    }

    if (event.code === 'ArrowLeft') {
        heroElement.style.left = heroElement.getBoundingClientRect().left - 5;
    }

    // Прыгаем только если на платформе
    if (event.code === 'Space' && isHeroOnPlatform) {
        heroElement.style.top = heroElement.getBoundingClientRect().top - 50;
    }

    // Свалились с платформы?
    if (!isOnPlatform(heroElement, currentPlatform)) {
        isHeroOnPlatform = false
    }   
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
    var platformElement = document.createElement('div');
    platformElement.style.position = "absolute";
    
    platformElement.style.top = gameElement.getBoundingClientRect().top + getRndInteger(100, 500);
    platformElement.style.left = gameElement.getBoundingClientRect().left + getRndInteger(100, 700);
    platformElement.setAttribute("class", "platform");

    gameElement.insertBefore(platformElement, gameElement.children[0]);

    return platformElement
}


// Случайне число в диапазоне
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
  }