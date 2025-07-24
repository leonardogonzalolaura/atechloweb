document.querySelectorAll('a.interest-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.add('animate__animated', 'animate__fadeOut');
    setTimeout(() => {
      window.location.href = btn.getAttribute('href');
    }, 500);
  });
});