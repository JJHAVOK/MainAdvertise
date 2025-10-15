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

    // NEW: Elements inside the Search Modal
    const modalSearchInput = document.getElementById('modal-search-input');
    const modalSearchButton = searchModal ? searchModal.querySelector('.search-input-container button') : null;
    

    
    // --- UTILITY FUNCTIONS (UPDATED) ---
    
    const toggleBlur = (enable) => {
        elementsToBlur.forEach(el => {
            el.style.filter = enable ? 'blur(5px)' : 'none';
        });
    };

    // Function to show a modal
    const showModal = (modalElement) => {
        if (!modalElement) return;
        
        // **FIX: Use class to control visibility, opacity, and display: flex**
        modalElement.classList.add('open-modal');
        
        toggleBlur(true);
        if (scrollToTopBtn) scrollToTopBtn.style.display = 'none';
        document.body.style.overflow = 'hidden'; 
    };

    const hideModal = (modalElement) => {
        if (!modalElement) return;
        
        // **FIX: Remove class to hide modal**
        modalElement.classList.remove('open-modal');
        
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
            // Check for the new class 'open-modal'
            const modalOpen = (detailModal && detailModal.classList.contains('open-modal')) || (searchModal && searchModal.classList.contains('open-modal'));
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



     // 3. Search Modal Control (Existing: opens the modal)
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            showModal(searchModal);
            // Optional: Auto-focus the input when the modal opens
            if (modalSearchInput) modalSearchInput.focus();
        });
    }

    // NEW 3.5. Execute Search Logic from Modal
    const executeModalSearch = () => {
        // This will call the consolidated filter function which now reads the search input
        checkActiveFilters();
        // Hide the modal after executing the search
        hideModal(searchModal);
    };

    if (modalSearchButton) {
        modalSearchButton.addEventListener('click', executeModalSearch);
    }
    
    if (modalSearchInput) {
        // Also trigger search when user presses Enter key
        modalSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                executeModalSearch();
            }
        });
    }


    // 4. Project Detail Modal Control
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
        
        // Close via click outside the content box (Check for the class instead of style.display)
        if (searchModal && searchModal.classList.contains('open-modal') && event.target === searchModal) {
            hideModal(searchModal);
        }
        if (detailModal && detailModal.classList.contains('open-modal') && event.target === detailModal) {
            hideModal(detailModal);
        }
    });

    
    // 6. CONSOLIDATED FILTERING MECHANISM (MODIFIED to include search)
    const checkActiveFilters = () => {
        const activeTechs = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.getAttribute('data-tech').toLowerCase()); // Normalize tech tags
            
        // NEW: Get search term from modal input
        const searchTerm = modalSearchInput ? modalSearchInput.value.toLowerCase().trim() : '';

        projectCards.forEach(card => {
            const cardTechs = card.getAttribute('data-tech').toLowerCase().split(' ');
            const cardName = card.querySelector('h3').textContent.toLowerCase();
            let matchesTechFilter = false;
            let matchesSearchTerm = false;

            // --- 1. Filter by Checkboxes (Tech) ---
            if (activeTechs.length === 0) {
                matchesTechFilter = true; // Show all if no tech filter is active
            } else {
                // Check if card has AT LEAST ONE of the active tech tags
                matchesTechFilter = activeTechs.some(filter => cardTechs.includes(filter));
            }

            // --- 2. Filter by Search Term (Name OR Coding Language) ---
            if (searchTerm === '') {
                matchesSearchTerm = true; // Show all if search term is empty
            } else {
                // Check if search term is included in the project name OR any tech tag
                const nameMatch = cardName.includes(searchTerm);
                const techMatch = cardTechs.some(tech => tech.includes(searchTerm));
                
                matchesSearchTerm = nameMatch || techMatch;
            }
            
            // Show the card ONLY if it satisfies BOTH the checkbox filter AND the search term filter
            card.style.display = (matchesTechFilter && matchesSearchTerm) ? 'block' : 'none';
        });
    };


    // Attach listeners to filter checkboxes (Existing)
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

