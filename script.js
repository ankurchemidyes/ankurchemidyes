const themeToggle = document.getElementById('theme-toggle');
const themeMenu = document.getElementById('theme-menu');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');

// Toggle dropdown visibility
themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    themeMenu.classList.toggle('hidden');
});

// Close dropdown when clicking outside
window.addEventListener('click', () => {
    if (!themeMenu.classList.contains('hidden')) {
        themeMenu.classList.add('hidden');
    }
});

// Updates the button icon and text
function updateUI(mode) {
    if (mode === 'dark') {
        themeIcon.className = 'fas fa-moon text-blue-400';
        themeLabel.innerText = 'Dark';
    } else if (mode === 'light') {
        themeIcon.className = 'fas fa-sun text-yellow-500';
        themeLabel.innerText = 'Light';
    } else {
        themeIcon.className = 'fas fa-circle-half-stroke text-blue-600 dark:text-blue-400';
        themeLabel.innerText = 'System';
    }
}

// Handles the actual switching logic
window.changeTheme = function(mode) {
    const doc = document.documentElement;
    
    if (mode === 'system') {
        localStorage.removeItem('theme');
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            doc.classList.add('dark');
        } else {
            doc.classList.remove('dark');
        }
    } else if (mode === 'dark') {
        doc.classList.add('dark');
        localStorage.theme = 'dark';
    } else {
        doc.classList.remove('dark');
        localStorage.theme = 'light';
    }
    
    updateUI(mode);
    themeMenu.classList.add('hidden');
};

// Handle System Preference Changes Live (if set to system)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.theme) {
        if (e.matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
});

// Initialize UI on Page Load based on localStorage or System defaults
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.theme === 'dark') {
        updateUI('dark');
    } else if (localStorage.theme === 'light') {
        updateUI('light');
    } else {
        updateUI('system');
    }
});