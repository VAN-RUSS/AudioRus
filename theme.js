(function() {
    const html = document.documentElement;
    const themeToggle = document.querySelector('.theme-toggle');

    function setTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.querySelector('.ikon').src = 'img/иконка_2_t.png';
    } else {
        document.body.classList.remove('dark-theme');
        document.querySelector('.ikon').src = 'img/иконка_2.png';
    }
    localStorage.setItem('theme', theme);
    }

    // Определение системной темы
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(systemDark.matches ? 'dark' : 'light');
    }

    // Следим за изменением системных настроек (если пользователь не выбрал вручную)
    systemDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Ручное переключение
    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
    });
})();