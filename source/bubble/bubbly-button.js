const animateButton = e => {
  e.preventDefault();
  e.target.classList.remove('animate');
  e.target.classList.add('animate');
  setTimeout(() => e.target.classList.remove('animate'), 700);
};

for (let bubblyButton of document.getElementsByClassName("bubbly-button")) {
  bubblyButton.addEventListener('click', animateButton, false);
}