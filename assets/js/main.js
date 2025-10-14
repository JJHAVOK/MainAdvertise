document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Navigation Enhancement (Using the 'scrolled' class)
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        // Add a class when scrolling to subtly change the header appearance 
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    // 2. Scroll to Top Button Functionality
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // Show or hide the button based on scroll position
    window.addEventListener('scroll', () => {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    });

    // When the user clicks on the button, scroll to the top of the document
    scrollToTopBtn.addEventListener('click', () => {
        // Use smooth scrolling behavior
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});