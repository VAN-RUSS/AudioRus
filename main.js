// ==================== ОСНОВНЫЕ ПЕРЕМЕННЫЕ ====================
let myAudio = null
let tec = 0
let Name_Russian = ''
let Name_papka = ''
let KolVo_files = 0
let pleylistF = []
let progressInterval = null
let saveInterval = null
let isRestoring = false

// !!! ЗАМЕНИТЕ НА HTTPS ПОСЛЕ НАСТРОЙКИ SSL !!!
const PROXY_URL = 'http://awesomwo.beget.tech/proxy.php'

// ==================== УТИЛИТЫ ====================
function tec2(a) {
    tec = a
}

// Генерация плейлиста
function xep(folder, nameRussian, filesCount, diskKey) {
    tec = 0
    pleylistF = []
    document.getElementById('pleylist').innerHTML = ''

    Name_papka = folder
    Name_Russian = nameRussian
    KolVo_files = filesCount

    const params = new URLSearchParams(window.location.search)
    const bookId = params.get('book')
    const book = bookId ? BOOKS_DATA[bookId] : null

    const hasDirectLinks = book && book.directLinks && book.directLinks.length > 0
    const hasDiskKey = diskKey && diskKey.length > 0

    if (hasDirectLinks) {
        // ========== ПРЯМЫЕ ССЫЛКИ ЧЕРЕЗ PHP-ПРОКСИ ==========
        console.log('Загрузка через PHP-прокси (прямые ссылки)')

        book.directLinks.forEach((link, index) => {
            const proxiedUrl = PROXY_URL + '?url=' + encodeURIComponent(link)
            pleylistF.push(proxiedUrl)

            const trackNum = index + 1
            const displayName = trackNum < 10 ? '0' + trackNum : '' + trackNum

            const trackHTML = `
                <div class="pleylist_3" id="${index}"
                     onclick="playTrack(${index})">
                    <p class="pleylist_2">${displayName} ${Name_Russian}</p>
                </div>`
            document.getElementById('pleylist').innerHTML += trackHTML
        })

        const restored = restoreProgress()
        if (!restored && pleylistF.length > 0) {
            tec = 0
            myAudio = new Audio(pleylistF[0])
            highlightTrack(0)
        }
        update()

    } else if (hasDiskKey) {
        // ========== API ЯНДЕКС.ДИСКА ЧЕРЕЗ PHP-ПРОКСИ ==========
        console.log('Загрузка через PHP-прокси (API Яндекс.Диска)')

        // Исправляем HTTP на HTTPS
        if (diskKey.startsWith('http://')) {
            diskKey = diskKey.replace('http://', 'https://')
        }

        const yandexApiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources?public_key=${encodeURIComponent(diskKey)}&limit=1000`
        const proxiedApiUrl = PROXY_URL + '?url=' + encodeURIComponent(yandexApiUrl)

        document.getElementById('pleylist').innerHTML = '<div style="padding:20px;text-align:center;color:var(--player-text)">Загрузка плейлиста...</div>'

        fetch(proxiedApiUrl)
            .then(response => response.json())
            .then(data => {
                document.getElementById('pleylist').innerHTML = ''

                if (data._embedded && data._embedded.items) {
                    const mp3Files = data._embedded.items
                        .filter(item => item.name.toLowerCase().endsWith('.mp3'))
                        .sort((a, b) => a.name.localeCompare(b.name))

                    if (mp3Files.length === 0) {
                        document.getElementById('pleylist').innerHTML = '<div style="padding:20px;text-align:center;color:var(--player-text)">MP3 файлы не найдены</div>'
                        return
                    }

                    mp3Files.forEach((file, index) => {
                        // Проксируем прямую ссылку на MP3
                        const proxiedMp3Url = PROXY_URL + '?url=' + encodeURIComponent(file.file)
                        pleylistF.push(proxiedMp3Url)

                        let displayName = file.name.replace('.mp3', '')

                        const trackHTML = `
                            <div class="pleylist_3" id="${index}"
                                 onclick="playTrack(${index})">
                                <p class="pleylist_2">${displayName} ${Name_Russian}</p>
                            </div>`
                        document.getElementById('pleylist').innerHTML += trackHTML
                    })

                    const restored = restoreProgress()
                    if (!restored && pleylistF.length > 0) {
                        tec = 0
                        myAudio = new Audio(pleylistF[0])
                        highlightTrack(0)
                    }
                    update()
                } else {
                    document.getElementById('pleylist').innerHTML = '<div style="padding:20px;text-align:center;color:var(--player-text)">Неверный ответ от API</div>'
                }
            })
            .catch(error => {
                console.error('Ошибка загрузки:', error)
                document.getElementById('pleylist').innerHTML = '<div style="padding:20px;text-align:center;color:var(--player-text)">Ошибка загрузки плейлиста</div>'
            })

    } else {
        // ========== ЛОКАЛЬНЫЕ ФАЙЛЫ ==========
        console.log('Загрузка локальных файлов')

        for (let i = 0; i < filesCount; i++) {
            let num = i < 10 ? '0' + i : '' + i
            pleylistF.push(folder + num + '.mp3')

            const trackHTML = `
                <div class="pleylist_3" id="${i}"
                     onclick="playTrack(${i})">
                    <p class="pleylist_2">${num} ${Name_Russian}</p>
                </div>`
            document.getElementById('pleylist').innerHTML += trackHTML
        }

        const restored = restoreProgress()
        if (!restored && pleylistF.length > 0) {
            tec = 0
            myAudio = new Audio(pleylistF[0])
            highlightTrack(0)
        }
        update()
    }
}

function highlightTrack(index) {
    for (let i = 0; i < pleylistF.length; i++) {
        const el = document.getElementById(i)
        if (el) el.setAttribute('style', 'background-color: rgb(70, 70, 70)')
    }
    const active = document.getElementById(index)
    if (active) active.setAttribute('style', 'background-color: rgb(100, 100, 100)')
}

function playTrack(index) {
    if (index < 0 || index >= pleylistF.length) return

    if (myAudio) {
        myAudio.pause()
        myAudio = null
    }

    myAudio = new Audio(pleylistF[index])
    tec = index
    highlightTrack(index)
    document.getElementById('pl').setAttribute('src', 'img/пауза.png')
    myAudio.play()
    saveProgress()
    update()
}

// ==================== ПРОГРЕСС-БАР ====================
function seekHandler(event) {
    event = event || window.event
    let clientX

    if (event.touches) {
        clientX = event.touches[0].clientX
    } else {
        clientX = event.clientX
    }

    const line = document.getElementsByClassName('line')[0]
    const rect = line.getBoundingClientRect()
    const offsetX = clientX - rect.left
    let percent = offsetX / line.offsetWidth

    if (percent < 0) percent = 0
    if (percent > 1) percent = 1

    document.getElementById('l').style.width = (percent * 100) + '%'
    if (myAudio && myAudio.duration && !isNaN(myAudio.duration)) {
        myAudio.currentTime = percent * myAudio.duration
    }
}

document.getElementsByClassName('line')[0].onmousedown = seekHandler
document.getElementsByClassName('line')[0].addEventListener('click', seekHandler)

document.getElementsByClassName('line')[0].ontouchstart = function(event) {
    event.preventDefault()
    seekHandler(event)

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
    if (tec <= 0) return
    playTrack(tec - 1)
}

function sled() {
    if (tec >= pleylistF.length - 1) return
    playTrack(tec + 1)
}

// ==================== ОБНОВЛЕНИЕ ТАЙМЕРА ====================
function update() {
    if (progressInterval) {
        clearInterval(progressInterval)
    }

    progressInterval = setInterval(function() {
        if (!myAudio || !myAudio.duration || isNaN(myAudio.duration)) return

        const maxSec = Math.floor(myAudio.duration)
        const maxMin = Math.floor(maxSec / 60)
        let maxSec2 = maxSec - (maxMin * 60)
        if (maxSec2 < 10) maxSec2 = '0' + maxSec2
        const maxTime = maxMin + ':' + maxSec2

        const sec = Math.floor(myAudio.currentTime)
        const min = Math.floor(sec / 60)
        let sec2 = sec - (min * 60)
        if (sec2 < 10) sec2 = '0' + sec2

        document.getElementById('p').textContent = min + ':' + sec2 + '/' + maxTime

        const percent = (myAudio.currentTime / maxSec) * 100
        document.getElementById('l').style.width = percent + '%'

        if (myAudio.ended && tec < pleylistF.length - 1) {
            playTrack(tec + 1)
        }
    }, 100)
}

// ==================== ПЛЕЙ / ПАУЗА ====================
function clicker() {
    const btn = document.getElementById('pl')
    if (!myAudio) return

    if (btn.getAttribute('src') === 'img/пауза.png') {
        btn.setAttribute('src', 'img/плей.png')
        myAudio.pause()
        saveProgress()
    } else {
        btn.setAttribute('src', 'img/пауза.png')
        myAudio.play()
    }
}

// ==================== КЭШ-СОХРАНЕНИЕ ПРОГРЕССА ====================
function getCacheKey() {
    const params = new URLSearchParams(window.location.search)
    const bookId = params.get('book')
    if (bookId) return 'audioProgress_' + bookId
    const path = window.location.pathname.split('/').pop().replace('.html', '')
    return 'audioProgress_' + path
}

const CACHE_KEY = getCacheKey()
const CACHE_EXPIRY_DAYS = 30

function saveProgress() {
    if (!myAudio || !myAudio.duration || isNaN(myAudio.duration)) return
    if (isRestoring) return

    const data = {
        track: tec,
        time: myAudio.currentTime,
        timestamp: Date.now()
    }

    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch (e) {
        console.warn('Не удалось сохранить прогресс:', e)
    }
}

function loadProgress() {
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return null

        const saved = JSON.parse(raw)

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
    if (!saved) return false
    if (saved.track < 0 || saved.track >= pleylistF.length) return false

    isRestoring = true
    tec = saved.track

    highlightTrack(tec)

    myAudio = new Audio(pleylistF[tec])
    myAudio.currentTime = saved.time

    document.getElementById('pl').setAttribute('src', 'img/плей.png')

    myAudio.addEventListener('loadedmetadata', function() {
        if (saved.time < myAudio.duration) {
            myAudio.currentTime = saved.time
        }
        isRestoring = false
    }, { once: true })

    if (myAudio.readyState >= 1) {
        if (saved.time < myAudio.duration) {
            myAudio.currentTime = saved.time
        }
        isRestoring = false
    }

    return true
}

// ==================== АВТОСОХРАНЕНИЕ ====================
saveInterval = setInterval(function() {
    if (myAudio && !myAudio.paused && myAudio.duration && !isNaN(myAudio.duration)) {
        saveProgress()
    }
}, 5000)

window.addEventListener('beforeunload', function() {
    saveProgress()
    if (progressInterval) clearInterval(progressInterval)
    if (saveInterval) clearInterval(saveInterval)
})

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        saveProgress()
    }
})