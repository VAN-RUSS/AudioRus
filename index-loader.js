document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('cycles-container')

    let html = ''

    for (const cycleId in CYCLES_DATA) {
        const cycle = CYCLES_DATA[cycleId]
        const firstBook = BOOKS_DATA[cycle.firstBookId]

        html += `
            <a href="${cycle.cyclePage}" class="cycle-card-link">
                <div class="cycle-card">
                    <img src="${cycle.cover}" class="cycle-cover" alt="${cycle.name}" loading="lazy">
                    <div class="cycle-info">
                        <p class="cycle-label">Цикл книг</p>
                        <h2 class="cycle-name">${cycle.name}</h2>
                        <p class="cycle-author">${cycle.author}</p>
                        <p class="cycle-genre">${cycle.genre.join(', ')}</p>
                        <p class="cycle-count">${cycle.booksCount} ${getBookWord(cycle.booksCount)}</p>
                        <p class="cycle-narrator">Читает: ${cycle.narrator.join(', ')}</p>
                        <p class="cycle-annotation">${cycle.annotation}</p>
                    </div>
                </div>
            </a>
        `
    }

    container.innerHTML = html
})

function getBookWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'книга'
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'книги'
    return 'книг'
}