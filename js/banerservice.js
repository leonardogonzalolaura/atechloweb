document.addEventListener('DOMContentLoaded', function() {
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  
  // 1. Verifica si hay elementos para animar
  if (animateElements.length === 0) {
    console.warn("No se encontraron elementos con la clase 'animate-on-scroll'");
    return; // Detiene la ejecución si no hay elementos
  }

  const checkScroll = () => {
    animateElements.forEach(element => {
      // 2. Asegura que el elemento exista
      if (!element) return;
      
      const elementPosition = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      // 3. Agrega validación para elementos ya animados
      if (elementPosition < windowHeight * 0.8 && !element.classList.contains('animated')) {
        element.classList.add('animated');
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    });
  };
  
  // 4. Ejecuta al cargar y al hacer scroll (con debounce para rendimiento)
  window.addEventListener('scroll', () => {
    requestAnimationFrame(checkScroll);
  });
  
  // 5. Llama a la función al cargar la página
  checkScroll();
});