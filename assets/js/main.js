document.addEventListener('DOMContentLoaded', () => {
    // --- Global Elements (CRITICAL for Modals) ---
    const header = document.querySelector('.header');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // CRITICAL: These MUST be defined here for the showModal function to work
    const searchModal = document.getElementById('search-modal');
    const detailModal = document.getElementById('project-detail-modal');

    const projectCards = document.querySelectorAll('.project-card');

    // CRITICAL: These must also be defined for the counter/message
    const noResultsMessage = document.getElementById('no-results-message');
    const totalH2 = document.getElementById('total-projects-h2');


    // ... other variables ...

    // Checkboxes and Inputs
    const allCheckboxes = document.querySelectorAll('.projects-sidebar input[type="checkbox"]');
    const techCheckboxes = document.querySelectorAll('.projects-sidebar input[type="checkbox"]:not(#show-all-checkbox)'); // All tech boxes EXCEPT Show All
    const showAllCheckbox = document.getElementById('show-all-checkbox');

    // Modal Inputs
    const searchBtn = document.getElementById('static-search-btn');
    const modalSearchInput = document.getElementById('modal-search-input');
    const modalSearchButton = document.getElementById('modal-search-execute');

    // Elements to blur (unchanged)
    const elementsToBlur = [
        document.body.querySelector('.header'),
        document.body.querySelector('.projects-catalogue'),
        document.body.querySelector('.main-footer'),
        document.body.querySelector('.top-bar'),
        document.body.querySelector('.projects-hero'),
        document.body.querySelector('.breadcrumb-container'),
        document.body.querySelector('.story-projects')
    ].filter(el => el);


    // --- UTILITY FUNCTIONS (Modal, Scroll, etc.) ---
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

    // 3. Search Modal Control (Open listener)
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {

            // 1. UNCHECK all sidebar filtering boxes (REQUIRED FOR RESET)
            allCheckboxes.forEach(cb => {
                cb.checked = false;
            });

            // 2. Clear the search input field (REQUIRED FOR RESET)
            if (modalSearchInput) {
                modalSearchInput.value = '';
            }

            // 3. Run the filter to show all projects behind the modal
            checkActiveFilters();

            // 4. Finally, show the modal and focus
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

    // --- SEARCH & FILTERING LOGIC ---

    // 1. Core Filtering Mechanism (Defined first for use by other handlers)
    const checkActiveFilters = () => {
    // No local declarations here, relying on the globally defined variables:
    // noResultsMessage and totalH2

    const activeTechs = Array.from(allCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.getAttribute('data-tech').toLowerCase());

    const searchTerm = modalSearchInput ? modalSearchInput.value.toLowerCase().trim() : '';

    let visibleProjectCount = 0; // Initialize a counter

    projectCards.forEach(card => {
        const cardTechs = card.getAttribute('data-tech').toLowerCase().split(' ');
        const cardName = card.querySelector('h3').textContent.toLowerCase();
        let matchesTechFilter = false;
        let matchesSearchTerm = false;

        // --- Filter by Checkboxes (Tech) ---
        if (activeTechs.length === 0 || activeTechs.includes('all')) {
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

        // Final: Determine visibility and count
        const isVisible = (matchesTechFilter && matchesSearchTerm);
        card.style.display = isVisible ? 'block' : 'none';

        if (isVisible) {
            visibleProjectCount++; // Increment counter if project is shown
        }
    });

    // --- Update UI after filtering ---

    // 1. Logic to show/hide the "No Results" message
    if (noResultsMessage) {
        if (visibleProjectCount === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
        }
    }

    // 2. Update the Total Projects H2 count
    if (totalH2) {
        totalH2.textContent = `Total Projects (${visibleProjectCount})`;
    }
    };

    // **REMOVED THE DUPLICATE/EARLY CALL HERE: checkActiveFilters();**


    // 2. Handler for Checkbox Changes (Includes new "Show All" logic)
    const handleCheckboxChange = (event) => {
        const checkboxClicked = event.target;

        // Logic for "Show All" checkbox
        if (checkboxClicked.id === 'show-all-checkbox') {
            if (checkboxClicked.checked) {
                // If 'Show All' is checked, uncheck all other tech boxes
                techCheckboxes.forEach(cb => {
                    cb.checked = false;
                });
            }
        } else if (showAllCheckbox && checkboxClicked.checked) {
            // If any other tech box is checked, uncheck "Show All"
            showAllCheckbox.checked = false;
        }

        // Always clear the search box when a sidebar filter is used
        if (modalSearchInput) {
            modalSearchInput.value = '';
        }

        // Run the main filtering logic
        checkActiveFilters();
    };

    // 3. Search Modal Execution
    const executeModalSearch = () => {
    // 1. Triggers the filtering based on the text input
    checkActiveFilters();

    // 2. NEW: Resets the text input field
    if (modalSearchInput) {
        modalSearchInput.value = '';
    }

    // 3. Closes the modal
    hideModal(searchModal);
    };

// Attach listeners for the search modal

// Clicking the 'Search' button executes and closes (KEPT)
if (modalSearchButton) {
    modalSearchButton.addEventListener('click', executeModalSearch);
}

// Pressing 'Enter' executes and closes (KEPT & ENFORCED)
if (modalSearchInput) {
    modalSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevents default form submission if applicable
            executeModalSearch();
        }
    });
}

    // Checkbox listeners (MODIFIED to use handleCheckboxChange)
    allCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
    
    // **FIXED INITIAL STATE: Run the filtering logic once the listeners are attached**
    checkActiveFilters();


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