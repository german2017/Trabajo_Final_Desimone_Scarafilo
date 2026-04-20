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
            params.set('location', 'Polanco, Ciudad de México');
            params.set('checkin', checkinVal);
            params.set('checkout', checkoutVal);
            params.set('guests', guestsVal);
            params.set('nights', currentNights);
            params.set('price', nightlyPrice);
            params.set('total', currentTotal);
            params.set('host', 'María González');
            
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
    const priceDetails = document.querySelector('.price-details');
    const priceTotal = document.querySelector('.price-total');
    
    const numNights = parseInt(nights) || 5;
    const subtotal = nightlyPrice * numNights;
    
    if (priceDetails) {
        const priceRows = priceDetails.querySelectorAll('.price-row');
        if (priceRows[0]) {
            priceRows[0].innerHTML = `<span class="price-label">${formatPrice(nightlyPrice)} x ${numNights} noches</span><span class="price-value">${formatPrice(subtotal)}</span>`;
        }
        if (priceRows[1]) {
            priceRows[1].innerHTML = `<span class="price-label">Tarifa de limpieza</span><span class="price-value">${formatPrice(cleaningFee)}</span>`;
        }
        if (priceRows[2]) {
            priceRows[2].innerHTML = `<span class="price-label">Tarifa de servicio</span><span class="price-value">${formatPrice(serviceFee)}</span>`;
        }
    }
    if (priceTotal) {
        const totalAmount = priceTotal.querySelector('.total-amount');
        if (totalAmount) {
            totalAmount.textContent = formatPrice(total);
        }
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
    
    // Handle confirm and pay button
    const confirmPayBtn = document.getElementById('confirm-pay-btn');
    
    if (confirmPayBtn) {
        confirmPayBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get form fields
            const firstName = document.getElementById('firstName');
            const lastName = document.getElementById('lastName');
            const email = document.getElementById('email');
            const cardName = document.getElementById('cardName');
            const cardNumber = document.getElementById('cardNumber');
            
            // Validation
            let errors = [];
            
            // Validate name (first + last)
            if (!firstName || !firstName.value.trim()) {
                errors.push('Nombre');
            }
            if (!lastName || !lastName.value.trim()) {
                errors.push('Apellido');
            }
            
            // Validate email
            if (!email || !email.value.trim()) {
                errors.push('Correo electrónico');
            } else if (!email.value.includes('@') || !email.value.includes('.')) {
                alert('Por favor, ingresa un correo electrónico válido.');
                email.focus();
                return;
            }
            
            // Validate card name
            if (!cardName || !cardName.value.trim()) {
                errors.push('Nombre en la tarjeta');
            }
            
            // Validate card number (basic check - at least 13 digits)
            if (!cardNumber || !cardNumber.value.trim()) {
                errors.push('Número de tarjeta');
            } else {
                // Remove spaces and check if it's numeric
                const cardDigits = cardNumber.value.replace(/\s/g, '');
                if (cardDigits.length < 13 || !/^\d+$/.test(cardDigits)) {
                    alert('Por favor, ingresa un número de tarjeta válido (13-19 dígitos).');
                    cardNumber.focus();
                    return;
                }
            }
            
            // Show error if any required fields are empty
            if (errors.length > 0) {
                alert('Por favor, completa los siguientes campos requeridos: ' + errors.join(', '));
                return;
            }
            
            // Generate mock reservation code
            const year = new Date().getFullYear();
            const randomNum = Math.floor(Math.random() * 90000) + 10000;
            const reservationCode = `ALQ-${year}-${randomNum}`;
            
            // Get property details from the page
            const propertyTitleEl = document.querySelector('.summary-details h3');
            const propertyTitle = propertyTitleEl ? propertyTitleEl.textContent : 'Apartamento moderno en Polanco';
            
            const locationEl = document.querySelector('.summary-location');
            const location = locationEl ? locationEl.textContent : 'Polanco, Ciudad de México';
            
            // Get dates from the page
            const dateValues = document.querySelectorAll('.date-block .date-value');
            const checkinDate = dateValues[0] ? dateValues[0].textContent : '';
            const checkoutDate = dateValues[1] ? dateValues[1].textContent : '';
            
            // Get guests
            const guestsEl = document.querySelector('.trip-guests .date-value');
            const guests = guestsEl ? guestsEl.textContent : '2 huéspedes';
            
            // Get total
            const totalEl = document.querySelector('.price-total .total-amount');
            const total = totalEl ? totalEl.textContent.replace(/[$,]/g, '') : '14375';
            
            // Get host name
            const hostEl = document.querySelector('.host-summary h4');
            const hostName = hostEl ? hostEl.textContent.replace('Anfitrión: ', '') : 'María González';
            
            // Build query parameters for booking-success.html
            const params = new URLSearchParams();
            params.set('id', propertyId || '1');
            params.set('title', encodeURIComponent(propertyTitle));
            params.set('location', encodeURIComponent(location));
            params.set('checkin', checkin || '2026-04-20');
            params.set('checkout', checkout || '2026-04-25');
            params.set('guests', guests || '2');
            params.set('nights', nights || '5');
            params.set('total', total);
            params.set('host', encodeURIComponent(hostName));
            params.set('code', reservationCode);
            
            // Redirect to booking-success.html
            window.location.href = 'booking-success.html?' + params.toString();
        });
    }
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