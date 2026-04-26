// ==================== ОСНОВНЫЕ ПЕРЕМЕННЫЕ ====================
let myAudio = 0
let tec = 0
let Name_Russian = 'Стеллар 2. Трибут'
let Name_papka = 'stellar_2' + '/'
let KolVo_files = 6
let container
let pleylistF = []
let a = -1
let pr = 0
let progressInterval = null  // для очистки setInterval
let saveInterval = null      // интервал автосохранения
let isRestoring = false      // флаг: идёт восстановление прогресса

// ==================== УТИЛИТЫ ====================
function tec2(a) {
    tec = a
}

// Генерация плейлиста
function xep(Name_papka, Name_Russian, KolVo_files = 6) {
    // Сбрасываем счётчик треков
    a = -1
    pleylistF = []
    document.getElementById('pleylist').innerHTML = ''

    while (a < KolVo_files - 1) {
        a += 1
        c = a
        if (a < 10) {
            c = '0' + a
        }
        pleylistF.push(Name_papka + c + '.mp3')
        container = '<div class="pleylist_3" id="' + a + '" onclick="document.getElementById(tec).setAttribute(`style`, `background-color: rgb(70, 70, 70)`); tec2(' + a + '); myAudio.pause(); myAudio = new Audio(`' + pleylistF[a] + '`); myAudio.play(); document.getElementById(`pl`).setAttribute(`src`, `img/пауза.png`); document.getElementById(`' + a + '`).setAttribute(`style`, `background-color: rgb(100, 100, 100)`); saveProgress();"><p class="pleylist_2">' + c + ' ' + Name_Russian + '</p></div>'
        document.getElementById('pleylist').innerHTML += container
    }

    // Пытаемся восстановить прогресс после генерации плейлиста
    restoreProgress()
    const restored = restoreProgress()
if (!restored) {
    tec = 0
    myAudio = new Audio(pleylistF[0])
    document.getElementById('0').setAttribute('style', 'background-color: rgb(100, 100, 100)')
}
}

// ==================== ПРОГРЕСС-БАР (МЫШЬ + TOUCH) ====================
function seekHandler(event) {
    event = event || window.event
    let clientX

    if (event.touches) {
        clientX = event.touches[0].clientX  // touch-событие
    } else {
        clientX = event.clientX  // mouse-событие
    }

    const line = document.getElementsByClassName('line')[0]
    const rect = line.getBoundingClientRect()
    const offsetX = clientX - rect.left
    let a = offsetX / line.offsetWidth

    // Защита от выхода за границы
    if (a < 0) a = 0
    if (a > 1) a = 1

    document.getElementById('l').style.width = (a * 100) + '%'
    if (myAudio && myAudio.duration && !isNaN(myAudio.duration)) {
        myAudio.currentTime = a * Math.floor(myAudio.duration)
    }
}

// Мышь
document.getElementsByClassName('line')[0].onmousedown = seekHandler

// Touch (для телефонов)
document.getElementsByClassName('line')[0].ontouchstart = function(event) {
    event.preventDefault()
    seekHandler(event)

    // Отслеживаем перемещение пальца
    const onTouchMove = function(e) {
        e.preventDefault()
        seekHandler(e)
    }
    const onTouchEnd = function() {
        document.removeEventListener('touchmove', onTouchMove)
        document.removeEventListener('touchend', onTouchEnd)
    }
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd)
}

// ==================== НАВИГАЦИЯ ПО ТРЕКАМ ====================
function pred() {
    if (tec <= 0) return  // защита от выхода за границы
    myAudio.pause()
    myAudio = new Audio(pleylistF[tec - 1])
    document.getElementById(tec - 1).setAttribute(`style`, `background-color: rgb(100, 100, 100)`)
    document.getElementById(tec).setAttribute(`style`, `background-color: rgb(70, 70, 70)`)
    document.getElementById(`pl`).setAttribute(`src`, `img/пауза.png`)
    myAudio.play()
    tec -= 1
    saveProgress()
}

function sled() {
    if (tec >= pleylistF.length - 1) return  // защита от выхода за границы
    myAudio.pause()
    myAudio = new Audio(pleylistF[tec + 1])
    document.getElementById(tec).setAttribute(`style`, `background-color: rgb(70, 70, 70)`)
    document.getElementById(tec + 1).setAttribute(`style`, `background-color: rgb(100, 100, 100)`)
    document.getElementById(`pl`).setAttribute(`src`, `img/пауза.png`)
    myAudio.play()
    tec += 1
    saveProgress()
}

// ==================== ОБНОВЛЕНИЕ ТАЙМЕРА И ПОЛОСЫ ====================
function update() {
    // Очищаем предыдущий интервал, если был
    if (progressInterval) {
        clearInterval(progressInterval)
    }

    progressInterval = setInterval(function() {
        // Защита: если аудио ещё не загрузилось
        if (!myAudio || !myAudio.duration || isNaN(myAudio.duration)) return

        let maxSec = Math.floor(myAudio.duration)
        let maxMin = Math.floor(maxSec / 60)
        let maxSec2 = maxSec - (maxMin * 60)
        if (maxSec2 < 10) {
            maxSec2 = '0' + maxSec2
        }
        let maxTime = maxMin + ':' + maxSec2

        let sec = Math.floor(myAudio.currentTime)
        let min = Math.floor(sec / 60)
        let sec2 = sec - (min * 60)
        if (sec2 < 10) {
            sec2 = '0' + sec2
        }

        document.getElementById('p').textContent = min + ':' + sec2 + '/' + maxTime

        // Прогресс-бар
        let progressPercent = (myAudio.currentTime / maxSec) * 100
        document.getElementById('l').style.width = progressPercent + '%'

        // Автопереход на следующий трек
        if (myAudio.duration === myAudio.currentTime && pleylistF.length > 0 && tec < pleylistF.length - 1) {
            myAudio.pause()
            myAudio = new Audio(pleylistF[tec + 1])
            document.getElementById(tec).setAttribute(`style`, `background-color: rgb(70, 70, 70)`)
            document.getElementById(tec + 1).setAttribute(`style`, `background-color: rgb(100, 100, 100)`)
            document.getElementById(`pl`).setAttribute(`src`, `img/пауза.png`)
            myAudio.play()
            tec += 1
            saveProgress()
        }
    }, 100)
}

update()

// ==================== ПЛЕЙ / ПАУЗА ====================
function clicker() {
    let a = document.getElementById('pl')
    if (a.getAttribute('src') === 'img/пауза.png') {
        a.setAttribute('src', 'img/плей.png')
        myAudio.pause()
        saveProgress()  // сохраняем при паузе
    } else if (a.getAttribute('src') === 'img/плей.png') {
        a.setAttribute('src', 'img/пауза.png')
        myAudio.play()
    }
}

// ==================== КЭШ-СОХРАНЕНИЕ ПРОГРЕССА ====================
// Формируем уникальный ключ на основе URL страницы (без .html)
function getCacheKey() {
    const params = new URLSearchParams(window.location.search)
    const bookId = params.get('book')
    if (bookId) return 'audioProgress_' + bookId
    // fallback для главной и старых страниц
    const path = window.location.pathname.split('/').pop().replace('.html', '')
    return 'audioProgress_' + path
}

const CACHE_KEY = getCacheKey()
const CACHE_EXPIRY_DAYS = 30

function saveProgress() {
    if (!myAudio || !myAudio.duration || isNaN(myAudio.duration)) return
    if (isRestoring) return  // не сохраняем во время восстановления

    const data = {
        track: tec,
        time: myAudio.currentTime,
        timestamp: Date.now()
    }

    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch (e) {
        // localStorage переполнен или недоступен — игнорируем
        console.warn('Не удалось сохранить прогресс:', e)
    }
}

function loadProgress() {
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return null

        const saved = JSON.parse(raw)

        // Проверка: не устарела ли запись
        if (Date.now() - saved.timestamp > CACHE_EXPIRY_DAYS * 24 * 3600 * 1000) {
            localStorage.removeItem(CACHE_KEY)
            return null
        }

        return saved
    } catch (e) {
        return null
    }
}

function restoreProgress() {
    const saved = loadProgress()
    if (!saved) return
    if (saved.track < 0 || saved.track >= pleylistF.length) return

    isRestoring = true

    tec = saved.track

    // Подсвечиваем сохранённый трек в плейлисте
    for (let i = 0; i < pleylistF.length; i++) {
        const el = document.getElementById(i)
        if (el) {
            el.setAttribute('style', 'background-color: rgb(70, 70, 70)')
        }
    }
    const activeEl = document.getElementById(tec)
    if (activeEl) {
        activeEl.setAttribute('style', 'background-color: rgb(100, 100, 100)')
    }

    // Создаём аудио с сохранённого трека
    myAudio = new Audio(pleylistF[tec])
    myAudio.currentTime = saved.time

    // Меняем иконку на паузу (готовность к воспроизведению)
    document.getElementById('pl').setAttribute('src', 'img/плей.png')

    // Ждём, пока аудио загрузится, затем устанавливаем время
    myAudio.addEventListener('loadedmetadata', function() {
        if (saved.time < myAudio.duration) {
            myAudio.currentTime = saved.time
        }
        isRestoring = false
    }, { once: true })

    // Fallback: если метаданные уже загружены
    if (myAudio.readyState >= 1) {
        if (saved.time < myAudio.duration) {
            myAudio.currentTime = saved.time
        }
        isRestoring = false
    }
}

// ==================== АВТОСОХРАНЕНИЕ И ЗАКРЫТИЕ ====================
// Сохраняем прогресс каждые 5 секунд во время воспроизведения
saveInterval = setInterval(function() {
    if (myAudio && !myAudio.paused && myAudio.duration && !isNaN(myAudio.duration)) {
        saveProgress()
    }
}, 5000)

// Сохраняем при уходе со страницы
window.addEventListener('beforeunload', function() {
    saveProgress()
    // Очищаем интервалы
    if (progressInterval) clearInterval(progressInterval)
    if (saveInterval) clearInterval(saveInterval)
})

// Сохраняем при сворачивании вкладки (мобильные)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        saveProgress()
    }
})