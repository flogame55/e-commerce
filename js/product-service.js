// ==========================================
// PRODUCT SERVICE
// Handles fetching products from JSON, applying filters/search, 
// pagination, and rendering the shop UI.
// ==========================================

let allProducts = [];
let currentFilteredProducts = [];
let currentCategory = 'All';
let currentPage = 1;
const itemsPerPage = 12;

/**
 * Starts the process of fetching product data from the server/JSON file.
 */
const requestProducts = () => {
    console.log("Sequence Start: Requesting product data...");
    fetchProducts('./data/products.json');
};

/**
 * Retrieves the product data from the provided JSON file path.
 */
const fetchProducts = (path) => {
    fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Data successfully fetched. Flowing to renderUI...");
            allProducts = data;
            setupFilters();
            applyFilters();
        })
        .catch(error => {
            console.error("Sequence Interrupted: Fetch error:", error);
            document.querySelector('#product-container').innerHTML =
                `<p class="text-danger">Error loading products. Please try again later.</p>`;
        });
};

/**
 * Attaches event listeners to the search form and category links.
 */
const setupFilters = () => {
    const searchForm = document.querySelector('#search-form');
    const searchInput = document.querySelector('#search-input');
    const categoryLinks = document.querySelectorAll('.product-category li a');

    const SEARCH_DELAY_MS = 1000;
    let debounceTimer;

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearTimeout(debounceTimer);
            applyFilters();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                applyFilters();
            }, SEARCH_DELAY_MS);
        });
    }

    if (categoryLinks) {
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                categoryLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                currentCategory = link.innerText;
                applyFilters();
            });
        });
    }
};

/**
 * Filters the master list based on category and search text.
 */
const applyFilters = () => {
    const searchInput = document.querySelector('#search-input');
    const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';

    currentFilteredProducts = allProducts.filter(product => {
        const matchesCategory = (currentCategory === 'All' || product.category === currentCategory);
        const matchesSearch = product.name.toLowerCase().includes(searchText);
        return matchesCategory && matchesSearch;
    });

    currentPage = 1;
    updateDisplay();
};

/**
 * Slices the filtered products array for the current page.
 */
const updateDisplay = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const productsToShow = currentFilteredProducts.slice(startIndex, endIndex);

    renderUI(productsToShow);
    renderPagination(currentFilteredProducts.length);
};

/**
 * Dynamically creates pagination buttons.
 */
const renderPagination = (totalItems) => {
    const paginationContainer = document.querySelector('#pagination-container ul');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return;

    if (currentPage > 1) {
        paginationContainer.insertAdjacentHTML('beforeend', `<li><a href="#" data-page="${currentPage - 1}">&lt;</a></li>`);
    }

    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationContainer.insertAdjacentHTML('beforeend', `<li class="active"><span>${i}</span></li>`);
        } else {
            paginationContainer.insertAdjacentHTML('beforeend', `<li><a href="#" data-page="${i}">${i}</a></li>`);
        }
    }

    if (currentPage < totalPages) {
        paginationContainer.insertAdjacentHTML('beforeend', `<li><a href="#" data-page="${currentPage + 1}">&gt;</a></li>`);
    }

    const pageLinks = paginationContainer.querySelectorAll('a[data-page]');
    pageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = parseInt(link.getAttribute('data-page'));
            updateDisplay();
            document.querySelector('#product-container').scrollIntoView({ behavior: 'smooth' });
        });
    });
};

/**
 * Generates the HTML to display products.
 */
const renderUI = (products) => {
    const container = document.querySelector('#product-container');
    if (!container) return;

    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<div class="col-md-12 text-center"><h3>No products found</h3></div>';
        return;
    }

    products.forEach(product => {
        const productHTML = `
            <div class="col-md-6 col-lg-3 ftco-animate fadeInUp ftco-animated">
                <div class="product">
                    <a href="#" class="img-prod">
                        <img class="img-fluid" src="${product.image}" alt="${product.name}">
                        <div class="overlay"></div>
                    </a>
                    <div class="text py-3 pb-4 px-3 text-center">
                        <h3><a href="#">${product.name}</a></h3>
                        <div class="pricing">
                            <p class="price"><span>$${product.price.toFixed(2)}</span></p>
                        </div>
                        <div class="bottom-area d-flex px-3">
                            <div class="m-auto d-flex">
                                <!-- Event Delegation ID -->
                                <a href="#" class="add-to-cart d-flex justify-content-center align-items-center text-center" data-id="${product.id}">
                                    <span><i class="ion-ios-cart"></i></span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', productHTML);
    });
};

/**
 * EVENT DELEGATION: Listen on the parent container for Add to Cart clicks
 */
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#product-container');
    if (container) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-to-cart');
            if (btn) {
                e.preventDefault();
                const productID = Number(btn.getAttribute('data-id'));
                if (typeof addToCart === 'function') {
                    addToCart(productID);
                } else {
                    console.error("CartService (addToCart) is not loaded!");
                }
            }
        });
    }

    // Auto start on page load
    requestProducts();
});
