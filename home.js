document.addEventListener('DOMContentLoaded', function () {
    const registerButton = document.getElementById('register-btn');
    const savePreferencesButton = document.getElementById('save-preferences-btn');

    // Step 1: Handle User Registration
    registerButton.addEventListener('click', registerUser);

    // Step 2: Handle Preferences Saving
    savePreferencesButton.addEventListener('click', savePreferences);

    // Step 3: Add click event to the preference cards
    const preferenceCards = document.querySelectorAll('.preference-item.card');
    preferenceCards.forEach(card => {
        card.addEventListener('click', toggleCardSelection);
    });
});

function registerUser() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();

    console.log("Name:", name, "Email:", email);  // Debugging log

    if (name && validateEmail(email)) {
        localStorage.setItem('user_name', name);
        localStorage.setItem('user_email', email);

        console.log("Registration successful!");  // Debugging log

        // Hide registration form and show preferences form
        document.querySelector('.registration-container').style.display = 'none';
        document.querySelector('.preferences-container').style.display = 'block';
    } else {
        alert('Please provide a valid name and email');
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function savePreferences() {
    const selectedPreferences = [];
    const checkboxes = document.querySelectorAll('#preferences-form input[type="checkbox"]:checked');

    console.log("Selected Preferences:", selectedPreferences);  // Debugging log

    checkboxes.forEach(checkbox => selectedPreferences.push(checkbox.value));

    if (selectedPreferences.length > 0) {
        localStorage.setItem('preferred_categories', JSON.stringify(selectedPreferences));

        console.log("Preferences saved!");  // Debugging log
        window.location.href = "index.html"; // Redirect to main news page
    } else {
        alert('Please select at least one preference');
    }
}

function toggleCardSelection(event) {
    const card = event.currentTarget; // Get the clicked card
    const checkbox = card.querySelector('input[type="checkbox"]'); // Find the checkbox inside the card

    if (checkbox) {
        checkbox.checked = !checkbox.checked; // Toggle the checkbox state
        card.classList.toggle('selected', checkbox.checked); // Add or remove 'selected' class for visual feedback
    }
}

// Get elements
const homeLink = document.getElementById("home-link");
const contactLink = document.getElementById("contact-link");

const mainContent = document.getElementById("main-content");
const footerContent = document.getElementById("footer-content");

// Add event listeners for navbar links
homeLink.addEventListener("click", function() {
    mainContent.style.display = "block";
    footerContent.style.display = "none";
});

contactLink.addEventListener("click", function() {
    mainContent.style.display = "none";
    footerContent.style.display = "block";
});


