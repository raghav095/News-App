window.onload = function () {
    const userName = localStorage.getItem("user_name");
    const userEmail = localStorage.getItem("user_email");
    const preferredCategories = JSON.parse(localStorage.getItem("preferred_categories"));

    if (!userName || !userEmail || !preferredCategories || preferredCategories.length === 0) {
        window.location.href = "register.html";
        return;
    }

    const sidebarUserInfoElement = document.getElementById("sidebar-user-info");
    sidebarUserInfoElement.innerHTML = `${userName}`;

    fetchNewsForPreferences(preferredCategories);

    const navbarLogo = document.getElementById("navbar-logo");
    navbarLogo.addEventListener("click", () => {
        window.location.reload();
    });

    initializeCategorySidebar(preferredCategories); 
};

const API_KEY = "704f089032214b16ab56c6f753b33b71";
const url = "https://newsapi.org/v2/everything?q=";

let currentPage = 1;
const articlesPerPage = 12;
let currentArticles = [];

async function fetchNews(query) {
    try {
        const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
        const data = await res.json();
        if (data.articles) {
            bindData(data.articles);
        } else {
            displayMessage("No articles found.");
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        displayMessage("Error fetching news, please try again later.");
    }
}

async function fetchNewsForPreferences(preferredCategories) {
    const promises = preferredCategories.map((category) => fetchNews(category));
    await Promise.all(promises);
}

function initializeCategorySidebar(preferredCategories) {
    const sidebarCategoriesElement = document.getElementById("sidebar-categories");
    sidebarCategoriesElement.innerHTML = "";

    preferredCategories.forEach(category => {
        const categoryElement = document.createElement("li");
        categoryElement.classList.add("category-item");
        categoryElement.textContent = category;
        categoryElement.addEventListener("click", () => {
            filterByCategory(category);
        });
        sidebarCategoriesElement.appendChild(categoryElement);
    });
}

function bindData(articles) {
    currentArticles = articles;
    displayPage(currentPage);
}

function displayPage(page) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";
    const start = (page - 1) * articlesPerPage;
    const end = Math.min(start + articlesPerPage, currentArticles.length); // Prevent overflow
    const articlesToDisplay = currentArticles.slice(start, end);

    articlesToDisplay.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });

    const nextButton = document.getElementById("next-button");
    const previousButton = document.getElementById("previous-button");

    previousButton.style.display = page > 1 ? "inline-block" : "none";
    nextButton.style.display = page * articlesPerPage < currentArticles.length ? "inline-block" : "none";

    nextButton.removeEventListener("click", onNextButtonClick);
    previousButton.removeEventListener("click", onPreviousButtonClick);

    nextButton.addEventListener("click", onNextButtonClick);
    previousButton.addEventListener("click", onPreviousButtonClick);
}

function onNextButtonClick() {
    if (currentPage * articlesPerPage < currentArticles.length) {
        currentPage++;
        displayPage(currentPage);
    }
}

function onPreviousButtonClick() {
    if (currentPage > 1) {
        currentPage--;
        displayPage(currentPage);
    }
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");
    const sentimentScore = cardClone.querySelector("#sentiment-score");

    newsImg.src = article.urlToImage;
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description;

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
    });

    newsSource.innerHTML = `${article.source.name} · ${date}`;

    sentimentScore.innerText = `Sentiment: Neutral`;
    sentimentScore.style.backgroundColor = getSentimentColor("Neutral");

    analyzeSentiment(article.title + " " + article.description).then((sentiment) => {
        sentimentScore.innerText = `Sentiment: ${sentiment}`;
        sentimentScore.style.backgroundColor = getSentimentColor(sentiment);
    });

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

function analyzeSentiment(text) {
    return new Promise((resolve) => {
        const url = "https://api.textrazor.com";
        const apiKey = "5a71dda79b8fc83b99bceeea59ef03b18286f4601e09bbf73c261ca5";
        const headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-textrazor-key": apiKey,
        };

        const body = `text=${encodeURIComponent(text)}&extractors=entities,topics,keywords,sentiment`;

        fetch(url, {
            method: "POST",
            headers: headers,
            body: body,
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.response && data.response.sentiment && data.response.sentiment.score) {
                    const sentimentScore = data.response.sentiment.score;
                    if (sentimentScore > 0) {
                        resolve("Positive");
                    } else if (sentimentScore < 0) {
                        resolve("Negative");
                    } else {
                        resolve("Neutral");
                    }
                } else {
                    resolve("Neutral");
                }
            })
            .catch(() => resolve("Neutral"));
    });
}

function getSentimentColor(sentiment) {
    switch (sentiment) {
        case "Positive":
            return "green";
        case "Negative":
            return "red";
        default:
            return "yellow";
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");
}

function filterByCategory(category) {
    currentPage = 1;
    fetchNews(category);
    toggleSidebar();
    updateActiveCategory(category);
}

function updateActiveCategory(category) {
    const categoryItems = document.querySelectorAll(".category-item");
    categoryItems.forEach(item => {
        item.classList.remove("active");
    });

    const activeCategoryItem = Array.from(categoryItems).find(item => item.textContent === category);
    if (activeCategoryItem) {
        activeCategoryItem.classList.add("active");
    }
}

const searchButton = document.getElementById("search-icon");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", handleSearch);
searchText.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
});

function handleSearch() {
    const query = searchText.value.trim();
    if (!query) {
        displayMessage("Please enter a search query.");
        return;
    }
    if (query.length < 3) {
        displayMessage("Please enter at least 3 characters.");
        return;
    }
    fetchNews(query);
}

function displayMessage(message) {
    const errorElement = document.createElement("div");
    errorElement.classList.add("error-message");
    errorElement.textContent = message;
    document.body.appendChild(errorElement);

    setTimeout(() => {
        errorElement.remove();
    }, 3000);
}

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("night");
    const theme = document.body.classList.contains("night") ? "night" : "light";
    localStorage.setItem("theme", theme); 
    if (document.body.classList.contains("night")) {
        themeIcon.src = "sun.png";
    } else {
        themeIcon.src = "night-mode.png";
    }
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "night") {
    document.body.classList.add("night");
    themeIcon.src = "sun.png";
} else {
    document.body.classList.remove("night");
    themeIcon.src = "night-mode.png";
}
