// Поиск по книгам на главной
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.hed_2_1')
    const searchButton = document.querySelector('.hed_2_2')
    const books = document.querySelectorAll('.prosto_kniga')
    const bookLinks = document.querySelectorAll('.prosto_knigi a')

    function filterBooks() {
        const query = searchInput.value.toLowerCase().trim()

        bookLinks.forEach(function(link) {
            const book = link.querySelector('.prosto_kniga')
            const title = book.querySelector('h2').textContent.toLowerCase()
            const description = book.querySelector('.kniga_p').textContent.toLowerCase()

            if (title.includes(query) || description.includes(query)) {
                link.style.display = ''
            } else {
                link.style.display = 'none'
            }
        })

        // Показываем сообщение, если ничего не найдено
        const visibleBooks = document.querySelectorAll('.prosto_knigi a[style=""]').length
        const noResults = document.getElementById('no-results')

        if (visibleBooks === 0 && query !== '') {
            if (!noResults) {
                const msg = document.createElement('div')
                msg.id = 'no-results'
                msg.style.cssText = 'text-align: center; font-size: 24px; font-family: Arial; margin: 40px; color: #888;'
                msg.textContent = 'Ничего не найдено :('
                document.querySelector('.prosto_knigi').appendChild(msg)
            }
        } else if (noResults) {
            noResults.remove()
        }
    }

    // Поиск по клику на иконку
    searchButton.addEventListener('click', filterBooks)

    // Поиск по Enter
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterBooks()
        }
        // Опционально: живой поиск при вводе (раскомментируй следующую строку)
        // filterBooks()
    })

    // Очистка поиска — показываем все книги снова
    searchInput.addEventListener('input', function() {
        if (searchInput.value === '') {
            bookLinks.forEach(function(link) {
                link.style.display = ''
            })
            const noResults = document.getElementById('no-results')
            if (noResults) noResults.remove()
        }
    })
})