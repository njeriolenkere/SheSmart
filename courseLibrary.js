// Toggle Hamburger Menu
function toggleMenu() {
    const menuItems = document.getElementById('menu-items');
    const hamburger = document.querySelector('.hamburger');
    
    if (menuItems.classList.contains('show')) {
        menuItems.classList.remove('show');
        hamburger.classList.remove('open');
        hamburger.innerHTML = '&#9776;'; // Hamburger icon
    } else {
        menuItems.classList.add('show');
        hamburger.classList.add('open');
        hamburger.innerHTML = '&times;'; // X icon
    }
};
// Toggle class , Answer
function toggleAnswer(answerId) {
    const answer = document.getElementById(answerId);
    answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
    
};
