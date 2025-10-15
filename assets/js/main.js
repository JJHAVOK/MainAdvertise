document.addEventListener('DOMContentLoaded', () => {
    // Global Elements
    const header = document.querySelector('.header');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const searchModal = document.getElementById('search-modal'); 
    const detailModal = document.getElementById('project-detail-modal');
    const projectCards = document.querySelectorAll('.project-card');
    const checkboxes = document.querySelectorAll('.projects-sidebar input[type="checkbox"]');
    
    // Static Search Button & Modal Inputs
    const searchBtn = document.getElementById('static-search-btn');
const modalSearchInput = document.getElementById('modal-search-input');
// CORRECTED: Target the button using its new ID
const modalSearchButton = document.getElementById('modal-search-execute'); 
    
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
    const toggleBlur = (enable) => {
        elementsToBlur.forEach(el => {
            el.style.filter = enable ? 'blur(5px)' : 'none';
        });
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

    // 3. Search Modal Control (FIXED: Re-attached click listener)
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            showModal(searchModal);
            if (modalSearchInput) modalSearchInput.focus();
        });
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

    /// --- SEARCH & FILTERING LOGIC (REPLACEMENT BLOCK STARTS HERE) ---
    
// 4. CONSOLIDATED FILTERING MECHANISM (The core logic MUST be defined first)
const checkActiveFilters = () => {
    const activeTechs = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.getAttribute('data-tech').toLowerCase());
        
    // Get search term from modal input
    const searchTerm = modalSearchInput ? modalSearchInput.value.toLowerCase().trim() : '';

    projectCards.forEach(card => {
        const cardTechs = card.getAttribute('data-tech').toLowerCase().split(' ');
        const cardName = card.querySelector('h3').textContent.toLowerCase();
        let matchesTechFilter = false;
        let matchesSearchTerm = false;

        // --- Filter by Checkboxes (Tech) ---
        if (activeTechs.length === 0) {
            matchesTechFilter = true;
        } else {
            matchesTechFilter = activeTechs.some(filter => cardTechs.includes(filter));
        }

        // --- Filter by Search Term (Name OR Coding Language) ---
        if (searchTerm === '') {
            matchesSearchTerm = true;
        } else {
            const nameMatch = cardName.includes(searchTerm);
            const techMatch = cardTechs.some(tech => tech.includes(searchTerm));
            matchesSearchTerm = nameMatch || techMatch;
        }
        
        // Final: Show the card ONLY if it satisfies BOTH
        card.style.display = (matchesTechFilter && matchesSearchTerm) ? 'block' : 'none';
    });
};


// Function to execute search from the modal
const executeModalSearch = () => {
    // Triggers the filter based on the text input and closes the modal
    checkActiveFilters(); 
    hideModal(searchModal); 
};

// Function to handle changes from the sidebar checkboxes (NEW)
const handleCheckboxChange = () => {
    // Clears the search box text when a filter is used
    if (modalSearchInput) {
        modalSearchInput.value = ''; 
    }
    // Then runs the main filtering logic
    checkActiveFilters();
};

// Attach listeners for the search modal (Search button and Enter key)
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

// Attach listeners to filter checkboxes (Uses the new handler)
checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', handleCheckboxChange); 
});

// --- SEARCH & FILTERING LOGIC (REPLACEMENT BLOCK ENDS HERE) ---

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