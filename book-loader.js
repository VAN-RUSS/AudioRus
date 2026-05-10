document.addEventListener('DOMContentLoaded', function() {
    // Получаем ID книги из URL-параметра ?book=
    const params = new URLSearchParams(window.location.search)
    const bookId = params.get('book') || 'stellar_1'

    const book = BOOKS_DATA[bookId]

    // Если книга не найдена — показываем ошибку
    if (!book) {
        document.body.innerHTML = `
            <div style="text-align: center; margin-top: 100px; font-family: Arial;">
                <h1 style="font-size: 48px;">Книга не найдена</h1>
                <p style="font-size: 20px;">Проверьте ссылку или вернитесь на <a href="index.html">главную</a></p>
            </div>
        `
        return
    }

    // Меняем title страницы
    document.title = 'Аудиокнига ' + book.title

    // Заголовок книги
    document.getElementById('book-title').textContent = book.title

    // Обложка
    const coverImg = document.getElementById('book-cover')
    coverImg.src = book.cover
    coverImg.alt = book.title
    coverImg.loading = 'lazy'

    // Информационный блок
    const info = document.getElementById('book-info')
    info.innerHTML = `
        <div class="info_3" style="margin-top: 10px;">
            <a class="info_2" href="#">Жанр: ${book.genre.join(', ')}</a>
        </div>
        <div class="info_3">
            <a class="info_2" href="#">Автор: ${book.author}</a>
        </div>
        <div class="info_3">
            <a class="info_2" href="#">Читает: ${book.narrator.join(', ')}</a>
        </div>
        <div class="info_3">
            <a class="info_2" href="#">Длительность: ${book.duration}</a>
        </div>
        <div class="info_3">
            <a class="info_2" href="#">Цикл "Стеллар" ${book.cycle}</a>
        </div>
        <div style="height: 10px;"></div>
    `

    // Аннотация
   document.getElementById('book-annotation').innerHTML = `
    <div class="an_3">
        <h1 class="an_1">
            Стеллар ${book.cycle.split('/')[0]}, ${book.title} Аннотация:
        </h1>
        <p class="an_2">
            ${book.annotation}
        </p>
    </div>
`

    // Навигация: предыдущая / следующая книга цикла
    const cycleNum = parseInt(book.cycle.split('/')[0])
    const navContainer = document.createElement('div')
    navContainer.style.cssText = `
        width: 100%;
        display: flex;
        justify-content: space-between;
        margin: 20px 0;
        font-family: Arial, Helvetica, sans-serif;
    `

    // Кнопка "Предыдущая книга"
    if (cycleNum > 1) {
        const prevBookId = 'stellar_' + (cycleNum - 1)
        const prevBook = BOOKS_DATA[prevBookId]
        if (prevBook) {
            const prevLink = document.createElement('a')
            prevLink.href = '?book=' + prevBookId
            prevLink.style.cssText = `
                text-decoration: none;
                color: rgb(60, 60, 60);
                font-size: 18px;
                padding: 10px 20px;
                background-color: rgb(225, 225, 225);
                border-radius: 10px;
                cursor: pointer;
            `
            prevLink.textContent = '← ' + prevBook.title
            navContainer.appendChild(prevLink)
        }
    } else {
        const spacer = document.createElement('div')
        navContainer.appendChild(spacer)
    }

    // Кнопка "Следующая книга"
    if (cycleNum < 9) {
        const nextBookId = 'stellar_' + (cycleNum + 1)
        const nextBook = BOOKS_DATA[nextBookId]
        if (nextBook) {
            const nextLink = document.createElement('a')
            nextLink.href = '?book=' + nextBookId
            nextLink.style.cssText = `
                text-decoration: none;
                color: rgb(60, 60, 60);
                font-size: 18px;
                padding: 10px 20px;
                background-color: rgb(225, 225, 225);
                border-radius: 10px;
                cursor: pointer;
            `
            nextLink.textContent = nextBook.title + ' →'
            navContainer.appendChild(nextLink)
        }
    }

    // Вставляем навигацию между плеером и аннотацией
    const annotation = document.getElementById('book-annotation')
    annotation.parentNode.insertBefore(navContainer, annotation)

    // book-loader.js (фрагмент)
// Запускаем плеер
xep(book.folder, book.nameRussian, book.filesCount, book.diskKey || null);
})