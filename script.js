/**
 * Alquileres - Home Page JavaScript
 * Premium startup-quality interactions
 */

const API_BASE_URL = "http://localhost:4000/api";

async function apiFetch(path, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${path}`, options);
        return response;
    } catch (error) {
        throw error;
    }
}

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem('alquileres_user'));
    } catch (error) {
        return null;
    }
}

function normalizeSessionRole(role) {
    const normalized = String(role || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    if (normalized === 'huesped' || normalized === 'tenant') {
        return 'tenant';
    }

    if (normalized === 'anfitrion' || normalized === 'owner') {
        return 'owner';
    }

    if (normalized === 'administrador' || normalized === 'admin') {
        return 'admin';
    }

    return normalized;
}

function getDashboardLink(role) {
    switch (normalizeSessionRole(role)) {
        case 'owner':
            return { href: 'owner-dashboard.html', text: 'Mi panel' };
        case 'admin':
            return { href: 'admin-dashboard.html', text: 'Admin' };
        case 'tenant':
        default:
            return { href: 'tenant-dashboard.html', text: 'Mi cuenta' };
    }
}

(function guardProtectedPages() {
    const protectedPages = new Set([
        'tenant-dashboard.html',
        'owner-dashboard.html',
        'admin-dashboard.html',
        'create-property.html',
        'booking.html',
        'booking-success.html',
        'messages.html'
    ]);

    const rolePages = {
        'tenant-dashboard.html': 'tenant',
        'owner-dashboard.html': 'owner',
        'admin-dashboard.html': 'admin',
        'create-property.html': 'owner'
    };

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (!protectedPages.has(currentPage)) return;

    const user = getStoredUser();
    if (!user?.id) {
        window.location.replace('login.html');
        return;
    }

    const expectedRole = rolePages[currentPage];
    const currentRole = normalizeSessionRole(user.role);

    if (expectedRole && currentRole !== expectedRole) {
        window.location.replace(getDashboardLink(currentRole).href);
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    const navbarActions = document.querySelector('.navbar-actions');
    if (!navbarActions) return;

    function isCurrentPage(href) {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        return currentPage === href;
    }

    function renderNavbarActions() {
        const user = getStoredUser();

        if (!user?.id) {
            navbarActions.innerHTML = `
                <a href="login.html" class="login-link ${isCurrentPage('login.html') ? 'active' : ''}">Iniciar sesión</a>
                <a href="register.html" class="register-btn ${isCurrentPage('register.html') ? 'active' : ''}">Registrarse</a>
            `;
            return;
        }

        const dashboard = getDashboardLink(user.role);
        navbarActions.innerHTML = `
            <a href="messages.html" class="login-link ${isCurrentPage('messages.html') ? 'active' : ''}">Mensajes</a>
            <a href="${dashboard.href}" class="login-link ${isCurrentPage(dashboard.href) ? 'active' : ''}">${dashboard.text}</a>
            <a href="index.html" class="login-link" data-logout-link>Cerrar sesión</a>
        `;
    }

    renderNavbarActions();

    navbarActions.addEventListener('click', function(event) {
        const logoutLink = event.target.closest('[data-logout-link]');
        if (!logoutLink) return;

        event.preventDefault();
        localStorage.removeItem('alquileres_user');
        window.location.href = 'index.html';
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Navbar glassmorphism effect on scroll
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        
        // Initial check
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        }
    }

    // Search button click handler
    const searchBtn = document.getElementById('searchBtn');
    const destinationInput = document.getElementById('destination');
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');

    // Add focus states for search inputs
    const searchInputs = [destinationInput, checkinInput, checkoutInput];
    searchInputs.forEach(input => {
        if (input) {
            input.addEventListener('focus', function() {
                const group = this.closest('.search-input-group');
                if (group) {
                    group.classList.add('focused');
                }
            });
            input.addEventListener('blur', function() {
                const group = this.closest('.search-input-group');
                if (group) {
                    group.classList.remove('focused');
                }
            });
        }
    });

    if (searchBtn && destinationInput) {
        searchBtn.addEventListener('click', function() {
            const destination = destinationInput.value.trim();
            
            // Validate destination is not empty
            if (!destination) {
                // Add visual feedback
                destinationInput.style.border = '2px solid #ef4444';
                destinationInput.style.borderRadius = '8px';
                destinationInput.style.padding = '8px';
                
                alert('Por favor, ingresa un destino para buscar propiedades.');
                destinationInput.focus();
                
                // Reset border after focus
                setTimeout(() => {
                    destinationInput.style.border = 'none';
                    destinationInput.style.padding = '0';
                }, 100);
                return;
            }
            
            // Get dates if provided
            const checkin = checkinInput ? checkinInput.value : '';
            const checkout = checkoutInput ? checkoutInput.value : '';
            
            // Build query parameters
            const params = new URLSearchParams();
            params.set('destination', destination);
            if (checkin) params.set('checkin', checkin);
            if (checkout) params.set('checkout', checkout);
            
            // Redirect to search.html with query parameters
            window.location.href = 'search.html?' + params.toString();
        });
    }

    // Wishlist button handlers
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');
    
    wishlistBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            
            // Add haptic-like feedback
            if (this.classList.contains('active')) {
                this.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
            }
            
            console.log('Wishlist toggled:', this.classList.contains('active'));
        });
    });

    // AI Assistant button click handler
    const aiAssistantBtn = document.getElementById('aiAssistantBtn');
    
    if (aiAssistantBtn) {
        aiAssistantBtn.addEventListener('click', function() {
            // Add pulse animation before alert
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = '';
            }, 10);
            
            alert('¡Hola! 🤖 Soy tu asistente de IA. Estoy aquí para ayudarte a encontrar el alquiler perfecto. ¿En qué puedo ayudarte hoy?');
        });
    }

    // Add smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Property card hover effect enhancement
    const propertyCards = document.querySelectorAll('.property-card');
    
    propertyCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '10';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '1';
        });
    });

    // Add keyboard support for search
    if (destinationInput && searchBtn) {
        destinationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    console.log('Alquileres - Premium Home page initialized');
});

/**
 * Search Page - Handle query parameters and dynamic content
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the search page
    const searchDestination = document.getElementById('search-destination');
    const searchCheckin = document.getElementById('search-checkin');
    const searchCheckout = document.getElementById('search-checkout');
    const searchBtnCompact = document.getElementById('search-btn-compact');
    const resultsHeading = document.getElementById('results-heading');
    const resultsDates = document.getElementById('results-dates');
    
    if (!searchDestination) return; // Not on search page
    
    // Read query parameters from URL
    const params = new URLSearchParams(window.location.search);
    const destination = params.get('destination');
    const checkin = params.get('checkin');
    const checkout = params.get('checkout');
    
    // Helper function to format date for display
    function formatDateDisplay(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        return date.getDate() + ' ' + months[date.getMonth()];
    }
    
    // Helper function to format full date for results heading
    function formatFullDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return date.getDate() + ' de ' + months[date.getMonth()];
    }
    
    // Prefill search bar with query parameter values (or keep defaults if none)
    if (destination) {
        searchDestination.value = destination;
    }
    if (checkin) {
        searchCheckin.value = checkin;
    }
    if (checkout) {
        searchCheckout.value = checkout;
    }
    
    // Update results heading dynamically
    const displayDestination = destination || 'Ciudad de México';
    let datesText = '';
    
    if (checkin && checkout) {
        datesText = `Del ${formatFullDate(checkin)} al ${formatFullDate(checkout)}`;
    } else if (checkin) {
        datesText = `Llegada: ${formatFullDate(checkin)}`;
    } else if (checkout) {
        datesText = `Salida: ${formatFullDate(checkout)}`;
    } else {
        datesText = 'Fechas flexibles';
    }
    
    if (resultsHeading) {
        resultsHeading.textContent = `156 propiedades en ${displayDestination}`;
    }
    if (resultsDates) {
        resultsDates.textContent = datesText + ' · 2 huéspedes';
    }
    
    // Handle compact search button click - redirect with new params
    if (searchBtnCompact) {
        searchBtnCompact.addEventListener('click', function() {
            const newDestination = searchDestination.value.trim();
            const newCheckin = searchCheckin.value;
            const newCheckout = searchCheckout.value;
            
            if (!newDestination) {
                searchDestination.style.border = '2px solid #ef4444';
                searchDestination.style.borderRadius = '8px';
                searchDestination.style.padding = '8px';
                alert('Por favor, ingresa un destino para buscar propiedades.');
                setTimeout(() => {
                    searchDestination.style.border = 'none';
                    searchDestination.style.padding = '0';
                }, 100);
                return;
            }
            
            const newParams = new URLSearchParams();
            newParams.set('destination', newDestination);
            if (newCheckin) newParams.set('checkin', newCheckin);
            if (newCheckout) newParams.set('checkout', newCheckout);
            
            window.location.href = 'search.html?' + newParams.toString();
        });
    }
    
    // Add Enter key support for compact search inputs
    searchDestination.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtnCompact.click();
        }
    });

    const resultsGrid = document.querySelector('.results-grid');
    const resultsStatus = document.getElementById('results-status');
    const resultsPagination = document.getElementById('results-pagination');

    function setStatusMessage(message) {
        if (resultsStatus) {
            resultsStatus.textContent = message;
            resultsStatus.style.display = 'block';
        }
        if (resultsGrid) {
            resultsGrid.style.display = 'none';
            resultsGrid.innerHTML = '';
        }
        if (resultsPagination) {
            resultsPagination.style.display = 'none';
        }
    }

    function clearStatusMessage() {
        if (resultsStatus) {
            resultsStatus.style.display = 'none';
        }
        if (resultsGrid) {
            resultsGrid.style.display = 'grid';
        }
    }

    function buildPropertyDetailUrl(propertyId) {
        const detailParams = new URLSearchParams();
        detailParams.set('id', propertyId);
        if (searchDestination.value.trim()) {
            detailParams.set('destination', searchDestination.value.trim());
        }
        if (searchCheckin.value) {
            detailParams.set('checkin', searchCheckin.value);
        }
        if (searchCheckout.value) {
            detailParams.set('checkout', searchCheckout.value);
        }
        return `property-detail.html?${detailParams.toString()}`;
    }

    function createStarIcon() {
        return '<svg class="star-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }

    function createPropertyCard(property) {
        const article = document.createElement('article');
        article.className = 'property-card';

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'property-image';

        const image = document.createElement('img');
        image.src = property.image || 'https://via.placeholder.com/400x300?text=Sin+imagen';
        image.alt = property.title || 'Propiedad';
        imageWrapper.appendChild(image);

        if (property.verified) {
            const verifiedBadge = document.createElement('span');
            verifiedBadge.className = 'verified-badge';
            verifiedBadge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            imageWrapper.appendChild(verifiedBadge);
        }

        const wishlistBtn = document.createElement('button');
        wishlistBtn.className = 'wishlist-btn';
        wishlistBtn.type = 'button';
        wishlistBtn.setAttribute('aria-label', 'Agregar a favoritos');
        wishlistBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
        wishlistBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
        });
        imageWrapper.appendChild(wishlistBtn);

        const content = document.createElement('div');
        content.className = 'property-content';

        const header = document.createElement('div');
        header.className = 'property-header';

        const title = document.createElement('h3');
        title.className = 'property-title';
        title.textContent = property.title || 'Propiedad';

        const rating = document.createElement('div');
        rating.className = 'property-rating';
        rating.innerHTML = `${createStarIcon()}<span>${(property.rating || 0).toFixed(1)}</span>`;

        header.appendChild(title);
        header.appendChild(rating);

        const location = document.createElement('p');
        location.className = 'property-location';
        location.textContent = property.location || 'Ubicación no disponible';

        const footer = document.createElement('div');
        footer.className = 'property-footer';

        const price = document.createElement('div');
        price.className = 'property-price';
        price.innerHTML = `<span class="price-currency">${property.currency || '$'}</span><span class="price-amount">${property.price || 0}</span><span class="price-period">/noche</span>`;

        const detailsLink = document.createElement('a');
        detailsLink.className = 'property-link';
        detailsLink.href = buildPropertyDetailUrl(property.id || '');
        detailsLink.textContent = 'Ver detalles';

        footer.appendChild(price);
        footer.appendChild(detailsLink);

        content.appendChild(header);
        content.appendChild(location);
        content.appendChild(footer);

        article.appendChild(imageWrapper);
        article.appendChild(content);

        return article;
    }

    function updateResultsHeading(count) {
        if (resultsHeading) {
            resultsHeading.textContent = `${count} propiedades en ${displayDestination}`;
        }
    }

    async function loadSearchResults() {
        setStatusMessage('Cargando propiedades...');

        try {
            const response = await apiFetch('/properties');
            if (!response.ok) {
                throw new Error('Respuesta de red no exitosa');
            }

            const result = await response.json();
            const properties = Array.isArray(result.properties) ? result.properties : [];
            const destinationFilter = destination ? destination.toLowerCase().trim() : '';
            const filteredProperties = destinationFilter
                ? properties.filter((item) => {
                    const titleText = item.title ? item.title.toLowerCase() : '';
                    const locationText = item.location ? item.location.toLowerCase() : '';
                    return titleText.includes(destinationFilter) || locationText.includes(destinationFilter);
                })
                : properties;

            if (filteredProperties.length === 0) {
                updateResultsHeading(0);
                setStatusMessage('No se encontraron propiedades');
                return;
            }

            clearStatusMessage();
            if (resultsGrid) {
                resultsGrid.innerHTML = '';
                filteredProperties.forEach((property) => resultsGrid.appendChild(createPropertyCard(property)));
            }
            if (resultsPagination) {
                resultsPagination.style.display = '';
            }
            updateResultsHeading(filteredProperties.length);
        } catch (error) {
            console.error('Error al cargar propiedades:', error);
            updateResultsHeading(0);
            setStatusMessage('No se pudo conectar con el servidor');
        }
    }

    loadSearchResults();

    console.log('Alquileres - Search page initialized with params:', {
        destination: destination || 'default',
        checkin: checkin || 'default',
        checkout: checkout || 'default'
    });
});

/**
 * Property Detail Page - Handle query parameters and dynamic pricing
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the property detail page
    const bookingCheckin = document.getElementById('booking-checkin');
    const bookingCheckout = document.getElementById('booking-checkout');
    const priceNights = document.getElementById('price-nights');
    const cleaningFee = document.getElementById('cleaning-fee');
    const serviceFee = document.getElementById('service-fee');
    const deposit = document.getElementById('deposit');
    const priceTotal = document.getElementById('price-total');
    const detailStatus = document.getElementById('property-detail-status');
    const detailContent = document.querySelector('.property-detail-content');
    const gallerySection = document.querySelector('.property-gallery');
    const mainImage = document.getElementById('property-gallery-main-img');
    const galleryGrid = document.getElementById('gallery-grid');
    const titleEl = document.getElementById('property-title');
    const locationEl = document.getElementById('property-location');
    const ratingValueEl = document.getElementById('property-rating-value');
    const reviewCountEl = document.getElementById('property-review-count');
    const hostNameEl = document.getElementById('host-name');
    const hostVerifiedBadge = document.getElementById('host-verified-badge');
    const hostAvatarEl = document.getElementById('host-avatar-img');
    const descriptionContainer = document.getElementById('property-description');
    const amenitiesGrid = document.getElementById('amenities-grid');
    const reserveBtn = document.getElementById('reserve-btn');
    const bookingGuests = document.getElementById('booking-guests');
    const bookingPriceAmount = document.querySelector('.booking-price .price-amount');
    const bookingPriceCurrency = document.querySelector('.booking-price .price-currency');
    const bookingRatingValue = document.querySelector('.booking-rating span');
    
    if (!bookingCheckin) return; // Not on property detail page
    
    // Read query parameters from URL
    const params = new URLSearchParams(window.location.search);
    const rawPropertyId = params.get('id') || '1';
    const propertyId = /^\d+$/.test(rawPropertyId) ? rawPropertyId : rawPropertyId.replace(/^property-/, '') || '1';
    const destination = params.get('destination');
    const checkin = params.get('checkin');
    const checkout = params.get('checkout');
    
    // Default pricing values
    let nightlyPrice = 1850;
    const cleaningPrice = 500;
    const serviceFeePercent = 0.10; // 10% service fee
    const depositAmount = 3700;
    let currentPropertyTitle = 'Apartamento moderno en Polanco';
    let currentPropertyLocation = 'Polanco, Ciudad de México';
    let currentPropertyOwnerId = 'owner-1';
    let currentPropertyHost = 'María González';
    
    function calculateNights(checkinDate, checkoutDate) {
        if (!checkinDate || !checkoutDate) return 5;
        const start = new Date(checkinDate + 'T00:00:00');
        const end = new Date(checkoutDate + 'T00:00:00');
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 5;
    }
    
    function formatPrice(num) {
        return '$' + Number(num || 0).toLocaleString('es-MX');
    }
    
    function setStatusMessage(message, isError = false) {
        if (!detailStatus) return;
        detailStatus.textContent = message;
        detailStatus.classList.toggle('error', isError);
        detailStatus.style.display = 'block';
    }
    
    function hideStatusMessage() {
        if (!detailStatus) return;
        detailStatus.style.display = 'none';
    }
    
    function showDetailSections(show) {
        if (detailContent) {
            detailContent.style.display = show ? '' : 'none';
        }
        if (gallerySection) {
            gallerySection.style.display = show ? '' : 'none';
        }
    }
    
    function updatePriceBreakdown() {
        const nights = calculateNights(bookingCheckin.value, bookingCheckout.value);
        const subtotal = nightlyPrice * nights;
        const calculatedServiceFee = Math.round(subtotal * serviceFeePercent);
        const total = subtotal + cleaningPrice + calculatedServiceFee + depositAmount;
    
        if (priceNights) {
            priceNights.innerHTML = `<span>${formatPrice(nightlyPrice)} x ${nights} noches</span><span>${formatPrice(subtotal)}</span>`;
        }
        if (cleaningFee) {
            cleaningFee.textContent = formatPrice(cleaningPrice);
        }
        if (serviceFee) {
            serviceFee.textContent = formatPrice(calculatedServiceFee);
        }
        if (deposit) {
            deposit.textContent = formatPrice(depositAmount);
        }
        if (priceTotal) {
            priceTotal.innerHTML = `<span>Total</span><span>${formatPrice(total)}</span>`;
        }
    }
    
    function buildBookingUrl() {
        const checkinVal = bookingCheckin.value || '2026-04-20';
        const checkoutVal = bookingCheckout.value || '2026-04-25';
        const guestsVal = bookingGuests ? bookingGuests.value : '2';
        const currentNights = calculateNights(checkinVal, checkoutVal);
        const currentSubtotal = nightlyPrice * currentNights;
        const currentServiceFee = Math.round(currentSubtotal * serviceFeePercent);
        const currentTotal = currentSubtotal + cleaningPrice + currentServiceFee + depositAmount;
        
        const params = new URLSearchParams();
        params.set('id', propertyId || '1');
        params.set('propertyId', propertyId || '1');
        params.set('ownerId', currentPropertyOwnerId || 'owner-1');
        params.set('title', currentPropertyTitle);
        params.set('location', currentPropertyLocation);
        params.set('host', currentPropertyHost);
        params.set('checkin', checkinVal);
        params.set('checkout', checkoutVal);
        params.set('guests', guestsVal);
        params.set('nights', currentNights);
        params.set('price', nightlyPrice);
        params.set('total', currentTotal);
        
        return 'booking.html?' + params.toString();
    }
    
    function updateHostSection(host) {
        if (!host) return;
        if (hostNameEl) {
            hostNameEl.textContent = host.name || 'Anfitrión';
        }
        if (hostAvatarEl) {
            hostAvatarEl.src = host.avatar || hostAvatarEl.src;
            hostAvatarEl.alt = host.name || 'Anfitrión';
        }
        if (hostVerifiedBadge) {
            hostVerifiedBadge.style.display = host.verified ? '' : 'none';
        }
    }
    
    function updateDescription(description) {
        if (!descriptionContainer) return;
        descriptionContainer.innerHTML = '';
        if (Array.isArray(description) && description.length) {
            description.forEach((paragraph) => {
                const p = document.createElement('p');
                p.className = 'property-description';
                p.textContent = paragraph;
                descriptionContainer.appendChild(p);
            });
        } else if (typeof description === 'string') {
            const p = document.createElement('p');
            p.className = 'property-description';
            p.textContent = description;
            descriptionContainer.appendChild(p);
        } else {
            const p = document.createElement('p');
            p.className = 'property-description';
            p.textContent = 'Descripción no disponible para esta propiedad.';
            descriptionContainer.appendChild(p);
        }
    }
    
    function updateAmenities(amenities) {
        if (!amenitiesGrid) return;
        amenitiesGrid.innerHTML = '';
        if (Array.isArray(amenities) && amenities.length) {
            amenities.forEach((item) => {
                const amenity = document.createElement('div');
                amenity.className = 'amenity-item';
                amenity.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg><span>${item}</span>`;
                amenitiesGrid.appendChild(amenity);
            });
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'amenity-item';
            placeholder.innerHTML = '<span>No hay servicios disponibles.</span>';
            amenitiesGrid.appendChild(placeholder);
        }
    }
    
    function updateGallery(images) {
        if (!mainImage || !galleryGrid) return;
        if (Array.isArray(images) && images.length) {
            mainImage.src = images[0];
            galleryGrid.innerHTML = '';
            images.slice(1, 5).forEach((imgUrl, index) => {
                const img = document.createElement('img');
                img.src = imgUrl;
                img.alt = `Imagen ${index + 2}`;
                galleryGrid.appendChild(img);
            });
            galleryGrid.style.display = images.length > 1 ? 'grid' : 'none';
        } else {
            galleryGrid.innerHTML = '';
            galleryGrid.style.display = 'none';
        }
    }
    
    function populatePropertyDetails(property) {
        if (titleEl) {
            titleEl.textContent = property.title || titleEl.textContent;
        }
        if (locationEl) {
            const textNode = Array.from(locationEl.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
            if (textNode) {
                textNode.textContent = ' ' + (property.location || locationEl.textContent.trim());
            }
        }
        if (ratingValueEl) {
            ratingValueEl.textContent = property.rating ? property.rating.toFixed(1) : '0.0';
        }
        if (reviewCountEl) {
            reviewCountEl.textContent = `(${property.reviewCount || 0} reseñas)`;
        }
        if (bookingPriceAmount) {
            bookingPriceAmount.textContent = property.price || nightlyPrice;
        }
        if (bookingPriceCurrency) {
            bookingPriceCurrency.textContent = property.currency || '$';
        }
        if (bookingRatingValue) {
            bookingRatingValue.textContent = property.rating ? property.rating.toFixed(1) : '0.0';
        }
        if (property.image && mainImage) {
            mainImage.src = property.image;
        }
        currentPropertyTitle = property.title || currentPropertyTitle;
        currentPropertyLocation = property.location || currentPropertyLocation;
        currentPropertyOwnerId = property.ownerId || currentPropertyOwnerId;
        currentPropertyHost = property.host?.name || property.ownerName || property.owner || currentPropertyHost;
        if (property.price) {
            nightlyPrice = property.price;
        }
        updateHostSection(property.host);
        updateDescription(property.description);
        updateAmenities(property.amenities);
        updateGallery(property.gallery || [property.image]);
        document.title = `${currentPropertyTitle} - Alquileres`;
    }
    
    function updateContentAfterLoad() {
        hideStatusMessage();
        showDetailSections(true);
        updatePriceBreakdown();
        if (reserveBtn) {
            reserveBtn.href = buildBookingUrl();
        }
    }
    
    function setLoadingState() {
        setStatusMessage('Cargando propiedad...', false);
        showDetailSections(false);
    }
    
    function setErrorState(message) {
        setStatusMessage(message, true);
        showDetailSections(false);
    }
    
    // Prefill date inputs if query params exist
    if (checkin) {
        bookingCheckin.value = checkin;
    }
    if (checkout) {
        bookingCheckout.value = checkout;
    }
    
    async function loadProperty() {
        setLoadingState();
        try {
            const response = await apiFetch(`/properties/${propertyId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    setErrorState('Propiedad no encontrada');
                    return;
                }
                throw new Error('Respuesta de red no exitosa');
            }
            const result = await response.json();
            const property = result.property;
            if (!property) {
                setErrorState('Propiedad no encontrada');
                return;
            }
            populatePropertyDetails(property);
            updateContentAfterLoad();
        } catch (error) {
            console.error('Error al cargar propiedad:', error);
            setErrorState('No se pudo conectar con el servidor');
        }
    }
    
    function handleBookingChange() {
        updatePriceBreakdown();
        if (reserveBtn) {
            reserveBtn.href = buildBookingUrl();
        }
    }
    
    bookingCheckin.addEventListener('change', handleBookingChange);
    bookingCheckout.addEventListener('change', handleBookingChange);
    if (bookingGuests) {
        bookingGuests.addEventListener('change', handleBookingChange);
    }
    
    if (reserveBtn) {
        reserveBtn.href = buildBookingUrl();
    }
    
    loadProperty();
    
    console.log('Alquileres - Property detail page initialized:', {
        propertyId: propertyId || 'default',
        destination: destination || 'default',
        checkin: checkin || 'default',
        checkout: checkout || 'default'
    });
});

/**
 * Booking Page - Submit reservation to backend
 */
document.addEventListener('DOMContentLoaded', function() {
    const confirmPayBtn = document.getElementById('confirm-pay-btn');
    if (!confirmPayBtn) return;

    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get('propertyId') || params.get('id') || 'property-1';
    const tenantId = 'tenant-1';
    const ownerId = params.get('ownerId') || 'owner-1';
    const title = params.get('title') || 'Apartamento moderno en Polanco';
    const location = params.get('location') || 'Polanco, Ciudad de México';
    const host = params.get('host') || 'María González';
    const checkin = params.get('checkin') || '2026-04-20';
    const checkout = params.get('checkout') || '2026-04-25';
    const guests = params.get('guests') || '2';
    const nights = params.get('nights') || '5';
    const total = params.get('total') || '14375';
    const price = Number(params.get('price')) || (Number(total) / Number(nights)) || 1850;

    const propertySummaryTitle = document.querySelector('.booking-property-summary .summary-details h3');
    const propertySummaryLocation = document.querySelector('.booking-property-summary .summary-location');
    const priceLabel = document.querySelector('.price-details .price-row .price-label');
    const priceValue = document.querySelector('.price-details .price-row .price-value');
    const totalAmount = document.querySelector('.price-total .total-amount');
    const confirmationMessage = document.createElement('div');
    confirmationMessage.style.color = '#b91c1c';
    confirmationMessage.style.margin = '1rem 0';
    confirmationMessage.style.fontWeight = '500';
    confirmationMessage.style.display = 'none';
    confirmPayBtn.parentNode.insertBefore(confirmationMessage, confirmPayBtn);

    if (propertySummaryTitle) {
        propertySummaryTitle.textContent = title;
    }
    if (propertySummaryLocation) {
        propertySummaryLocation.textContent = location;
    }
    if (priceLabel) {
        priceLabel.textContent = `${formatPrice(price)} x ${nights} noches`;
    }
    if (priceValue) {
        priceValue.textContent = formatPrice(price * Number(nights));
    }
    if (totalAmount) {
        totalAmount.textContent = formatPrice(total);
    }

    function formatPrice(value) {
        const number = Number(value || 0);
        return '$' + number.toLocaleString('es-MX');
    }

    function showBookingError(message) {
        confirmationMessage.textContent = message;
        confirmationMessage.style.display = 'block';
    }

    function clearBookingError() {
        confirmationMessage.textContent = '';
        confirmationMessage.style.display = 'none';
    }

    function validateFields() {
        const fields = [
            { el: document.getElementById('cardName'), label: 'Nombre en la tarjeta' },
            { el: document.getElementById('cardNumber'), label: 'Número de tarjeta' },
            { el: document.getElementById('email'), label: 'Correo electrónico' }
        ];

        for (const field of fields) {
            if (!field.el || !field.el.value.trim()) {
                alert(`Por favor completa el campo: ${field.label}`);
                field.el?.focus();
                return false;
            }
        }

        const emailInput = document.getElementById('email');
        if (emailInput && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
            alert('Ingresa un correo electrónico válido.');
            emailInput.focus();
            return false;
        }

        return true;
    }

    async function submitBooking() {
        if (!validateFields()) {
            return;
        }

        confirmPayBtn.disabled = true;
        const originalText = confirmPayBtn.textContent;
        confirmPayBtn.textContent = 'Procesando...';

        const bookingPayload = {
            propertyId,
            tenantId,
            ownerId,
            title,
            location,
            host,
            checkin,
            checkout,
            guests: Number(guests),
            nights: Number(nights),
            total: Number(total),
            status: 'Pendiente'
        };

        try {
            const url = `${API_BASE_URL}/bookings`;
            console.log('Booking payload:', bookingPayload);
            console.log('Sending booking POST to:', url);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingPayload)
            });

            console.log('Booking response status:', response.status, 'ok:', response.ok);

            const responseBody = await response.json().catch((jsonError) => {
                console.warn('Booking response JSON parse failed:', jsonError);
                return null;
            });
            console.log('Booking response body:', responseBody);

            if (!response.ok) {
                console.error('Booking POST failed:', response.status, responseBody);
                alert('No pudimos confirmar la reserva. Intenta nuevamente.');
                return;
            }

            const bookingId = responseBody?.booking?.id || responseBody?.id || responseBody?.bookingId;
            const confirmationCode = responseBody?.confirmationCode || responseBody?.code || (bookingId ? `ALQ-${bookingId}` : null);

            if (!bookingId) {
                console.error('Booking POST returned no booking id:', responseBody);
                alert('No pudimos confirmar la reserva. Intenta nuevamente.');
                return;
            }

            const params = new URLSearchParams();
            params.set('id', propertyId);
            params.set('bookingId', bookingId);
            if (confirmationCode) params.set('code', confirmationCode);
            params.set('title', title);
            params.set('location', location);
            params.set('host', host);
            params.set('checkin', checkin);
            params.set('checkout', checkout);
            params.set('guests', guests);
            params.set('nights', nights);
            params.set('total', total);
            window.location.href = `booking-success.html?${params.toString()}`;
        } catch (error) {
            console.error('Error al enviar la reserva:', error);
            alert('No pudimos confirmar la reserva. Intenta nuevamente.');
        } finally {
            confirmPayBtn.disabled = false;
            confirmPayBtn.textContent = originalText;
        }
    }

    confirmPayBtn.addEventListener('click', function(event) {
        event.preventDefault();
        console.log('Confirmar y pagar clickeado');
        submitBooking();
    });

    console.log('Listener attached to #confirm-pay-btn');
});

/**
 * Booking Success Page - Handle query parameters and display reservation confirmation
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the booking success page
    const successTitle = document.querySelector('.success-title');
    if (!successTitle) return; // Not on booking success page
    
    // Read query parameters from URL
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get('id');
    const propertyTitle = params.get('title');
    const location = params.get('location');
    const checkin = params.get('checkin');
    const checkout = params.get('checkout');
    const guests = params.get('guests');
    const nights = params.get('nights');
    const total = params.get('total');
    const hostName = params.get('host');
    const reservationCode = params.get('code');
    
    // Helper function to format date
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    }
    
    // Helper function to format price
    function formatPrice(num) {
        return '$' + (num || 0).toLocaleString('es-MX');
    }
    
    // Update confirmation code
    const codeValue = document.querySelector('.code-value');
    if (codeValue && reservationCode) {
        codeValue.textContent = reservationCode;
    }
    
    // Update property title
    const propertyTitleEl = document.querySelector('.summary-property-info h3');
    if (propertyTitleEl && propertyTitle) {
        propertyTitleEl.textContent = decodeURIComponent(propertyTitle);
    }
    
    // Update location
    const locationEl = document.querySelector('.summary-property-info .summary-location');
    if (locationEl && location) {
        // Keep the SVG icon, update the text
        const svgIcon = locationEl.querySelector('svg');
        if (svgIcon) {
            locationEl.innerHTML = '';
            locationEl.appendChild(svgIcon);
            locationEl.appendChild(document.createTextNode(' ' + decodeURIComponent(location)));
        }
    }
    
    // Update check-in date
    const dateItems = document.querySelectorAll('.date-item');
    if (dateItems.length >= 2) {
        const checkinDateEl = dateItems[0].querySelector('.date-value');
        if (checkinDateEl && checkin) {
            checkinDateEl.textContent = formatDate(checkin);
        }
        
        const checkoutDateEl = dateItems[1].querySelector('.date-value');
        if (checkoutDateEl && checkout) {
            checkoutDateEl.textContent = formatDate(checkout);
        }
    }
    
    // Update guests
    const guestsEl = document.querySelector('.summary-guests span');
    if (guestsEl && guests) {
        guestsEl.textContent = `${guests} huésped${parseInt(guests) > 1 ? 'es' : ''}`;
    }
    
    // Update pricing
    const priceSummary = document.querySelector('.summary-price');
    if (priceSummary) {
        const nightlyPrice = 1850;
        const numNights = parseInt(nights) || 5;
        const subtotal = nightlyPrice * numNights;
        const cleaningFee = 500;
        const serviceFee = Math.round(subtotal * 0.10);
        const taxes = 1700;
        
        const priceRows = priceSummary.querySelectorAll('.price-row');
        if (priceRows[0]) {
            priceRows[0].innerHTML = `<span>${formatPrice(nightlyPrice)} x ${numNights} noches</span><span>${formatPrice(subtotal)}</span>`;
        }
        if (priceRows[1]) {
            priceRows[1].innerHTML = `<span>Tarifa de limpieza</span><span>${formatPrice(cleaningFee)}</span>`;
        }
        if (priceRows[2]) {
            priceRows[2].innerHTML = `<span>Tarifa de servicio</span><span>${formatPrice(serviceFee)}</span>`;
        }
        if (priceRows[3]) {
            priceRows[3].innerHTML = `<span>Impuestos (16%)</span><span>${formatPrice(taxes)}</span>`;
        }
        
        const totalRow = priceSummary.querySelector('.price-total');
        if (totalRow) {
            const totalAmount = totalRow.querySelector('.total-amount');
            if (totalAmount) {
                totalAmount.textContent = formatPrice(parseInt(total) || 14375);
            }
        }
    }
    
    // Update host name
    const hostNameEl = document.querySelector('.host-details h3');
    if (hostNameEl && hostName) {
        hostNameEl.textContent = decodeURIComponent(hostName);
    }
    
    console.log('Alquileres - Booking success page initialized:', {
        propertyId: propertyId || 'default',
        propertyTitle: propertyTitle || 'default',
        location: location || 'default',
        checkin: checkin || 'default',
        checkout: checkout || 'default',
        guests: guests || 'default',
        nights: nights || 'default',
        total: total || 'default',
        hostName: hostName || 'default',
        reservationCode: reservationCode || 'default'
    });
});

/**
 * Tenant Dashboard - Load upcoming reservations from backend
 */
document.addEventListener('DOMContentLoaded', function() {
    const reservationsList = document.querySelector('.dashboard-main.tenant-dashboard .reservations-list');
    if (!reservationsList) return;

    const initialReservationsHtml = reservationsList.innerHTML;
    const countEl = document.getElementById('tenant-bookings-count');
    const loadingMessage = 'Cargando tus reservaciones...';
    const emptyMessage = 'Todavía no tienes reservaciones';
    const errorMessage = 'No se pudieron cargar tus reservaciones';

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return `${date.getDate()} ${months[date.getMonth()]}`;
    }

    function normalizeTenantPropertyId(propertyId) {
        if (!propertyId) return '';
        return String(propertyId).replace(/^property-/, '');
    }

    function updateTenantBookingsCount(bookings) {
        if (!countEl) return;
        countEl.textContent = `(${bookings.length})`;
        countEl.hidden = false;
    }

    function hideTenantBookingsCount() {
        if (!countEl) return;
        countEl.hidden = true;
    }

    function buildStatusCard(message) {
        return `
            <div style="grid-column: 1 / -1; padding: 1rem 1.1rem; border-radius: var(--radius-lg); background: var(--gray-50); border: 1px solid rgba(0,0,0,0.06); color: var(--text-medium); font-size: 0.95rem;">
                ${message}
            </div>
        `;
    }

    async function fetchPropertyDetail(propertyId) {
        if (!propertyId) return null;
        const idsToTry = [...new Set([propertyId, normalizeTenantPropertyId(propertyId)].filter(Boolean))];

        try {
            for (const id of idsToTry) {
                const response = await apiFetch(`/properties/${encodeURIComponent(id)}`);
                if (!response.ok) continue;

                const result = await response.json();
                return result.property || result.data || result;
            }

            return null;
        } catch (error) {
            console.warn('Error fetching property detail for', propertyId, error);
            return null;
        }
    }

    function normalizeBooking(booking, propertyData) {
        const propertyId = booking.propertyId || booking.property?.id || '';
        const property = Object.assign({}, booking.property || {}, propertyData || {});
        const ownerName = booking.owner || booking.ownerName || booking.host || property.owner?.name || property.owner || booking.ownerId || '';
        const title = booking.title || property.title || `Propiedad ${propertyId || ''}`.trim();
        const image = booking.image || property.image || property.picture || property.thumbnail || 'https://via.placeholder.com/320x220?text=Propiedad';
        const location = property.location || booking.location || '';
        const checkin = booking.checkin || '';
        const checkout = booking.checkout || '';
        const status = booking.status || 'Pendiente';

        return {
            id: booking.id || '',
            propertyId,
            title,
            image,
            location,
            checkin,
            checkout,
            status,
            owner: ownerName
        };
    }

    function getTenantStatusClass(status) {
        const normalized = String(status || '').toLowerCase();

        if (normalized.includes('confirm')) return 'confirmed';
        if (normalized.includes('pend')) return 'pending';
        if (normalized.includes('rechaz')) return 'rejected';
        if (normalized.includes('complet')) return 'completed';

        return '';
    }

    function getTenantStatusMessage(status) {
        const normalized = String(status || '').toLowerCase();

        if (normalized.includes('rechaz')) {
            return 'Esta reserva fue rechazada por el anfitrión.';
        }

        if (normalized.includes('pend')) {
            return 'Esperando confirmación del anfitrión.';
        }

        return '';
    }

    function renderReservationCard(item) {
        const statusClass = getTenantStatusClass(item.status);
        const statusMessage = getTenantStatusMessage(item.status);
        const detailsHref = item.propertyId ? `property-detail.html?id=${encodeURIComponent(item.propertyId)}` : 'property-detail.html';
        const messagesHref = `messages.html?host=${encodeURIComponent(item.owner || '')}&property=${encodeURIComponent(item.title || '')}&status=${encodeURIComponent(item.status)}&checkin=${encodeURIComponent(item.checkin)}&checkout=${encodeURIComponent(item.checkout)}`;
        const statusMessageHtml = statusMessage ? `<p class="reservation-status-message">${statusMessage}</p>` : '';
        const ownerHtml = item.owner ? `<div class="reservation-host"><img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=30&h=30&fit=crop" alt="${item.owner}"><span>Anfitrión: ${item.owner}</span></div>` : '';

        return `
            <article class="reservation-card">
                <div class="reservation-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="reservation-details">
                    <h3>${item.title}</h3>
                    <div class="reservation-meta">
                        <span class="reservation-dates">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            ${formatDate(item.checkin)} - ${formatDate(item.checkout)}
                        </span>
                        <span class="reservation-status ${statusClass}">${item.status}</span>
                    </div>
                    ${ownerHtml}
                    ${statusMessageHtml}
                </div>
                <div class="reservation-actions">
                    <a href="${detailsHref}" class="btn-outline-sm">Ver propiedad</a>
                    <a href="${messagesHref}" class="btn-outline-sm">Mensajes</a>
                </div>
            </article>
        `;
    }

    async function loadReservations() {
        reservationsList.innerHTML = buildStatusCard(loadingMessage);

        try {
            const response = await apiFetch('/bookings/user/tenant-1');
            if (!response.ok) {
                throw new Error('No se pudo obtener reservaciones');
            }

            const result = await response.json();
            const bookings = Array.isArray(result.bookings)
                ? result.bookings
                : Array.isArray(result.data)
                    ? result.data
                    : Array.isArray(result)
                        ? result
                        : [];
            updateTenantBookingsCount(bookings);

            if (bookings.length === 0) {
                reservationsList.innerHTML = buildStatusCard(emptyMessage);
                return;
            }

            const hydratedBookings = await Promise.all(bookings.map(async (booking) => {
                const propertyId = booking.propertyId || booking.property?.id;
                let propertyData = booking.property || null;
                if (propertyId && (!propertyData || !propertyData.title || !propertyData.image || !propertyData.location || !propertyData.owner)) {
                    propertyData = await fetchPropertyDetail(propertyId) || propertyData;
                }
                return normalizeBooking(booking, propertyData);
            }));

            reservationsList.innerHTML = hydratedBookings.map(renderReservationCard).join('');
        } catch (error) {
            console.error('Error cargando reservaciones:', error);
            hideTenantBookingsCount();
            reservationsList.innerHTML = buildStatusCard(errorMessage) + initialReservationsHtml;
        }
    }

    loadReservations();
});

/**
 * Owner Dashboard - Load real owner properties, reservations and stats
 */
document.addEventListener('DOMContentLoaded', function() {
    const ownerDashboard = document.querySelector('.dashboard-main.owner-dashboard');
    if (!ownerDashboard) return;

    const OWNER_ID = 'owner-1';
    const listingsGrid = ownerDashboard.querySelector('.listings-grid');
    const reservationsList = ownerDashboard.querySelector('.reservations-received-list');
    const activePropertiesStat = ownerDashboard.querySelector('[data-owner-stat="active-properties"]');
    const reservationsCountStat = ownerDashboard.querySelector('[data-owner-stat="reservations-count"]');
    const estimatedIncomeStat = ownerDashboard.querySelector('[data-owner-stat="estimated-income"]');
    const averageRatingStat = ownerDashboard.querySelector('[data-owner-stat="average-rating"]');
    const fallbackImage = 'https://via.placeholder.com/320x220?text=Propiedad';

    function escapeOwnerHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function normalizeOwnerPropertyId(propertyId) {
        if (!propertyId) return '';
        return String(propertyId).replace(/^property-/, '');
    }

    function getOwnerArray(result, key) {
        if (Array.isArray(result?.[key])) return result[key];
        if (Array.isArray(result?.data)) return result.data;
        if (Array.isArray(result)) return result;
        return [];
    }

    function formatOwnerDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    function formatOwnerMoney(value) {
        return '$' + Number(value || 0).toLocaleString('es-MX');
    }

    function getOwnerNights(booking) {
        if (booking.nights) return Number(booking.nights);
        if (!booking.checkin || !booking.checkout) return 0;
        const start = new Date(booking.checkin + 'T00:00:00');
        const end = new Date(booking.checkout + 'T00:00:00');
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return nights > 0 ? nights : 0;
    }

    function buildOwnerStatus(message) {
        return `<div class="owner-dashboard-status">${escapeOwnerHtml(message)}</div>`;
    }

    async function fetchOwnerJson(path) {
        const response = await apiFetch(path);
        if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
        return response.json();
    }

    async function fetchOwnerProperty(propertyId) {
        if (!propertyId) return null;
        const idsToTry = [...new Set([propertyId, normalizeOwnerPropertyId(propertyId)].filter(Boolean))];

        for (const id of idsToTry) {
            try {
                const result = await fetchOwnerJson(`/properties/${encodeURIComponent(id)}`);
                return result.property || result.data || result;
            } catch (error) {
                // Try next id form.
            }
        }

        return null;
    }

    function propertyMatchesOwnerBooking(property, booking) {
        return property.id === booking.propertyId || property.id === normalizeOwnerPropertyId(booking.propertyId);
    }

    function getOwnerBookingTotal(booking, property) {
        if (booking.total) return Number(booking.total);
        const nights = getOwnerNights(booking);
        return nights && property?.price ? nights * Number(property.price) : 0;
    }

    function getOwnerGuestName(booking) {
        return booking.guest || booking.guestName || booking.tenantName || booking.tenant?.name || booking.tenantId || 'Huésped';
    }

    function renderOwnerProperty(property, ownerBookings) {
        const propertyBookings = ownerBookings.filter((booking) => propertyMatchesOwnerBooking(property, booking));
        const statusText = property.status === 'available' ? 'Activa' : property.status || 'Activa';
        const statusClass = property.status === 'available' ? 'active' : 'paused';
        const priceText = property.price ? `${formatOwnerMoney(property.price)}/noche` : 'Precio no disponible';

        return `
            <article class="listing-card">
                <div class="listing-image">
                    <img src="${escapeOwnerHtml(property.image || fallbackImage)}" alt="${escapeOwnerHtml(property.title)}">
                    <span class="listing-status ${statusClass}">${escapeOwnerHtml(statusText)}</span>
                </div>
                <div class="listing-content">
                    <h3>${escapeOwnerHtml(property.title)}</h3>
                    <p class="property-location">${escapeOwnerHtml(property.location || '')}</p>
                    <div class="listing-stats">
                        <span>${escapeOwnerHtml(priceText)}</span>
                        <span>${propertyBookings.length} reservaciones</span>
                    </div>
                    <div class="listing-actions">
                        <a href="property-detail.html?id=${encodeURIComponent(property.id)}" class="btn-outline-sm">Ver</a>
                    </div>
                </div>
            </article>
        `;
    }

    function renderOwnerReservation(booking, property) {
        const title = booking.title || property?.title || `Propiedad ${booking.propertyId || ''}`.trim();
        const total = getOwnerBookingTotal(booking, property);
        const status = booking.status || 'Pendiente';
        const normalizedStatus = status.toLowerCase();
        const isPending = normalizedStatus.includes('pend');
        const statusClass = normalizedStatus.includes('confirm')
            ? 'confirmed'
            : normalizedStatus.includes('rechaz')
                ? 'rejected'
                : isPending ? 'pending' : '';
        const messagesParams = new URLSearchParams();
        messagesParams.set('property', title);
        messagesParams.set('status', status);
        messagesParams.set('checkin', booking.checkin || '');
        messagesParams.set('checkout', booking.checkout || '');
        const pendingActions = isPending ? `
                    <button class="btn-outline-sm" data-owner-action="confirm" data-booking-id="${escapeOwnerHtml(booking.id)}">Confirmar</button>
                    <button class="btn-outline-sm" data-owner-action="reject" data-booking-id="${escapeOwnerHtml(booking.id)}">Rechazar</button>` : '';

        return `
            <div class="received-item" data-booking-id="${escapeOwnerHtml(booking.id)}">
                <img src="${escapeOwnerHtml(property?.image || fallbackImage)}" alt="${escapeOwnerHtml(title)}" class="guest-avatar">
                <div class="received-details">
                    <h4>${escapeOwnerHtml(getOwnerGuestName(booking))}</h4>
                    <p>${escapeOwnerHtml(title)}</p>
                    <span class="received-dates">${escapeOwnerHtml(formatOwnerDate(booking.checkin))} - ${escapeOwnerHtml(formatOwnerDate(booking.checkout))}</span>
                    <span class="received-dates">Total: ${escapeOwnerHtml(formatOwnerMoney(total))}</span>
                </div>
                <div class="received-status ${statusClass}">${escapeOwnerHtml(status)}</div>
                <div class="received-actions">
                    <a href="messages.html?${messagesParams.toString()}" class="btn-outline-sm">Mensajes</a>
                    ${pendingActions}
                </div>
            </div>
        `;
    }

    function updateOwnerStats(ownerProperties, ownerBookings, propertyById) {
        const estimatedIncome = ownerBookings.reduce((sum, booking) => {
            const property = propertyById.get(normalizeOwnerPropertyId(booking.propertyId));
            return sum + getOwnerBookingTotal(booking, property);
        }, 0);
        const ratings = ownerProperties
            .map((property) => Number(property.rating))
            .filter((rating) => Number.isFinite(rating));
        const averageRating = ratings.length
            ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
            : 'N/A';

        if (activePropertiesStat) activePropertiesStat.textContent = ownerProperties.length;
        if (reservationsCountStat) reservationsCountStat.textContent = ownerBookings.length;
        if (estimatedIncomeStat) estimatedIncomeStat.textContent = formatOwnerMoney(estimatedIncome);
        if (averageRatingStat) averageRatingStat.textContent = averageRating;
    }

    async function updateOwnerBookingStatus(bookingId, status) {
        const response = await apiFetch(`/bookings/${encodeURIComponent(bookingId)}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (!response.ok) throw new Error('No se pudo actualizar la reserva');
        return response.json();
    }

    async function loadOwnerDashboard() {
        if (listingsGrid) listingsGrid.innerHTML = buildOwnerStatus('Cargando propiedades...');
        if (reservationsList) reservationsList.innerHTML = buildOwnerStatus('Cargando reservaciones...');

        try {
            const [propertiesResult, bookingsResult] = await Promise.all([
                fetchOwnerJson('/properties'),
                fetchOwnerJson('/bookings')
            ]);
            const properties = getOwnerArray(propertiesResult, 'properties');
            const bookings = getOwnerArray(bookingsResult, 'bookings');
            const ownerProperties = properties.filter((property) => property.ownerId === OWNER_ID);
            const ownerBookings = bookings.filter((booking) => booking.ownerId === OWNER_ID);
            const propertyById = new Map(properties.map((property) => [normalizeOwnerPropertyId(property.id), property]));
            const hydratedReservations = await Promise.all(ownerBookings.map(async (booking) => {
                const property = await fetchOwnerProperty(booking.propertyId) || propertyById.get(normalizeOwnerPropertyId(booking.propertyId));
                if (property?.id) propertyById.set(normalizeOwnerPropertyId(property.id), property);
                return { booking, property };
            }));

            updateOwnerStats(ownerProperties, ownerBookings, propertyById);

            if (listingsGrid) {
                listingsGrid.innerHTML = ownerProperties.length
                    ? ownerProperties.map((property) => renderOwnerProperty(property, ownerBookings)).join('')
                    : buildOwnerStatus('Todavía no tienes propiedades');
            }

            if (reservationsList) {
                reservationsList.innerHTML = hydratedReservations.length
                    ? hydratedReservations.map(({ booking, property }) => renderOwnerReservation(booking, property)).join('')
                    : buildOwnerStatus('Todavía no tienes reservaciones');
            }
        } catch (error) {
            console.error('Error cargando panel de anfitrión:', error);
            if (listingsGrid) listingsGrid.innerHTML = buildOwnerStatus('No se pudieron cargar tus propiedades');
            if (reservationsList) reservationsList.innerHTML = buildOwnerStatus('No se pudieron cargar tus reservaciones');
        }
    }

    if (reservationsList) {
        reservationsList.addEventListener('click', async function(event) {
            const actionButton = event.target.closest('[data-owner-action]');
            if (!actionButton) return;

            const bookingId = actionButton.dataset.bookingId;
            const nextStatus = actionButton.dataset.ownerAction === 'confirm' ? 'Confirmada' : 'Rechazada';
            actionButton.disabled = true;

            try {
                await updateOwnerBookingStatus(bookingId, nextStatus);
                await loadOwnerDashboard();
            } catch (error) {
                console.error('Error actualizando reserva:', error);
                actionButton.disabled = false;
                alert('No se pudo actualizar la reserva.');
            }
        });
    }

    loadOwnerDashboard();
});

/**
 * Messages Page - Load conversations and chat thread from backend
 */
document.addEventListener('DOMContentLoaded', function() {
    const messagesMain = document.querySelector('.messages-main');
    if (!messagesMain) return;

    const conversationsList = messagesMain.querySelector('.conversations-list');
    const chatHeader = messagesMain.querySelector('.chat-header');
    const chatAvatar = messagesMain.querySelector('.chat-avatar');
    const chatTitle = messagesMain.querySelector('.chat-user-info h3');
    const chatStatus = messagesMain.querySelector('.chat-status');
    const propertyContext = messagesMain.querySelector('.chat-property-context');
    const contextImage = messagesMain.querySelector('.chat-property-context img');
    const contextTitle = messagesMain.querySelector('.context-details h4');
    const contextText = messagesMain.querySelector('.context-details span');
    const contextLink = messagesMain.querySelector('.context-link');
    const chatMessages = messagesMain.querySelector('.chat-messages');
    const messageInput = messagesMain.querySelector('.message-input');
    const sendButton = messagesMain.querySelector('.send-btn');
    const fallbackAvatar = 'https://via.placeholder.com/80x80?text=U';
    const knownUsers = {
        'tenant-1': { name: 'Juan Pérez', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop' },
        'owner-1': { name: 'María González', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop' },
        'admin-1': { name: 'Administrador', avatar: fallbackAvatar }
    };
    let currentUser = null;
    let activeConversationId = null;

    function getLoggedUser() {
        try {
            return JSON.parse(localStorage.getItem('alquileres_user'));
        } catch (error) {
            return null;
        }
    }

    function escapeMessageHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getArrayPayload(result, key) {
        if (Array.isArray(result?.[key])) return result[key];
        if (Array.isArray(result?.data)) return result.data;
        if (Array.isArray(result)) return result;
        return [];
    }

    function getOtherParticipant(conversation) {
        const otherId = (conversation.participants || []).find((participantId) => participantId !== currentUser.id);
        return {
            id: otherId || '',
            name: conversation.userName || conversation.name || conversation.participantName || knownUsers[otherId]?.name || otherId || 'Conversación',
            avatar: conversation.avatar || conversation.userAvatar || knownUsers[otherId]?.avatar || fallbackAvatar
        };
    }

    function formatMessageTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }

    function getLastMessage(conversation) {
        const messages = Array.isArray(conversation.messages) ? conversation.messages : [];
        return messages[messages.length - 1] || null;
    }

    function buildMessagesStatus(message) {
        return `<div class="messages-status">${escapeMessageHtml(message)}</div>`;
    }

    async function fetchMessagesJson(path, options) {
        const response = await apiFetch(path, options);
        if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
        return response.json();
    }

    function renderConversations(conversations) {
        conversationsList.innerHTML = conversations.map((conversation) => {
            const other = getOtherParticipant(conversation);
            const lastMessage = getLastMessage(conversation);
            const unread = Number(conversation.unread || conversation.unreadCount || 0);
            const isActive = conversation.id === activeConversationId;

            return `
                <div class="conversation-item ${isActive ? 'active' : ''}" data-conversation-id="${escapeMessageHtml(conversation.id)}">
                    <img src="${escapeMessageHtml(other.avatar)}" alt="${escapeMessageHtml(other.name)}" class="conversation-avatar">
                    <div class="conversation-info">
                        <div class="conversation-header">
                            <h4>${escapeMessageHtml(other.name)}</h4>
                            <span class="conversation-time">${escapeMessageHtml(formatMessageTime(lastMessage?.timestamp))}</span>
                        </div>
                        <div class="conversation-preview-row">
                            <p class="conversation-preview">${escapeMessageHtml(lastMessage?.text || conversation.title || 'Sin mensajes todavía')}</p>
                            ${unread ? `<span class="unread-badge">${unread}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderChatHeader(conversation) {
        const other = getOtherParticipant(conversation);
        if (chatAvatar) {
            chatAvatar.src = other.avatar;
            chatAvatar.alt = other.name;
        }
        if (chatTitle) chatTitle.textContent = other.name;
        if (chatStatus) chatStatus.textContent = conversation.subtitle || conversation.roleLabel || 'Conversación activa';
        if (propertyContext) propertyContext.style.display = '';
        if (contextImage) {
            contextImage.src = conversation.propertyImage || contextImage.src;
            contextImage.alt = conversation.title || 'Propiedad';
        }
        if (contextTitle) contextTitle.textContent = conversation.title || 'Consulta de reserva';
        if (contextText) contextText.textContent = conversation.status || 'Mensajes de la conversación';
        if (contextLink) contextLink.href = conversation.propertyId ? `property-detail.html?id=${encodeURIComponent(conversation.propertyId)}` : 'property-detail.html';
        if (chatHeader) chatHeader.style.display = '';
    }

    function renderChatMessages(conversation) {
        const other = getOtherParticipant(conversation);
        const messages = Array.isArray(conversation.messages) ? conversation.messages : [];

        if (!messages.length) {
            chatMessages.innerHTML = buildMessagesStatus('Todavía no hay mensajes en esta conversación.');
            return;
        }

        chatMessages.innerHTML = messages.map((message) => {
            const isOutgoing = message.senderId === currentUser.id;

            if (isOutgoing) {
                return `
                    <div class="message outgoing">
                        <div class="message-bubble">
                            <p>${escapeMessageHtml(message.text)}</p>
                            <span class="message-time">${escapeMessageHtml(formatMessageTime(message.timestamp))}</span>
                        </div>
                    </div>
                `;
            }

            return `
                <div class="message incoming">
                    <img src="${escapeMessageHtml(other.avatar)}" alt="${escapeMessageHtml(other.name)}" class="message-avatar">
                    <div class="message-bubble">
                        <p>${escapeMessageHtml(message.text)}</p>
                        <span class="message-time">${escapeMessageHtml(formatMessageTime(message.timestamp))}</span>
                    </div>
                </div>
            `;
        }).join('');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function loadConversation(conversationId) {
        activeConversationId = conversationId;
        chatMessages.innerHTML = buildMessagesStatus('Cargando chat...');

        try {
            const result = await fetchMessagesJson(`/messages/${encodeURIComponent(conversationId)}`);
            const conversation = result.conversation || result.data || result;
            renderChatHeader(conversation);
            renderChatMessages(conversation);

            conversationsList.querySelectorAll('.conversation-item').forEach((item) => item.classList.remove('active'));
            const activeItem = Array.from(conversationsList.querySelectorAll('.conversation-item'))
                .find((item) => item.dataset.conversationId === conversationId);
            if (activeItem) activeItem.classList.add('active');
        } catch (error) {
            console.error('Error cargando conversación:', error);
            chatMessages.innerHTML = buildMessagesStatus('No pudimos cargar esta conversación.');
        }
    }

    async function loadConversations() {
        conversationsList.innerHTML = buildMessagesStatus('Cargando conversaciones...');
        chatMessages.innerHTML = buildMessagesStatus('Selecciona una conversación para empezar.');

        try {
            const result = await fetchMessagesJson(`/messages/conversations/${encodeURIComponent(currentUser.id)}`);
            const conversations = getArrayPayload(result, 'conversations');

            if (!conversations.length) {
                conversationsList.innerHTML = buildMessagesStatus('Todavía no tienes conversaciones.');
                chatMessages.innerHTML = buildMessagesStatus('No hay mensajes para mostrar.');
                return;
            }

            activeConversationId = activeConversationId || conversations[0].id;
            renderConversations(conversations);
            await loadConversation(activeConversationId);
        } catch (error) {
            console.error('Error cargando conversaciones:', error);
            conversationsList.innerHTML = buildMessagesStatus('No pudimos cargar tus conversaciones.');
            chatMessages.innerHTML = buildMessagesStatus('No pudimos cargar tus mensajes.');
        }
    }

    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text || !activeConversationId) return;

        sendButton.disabled = true;

        try {
            await fetchMessagesJson(`/messages/${encodeURIComponent(activeConversationId)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    senderId: currentUser.id,
                    text
                })
            });
            messageInput.value = '';
            await loadConversation(activeConversationId);
            await loadConversations();
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            chatMessages.insertAdjacentHTML('beforeend', buildMessagesStatus('No pudimos enviar el mensaje.'));
        } finally {
            sendButton.disabled = false;
        }
    }

    currentUser = getLoggedUser();
    if (!currentUser?.id) {
        conversationsList.innerHTML = buildMessagesStatus('Inicia sesión para ver tus conversaciones.');
        chatMessages.innerHTML = buildMessagesStatus('No hay usuario activo.');
        return;
    }

    conversationsList.addEventListener('click', function(event) {
        const item = event.target.closest('.conversation-item');
        if (!item?.dataset.conversationId) return;
        loadConversation(item.dataset.conversationId);
    });

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });

    loadConversations();
});

/**
 * Admin Dashboard - Load users, properties, bookings and stats from backend
 */
document.addEventListener('DOMContentLoaded', function() {
    const adminDashboard = document.querySelector('.dashboard-main.admin-dashboard');
    if (!adminDashboard) return;

    const usersList = adminDashboard.querySelector('.verification-list');
    const propertiesList = adminDashboard.querySelector('.flagged-list');
    const bookingsList = adminDashboard.querySelector('.disputes-list');
    const totalUsersStat = adminDashboard.querySelector('[data-admin-stat="total-users"]');
    const totalPropertiesStat = adminDashboard.querySelector('[data-admin-stat="total-properties"]');
    const totalBookingsStat = adminDashboard.querySelector('[data-admin-stat="total-bookings"]');
    const estimatedRevenueStat = adminDashboard.querySelector('[data-admin-stat="estimated-revenue"]');
    const usersCount = adminDashboard.querySelector('[data-admin-count="users"]');
    const propertiesCount = adminDashboard.querySelector('[data-admin-count="properties"]');
    const bookingsCount = adminDashboard.querySelector('[data-admin-count="bookings"]');
    const fallbackAvatar = 'https://via.placeholder.com/80x80?text=U';
    const fallbackImage = 'https://via.placeholder.com/160x120?text=Propiedad';

    function escapeAdminHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function getAdminArray(result, key) {
        if (Array.isArray(result?.[key])) return result[key];
        if (Array.isArray(result?.data)) return result.data;
        if (Array.isArray(result)) return result;
        return [];
    }

    function normalizeAdminPropertyId(propertyId) {
        if (!propertyId) return '';
        return String(propertyId).replace(/^property-/, '');
    }

    function formatAdminMoney(value) {
        return '$' + Number(value || 0).toLocaleString('es-MX');
    }

    function formatAdminDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        if (Number.isNaN(date.getTime())) return dateString;
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    function getAdminNights(booking) {
        if (booking.nights) return Number(booking.nights);
        if (!booking.checkin || !booking.checkout) return 0;
        const start = new Date(booking.checkin + 'T00:00:00');
        const end = new Date(booking.checkout + 'T00:00:00');
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return nights > 0 ? nights : 0;
    }

    function buildAdminStatus(message) {
        return `<div class="admin-dashboard-status">${escapeAdminHtml(message)}</div>`;
    }

    async function fetchAdminJson(path) {
        const response = await apiFetch(path);
        if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
        return response.json();
    }

    function renderAdminUser(user) {
        const status = user.status || 'Activo';
        return `
            <div class="verification-item">
                <img src="${escapeAdminHtml(user.avatar || fallbackAvatar)}" alt="${escapeAdminHtml(user.name)}" class="verification-avatar">
                <div class="verification-details">
                    <h4>${escapeAdminHtml(user.name || 'Usuario')}</h4>
                    <p>${escapeAdminHtml(user.email || 'Sin email')} · ${escapeAdminHtml(user.role || 'sin rol')}</p>
                </div>
                <div class="verification-actions">
                    <span class="user-status active">${escapeAdminHtml(status)}</span>
                </div>
            </div>
        `;
    }

    function renderAdminProperty(property, usersById) {
        const owner = usersById.get(property.ownerId);
        const status = property.status || 'Sin estado';
        return `
            <div class="flagged-item">
                <img src="${escapeAdminHtml(property.image || fallbackImage)}" alt="${escapeAdminHtml(property.title)}" class="flagged-image">
                <div class="flagged-details">
                    <h4>${escapeAdminHtml(property.title || 'Propiedad')}</h4>
                    <p>Dueño: ${escapeAdminHtml(owner?.name || property.ownerId || 'Sin dueño')}</p>
                    <span class="flagged-reason">${escapeAdminHtml(property.location || 'Sin ubicación')} · ${escapeAdminHtml(formatAdminMoney(property.price))}/noche · ${escapeAdminHtml(status)}</span>
                </div>
                <div class="flagged-actions">
                    <a href="property-detail.html?id=${encodeURIComponent(property.id)}" class="btn-outline-sm">Ver</a>
                </div>
            </div>
        `;
    }

    function getAdminBookingTotal(booking, property) {
        if (booking.total) return Number(booking.total);
        const nights = getAdminNights(booking);
        return nights && property?.price ? nights * Number(property.price) : 0;
    }

    function renderAdminBooking(booking, propertiesById, usersById) {
        const property = propertiesById.get(normalizeAdminPropertyId(booking.propertyId));
        const tenant = usersById.get(booking.tenantId);
        const title = booking.title || property?.title || booking.propertyId || 'Propiedad';
        const tenantLabel = booking.tenantId || tenant?.id || 'Sin huésped';
        const total = getAdminBookingTotal(booking, property);
        const status = booking.status || 'Pendiente';
        const statusClass = status.toLowerCase().includes('confirm') ? 'urgent' : 'pending';
        return `
            <div class="dispute-item">
                <div class="dispute-header">
                    <span class="dispute-id">Reserva ${escapeAdminHtml(booking.id || 'sin ID')}</span>
                    <span class="dispute-status ${statusClass}">${escapeAdminHtml(status)}</span>
                </div>
                <div class="dispute-parties">
                    <span class="party">${escapeAdminHtml(title)}</span>
                    <span class="vs">·</span>
                    <span class="party">Tenant: ${escapeAdminHtml(tenantLabel)}</span>
                </div>
                <p class="dispute-issue">${escapeAdminHtml(formatAdminDate(booking.checkin))} - ${escapeAdminHtml(formatAdminDate(booking.checkout))} · Total: ${escapeAdminHtml(formatAdminMoney(total))}</p>
            </div>
        `;
    }

    function updateAdminStats(users, properties, bookings, propertiesById) {
        const estimatedRevenue = bookings.reduce((sum, booking) => {
            const property = propertiesById.get(normalizeAdminPropertyId(booking.propertyId));
            return sum + getAdminBookingTotal(booking, property);
        }, 0);

        if (totalUsersStat) totalUsersStat.textContent = users.length;
        if (totalPropertiesStat) totalPropertiesStat.textContent = properties.length;
        if (totalBookingsStat) totalBookingsStat.textContent = bookings.length;
        if (estimatedRevenueStat) estimatedRevenueStat.textContent = formatAdminMoney(estimatedRevenue);
        if (usersCount) usersCount.textContent = `${users.length} usuarios`;
        if (propertiesCount) propertiesCount.textContent = `${properties.length} propiedades`;
        if (bookingsCount) bookingsCount.textContent = `${bookings.length} reservas`;
    }

    async function loadAdminDashboard() {
        if (usersList) usersList.innerHTML = buildAdminStatus('Cargando usuarios...');
        if (propertiesList) propertiesList.innerHTML = buildAdminStatus('Cargando propiedades...');
        if (bookingsList) bookingsList.innerHTML = buildAdminStatus('Cargando reservas...');

        try {
            const [usersResult, propertiesResult, bookingsResult] = await Promise.all([
                fetchAdminJson('/auth/users'),
                fetchAdminJson('/properties'),
                fetchAdminJson('/bookings')
            ]);
            const users = getAdminArray(usersResult, 'users');
            const properties = getAdminArray(propertiesResult, 'properties');
            const bookings = getAdminArray(bookingsResult, 'bookings');
            const usersById = new Map(users.map((user) => [user.id, user]));
            const propertiesById = new Map(properties.map((property) => [normalizeAdminPropertyId(property.id), property]));

            updateAdminStats(users, properties, bookings, propertiesById);

            if (usersList) {
                usersList.innerHTML = users.length
                    ? users.map(renderAdminUser).join('')
                    : buildAdminStatus('No hay usuarios para mostrar.');
            }

            if (propertiesList) {
                propertiesList.innerHTML = properties.length
                    ? properties.map((property) => renderAdminProperty(property, usersById)).join('')
                    : buildAdminStatus('No hay propiedades para mostrar.');
            }

            if (bookingsList) {
                bookingsList.innerHTML = bookings.length
                    ? bookings.map((booking) => renderAdminBooking(booking, propertiesById, usersById)).join('')
                    : buildAdminStatus('No hay reservas para mostrar.');
            }
        } catch (error) {
            console.error('Error cargando panel admin:', error);
            if (usersList) usersList.innerHTML = buildAdminStatus('No se pudieron cargar los usuarios.');
            if (propertiesList) propertiesList.innerHTML = buildAdminStatus('No se pudieron cargar las propiedades.');
            if (bookingsList) bookingsList.innerHTML = buildAdminStatus('No se pudieron cargar las reservas.');
        }
    }

    loadAdminDashboard();
});

/*
 * Create Property - Publish owner properties through backend
 */
document.addEventListener('DOMContentLoaded', function() {
    const createPropertyForm = document.getElementById('createPropertyForm');
    if (!createPropertyForm) return;

    const submitButton = document.getElementById('createPropertySubmit');
    const message = document.getElementById('createPropertyMessage');

    function showCreatePropertyMessage(text) {
        if (!message) return;
        message.textContent = text;
        message.classList.add('visible');
    }

    function clearCreatePropertyMessage() {
        if (!message) return;
        message.textContent = '';
        message.classList.remove('visible');
    }

    function getCreatePropertyValue(id) {
        return document.getElementById(id)?.value.trim() || '';
    }

    function getCreatePropertyNumber(id) {
        return Number(getCreatePropertyValue(id));
    }

    function getSelectedAmenities() {
        return Array.from(createPropertyForm.querySelectorAll('input[name="amenities"]:checked'))
            .map((checkbox) => checkbox.value);
    }

    function validateCreateProperty(payload) {
        if (!payload.title || !payload.location || !payload.city || !payload.country || !payload.description?.[0]) {
            return false;
        }

        if (!payload.type || !payload.image) {
            return false;
        }

        return payload.price > 0 && payload.maxGuests > 0 && payload.bedrooms >= 0 && payload.bathrooms > 0;
    }

    createPropertyForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        clearCreatePropertyMessage();

        const user = getStoredUser();
        if (!user?.id) {
            window.location.href = 'login.html';
            return;
        }

        if (normalizeSessionRole(user.role) !== 'owner') {
            window.location.href = getDashboardLink(user.role).href;
            return;
        }

        const payload = {
            title: getCreatePropertyValue('propertyTitle'),
            location: getCreatePropertyValue('propertyLocation'),
            city: getCreatePropertyValue('propertyCity'),
            country: getCreatePropertyValue('propertyCountry'),
            description: [getCreatePropertyValue('propertyDescription')],
            price: getCreatePropertyNumber('propertyPrice'),
            currency: 'MXN',
            type: getCreatePropertyValue('propertyType'),
            maxGuests: getCreatePropertyNumber('propertyGuests'),
            bedrooms: getCreatePropertyNumber('propertyBedrooms'),
            bathrooms: getCreatePropertyNumber('propertyBathrooms'),
            amenities: getSelectedAmenities(),
            image: getCreatePropertyValue('propertyImage'),
            gallery: [getCreatePropertyValue('propertyImage')],
            status: getCreatePropertyValue('propertyStatus') || 'active',
            ownerId: user.id,
            host: {
                name: user.name || 'Anfitrion',
                verified: false,
                avatar: user.avatar || ''
            }
        };

        if (!validateCreateProperty(payload)) {
            showCreatePropertyMessage('Por favor completa todos los campos requeridos.');
            return;
        }

        const originalButtonHtml = submitButton?.innerHTML;
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Publicando...';
        }

        try {
            const response = await apiFetch('/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => null);
            if (!response.ok || !result?.success) {
                throw new Error(result?.message || 'Create property failed');
            }

            window.location.href = 'owner-dashboard.html';
        } catch (error) {
            console.error('Error publicando propiedad:', error);
            showCreatePropertyMessage('No pudimos publicar la propiedad. Verifica los datos e intenta nuevamente.');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHtml;
            }
        }
    });
});
