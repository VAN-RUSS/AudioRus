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
let progressInterval = null
let saveInterval = null
let isRestoring = false

// ==================== УТИЛИТЫ ====================
function tec2(a) {
    tec = a
}

// Генерация плейлиста
function xep(Name_papka, Name_Russian, KolVo_files, diskKey) {
    a = -1;
    pleylistF = [];
    document.getElementById('pleylist').innerHTML = '';

    const isYandexDisk = diskKey && diskKey.length > 0;

    if (isYandexDisk) {
        // --- Режим Яндекс.Диска ---
        let publicKey = diskKey;
        if (publicKey.startsWith('http://')) {
            publicKey = publicKey.replace('http://', 'https://');
        }

        const apiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources?public_key=${encodeURIComponent(publicKey)}&limit=1000`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data._embedded && data._embedded.items) {
                    const items = data._embedded.items;
                    const mp3Files = items
                        .filter(item => item.name.endsWith('.mp3'))
                        .sort((a, b) => a.name.localeCompare(b.name));

                    if (mp3Files.length === 0) {
                        console.error('MP3 файлы не найдены');
                        document.getElementById('pleylist').innerHTML = '<div style="padding: 20px; text-align: center; color: var(--player-text);">MP3 файлы не найдены</div>';
                        return;
                    }

                    // Создаем плейлист с прямыми ссылками (SW их проксирует)
                    mp3Files.forEach((fileMetadata, index) => {
                        // Используем прямые ссылки без прокси — Service Worker обработает
                        pleylistF.push(fileMetadata.file);

                        let displayName = fileMetadata.name.replace('.mp3', '');
                        if (displayName.includes('?')) {
                            displayName = displayName.split('?')[0];
                        }

                        container = '<div class="pleylist_3" id="' + index + '" onclick="document.getElementById(tec).setAttribute(`style`, `background-color: rgb(70, 70, 70)`); tec2(' + index + '); myAudio.pause(); myAudio = new Audio(`' + pleylistF[index] + '`); myAudio.play(); document.getElementById(`pl`).setAttribute(`src`, `img/пауза.png`); document.getElementById(`' + index + '`).setAttribute(`style`, `background-color: rgb(100, 100, 100)`); saveProgress(); update();"><p class="pleylist_2">' + displayName + ' ' + Name_Russian + '</p></div>';
                        document.getElementById('pleylist').innerHTML += container;
                    });

                    // Запускаем плеер
                    const restored = restoreProgress();
                    if (!restored) {
                        tec = 0;
                        myAudio = new Audio(pleylistF[0]);
                        document.getElementById('0').setAttribute('style', 'background-color: rgb(100, 100, 100)');
                    }
                    update();
                } else {
                    console.error('Неверный формат ответа от API');
                    document.getElementById('pleylist').innerHTML = '<div style="padding: 20px; text-align: center; color: var(--player-text);">Ошибка загрузки плейлиста</div>';
                }
            })
            .catch(error => {
                console.error('Ошибка при запросе к API Яндекс.Диска:', error);
                document.getElementById('pleylist').innerHTML = '<div style="padding: 20px; text-align: center; color: var(--player-text);">Не удалось загрузить плейлист. Проверьте интернет.</div>';
            });

    } else {
        // --- Локальный режим ---
        const basePath = Name_papka;

        while (a < KolVo_files - 1) {
            a += 1;
            c = a;
            if (a < 10) {
                c = '0' + a;
            }
            pleylistF.push(basePath + c + '.mp3');
            container = '<div class="pleylist_3" id="' + a + '" onclick="document.getElementById(tec).setAttribute(`style`, `background-color: rgb(70, 70, 70)`); tec2(' + a + '); myAudio.pause(); myAudio = new Audio(`' + pleylistF[a] + '`); myAudio.play(); document.getElementById(`pl`).setAttribute(`src`, `img/пауза.png`); document.getElementById(`' + a + '`).setAttribute(`style`, `background-color: rgb(100, 100, 100)`); saveProgress(); update();"><p class="pleylist_2">' + c + ' ' + Name_Russian + '</p></div>';
            document.getElementById('pleylist').innerHTML += container;
        }

        const restored = restoreProgress();
        if (!restored) {
            tec = 0;
            myAudio = new Audio(pleylistF[0]);
            document.getElementById('0').setAttribute('style', 'background-color: rgb(100, 100, 100)');
        }
        update();
    }
}

// ==================== ПРОГРЕСС-БАР (МЫШЬ + TOUCH) ====================
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
    let a = offsetX / line.offsetWidth

    if (a < 0) a = 0
    if (a > 1) a = 1

    document.getElementById('l').style.width = (a * 100) + '%'
    if (myAudio && myAudio.duration && !isNaN(myAudio.duration)) {
        myAudio.currentTime = a * Math.floor(myAudio.duration)
    }
}

document.getElementsByClassName('line')[0].onmousedown = seekHandler

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
    myAudio.pause()
    myAudio = new Audio(pleylistF[tec - 1])
    document.getElementById(tec - 1).setAttribute(`style`, `background-color: rgb(100, 100, 100)`)
    document.getElementById(tec).setAttribute(`style`, `background-color: rgb(70, 70, 70)`)
    document.getElementById(`pl`).setAttribute(`src`, `img/пауза.png`)
    myAudio.play()
    tec -= 1
    saveProgress()
    update()
}

function sled() {
    if (tec >= pleylistF.length - 1) return
    myAudio.pause()
    myAudio = new Audio(pleylistF[tec + 1])
    document.getElementById(tec).setAttribute(`style`, `background-color: rgb(70, 70, 70)`)
    document.getElementById(tec + 1).setAttribute(`style`, `background-color: rgb(100, 100, 100)`)
    document.getElementById(`pl`).setAttribute(`src`, `img/пауза.png`)
    myAudio.play()
    tec += 1
    saveProgress()
    update()
}

// ==================== ОБНОВЛЕНИЕ ТАЙМЕРА И ПОЛОСЫ ====================
function update() {
    if (progressInterval) {
        clearInterval(progressInterval)
    }

    progressInterval = setInterval(function() {
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

        let progressPercent = (myAudio.currentTime / maxSec) * 100
        document.getElementById('l').style.width = progressPercent + '%'

        if (myAudio.ended && pleylistF.length > 0 && tec < pleylistF.length - 1) {
            myAudio.pause()
            document.getElementById(tec).setAttribute(`style`, `background-color: rgb(70, 70, 70)`)
            tec += 1
            myAudio = new Audio(pleylistF[tec])
            document.getElementById(tec).setAttribute(`style`, `background-color: rgb(100, 100, 100)`)
            document.getElementById(`pl`).setAttribute(`src`, `img/пауза.png`)
            myAudio.play()
            saveProgress()
            update()
        }
    }, 100)
}

// ==================== ПЛЕЙ / ПАУЗА ====================
function clicker() {
    let a = document.getElementById('pl')
    if (a.getAttribute('src') === 'img/пауза.png') {
        a.setAttribute('src', 'img/плей.png')
        myAudio.pause()
        saveProgress()
    } else if (a.getAttribute('src') === 'img/плей.png') {
        a.setAttribute('src', 'img/пауза.png')
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
    if (!myAudio || !myAudio.duration || isNaN(myAudio.duration) || myAudio.duration === 0) return
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

// ==================== РЕГИСТРАЦИЯ SERVICE WORKER ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/Sorokin_Ivan_the_end_project/sw.js')
            .then(function(registration) {
                console.log('Service Worker зарегистрирован:', registration.scope);
            })
            .catch(function(error) {
                console.log('Ошибка регистрации Service Worker:', error);
            });
    });
}

// ==================== АВТОСОХРАНЕНИЕ И ЗАКРЫТИЕ ====================
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