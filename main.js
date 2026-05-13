
const generateBtn = document.getElementById('generate');
const numbersContainer = document.querySelector('.numbers');
const themeButtons = document.querySelectorAll('.theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'light';

setTheme(savedTheme);

generateBtn.addEventListener('click', () => {
    const numbers = generateNumbers();
    displayNumbers(numbers);
});

themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        setTheme(button.dataset.theme);
    });
});

function generateNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return [...numbers];
}

function displayNumbers(numbers) {
    numbersContainer.innerHTML = '';
    for (const number of numbers) {
        const numberEl = document.createElement('div');
        numberEl.classList.add('number');
        numberEl.textContent = number;
        numbersContainer.appendChild(numberEl);
    }
}

function setTheme(theme) {
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);

    themeButtons.forEach((button) => {
        const isActive = button.dataset.theme === theme;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}
