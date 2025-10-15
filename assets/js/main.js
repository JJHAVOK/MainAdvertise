document.addEventListener('DOMContentLoaded', () => {
    // Global Elements (unchanged)
    const header = document.querySelector('.header');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const searchModal = document.getElementById('search-modal'); 
    const detailModal = document.getElementById('project-detail-modal');
    const projectCards = document.querySelectorAll('.project-card');
    const checkboxes = document.querySelectorAll('.projects-sidebar input[type="checkbox"]');
    
    // Static Search Button & Modal Inputs (unchanged)
    const searchBtn = document.getElementById('static-search-btn');
    const modalSearchInput = document.getElementById('modal-search-input');
    const modalSearchButton = document.getElementById('modal-search-execute'); 
    
    // Elements to blur (unchanged)
    const elementsToBlur = [
        document.body.querySelector('.header'), 
        // document.body.querySelector('.projects-catalogue'), // REMOVED
        document.body.querySelector('.main-footer'),
        document.body.querySelector('.top-bar'),
        document.body.querySelector('.projects-hero'),
        document.body.querySelector('.breadcrumb-container'),
        document.body.querySelector('.story-projects')
    ].filter(el => el); 

    // --- UTILITY FUNCTIONS ---
    // (toggleBlur, showModal, hideModal remain unchanged as before, ensuring blur/open/close functionality)
    
    const toggleBlur = (enable) => {
        elementsToBlur.forEach(el => {
            el.style.filter = enable ? 'blur(5px)' : 'none';
        });
        
        // NEW: When blurring is enabled (modal is open), set the overlay's opacity very low
        if (searchModal) {
            // Set overlay to be nearly transparent for search, but still apply blur to other elements
            if (searchModal.classList.contains('open-modal')) {
                searchModal.style.backgroundColor = enable ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.5)';
            } else {
                 searchModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            }
        }
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
        // Restore overlay background color when closing the search modal
        searchModal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        toggleBlur(false);
        document.body.style.overflow = '';
        // ... (rest of hideModal logic remains the same) ...
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



    // 3. Search Modal Control (Still opens the modal)
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            showModal(searchModal);
            if (modalSearchInput) modalSearchInput.focus();
            // IMPORTANT: Also run the filter immediately to show all projects behind the modal
            checkActiveFilters();
        });
    }



    // --- SEARCH & FILTERING LOGIC ---
    

    // MODIFIED: This function is now only for closing the modal after manual execution (Enter/Button)
    const executeModalSearchAndClose = () => {
        // Just closes the modal, as filtering is handled by the 'input' event below
        hideModal(searchModal);
    };


    // MODIFIED: Attach listener to the input field for live filtering
    if (modalSearchInput) {
        // Use 'input' event for real-time filtering as the user types
        modalSearchInput.addEventListener('input', checkActiveFilters);
        
        // Keep 'Enter' key to close the modal after search is done
        modalSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                executeModalSearchAndClose();
            }
        });
    }

    
    // MODIFIED: Search button only closes the modal now
    if (modalSearchButton) {
        modalSearchButton.addEventListener('click', executeModalSearchAndClose);
    }



    // 4. Project Detail Modal Control (FIXED: Re-attached click listener)
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
                showModal(detailModal); // Crucial step
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
    
    // Execute Search Logic from Modal
    const executeModalSearch = () => {
    checkActiveFilters(); // This triggers the filtering
    hideModal(searchModal); // This closes the modal
};

    if (modalSearchButton) {
        modalSearchButton.addEventListener('click', executeModalSearch);
    }
    
    if (modalSearchInput) {
        modalSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                executeModalSearch();
            }
        });
    }



    // 6. CONSOLIDATED FILTERING MECHANISM (Unchanged logic, just triggered by 'input')
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

    // Attach listeners to filter checkboxes (Unchanged)
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', checkActiveFilters);
    });







    // --- ACCORDION FUNCTIONALITY (Unchanged) ---


    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
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