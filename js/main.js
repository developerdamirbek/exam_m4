const bestSeller = document.querySelector(".best_seller__container");
const tab_content = document.querySelector(".tab_content");
const products_wrapper = document.querySelector(".products_wrapper");
const mobile_header__input = document.querySelector(".mobile_header__input");
const mobile_searchbar = document.querySelector(".mobile_searchbar");
const mobile_cart__link = document.querySelector(".mobile_cart__link");
const products_input = document.querySelector(".products_input");
const product_searchbar_content = document.querySelector(".product_searchbar_content");

const baseUrl = "http://localhost:3000";
const localStorageKey = 'selectedCategory';

const getProducts = async () => {
    try {
        const res = await fetch(`${baseUrl}/bestSeller`);
        const data = await res.json();

        return data;
    } catch (error) {
        console.error(error);
    }
}

const getSingleCategory = async (id) => {
    try {
        const res = await fetch(`${baseUrl}/products/${id}`);
        const data = await res.json();

        return data;
    } catch (error) {
        showToast(error);
    }
}

let searchData = [];

const renderProducts = async (id) => {
    const buttons = document.querySelectorAll(".tab_content > button");
    for (let i of buttons) {
        i.classList.remove("active");
    }
    buttons.forEach((item) => {
        if (item.dataset.id == id) {
            item.classList.add("active");
        }
    });
    const data = await getSingleCategory(id);
    searchData = [...data.products];
    products_wrapper.innerHTML = searchData?.map((item, index) => {
        const productRatingId = `productRating_${index}`;

        return `
            <div class="product_card">
                <div class="img_block">
                    <img class"img" src="${item.img}" alt="${item.title}">
                    <div class="hover_link">
                        <button data-id="${item.id}" class="liked_btn"></button>
                        <button data-id="${item.id}" class="add_btn"></button>
                    </div>
                </div>
                <div data-id="${item.id}" class="product_infos">
                <h3 class="product_title">${item.title}</h3>
                <div class="rating" id="${productRatingId}"></div>
                    <div class="prices_wrapper">
                        <p class="price">$${item.price}</p>
                        <div class="discount_wrapper">
                        <p class="disabled_price">$534,33</p>
                        <p class="product_discount">24% Off</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    searchData.forEach((item, index) => {
        const rating = 4; // Replace with the actual rating for each product
        const productRatingId = `productRating_${index}`;
        const ratingContainer = document.getElementById(productRatingId);

        for (let i = 0; i < 5; i++) {
            const star = document.createElement("span");
            star.innerHTML = i < rating ? "&#9733;" : "&#9734;";
            ratingContainer.appendChild(star);
        }
    });
};


mobile_header__input.addEventListener("keyup", (e) => {
    if (e.target.value) {
        mobile_searchbar.style.display = "flex";
        mobile_searchbar.innerHTML = searchData.filter((item) => item.title.toLowerCase().includes(e.target.value.toLowerCase())).map((item) => `
        <div data-id="${item.id}" class="search_item">
            <div class="search_img">
                <img src="${item.img}">
            </div>
            <div class="search_item_about">
            <h3 class="search_item_title">${item.title}</h3>
            <h3 class="search_item_price">${item.price}</h3>
            </div>
        </div>
    `).join("");
    } else {
        mobile_searchbar.innerHTML = "";
        mobile_searchbar.style.display = "none";
    }
})


const getCategories = async () => {
    try {
        const res = await fetch(`${baseUrl}/products`);
        const data = await res.json();

        return data;
    } catch (error) {
        console.error(error);
    }
}

const renderBestSeller = async () => {
    const cardBlock = document.querySelector(".best_seller__container");

    const data = await getProducts();
    let newData = data.slice(0, 3);

    cardBlock.innerHTML = newData.map((item) => {
        return `
            <div class="best_seller__card">
                <div class="best_seller_img_block">
                    <img src="${item.img}">
                </div>
                <h3 class="best_seller_title">${item.title.slice(0, 26)}...</h3>
                <p class="best_seller_price">$${item.price}</p>
                <p class="best_seller_off">24% Off</p>
            </div>
        `;
    }).join("");
};

const renderCategories = async () => {
    const data = await getCategories();
    tab_content.innerHTML = data.map((item) => {
        return `
            <button class="active" data-id="${item.id}">${item.category}</button>
        `;
    }).join("");

    const lastSelectedCategory = localStorage.getItem(localStorageKey);

    if (lastSelectedCategory) {
        renderProducts(lastSelectedCategory);
    } else {
        renderProducts(data[0]?.id);
    }
}

renderBestSeller();
renderCategories();

tab_content.addEventListener("click", (e) => {
    if (e.target.dataset.id) {
        renderProducts(e.target.dataset.id);

        localStorage.setItem(localStorageKey, e.target.dataset.id);
    }
});


products_input.addEventListener("keyup", (e) => {
    if (e.target.value) {
        product_searchbar_content.style.display = "flex";
        product_searchbar_content.innerHTML = searchData.filter((item) => item.title.toLowerCase().includes(e.target.value.toLowerCase())).map((item) => `
        <div data-id="${item.id}" class="search_item">
            <div class="search_img">
                <img src="${item.img}">
            </div>
            <div class="search_item_about">
            <h3 class="search_item_title">${item.title}</h3>
            <h3 class="search_item_price">${item.price}</h3>
            </div>
        </div>
    `).join("");
    } else {
        product_searchbar_content.innerHTML = "";
        product_searchbar_content.style.display = "none";
    }
})



document.addEventListener("click", (e) => {
    if (e.target.classList.contains("add_btn")) {
        const productId = e.target.dataset.id;
        addToCart(productId);
    }
});

const addToCart = (productId) => {
    try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProduct = cart.find(product => product.id === productId);

        if (existingProduct) {
            if (existingProduct.quantity < 1) {
                existingProduct.quantity += 1;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
            } else {

            }
        } else {
            const productToAdd = searchData.find(product => product.id === productId);
            if (productToAdd) {
                console.log(productToAdd);
                cart.push({
                    id: productToAdd.id,
                    title: productToAdd.title,
                    quantity: 1,
                    price: productToAdd.price,
                    img: productToAdd.img
                });
                showToast(successMsg)
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
            } else {
                showToast(invalidMsg);
            }

        }
    } catch (error) {
        console.error(error);
    }
}



document.addEventListener("DOMContentLoaded", () => {
    updateCartDisplay1();
});

const updateCartDisplay1 = () => {
    const cartCount = document.querySelector('.count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const totalQuantity = cart.reduce((total, product) => total + product.quantity, 0);
    cartCount.innerText = totalQuantity;
}


const openModal = (productId) => {
    const product = searchData.find(item => item.id === productId);

    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div class="about_product">
            <div class="modal_img_block">
                <img src="${product.img}">
            </div>
            <div class="about_product_info">
                <h2 class="modal_product_title">${product.title}</h2>
                <h3 class="modal_product_about">${product.about}</h3>
                <p class="modal_product_price">PRICE: <span>$${product.price}</span> </p>
            </div>
        </div>
    `;

    const modal = document.getElementById('productModal');
    modal.style.display = 'block';
}

const closeModal = () => {
    const modal = document.getElementById('productModal');
    modal.style.display = 'none';
}

products_wrapper.addEventListener('click', (e) => {
    const productId = e.target.closest('.product_infos')?.getAttribute('data-id');
    if (productId) {
        openModal(productId);
    }
});

const renderCart = () => {
    const cartSection = document.getElementById('cartSection');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    cartSection.innerHTML = '';

    let totalCartPrice = 0;

    cart.forEach((item) => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');

        const updateTotalPrice = () => {
            const totalPrice = item.quantity * item.price;
            totalPriceElement.innerText = `Total Price: $${totalPrice.toFixed(2)}`;
        };


        cartItem.innerHTML = `
    <div class="cart_product__block">
        <button class="delete-btn" data-id="${item.id}">&times;</button>
        <div class="cart_image__block">
        <img src="${item.img}">
        </div>
        <div class="cart-product-title">${item.title}</div>
        <div class="cart-product-price">$${item.price}</div>
        <div class="cart-product-quantity">
            <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
            <span>${item.quantity}</span>
            <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
        </div>
        <div class="cart-total-price">$${(item.quantity * item.price).toFixed(2)}</div>
    </div>
`;

        const subtotal = document.querySelector(".subtotal")
        const deleteButton = cartItem.querySelector('.delete-btn');
        const totalPriceElement = cartItem.querySelector('.cart-total-price');
        deleteButton.addEventListener('click', () => {
            deleteCartItem(item.id);
            showToast(invalidMsg);
            updateCartDisplay();
            renderCart();
        });
        const decreaseButton = cartItem.querySelector('.quantity-btn[data-action="decrease"]');
        decreaseButton.addEventListener('click', () => {
            updateCartItemQuantity(item.id, 'decrease');
            updateCartDisplay();
            updateTotalPrice();
        });

        const increaseButton = cartItem.querySelector('.quantity-btn[data-action="increase"]');
        increaseButton.addEventListener('click', () => {
            updateCartItemQuantity(item.id, 'increase');
            updateCartDisplay();
            updateTotalPrice();
        });

        const subtotal_price = document.querySelector(".subtotal_price")

        cartSection.appendChild(cartItem);

        totalCartPrice += item.quantity * item.price;
        subtotal_price.innerText  = `$${totalCartPrice.toFixed(2)}`;
    });
    const shippingPrice = totalCartPrice
    // const cart_section = document.querySelector(".cart_section");
    const totalCartPriceElement = document.createElement('div');
    totalCartPriceElement.classList.add('total-cart-price');

    const totalPriceCart = document.querySelector(".total-price-cart");

    totalPriceCart.innerText = `$${shippingPrice.toFixed(2)}`

}

document.addEventListener("DOMContentLoaded", () => {
    updateCartDisplay();
    renderCart();
});

const updateCartDisplay = () => {
    const cartCount = document.querySelector('.count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const totalQuantity = cart.reduce((total, product) => total + product.quantity, 0);
    cartCount.innerText = totalQuantity;

    renderCart();
}

const updateCartItemQuantity = (productId, action) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.map(product => {
        if (product.id === productId) {
            if (action === 'increase') {
                product.quantity += 1;
            } else if (action === 'decrease' && product.quantity > 0) {
                product.quantity -= 1;
            }else if(product.quantity == 0){

            }
        }
        return product;
    });

    localStorage.setItem('cart', JSON.stringify(updatedCart));
}

const deleteCartItem = (productId) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const updatedCart = cart.filter(product => product.id !== productId);

    localStorage.setItem('cart', JSON.stringify(updatedCart));
}

let toastBox = document.getElementById("toastBox");
let successMsg = '<i class="fa-solid fa-circle-check"></i> Mahsulot savatga qoshildi!';
let errorMsg = '<i class="fa-solid fa-circle-xmark"></i> Mahsulot savatda mavjud!';
let invalidMsg = `<i class="fa-solid fa-circle-exclamation"></i> Mahsulot savatdan o'chirildi`;

const showToast = (msg) => {
    let toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerHTML = msg;
    toastBox.appendChild(toast);

    if (msg.includes('mavjud')) {
        toast.classList.add('error');
    }

    if (msg.includes("o'chirildi")) {
        toast.classList.add('invalid');
    }

    setTimeout(() => {
        toast.remove();
    }, 5500)
}

const countdownDates = [
    new Date("Jan 19, 2024 12:00:00").getTime(),
    new Date("Jan 20, 2024 12:00:00").getTime(),
    new Date("Jan 21, 2024 12:00:00").getTime(),
    new Date("Jan 22, 2024 12:00:00").getTime(),
    new Date("Jan 23, 2024 12:00:00").getTime()
];

let remainingTimes = JSON.parse(localStorage.getItem('remainingTimes')) || countdownDates;

const countdownIntervals = remainingTimes.map((remainingTime, index) => {
    return setInterval(() => {
        updateCountdown(index + 1, remainingTime);
    }, 1000);
});

const updateCountdown = (timerIndex, remainingTime) => {
    const now = new Date().getTime();

    const distance = remainingTime - now;

    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById(`hours${timerIndex}`).innerText = padZero(hours);
    document.getElementById(`minutes${timerIndex}`).innerText = padZero(minutes);
    document.getElementById(`seconds${timerIndex}`).innerText = padZero(seconds);

    if (distance < 0) {
        clearInterval(countdownIntervals[timerIndex - 1]);
        document.getElementById(`hours${timerIndex}`).innerText = "00";
        document.getElementById(`minutes${timerIndex}`).innerText = "00";
        document.getElementById(`seconds${timerIndex}`).innerText = "00";
    }
}

function padZero(number) {
    return (number < 10 ? "0" : "") + number;
}

setInterval(() => {
    localStorage.setItem('remainingTimes', JSON.stringify(remainingTimes));
}, 1000);

const cartSection = document.querySelector(".cart_section");
const cartBtn = document.querySelector(".cart_link");
const cart_page = document.querySelector(".cart_page");

const showCartModal = () => {
    cartSection.classList.add("block");
};

const closeCartModal = () => {
    cartSection.classList.remove("block")
}
cart_page.addEventListener("click", () => {
    showCartModal();
});

cartBtn.addEventListener("click", () => {
    showCartModal();
});

const click = () => {
    showCartModal();
}

$('.slider').slick({
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: true
});