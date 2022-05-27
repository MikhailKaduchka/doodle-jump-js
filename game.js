// Константы
var jumpSize = 100;
var heroGravitationIncrement = 5;
var platformGravitationIncrement = 1;
var numberOfPlatforms = 20;
var intervalTimeoutMilliseconds = 30;

var platformHeight = 10;
var platformWidth = 80;
var fireHeight = 20;

var heroWidth = 34

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

var score = 0

function cleanState() {
    //Удаляем старое
    window.clearInterval(gravitationInterval)

    removeElementsByClass("hero")
    removeElementsByClass("platform")

    movingRight = false
    movingLeft = false
    impulse = 0
    score = 0

    currentPlatform = null
    isHeroOnPlatform = false
}

// Функция запускаемая в начале из HTML файла
function startGame() {
    cleanState()

    // Находим игровое поле
    gameElement = document.getElementById('game');

    scoreElement = document.getElementById('score');

    // Значения поля
    maxTop = gameElement.getBoundingClientRect().top
    maxBottom = gameElement.getBoundingClientRect().bottom
    maxLeft = gameElement.getBoundingClientRect().left
    maxRight = gameElement.getBoundingClientRect().right

    // Создаем объект для героя в поле игры
    heroElement = createHero(gameElement)

    // Добавляем функцию обработчик для нажатия клавиш
    document.addEventListener('keydown', function (e) { keydownEvent(event); }, false)
    document.addEventListener('keyup', function (e) { keyupEvent(event); }, false)

    // Создаем платформы
    // Массив сосзданных платформ
    var platforms = generatePlatforms(gameElement, numberOfPlatforms);

    // "Включаем" гравитацию
    gravitationInterval = window.setInterval(intervalFunction,
        intervalTimeoutMilliseconds, heroElement, gameElement, platforms, scoreElement, heroGravitationIncrement, platformGravitationIncrement);
}

// Создаем героя
function createHero(gameElement) {
    var hero = document.createElement('div');
    hero.setAttribute("id", "hero");
    hero.style.position = "absolute";
    hero.style.left = gameElement.getBoundingClientRect().left + (gameElement.getBoundingClientRect().right - gameElement.getBoundingClientRect().left) / 2
    hero.setAttribute("class", "hero right");
    gameElement.insertBefore(hero, gameElement.children[0]);

    return hero
}

// Удаляем объект по его классу
function removeElementsByClass(className) {
    const elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
        removeElement(elements[0])
    }
}

function removeElement(element) {
    element.parentNode.removeChild(element);
}

function intervalFunction(heroElement, gameElement, platforms, scoreElement, heroGravitationIncrement, platformGravitationIncrement) {
    movementsForHero(heroElement)
    gravityForHero(heroElement, gameElement, platforms, heroGravitationIncrement)
    gravityForPlatforms(heroElement, platforms, platformGravitationIncrement)
    updateScore(scoreElement, platformGravitationIncrement)
}

function movementsForHero(heroElement) {

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
}

function gravityForHero(heroElement, gameElement, platforms, increment) {
    // импульс прыжка
    if (impulse > 0) {
        heroElement.style.top = heroElement.getBoundingClientRect().top - increment;
        impulse -= increment;
        isHeroOnPlatform = false
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
        if (isOnPlatform(heroElement, platforms[i])) {
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

function gravityForPlatforms(heroElement, platforms, platformGravitationIncrement) {
    // Падают платформы
    for (let i = 0; i < platforms.length; i++) {
        platforms[i].style.top = platforms[i].getBoundingClientRect().top + platformGravitationIncrement;
        if (isHeroOnPlatform && platforms[i] === currentPlatform) {
            heroElement.style.top = currentPlatform.getBoundingClientRect().top - heroElement.getBoundingClientRect().height;
        }
        //Удаляем платформы если вышли за границу игрового поля
        if (platforms[i].getBoundingClientRect().bottom > maxBottom) {
            if (isHeroOnPlatform && platforms[i] === currentPlatform) {
                isHeroOnPlatform = false
            }
            removeElement(platforms[i])
            platforms.splice(i, 1);

            var top = maxTop
            var left = maxLeft + getRndInteger(0, maxRight - platformWidth - maxLeft)
            platforms.push(createPlatform(gameElement, top, left))

        }
    }

}

function updateScore(scoreElement, platformGravitationIncrement) {
    score += platformGravitationIncrement
    scoreElement.textContent = "Очки: " + Math.floor(score/10)
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
    for (var i = 0; i < numberPlatforms; i++) {
        var top = maxTop + getRndInteger(maxTop, maxBottom - platformHeight - fireHeight)
        var left = maxLeft + getRndInteger(0, maxRight - platformWidth - maxLeft)
        platforms.push(createPlatform(gameElement, top, left))
    }
    return platforms
}

// Cоздаем новую платформу в игре
function createPlatform(gameElement, top, left) {
    var platformElement = document.createElement('div');
    platformElement.style.position = "absolute";

    platformElement.style.top = top
    platformElement.style.left = left
    platformElement.setAttribute("class", "platform");

    gameElement.insertBefore(platformElement, gameElement.children[0]);

    return platformElement
}

// Случайне число в диапазоне
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}