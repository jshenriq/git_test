window.addEventListener("DOMContentLoaded", () => {
  const heroContent = document.querySelector(".hero-content-container");
  const heroGraphic = document.querySelector(".hero-graphic");

  setTimeout(() => {
    heroContent.classList.add("show");
    heroGraphic.classList.add("show");
  }, 100); // um pequeno delay para o carregamento suave
});




const arrowScroll = document.querySelector('.arrow-scroll');

window.addEventListener('scroll', () => {
  // Esconde as setas quando o usuário rolar a página
  arrowScroll.style.opacity = '0';
});

