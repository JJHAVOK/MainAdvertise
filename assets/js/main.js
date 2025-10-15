document.addEventListener('DOMContentLoaded', () => {
    // Global Elements (Ensure these IDs exist in your HTML)
    const header = document.querySelector('.header');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const searchModal = document.getElementById('search-modal'); 
    const detailModal = document.getElementById('project-detail-modal');
    const projectCards = document.querySelectorAll('.project-card');
    const checkboxes = document.querySelectorAll('.projects-sidebar input[type="checkbox"]');
    
    // Static Search Button & Modal Inputs (Crucial for functionality)
    const searchBtn = document.getElementById('static-search-btn'); // The floating search button
    const modalSearchInput = document.getElementById('modal-search-input');
    const modalSearchButton = document.getElementById('modal-search-execute'); // The 'Search' button inside the modal
    
    // Elements to blur when a modal is active
    const elementsToBlur = [
        document.body.querySelector('.header'), 
        document.body.querySelector('.projects-catalogue'), // Currently included in blur
        document.body.querySelector('.main-footer'),
        document.body.querySelector('.top-bar'),
        document.body.querySelector('.projects-hero'),
        document.body.querySelector('.breadcrumb-container'),
        document.body.querySelector('.story-projects')
    ].filter(el => el); 

    // --- UTILITY FUNCTIONS ---
    
    const toggleBlur = (enable) => {
        elementsToBlur.forEach(el => {
            el.style.filter = enable ? 'blur(5px)' : 'none';
        });
        
        // Custom searchModal background logic is removed/restored to default (full blur)
    };
    
    const showModal = (modalElement) => {
        if (!modalElement) return;
        modalElement.classList.add('open-modal');
        toggleBlur(true);
        if (scrollToTopBtn) scrollToTopBtn.style.display = 'none';
        document.body.style.overflow = 'hidden'; 
    };

    const hideModal = (modalElement) => {
        if (!modalElement) return;
        modalElement.classList.remove('open-modal');
        toggleBlur(false);
        document.body.style.overflow = '';
        if (scrollToTopBtn) {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                 scrollToTopBtn.style.display = "block";
            }
        }
    };
    
    // --- CORE FUNCTIONALITY ---
    
    // 1. Sticky Navigation & Scroll Button (Unchanged)
    window.addEventListener('scroll', () => {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }
        
        if (scrollToTopBtn) {
            const modalOpen = (detailModal && detailModal.classList.contains('open-modal')) || (searchModal && searchModal.classList.contains('open-modal'));
            if (!modalOpen) {
                scrollToTopBtn.style.display = (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) ? "block" : "none";
            }
        }
    });

    // 2. Scroll to Top Button (Unchanged)
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 3. Search Modal Control (FIXED: Ensures the button opens the search modal)
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            showModal(searchModal);
            if (modalSearchInput) modalSearchInput.focus();
            // We run the filter here to clear any previous filter on modal opening
            checkActiveFilters(); 
        });
    }

    // 4. Project Detail Modal Control (FIXED: Ensures project cards open the detail modal)
    if (projectCards.length > 0) {
        projectCards.forEach(card => {
            card.addEventListener('click', () => {
                
                if (!detailModal) return; 

                // --- Content Injection Logic (Unchanged) ---
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
                showModal(detailModal); // Opens the modal
            });
        });
    }

    // 5. Global Modal Closing Functionality (Unchanged)
    document.addEventListener('click', (event) => {
        
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
        
        if (searchModal && searchModal.classList.contains('open-modal') && event.target === searchModal) {
            hideModal(searchModal);
        }
        if (detailModal && detailModal.classList.contains('open-modal') && event.target === detailModal) {
            hideModal(detailModal);
        }
    });

    // --- SEARCH & FILTERING LOGIC ---
    
    // This function only closes the modal
    const executeModalSearchAndClose = () => {
        // Filtering is handled by the 'input' event, so we just close the modal here.
        hideModal(searchModal);
    };

    // LIVE FILTERING: Attach listener to the input field
    if (modalSearchInput) {
        // *** LIVE SEARCH PREVIEW IS HERE ***: Filter as the user types
        modalSearchInput.addEventListener('input', checkActiveFilters);
        
        // 'Enter' key CLOSES the modal
        modalSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                executeModalSearchAndClose();
            }
        });
    }
    
    // 'Search' button CLOSES the modal
    if (modalSearchButton) {
        modalSearchButton.addEventListener('click', executeModalSearchAndClose);
    }


    // 6. CONSOLIDATED FILTERING MECHANISM (Logic remains the same)
    const checkActiveFilters = () => {
        const activeTechs = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.getAttribute('data-tech').toLowerCase());
            
        const searchTerm = modalSearchInput ? modalSearchInput.value.toLowerCase().trim() : '';

        projectCards.forEach(card => {
            const cardTechs = card.getAttribute('data-tech').toLowerCase().split(' ');
            const cardName = card.querySelector('h3').textContent.toLowerCase();
            let matchesTechFilter = false;
            let matchesSearchTerm = false;

            // --- 1. Filter by Checkboxes (Tech) ---
            if (activeTechs.length === 0) {
                matchesTechFilter = true;
            } else {
                matchesTechFilter = activeTechs.some(filter => cardTechs.includes(filter));
            }

            // --- 2. Filter by Search Term (Name OR Coding Language) ---
            if (searchTerm === '') {
                matchesSearchTerm = true;
            } else {
                const nameMatch = cardName.includes(searchTerm);
                const techMatch = cardTechs.some(tech => tech.includes(searchTerm));
                
                matchesSearchTerm = nameMatch || techMatch;
            }
            
            // Show the card ONLY if it satisfies BOTH
            card.style.display = (matchesTechFilter && matchesSearchTerm) ? 'block' : 'none';
        });
    };

    // Attach listeners to filter checkboxes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', checkActiveFilters);
    });

    // --- ACCORDION FUNCTIONALITY (Unchanged) ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    // ... (rest of accordion logic is unchanged) ...