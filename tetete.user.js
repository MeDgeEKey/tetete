// ==UserScript==
// @name         Blume miner
// @version      1.23
// @namespace    cheltbl
// @author       cheltbl
// @match        https://telegram.blum.codes/*
// @grant        none
// @icon         https://cdn.prod.website-files.com/65b6a1a4a0e2af577bccce96/65ba99c1616e21b24009b86c_blum-256.png
// @downloadURL  https://github.com/MeDgeEKey/tetete/raw/main/tetete.user.js
// @updateURL    https://github.com/MeDgeEKey/tetete/raw/main/tetete.user.js
// @homepage     https://www.google.com/search?client=opera&q=google&sourceid=opera&ie=UTF-8&oe=UTF-8
// ==/UserScript==

let GAME_SETTINGS = {
    bombHitPercentage: Math.floor(Math.random() * 20)+60,
    minIceHits: Math.floor(Math.random() * 2) + 2,
    flowerSkipPercentage: Math.floor(Math.random() * 24) + 20,
    minDelayMs: 2000,
    maxDelayMs: 5000,
};

let isGamePaused = false;

try {
    let gameStats = {
        score: 0,
        bombHits: 0,
        iceHits: 0,
        flowersSkipped: 0,
        isGameOver: false,
    };

    const originalPush = Array.prototype.push;
    Array.prototype.push = function (...items) {
        if (!isGamePaused) {
            items.forEach(item => handleGameElement(item));
        }
        return originalPush.apply(this, items);
    };

    function handleGameElement(element) {
        if (!element || !element.item) return;

        const { type } = element.item;
        switch (type) {
            case "CLOVER":
                processFlower(element);
                break;
            case "BOMB":
                processBomb(element);
                break;
            case "FREEZE":
                processIce(element);
                break;
        }
    }

    function processFlower(element) {
        const shouldSkip = Math.random() < (GAME_SETTINGS.flowerSkipPercentage / 100);
        if (shouldSkip) {
            gameStats.flowersSkipped++;
        } else {
            gameStats.score++;
            clickElement(element);
        }
    }

    function processBomb(element) {
        const shouldHit = Math.random() < (GAME_SETTINGS.bombHitPercentage / 100);
        if (shouldHit==true) {
            gameStats.score = 0;
            clickElement(element);
            gameStats.bombHits++;
        }
    }

    function processIce(element) {
        if (gameStats.iceHits < GAME_SETTINGS.minIceHits) {
            clickElement(element);
            gameStats.iceHits++;
        }
    }

    function clickElement(element) {
        element.onClick(element);
        element.isExplosion = true;
        element.addedAt = performance.now();
    }

    function checkGameCompletion() {
        const rewardElement = document.querySelector('#app > div > div > div.content > div.reward');
        if (rewardElement && !gameStats.isGameOver) {
            gameStats.isGameOver = true;
            resetGameStats();
            resetGameSettings();
        }
    }

    function resetGameStats() {
        gameStats = {
            score: 0,
            bombHits: 0,
            iceHits: 0,
            flowersSkipped: 0,
            isGameOver: false,
        };
    }

    function resetGameSettings() {
        GAME_SETTINGS = {
            bombHitPercentage: Math.floor(Math.random() * 20)+60,
            minIceHits: Math.floor(Math.random() * 2) + 2,
            flowerSkipPercentage: Math.floor(Math.random() * 24) + 20,
            minDelayMs: 2000,
            maxDelayMs: 5000,
        };

    }

    function getRandomDelay() {
        return Math.random() * (GAME_SETTINGS.maxDelayMs - GAME_SETTINGS.minDelayMs) + GAME_SETTINGS.minDelayMs;
    }

    function getNewGameDelay() {
        return Math.floor(Math.random() * (1500 - 1000 + 1) + 1800);
    }

    function checkAndClickPlayButton() {
        const playButton = document.querySelector('button.kit-button.is-large.is-primary');
        if (playButton && playButton.textContent.includes('Play')) {
            setTimeout(() => {
                playButton.click();
                gameStats.isGameOver = false;
            }, getNewGameDelay());
        }
    }

    function continuousPlayButtonCheck() {
        checkAndClickPlayButton();
        setTimeout(continuousPlayButtonCheck, 3000);
    }

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                checkGameCompletion();
            }
        }
    });

    const appElement = document.querySelector('#app');
    if (appElement) {
        observer.observe(appElement, { childList: true, subtree: true });
    }

    continuousPlayButtonCheck();

    const pauseButton = document.createElement('button');
    pauseButton.textContent = 'Pause';
    pauseButton.style.position = 'fixed';
    pauseButton.style.bottom = '20px';
    pauseButton.style.right = '20px';
    pauseButton.style.zIndex = '9999';
    pauseButton.style.padding = '4px 8px';
    pauseButton.style.backgroundColor = '#5d5abd';
    pauseButton.style.color = 'white';
    pauseButton.style.border = 'none';
    pauseButton.style.borderRadius = '10px';
    pauseButton.style.cursor = 'pointer';
    pauseButton.classList.add('StopTest');
    pauseButton.onclick = toggleGamePause;
    document.body.appendChild(pauseButton);

    function toggleGamePause() {
        isGamePaused = !isGamePaused;
        pauseButton.textContent = isGamePaused ? 'Resume' : 'Pause';
        if(isGamePaused){
            pauseButton.classList.add('ResumeTest');
            pauseButton.classList.remove('StopTest');
        }
        else{
            pauseButton.classList.remove('ResumeTest');
            pauseButton.classList.add('StopTest');
        }
    }
} catch (e) {
    // В случае ошибки, не выводим ее в консоль
}
