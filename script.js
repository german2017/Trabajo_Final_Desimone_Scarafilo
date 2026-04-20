/**
 * Alquileres - Home Page JavaScript
 * Premium startup-quality interactions
 */

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
                this.closest('.search-input-group').classList.add('focused');
            });
            input.addEventListener('blur', function() {
                this.closest('.search-input-group').classList.remove('focused');
            });
        }
    });

    if (searchBtn) {
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
            const checkin = checkinInput.value;
            const checkout = checkoutInput.value;
            
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
    destinationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });

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
    
    // Update property card links to use current search bar values
    const propertyLinks = document.querySelectorAll('.results-grid .property-link');
    propertyLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Get current values from search bar
            const currentDestination = searchDestination.value.trim() || 'Ciudad+de+México';
            const currentCheckin = searchCheckin.value || '2026-04-20';
            const currentCheckout = searchCheckout.value || '2026-04-25';
            
            // Build new href with current values
            const baseUrl = this.href.split('?')[0];
            const params = new URLSearchParams();
            
            // Extract property ID from current href
            const currentParams = new URLSearchParams(this.href.split('?')[1] || '');
            const propertyId = currentParams.get('id') || '1';
            
            params.set('id', propertyId);
            params.set('destination', currentDestination);
            params.set('checkin', currentCheckin);
            params.set('checkout', currentCheckout);
            
            this.href = baseUrl + '?' + params.toString();
        });
    });
    
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
    
    if (!bookingCheckin) return; // Not on property detail page
    
    // Read query parameters from URL
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get('id');
    const destination = params.get('destination');
    const checkin = params.get('checkin');
    const checkout = params.get('checkout');
    
    // Default pricing values (for this specific property - Apartment in Polanco)
    const nightlyPrice = 1850;
    const cleaningPrice = 500;
    const serviceFeePercent = 0.10; // 10% service fee
    const depositAmount = 3700;
    
    // Helper function to calculate nights between dates
    function calculateNights(checkinDate, checkoutDate) {
        if (!checkinDate || !checkoutDate) return 5; // Default 5 nights
        const start = new Date(checkinDate + 'T00:00:00');
        const end = new Date(checkoutDate + 'T00:00:00');
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 5; // Default to 5 if invalid
    }
    
    // Helper function to format number with commas
    function formatPrice(num) {
        return '$' + num.toLocaleString('es-MX');
    }
    
    // Helper function to format date for display
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        return date.getDate() + ' ' + months[date.getMonth()];
    }
    
    // Prefill date inputs if query params exist
    if (checkin) {
        bookingCheckin.value = checkin;
    }
    if (checkout) {
        bookingCheckout.value = checkout;
    }
    
    // Calculate and update pricing
    const nights = calculateNights(bookingCheckin.value, bookingCheckout.value);
    const subtotal = nightlyPrice * nights;
    const calculatedServiceFee = Math.round(subtotal * serviceFeePercent);
    const total = subtotal + cleaningPrice + calculatedServiceFee + depositAmount;
    
    // Update price breakdown
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
    
    // Add event listeners to recalculate when dates change
    bookingCheckin.addEventListener('change', function() {
        const newNights = calculateNights(bookingCheckin.value, bookingCheckout.value);
        const newSubtotal = nightlyPrice * newNights;
        const newServiceFee = Math.round(newSubtotal * serviceFeePercent);
        const newTotal = newSubtotal + cleaningPrice + newServiceFee + depositAmount;
        
        if (priceNights) {
            priceNights.innerHTML = `<span>${formatPrice(nightlyPrice)} x ${newNights} noches</span><span>${formatPrice(newSubtotal)}</span>`;
        }
        if (serviceFee) {
            serviceFee.textContent = formatPrice(newServiceFee);
        }
        if (priceTotal) {
            priceTotal.innerHTML = `<span>Total</span><span>${formatPrice(newTotal)}</span>`;
        }
    });
    
    bookingCheckout.addEventListener('change', function() {
        const newNights = calculateNights(bookingCheckin.value, bookingCheckout.value);
        const newSubtotal = nightlyPrice * newNights;
        const newServiceFee = Math.round(newSubtotal * serviceFeePercent);
        const newTotal = newSubtotal + cleaningPrice + newServiceFee + depositAmount;
        
        if (priceNights) {
            priceNights.innerHTML = `<span>${formatPrice(nightlyPrice)} x ${newNights} noches</span><span>${formatPrice(newSubtotal)}</span>`;
        }
        if (serviceFee) {
            serviceFee.textContent = formatPrice(newServiceFee);
        }
        if (priceTotal) {
            priceTotal.innerHTML = `<span>Total</span><span>${formatPrice(newTotal)}</span>`;
        }
    });
    
    console.log('Alquileres - Property detail page initialized:', {
        propertyId: propertyId || 'default',
        destination: destination || 'default',
        checkin: checkin || 'default',
        checkout: checkout || 'default',
        nights: nights,
        total: total
    });
    
    // Update reserve button with query parameters
    const reserveBtn = document.getElementById('reserve-btn');
    const bookingGuests = document.getElementById('booking-guests');
    
    if (reserveBtn) {
        // Function to build the booking URL with current values
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
            params.set('title', 'Apartamento moderno en Polanco');
            params.set('checkin', checkinVal);
            params.set('checkout', checkoutVal);
            params.set('guests', guestsVal);
            params.set('nights', currentNights);
            params.set('price', nightlyPrice);
            params.set('total', currentTotal);
            
            return 'booking.html?' + params.toString();
        }
        
        // Set initial href
        reserveBtn.href = buildBookingUrl();
        
        // Update href when dates or guests change
        bookingCheckin.addEventListener('change', function() {
            reserveBtn.href = buildBookingUrl();
        });
        
        bookingCheckout.addEventListener('change', function() {
            reserveBtn.href = buildBookingUrl();
        });
        
        if (bookingGuests) {
            bookingGuests.addEventListener('change', function() {
                reserveBtn.href = buildBookingUrl();
            });
        }
    }
});

/**
 * Booking Page - Handle query parameters and display reservation summary
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the booking page
    const bookingPageTitle = document.querySelector('.booking-page-title');
    if (!bookingPageTitle) return; // Not on booking page
    
    // Read query parameters from URL
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get('id');
    const propertyTitle = params.get('title');
    const checkin = params.get('checkin');
    const checkout = params.get('checkout');
    const guests = params.get('guests');
    const nights = params.get('nights');
    const nightlyPrice = parseInt(params.get('price')) || 1850;
    const total = parseInt(params.get('total')) || 14375;
    
    // Default values
    const cleaningFee = 500;
    const serviceFee = Math.round((nightlyPrice * (parseInt(nights) || 5)) * 0.10);
    const deposit = 3700;
    
    // Helper function to format date for display
    function formatDateFull(dateStr) {
        if (!dateStr) return '20 de abril de 2026';
        const date = new Date(dateStr + 'T00:00:00');
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    }
    
    // Helper function to format price
    function formatPrice(num) {
        return '$' + (num || 0).toLocaleString('es-MX');
    }
    
    // Update property summary title
    const summaryTitle = document.querySelector('.summary-details h3');
    if (summaryTitle && propertyTitle) {
        summaryTitle.textContent = decodeURIComponent(propertyTitle);
    }
    
    // Update trip dates
    const dateValues = document.querySelectorAll('.date-block .date-value');
    if (dateValues.length >= 2) {
        if (checkin) {
            dateValues[0].textContent = formatDateFull(checkin);
        }
        if (checkout) {
            dateValues[1].textContent = formatDateFull(checkout);
        }
    }
    
    // Update guests
    const guestsValue = document.querySelector('.trip-guests .date-value');
    if (guestsValue && guests) {
        guestsValue.textContent = `${guests} huésped${parseInt(guests) > 1 ? 'es' : ''}`;
    }
    
    // Update pricing in the price box
    const priceBoxNights = document.querySelector('.price-box-row:nth-child(1)');
    const priceBoxCleaning = document.querySelector('.price-box-row:nth-child(2)');
    const priceBoxService = document.querySelector('.price-box-row:nth-child(3)');
    const priceBoxDeposit = document.querySelector('.price-box-row:nth-child(4)');
    const priceBoxTotal = document.querySelector('.price-box-total');
    
    const numNights = parseInt(nights) || 5;
    const subtotal = nightlyPrice * numNights;
    
    if (priceBoxNights) {
        priceBoxNights.innerHTML = `<span>${formatPrice(nightlyPrice)} x ${numNights} noches</span><span>${formatPrice(subtotal)}</span>`;
    }
    if (priceBoxCleaning) {
        priceBoxCleaning.innerHTML = `<span>Tarifa de limpieza</span><span>${formatPrice(cleaningFee)}</span>`;
    }
    if (priceBoxService) {
        priceBoxService.innerHTML = `<span>Tarifa de servicio</span><span>${formatPrice(serviceFee)}</span>`;
    }
    if (priceBoxDeposit) {
        priceBoxDeposit.innerHTML = `<span>Depósito reembolsable</span><span>${formatPrice(deposit)}</span>`;
    }
    if (priceBoxTotal) {
        priceBoxTotal.innerHTML = `<span>Total</span><span>${formatPrice(total)}</span>`;
    }
    
    console.log('Alquileres - Booking page initialized:', {
        propertyId: propertyId || 'default',
        propertyTitle: propertyTitle || 'default',
        checkin: checkin || 'default',
        checkout: checkout || 'default',
        guests: guests || 'default',
        nights: nights || 'default',
        nightlyPrice: nightlyPrice,
        total: total
    });
});