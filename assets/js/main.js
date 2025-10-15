document.addEventListener('DOMContentLoaded', () => {
    // Global Elements
    const header = document.querySelector('.header');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const searchModal = document.getElementById('search-modal');
    const detailModal = document.getElementById('project-detail-modal');
    const projectCards = document.querySelectorAll('.project-card');
    const checkboxes = document.querySelectorAll('.projects-sidebar input[type="checkbox"]');
    
    // Elements to blur when a modal is active
    const elementsToBlur = [
        document.body.querySelector('.header'), 
        document.body.querySelector('.projects-catalogue'),
        document.body.querySelector('.main-footer'),
        document.body.querySelector('.top-bar'),
        document.body.querySelector('.projects-hero'),
        document.body.querySelector('.breadcrumb-container'),
        document.body.querySelector('.story-projects')
    ].filter(el => el); 

    
    // --- UTILITY FUNCTIONS ---
    
    // Function to apply blur effect to non-modal content
    const toggleBlur = (enable) => {
        elementsToBlur.forEach(el => {
            el.style.filter = enable ? 'blur(5px)' : 'none';
        });
    };

    // Function to show a modal
    const showModal = (modalElement) => {
        if (!modalElement) return;
        
        // **CRITICAL FIX:** Ensure display is flex and visibility is explicitly set
        modalElement.style.display = 'flex';
        modalElement.style.visibility = 'visible'; // Ensure visibility isn't hidden by CSS
        
        toggleBlur(true);
        if (scrollToTopBtn) scrollToTopBtn.style.display = 'none';
        document.body.style.overflow = 'hidden'; 
    };

    const hideModal = (modalElement) => {
        if (!modalElement) return;
        modalElement.style.display = 'none';
        modalElement.style.visibility = 'hidden'; // Set to hidden when closed
        toggleBlur(false);
        document.body.style.overflow = '';
        if (scrollToTopBtn) {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                 scrollToTopBtn.style.display = "block";
            }
        }
    };
    
    // --- EXISTING FUNCTIONALITY ---
    
    // 1. Sticky Navigation Enhancement & Scroll Button Visibility
    window.addEventListener('scroll', () => {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }
        
        if (scrollToTopBtn) {
            const modalOpen = (detailModal && detailModal.style.display === 'flex') || (searchModal && searchModal.style.display === 'flex');
            if (!modalOpen) {
                scrollToTopBtn.style.display = (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) ? "block" : "none";
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



     // 3. Search Modal Control
    const searchBtn = document.getElementById('static-search-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            showModal(searchModal);
        });
    }



    // 4. Project Detail Modal Control (The core fix is in showModal, but the listener is here)
    if (projectCards.length > 0) {
        projectCards.forEach(card => {
            card.addEventListener('click', () => {
                
                if (!detailModal) return; 

                // --- Content Injection ---
                const projectId = card.getAttribute('data-id');
                const projectTitle = card.querySelector('h3').textContent;
                const projectTech = card.querySelector('.tech-stack').textContent;
                const projectCategory = card.getAttribute('data-category');
                
                const modalContent = document.getElementById('project-modal-content');
                if (modalContent) {
                    modalContent.querySelector('h2').textContent = projectTitle;
                    modalContent.querySelector('.modal-tech-stack').textContent = projectTech;
                    modalContent.querySelector('.modal-category').textContent = projectCategory.toUpperCase().replace('-', ' ');
                    
                    const projectLink = modalContent.querySelector('.modal-project-link');
                    if (projectLink) {
                        projectLink.href = `project-page-${projectId}.html`;
                    }
                }
                // -------------------------
                
                showModal(detailModal); // Show modal and apply blur
            });
        });
    }


    // 5. Global Modal Closing Functionality
    document.addEventListener('click', (event) => {
        
        // Close via 'X' button click
        const closeBtn = event.target.closest('.close-btn');
        if (closeBtn) {
            const closeTarget = closeBtn.getAttribute('data-close-target');
            if (closeTarget === 'search-modal') {
                hideModal(searchModal);
            } else if (closeTarget === 'project-detail-modal') {
                hideModal(detailModal);
            }
            return;
        }
        
        // Close via click outside the content box
        if (searchModal && searchModal.style.display === 'flex' && event.target === searchModal) {
            hideModal(searchModal);
        }
        if (detailModal && detailModal.style.display === 'flex' && event.target === detailModal) {
            hideModal(detailModal);
        }
    });

    
    // 6. PROPER FILTERING MECHANISM INTEGRATION
    const checkActiveFilters = () => {
        const activeTechs = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.getAttribute('data-tech'));
        
        if (activeTechs.length === 0) {
            projectCards.forEach(card => {
                card.style.display = 'block';
            });
            return;
        }

        projectCards.forEach(card => {
            const cardTechs = card.getAttribute('data-tech').split(' ');
            let matches = false;

            for (let filter of activeTechs) {
                if (cardTechs.includes(filter)) {
                    matches = true;
                    break;
                }
            }

            card.style.display = matches ? 'block' : 'none';
        });
    };


    // Attach the filter checking function to all checkbox changes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', checkActiveFilters);
    });
    



    // --- NEW ACCORDION FUNCTIONALITY (PROJECTS PAGE) ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    // Function to calculate and set the max height for the first panel
    const initializeAccordion = () => {
        if (accordionHeaders.length > 0) {
            const firstHeader = accordionHeaders[0];
            const firstPanel = document.getElementById(firstHeader.getAttribute('data-target'));
            
            if (firstHeader.getAttribute('aria-expanded') === 'true' && firstPanel) {
                firstPanel.classList.add('open');
                setTimeout(() => {
                    firstPanel.style.maxHeight = firstPanel.scrollHeight + "px"; 
                }, 50); 
            }
        }
    };
    
    // Run initialization once the page is ready
    if (accordionHeaders.length > 0) {
        window.addEventListener('load', initializeAccordion);
    }


    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const panelId = header.getAttribute('data-target');
            const panel = document.getElementById(panelId);
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            accordionHeaders.forEach(h => {
                h.setAttribute('aria-expanded', 'false');
                const p = document.getElementById(h.getAttribute('data-target'));
                if (p) {
                    p.classList.remove('open');
                    p.style.maxHeight = '0';
                }
            });
            
            if (!isExpanded && panel) {
                header.setAttribute('aria-expanded', 'true');
                panel.classList.add('open');
                panel.style.maxHeight = panel.scrollHeight + "px"; 
            }
        });
    });
    
});

