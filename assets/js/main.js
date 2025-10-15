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





// --- NEW PROJECTS PAGE FUNCTIONALITY ---




    // 3. Search Modal Control
    const searchBtn = document.getElementById('static-search-btn');
    const searchModal = document.getElementById('search-modal');

    searchBtn.addEventListener('click', () => {
        searchModal.style.display = 'flex';
        // Hide the scroll-to-top button when overlay is active
        scrollToTopBtn.style.display = 'none'; 
    });


    // 4. Project Detail Modal Control
    const projectCards = document.querySelectorAll('.project-card');
    const detailModal = document.getElementById('project-detail-modal');

    // Attach event listeners to all project cards
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            // Placeholder JS to simulate content loading
            const projectId = card.getAttribute('data-id');
            const projectTitle = card.querySelector('h3').textContent;
            const projectTech = card.querySelector('.tech-stack').textContent;
            const projectCategory = card.getAttribute('data-category');
            
            // Populate the modal content (simplified placeholder injection)
            const modalContent = document.getElementById('project-modal-content');
            modalContent.querySelector('h2').textContent = projectTitle;
            modalContent.querySelector('.modal-tech-stack').textContent = projectTech;
            modalContent.querySelector('.modal-category').textContent = projectCategory.toUpperCase();
            modalContent.querySelector('.modal-project-link').href = `project-page-${projectId}.html`; // Link to the future dedicated page

            detailModal.style.display = 'flex';
            scrollToTopBtn.style.display = 'none';
        });
    });


    // 5. Global Modal Closing Functionality (Click X or click outside)
    document.addEventListener('click', (event) => {
        const modals = document.querySelectorAll('.global-overlay');

        // Close via 'X' button click
        if (event.target.closest('.close-btn')) {
            const targetId = event.target.closest('.close-btn').getAttribute('data-close-target');
            document.getElementById(targetId).style.display = 'none';
        }
        
        // Close via click outside the content box
        modals.forEach(modal => {
            // Check if the click occurred on the overlay itself, and not on a child element with the class 'overlay-content'
            if (modal.style.display === 'flex' && event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Re-evaluate scroll button display after closing a modal
        if (window.scrollY > 300) {
             scrollToTopBtn.style.display = "block";
        }
    });

    // 6. Basic Filtering Logic (Placeholder for future expansion)
    const checkboxes = document.querySelectorAll('.projects-sidebar input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            // In a real application, you would gather all checked values
            // and refilter/re-render the project-grid here.
            
            // Placeholder functionality: Just log the filter changes
            const activeFilters = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.getAttribute('data-tech'));
            
            console.log('Active Filters:', activeFilters);
            
            // For now, we will just hide/show all cards to demonstrate the filter mechanism
            projectCards.forEach(card => {
                card.style.opacity = '0.3'; // Dim cards when filtering is active
                card.style.pointerEvents = 'none'; 
            });
            // (A proper filtering mechanism would be integrated here)
        });
    });

});