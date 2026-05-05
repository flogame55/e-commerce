AOS.init({
	duration: 800,
	easing: 'slide'
});


(function ($) {

	"use strict";

	var isMobile = {
		Android: function () {
			return navigator.userAgent.match(/Android/i);
		},
		BlackBerry: function () {
			return navigator.userAgent.match(/BlackBerry/i);
		},
		iOS: function () {
			return navigator.userAgent.match(/iPhone|iPad|iPod/i);
		},
		Opera: function () {
			return navigator.userAgent.match(/Opera Mini/i);
		},
		Windows: function () {
			return navigator.userAgent.match(/IEMobile/i);
		},
		any: function () {
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
		}
	};


	$(window).stellar({
		responsive: true,
		parallaxBackgrounds: true,
		parallaxElements: true,
		horizontalScrolling: false,
		hideDistantElements: false,
		scrollProperty: 'scroll'
	});


	var fullHeight = function () {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function () {
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	// loader
	var loader = function () {
		setTimeout(function () {
			if ($('#ftco-loader').length > 0) {
				$('#ftco-loader').removeClass('show');
			}
		}, 1);
	};
	loader();

	// Scrollax
	$.Scrollax();

	var carousel = function () {
		$('.home-slider').owlCarousel({
			loop: true,
			autoplay: true,
			margin: 0,
			animateOut: 'fadeOut',
			animateIn: 'fadeIn',
			nav: false,
			autoplayHoverPause: false,
			items: 1,
			navText: ["<span class='ion-md-arrow-back'></span>", "<span class='ion-chevron-right'></span>"],
			responsive: {
				0: {
					items: 1
				},
				600: {
					items: 1
				},
				1000: {
					items: 1
				}
			}
		});

		$('.carousel-testimony').owlCarousel({
			center: true,
			loop: true,
			items: 1,
			margin: 30,
			stagePadding: 0,
			nav: false,
			navText: ['<span class="ion-ios-arrow-back">', '<span class="ion-ios-arrow-forward">'],
			responsive: {
				0: {
					items: 1
				},
				600: {
					items: 3
				},
				1000: {
					items: 3
				}
			}
		});

	};
	carousel();

	$('nav .dropdown').hover(function () {
		var $this = $(this);
		// 	 timer;
		// clearTimeout(timer);
		$this.addClass('show');
		$this.find('> a').attr('aria-expanded', true);
		// $this.find('.dropdown-menu').addClass('animated-fast fadeInUp show');
		$this.find('.dropdown-menu').addClass('show');
	}, function () {
		var $this = $(this);
		// timer;
		// timer = setTimeout(function(){
		$this.removeClass('show');
		$this.find('> a').attr('aria-expanded', false);
		// $this.find('.dropdown-menu').removeClass('animated-fast fadeInUp show');
		$this.find('.dropdown-menu').removeClass('show');
		// }, 100);
	});


	$('#dropdown04').on('show.bs.dropdown', function () {
		console.log('show');
	});

	// scroll
	var scrollWindow = function () {
		$(window).scroll(function () {
			var $w = $(this),
				st = $w.scrollTop(),
				navbar = $('.ftco_navbar'),
				sd = $('.js-scroll-wrap');

			if (st > 150) {
				if (!navbar.hasClass('scrolled')) {
					navbar.addClass('scrolled');
				}
			}
			if (st < 150) {
				if (navbar.hasClass('scrolled')) {
					navbar.removeClass('scrolled sleep');
				}
			}
			if (st > 350) {
				if (!navbar.hasClass('awake')) {
					navbar.addClass('awake');
				}

				if (sd.length > 0) {
					sd.addClass('sleep');
				}
			}
			if (st < 350) {
				if (navbar.hasClass('awake')) {
					navbar.removeClass('awake');
					navbar.addClass('sleep');
				}
				if (sd.length > 0) {
					sd.removeClass('sleep');
				}
			}
		});
	};
	scrollWindow();


	var counter = function () {

		$('#section-counter').waypoint(function (direction) {

			if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {

				var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',')
				$('.number').each(function () {
					var $this = $(this),
						num = $this.data('number');
					console.log(num);
					$this.animateNumber(
						{
							number: num,
							numberStep: comma_separator_number_step
						}, 7000
					);
				});

			}

		}, { offset: '95%' });

	}
	counter();

	var contentWayPoint = function () {
		var i = 0;
		$('.ftco-animate').waypoint(function (direction) {

			if (direction === 'down' && !$(this.element).hasClass('ftco-animated')) {

				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function () {

					$('body .ftco-animate.item-animate').each(function (k) {
						var el = $(this);
						setTimeout(function () {
							var effect = el.data('animate-effect');
							if (effect === 'fadeIn') {
								el.addClass('fadeIn ftco-animated');
							} else if (effect === 'fadeInLeft') {
								el.addClass('fadeInLeft ftco-animated');
							} else if (effect === 'fadeInRight') {
								el.addClass('fadeInRight ftco-animated');
							} else {
								el.addClass('fadeInUp ftco-animated');
							}
							el.removeClass('item-animate');
						}, k * 50, 'easeInOutExpo');
					});

				}, 100);

			}

		}, { offset: '95%' });
	};
	contentWayPoint();


	// navigation
	var OnePageNav = function () {
		$(".smoothscroll[href^='#'], #ftco-nav ul li a[href^='#']").on('click', function (e) {
			e.preventDefault();

			var hash = this.hash,
				navToggler = $('.navbar-toggler');
			$('html, body').animate({
				scrollTop: $(hash).offset().top
			}, 700, 'easeInOutExpo', function () {
				window.location.hash = hash;
			});


			if (navToggler.is(':visible')) {
				navToggler.click();
			}
		});
		$('body').on('activate.bs.scrollspy', function () {
			console.log('nice');
		})
	};
	OnePageNav();


	// magnific popup
	$('.image-popup').magnificPopup({
		type: 'image',
		closeOnContentClick: true,
		closeBtnInside: false,
		fixedContentPos: true,
		mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
		gallery: {
			enabled: true,
			navigateByImgClick: true,
			preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
		},
		image: {
			verticalFit: true
		},
		zoom: {
			enabled: true,
			duration: 300 // don't foget to change the duration also in CSS
		}
	});

	$('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
		disableOn: 700,
		type: 'iframe',
		mainClass: 'mfp-fade',
		removalDelay: 160,
		preloader: false,

		fixedContentPos: false
	});



	var goHere = function () {

		$('.mouse-icon').on('click', function (event) {

			event.preventDefault();

			$('html,body').animate({
				scrollTop: $('.goto-here').offset().top
			}, 500, 'easeInOutExpo');

			return false;
		});
	};
	goHere();


	function makeTimer() {

		var endTime = new Date("21 December 2019 9:56:00 GMT+01:00");
		endTime = (Date.parse(endTime) / 1000);

		var now = new Date();
		now = (Date.parse(now) / 1000);

		var timeLeft = endTime - now;

		var days = Math.floor(timeLeft / 86400);
		var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
		var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600)) / 60);
		var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));

		if (hours < "10") { hours = "0" + hours; }
		if (minutes < "10") { minutes = "0" + minutes; }
		if (seconds < "10") { seconds = "0" + seconds; }

		$("#days").html(days + "<span>Days</span>");
		$("#hours").html(hours + "<span>Hours</span>");
		$("#minutes").html(minutes + "<span>Minutes</span>");
		$("#seconds").html(seconds + "<span>Seconds</span>");

	}

	setInterval(function () { makeTimer(); }, 1000);



})(jQuery);

/* ==========================================================================
   CORE E-COMMERCE LOGIC (FETCH, SEARCH, FILTER, CART)
   ========================================================================== */

// 1. GLOBAL STATE[cite: 3, 4]
const API_URL = 'http://localhost:3000/api/products';
let allProducts = []; // Master list from Backend/Database
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Persistent Cart

// 2. INITIALIZATION ON PAGE LOAD
document.addEventListener('DOMContentLoaded', () => {
	requestProducts();
	updateCartUI();
	if (document.querySelector('.cart-list')) {
		renderCartTable();
	}
	if (document.querySelector('.billing-form')) {
		renderCheckoutSummary();
	}
});

// 3. BACKEND COMMUNICATION
async function requestProducts() {
	try {
		const response = await fetch('http://localhost:3000/api/products');
		allProducts = await response.json();
		renderUI(allProducts);
	} catch (error) {
		console.error("Load error:", error);
	}
}

/* --- HELPER: Logic for Inventory Visual Cues --- */
function getStockColor(quantity) {
	if (quantity === 0) return 'text-muted'; // Gray for empty
	if (quantity < 5) return 'text-danger';  // Red for < 5
	if (quantity < 15) return 'text-warning'; // Yellow/Orange for < 15
	return 'text-success'; // Normal green for plenty of stock
}

/* --- THE UI RENDERER (Updated with UX/UI Color Logic) --- */
function renderUI(products) {
	const container = document.querySelector('#product-container');
	if (!container) return;

	container.innerHTML = '';

	if (products.length === 0) {
		container.innerHTML = '<div class="col-12 text-center"><h3>No products found.</h3></div>';
		return;
	}

	const html = products.map(p => {
		// Determine the Bootstrap color class based on our new logic[cite: 5]
		const stockClass = getStockColor(p.quantity);
		const stockText = p.quantity === 0 ? "Out of Stock" : `Stock: ${p.quantity} left`;

		return `
            <div class="col-md-6 col-lg-3">
                <div class="product">
                    <a href="#" class="img-prod">
                        <img class="img-fluid" src="${p.image}" alt="${p.name}">
                    </a>
                    <div class="text py-3 pb-4 px-3 text-center">
                        <h3><a href="#">${p.name}</a></h3>
                        <div class="pricing">
                            <p class="price"><span>$${Number(p.price).toFixed(2)}</span></p>
                        </div>
                        
                        <!-- UPDATED UX/UI: Inventory Info with dynamic colors -->
                        <div class="inventory-info mb-3">
                            <span class="${stockClass}" style="font-weight: bold;">
                                ${stockText}
                            </span>
                        </div>

                        <div class="bottom-area d-flex px-3">
                            <div class="m-auto d-flex">
                                <!-- Disable button if out of stock for better UX -->
                                <a href="#" class="add-to-cart d-flex justify-content-center align-items-center text-center ${p.quantity === 0 ? 'disabled' : ''}" data-id="${p.id}">
                                    <span><i class="ion-ios-cart"></i></span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
	}).join('');

	container.innerHTML = html;
}

// 5. SEARCH LOGIC (Real-time)
// 1. Target the search input by its ID
const searchInput = document.querySelector('#search-item');

if (searchInput) {
	searchInput.addEventListener('input', (e) => {
		// 2. Get the current text, make it lowercase, and remove extra spaces
		const searchTerm = e.target.value.toLowerCase().trim();

		// 3. Filter the master list 'allProducts' we fetched from Express
		const filteredResults = allProducts.filter(product => {
			return product.name.toLowerCase().includes(searchTerm);
		});

		// 4. Update the UI with only the matches
		// If the search is empty, it will automatically show allProducts again
		renderUI(filteredResults);

		// Optional: Show "No results" if nothing matches
		const container = document.querySelector('#product-container');
		if (filteredResults.length === 0 && container) {
			container.innerHTML = `<div class="col-12 text-center">
                                      <h3>No products found for "${searchTerm}"</h3>
                                   </div>`;
		}
	});
}

/* --- THE LOGIC FLOW: CATEGORY FILTER --- */
const categoryContainer = document.querySelector('.product-category');
if (categoryContainer) {
	const categoryLinks = categoryContainer.querySelectorAll('a');
	categoryLinks.forEach(link => {
		link.addEventListener('click', async (e) => {
			e.preventDefault();

			// UI: Update active highlight
			categoryLinks.forEach(l => l.classList.remove('active'));
			link.classList.add('active');

			// 1. TRIGGER: Get category from HTML data attribute[cite: 5]
			const category = link.getAttribute('data-category');

			// 2. REQUEST: Send Envelope to Server
			try {
				const response = await fetch(`http://localhost:3000/api/products/filter?category=${category}`);
				if (!response.ok) throw new Error("Gatekeeper rejected request");

				// 4. RESPONSE: Receive the Package (JSON)
				const filteredData = await response.json();

				// 4. UPDATE UI: Call the renderer with the new data[cite: 3]
				renderUI(filteredData);
			} catch (error) {
				console.error("Filter error:", error);
			}
		});
	});
}

// 7. CART ACTIONS (Add & Delete)[cite: 3, 4]

// Delegation for Add to Cart (Shop Page)
const prodContainer = document.querySelector('#product-container');
if (prodContainer) {
	prodContainer.addEventListener('click', (e) => {
		const btn = e.target.closest('.add-to-cart');
		if (btn) {
			e.preventDefault();
			const id = Number(btn.getAttribute('data-id'));
			addToCart(id);
		}
	});
}

function addToCart(id) {
	const existing = cart.find(item => item.id === id);
	if (existing) {
		existing.quantity += 1;
	} else {
		const productData = allProducts.find(p => p.id === id);
		if (productData) {
			cart.push({ ...productData, quantity: 1 });
		}
	}
	saveAndSync();
}

function deleteItem(id) {
	cart = cart.filter(item => item.id !== id);
	saveAndSync();
	renderCartTable(); // Refresh table immediately
}

function saveAndSync() {
	localStorage.setItem('cart', JSON.stringify(cart));
	updateCartUI();
}

// 8. UI RENDERER: CART TABLE (cart.html)
function renderCartTable() {
	const tableBody = document.querySelector('.cart-list tbody');
	if (!tableBody) return; // Exit if not on cart.html

	if (cart.length === 0) {
		tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Your cart is empty</td></tr>';
		updateCartTotals();
		return;
	}

	tableBody.innerHTML = cart.map(item => `
        <tr class="text-center">
            <td class="product-remove">
                <a href="#" class="remove-btn" data-id="${item.id}">
                    <span class="ion-ios-close"></span>
                </a>
            </td>
            <td class="image-prod"><div class="img" style="background-image:url(${item.image});"></div></td>
            <td class="product-name"><h3>${item.name}</h3></td>
            <td class="price">$${item.price.toFixed(2)}</td>
            <td class="quantity">
                <input type="number" class="form-control cart-quantity-input" data-id="${item.id}" value="${item.quantity}" min="1" style="width: 80px; margin: 0 auto; text-align: center;">
            </td>
            <td class="total">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

	if (typeof updateCartTotals === 'function') updateCartTotals();
}

// Delegation for Delete from Cart (Cart Page)
const cartTable = document.querySelector('.cart-list');
if (cartTable) {
	cartTable.addEventListener('click', (e) => {
		const btn = e.target.closest('.remove-btn');
		if (btn) {
			e.preventDefault();
			const id = Number(btn.getAttribute('data-id'));
			deleteItem(id);
		}
	});

	cartTable.addEventListener('change', (e) => {
		if (e.target.classList.contains('cart-quantity-input')) {
			const id = Number(e.target.getAttribute('data-id'));
			const newQuantity = Number(e.target.value);

			if (newQuantity > 0) {
				const item = cart.find(i => i.id === id);
				if (item) {
					item.quantity = newQuantity;
					saveAndSync();
					renderCartTable(); // Refresh table immediately to update totals
				}
			} else {
				e.target.value = 1; // Prevent zero or negative quantities
				const item = cart.find(i => i.id === id);
				if (item) {
					item.quantity = 1;
					saveAndSync();
					renderCartTable();
				}
			}
		}
	});
}

// 9. NAVBAR UI UPDATE
function updateCartUI() {
	const totalCount = cart.reduce((total, item) => total + item.quantity, 0);
	const badge = document.querySelector('.icon-shopping_cart');
	if (badge && badge.parentElement) {
		badge.parentElement.innerHTML = `<span class="icon-shopping_cart"></span>[${totalCount}]`;
	}
}

// 9.5 CART PAGE TOTALS UPDATE (cart.html)
function updateCartTotals() {
	const subtotalEl = document.getElementById('cart-subtotal');
	const deliveryEl = document.getElementById('cart-delivery');
	const taxEl = document.getElementById('cart-discount'); // Repurposing discount span for tax
	const totalEl = document.getElementById('cart-final-total');

	if (!subtotalEl) return;

	let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
	let delivery = subtotal > 0 ? 5.00 : 0.00;
	let tax = subtotal * 0.08;
	let total = subtotal + delivery + tax;

	subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
	if (deliveryEl) deliveryEl.innerText = `$${delivery.toFixed(2)}`;
	
	if (taxEl) {
		const label = taxEl.previousElementSibling;
		if (label) label.innerText = 'Tax (8%)';
		taxEl.innerText = `$${tax.toFixed(2)}`;
	}

	if (totalEl) totalEl.innerText = `$${total.toFixed(2)}`;
}

// 10. CHECKOUT SUMMARY RENDERER (checkout.html)
function renderCheckoutSummary() {
	const checkoutContainer = document.querySelector('.cart-detail.cart-total');
	if (!checkoutContainer) return; // Exit if not on checkout.html

	let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
	let delivery = subtotal > 0 ? 5.00 : 0.00; // Mock delivery fee
	let tax = subtotal * 0.08; // Mock tax (8%)
	let total = subtotal + delivery + tax;

	let productListHTML = cart.length > 0 ? cart.map(item => `
        <p class="d-flex">
            <span>${item.name} <span style="color: #999;">(x${item.quantity})</span></span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </p>
    `).join('') : '<p class="text-center">Your cart is empty.</p>';

	checkoutContainer.innerHTML = `
        <h3 class="billing-heading mb-4">Cart Total</h3>
		<div class="product-list mb-4">
			<h4 class="mb-3" style="font-size: 18px;">Product List</h4>
			${productListHTML}
		</div>
		<hr>
        <p class="d-flex">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
        </p>
        <p class="d-flex">
            <span>Delivery</span>
            <span>$${delivery.toFixed(2)}</span>
        </p>
        <p class="d-flex">
            <span>Tax (8%)</span>
            <span>$${tax.toFixed(2)}</span>
        </p>
        <hr>
        <p class="d-flex total-price">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </p>
    `;
}



// Start the app
requestProducts();
updateCartUI();
