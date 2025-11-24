const checkbox = document.getElementById("checkbox");
const professional = document.getElementById("super");
const master = document.getElementById("family");
const basic = document.getElementById("free");

checkbox.addEventListener("click", () => {
  basic.textContent = basic.textContent === "SEK 0" ? " SEK 0" : "SEK 0";
  professional.textContent =
    professional.textContent === "SEK 599" ? "SEK 95" : "SEK 599";
  master.textContent = master.textContent === "SEK 1099" ? " " : "SEK 1099";
});

