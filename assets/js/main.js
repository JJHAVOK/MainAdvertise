document.addEventListener('DOMContentLoaded', () => {
    // Global Elements
    const header = document.querySelector('.header');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const searchModal = document.getElementById('search-modal');
    const detailModal = document.getElementById('project-detail-modal');
    const projectCards = document.querySelectorAll('.project-card');
    const checkboxes = document.querySelectorAll('.projects-sidebar input[type="checkbox"]');
    
    // Elements to blur when a modal is active (expanded list for maximum coverage)
    const elementsToBlur = [
        document.body.querySelector('.header'), 
        document.body.querySelector('.projects-catalogue'),
        document.body.querySelector('.main-footer'),
        document.body.querySelector('.top-bar'),
        document.body.querySelector('.projects-hero'),
        document.body.querySelector('.breadcrumb-container'),
        document.body.querySelector('.story-projects') // Added story-projects
    ].filter(el => el); 

    
    // --- UTILITY FUNCTIONS ---
    
    // Function to apply blur effect to non-modal content
    const toggleBlur = (enable) => {
        elementsToBlur.forEach(el => {
            if (enable) {
                // Apply blur effect directly to the HTML element
                el.style.filter = 'blur(5px)'; 
            } else {
                el.style.filter = 'none'; // Remove blur effect
            }
        });
    };

    // Function to show a modal
    const showModal = (modalElement) => {
        modalElement.style.display = 'flex';
        toggleBlur(true);
        scrollToTopBtn.style.display = 'none'; // Hide scroll button when overlay is active
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    // Function to hide a modal
    const hideModal = (modalElement) => {
        modalElement.style.display = 'none';
        toggleBlur(false);
        document.body.style.overflow = ''; // Restore background scrolling
        // Re-evaluate scroll button display after closing a modal
        if (window.scrollY > 300) {
             scrollToTopBtn.style.display = "block";
        }
    };
    
    // --- EXISTING FUNCTIONALITY ---
    
    // 1. Sticky Navigation Enhancement & Scroll Button Visibility
    window.addEventListener('scroll', () => {
        if (header) { // Check if header exists (i.e., not 404 page)
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        // Control Scroll to Top Button visibility
        if (scrollToTopBtn) {
            if (!detailModal || detailModal.style.display === 'none') {
                if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                    scrollToTopBtn.style.display = "block";
                } else {
                    scrollToTopBtn.style.display = "none";
                }
            }
        }
    });

    // 2. Scroll to Top Button Functionality
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // --- PROJECTS PAGE FUNCTIONALITY ---

    // 3. Search Modal Control (Only runs on projects page)
    const searchBtn = document.getElementById('static-search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            showModal(searchModal);
        });
    }


    // 4. Project Detail Modal Control (FIXED: This now correctly opens the modal with blur)
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            
            // --- Content Injection (Keep as placeholder) ---
            const projectId = card.getAttribute('data-id');
            const projectTitle = card.querySelector('h3').textContent;
            const projectTech = card.querySelector('.tech-stack').textContent;
            const projectCategory = card.getAttribute('data-category');
            
            const modalContent = document.getElementById('project-modal-content');
            if (modalContent) {
                modalContent.querySelector('h2').textContent = projectTitle;
                modalContent.querySelector('.modal-tech-stack').textContent = projectTech;
                modalContent.querySelector('.modal-category').textContent = projectCategory.toUpperCase().replace('-', ' ');
                modalContent.querySelector('.modal-project-link').href = `project-page-${projectId}.html`; 
            }
            // ------------------------------------------------
            
            showModal(detailModal); // Show modal and apply blur
        });
    });


    // 5. Global Modal Closing Functionality (FIXED: Handles all modals and external clicks)
    document.addEventListener('click', (event) => {
        
        // Check for 'X' button click
        const closeBtn = event.target.closest('.close-btn');
        if (closeBtn) {
            const closeTarget = closeBtn.getAttribute('data-close-target');
            if (closeTarget === 'search-modal') {
                hideModal(searchModal);
            } else if (closeTarget === 'project-detail-modal') {
                hideModal(detailModal);
            }
            return; // Exit function after closing
        }
        
        // Check for click outside the content box (Only if a modal is visible)
        if (searchModal && searchModal.style.display === 'flex' && event.target === searchModal) {
            hideModal(searchModal);
        }
        if (detailModal && detailModal.style.display === 'flex' && event.target === detailModal) {
            hideModal(detailModal);
        }
    });

    
    // 6. PROPER FILTERING MECHANISM INTEGRATION (FIXED: Now fully functional)
    const checkActiveFilters = () => {
        const activeTechs = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.getAttribute('data-tech'));
        
        // If no filters are active, show all projects
        if (activeTechs.length === 0) {
            projectCards.forEach(card => {
                card.style.display = 'block';
            });
            return;
        }

        // Filter the projects
        projectCards.forEach(card => {
            // Get all tech stacks listed on the card (space separated in HTML data attribute)
            const cardTechs = card.getAttribute('data-tech').split(' ');
            let matches = false;

            // Check if ANY of the card's tech stacks match ANY of the active filters
            for (let filter of activeTechs) {
                if (cardTechs.includes(filter)) {
                    matches = true;
                    break;
                }
            }

            // Hide or show the card
            card.style.display = matches ? 'block' : 'none';
        });
    };

    // Attach the filter checking function to all checkbox changes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', checkActiveFilters);
    });

});