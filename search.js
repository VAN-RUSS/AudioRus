// Поиск по циклам книг на главной
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.hed_2_1')
    const searchButton = document.querySelector('.hed_2_2')
    const cycleCards = document.querySelectorAll('.cycle-card-link')

    function filterCycles() {
        const query = searchInput.value.toLowerCase().trim()

        cycleCards.forEach(function(card) {
            const cycleInfo = card.querySelector('.cycle-info')
            const name = cycleInfo.querySelector('.cycle-name').textContent.toLowerCase()
            const author = cycleInfo.querySelector('.cycle-author').textContent.toLowerCase()
            const genre = cycleInfo.querySelector('.cycle-genre').textContent.toLowerCase()
            const annotation = cycleInfo.querySelector('.cycle-annotation').textContent.toLowerCase()
            const combined = name + ' ' + author + ' ' + genre + ' ' + annotation

            if (combined.includes(query)) {
                card.style.display = ''
            } else {
                card.style.display = 'none'
            }
        })

        // Показываем сообщение, если ничего не найдено
        const visibleCards = document.querySelectorAll('.cycle-card-link[style=""]').length
        const noResults = document.getElementById('no-results')

        if (visibleCards === 0 && query !== '') {
            if (!noResults) {
                const msg = document.createElement('div')
                msg.id = 'no-results'
                msg.style.cssText = 'text-align: center; font-size: 24px; font-family: Arial; margin: 40px; color: #888;'
                msg.textContent = 'Ничего не найдено :('
                document.querySelector('.cycles-container').appendChild(msg)
            }
        } else if (noResults) {
            noResults.remove()
        }
    }

    // Поиск по клику на иконку
    searchButton.addEventListener('click', filterCycles)

    // Поиск по Enter
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            filterCycles()
        }
    })

    // Очистка поиска — показываем все циклы снова
    searchInput.addEventListener('input', function() {
        if (searchInput.value === '') {
            cycleCards.forEach(function(card) {
                card.style.display = ''
            })
            const noResults = document.getElementById('no-results')
            if (noResults) noResults.remove()
        }
    })
})