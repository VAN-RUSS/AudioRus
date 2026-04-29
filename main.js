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
let audioBlobUrls = [] // Храним Blob URL для аудио

// ==================== УТИЛИТЫ ====================
function tec2(a) {
    tec = a
}

// Функция для создания проксированного аудио
function createProxiedAudio(url) {
    // Возвращаем Promise с Audio элементом
    return fetch(url, {
        method: 'GET',
        headers: {
            'Referer': 'https://disk.yandex.ru/',
            'Origin': 'https://disk.yandex.ru'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.blob();
    })
    .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        audioBlobUrls.push(blobUrl); // Сохраняем для очистки
        const audio = new Audio(blobUrl);
        return audio;
    });
}

// Генерация плейлиста
function xep(Name_papka, Name_Russian, KolVo_files, diskKey) {
    a = -1;
    pleylistF = [];
    document.getElementById('pleylist').innerHTML = '';

    // Очищаем старые Blob URL
    audioBlobUrls.forEach(url => URL.revokeObjectURL(url));
    audioBlobUrls = [];

    const isYandexDisk = diskKey && diskKey.length > 0;

    if (isYandexDisk) {
        // --- Режим Яндекс.Диска ---
        let publicKey = diskKey;
        if (publicKey.startsWith('http://')) {
            publicKey = publicKey.replace('http://', 'https://');
        }

        const apiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources?public_key=${encodeURIComponent(publicKey)}&limit=1000`;

        // Показываем индикатор загрузки
        document.getElementById('pleylist').innerHTML = '<div style="padding: 20px; text-align: center; color: var(--player-text);">Загрузка плейлиста...</div>';

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data._embedded && data._embedded.items) {
                    const items = data._embedded.items;
                    const mp3Files = items
                        .filter(item => item.name.endsWith('.mp3'))
                        .sort((a, b) => a.name.localeCompare(b.name));

                    if (mp3Files.length === 0) {
                        document.getElementById('pleylist').innerHTML = '<div style="padding: 20px; text-align: center; color: var(--player-text);">MP3 файлы не найдены</div>';
                        return;
                    }

                    document.getElementById('pleylist').innerHTML = '';

                    // Сохраняем прямые ссылки
                    pleylistF = mp3Files.map(file => file.file);

                    // Создаем HTML плейлиста
                    mp3Files.forEach((fileMetadata, index) => {
                        let displayName = fileMetadata.name.replace('.mp3', '');
                        if (displayName.includes('?')) {
                            displayName = displayName.split('?')[0];
                        }

                        container = '<div class="pleylist_3" id="' + index + '" onclick="playTrack(' + index + ')"><p class="pleylist_2">' + displayName + ' ' + Name_Russian + '</p></div>';
                        document.getElementById('pleylist').innerHTML += container;
                    });

                    // Начинаем загрузку первого трека
                    loadAndPlayTrack(0, true);
                }
            })
            .catch(error => {
                console.error('Ошибка при запросе к API Яндекс.Диска:', error);
                document.getElementById('pleylist').innerHTML = '<div style="padding: 20px; text-align: center; color: var(--player-text);">Ошибка загрузки плейлиста</div>';
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
            container = '<div class="pleylist_3" id="' + a + '" onclick="playTrack(' + a + ')"><p class="pleylist_2">' + c + ' ' + Name_Russian + '</p></div>';
            document.getElementById('pleylist').innerHTML += container;
        }

        // Для локальных файлов — обычное аудио
        const restored = restoreProgress();
        if (!restored) {
            tec = 0;
            myAudio = new Audio(pleylistF[0]);
            document.getElementById('0').setAttribute('style', 'background-color: rgb(100, 100, 100)');
        }
        update();
    }
}

// Новая функция для загрузки и воспроизведения трека
function loadAndPlayTrack(trackIndex, isInitial) {
    const url = pleylistF[trackIndex];

    // Подсвечиваем трек
    for (let i = 0; i < pleylistF.length; i++) {
        const el = document.getElementById(i);
        if (el) el.setAttribute('style', 'background-color: rgb(70, 70, 70)');
    }
    document.getElementById(trackIndex).setAttribute('style', 'background-color: rgb(100, 100, 100)');

    document.getElementById('pleylist').style.opacity = '0.5';

    createProxiedAudio(url)
        .then(audio => {
            myAudio = audio;
            tec = trackIndex;

            document.getElementById('pl').setAttribute('src', 'img/пауза.png');
            document.getElementById('pleylist').style.opacity = '1';

            // Восстанавливаем прогресс если это начальная загрузка
            if (isInitial) {
                const restored = restoreProgress();
                if (!restored) {
                    myAudio.play();
                }
            } else {
                myAudio.play();
            }

            update();
            saveProgress();
        })
        .catch(error => {
            console.error('Ошибка загрузки аудио:', error);
            document.getElementById('pleylist').style.opacity = '1';
            alert('Не удалось загрузить аудиофайл. Попробуйте позже.');
        });
}

// Функция для воспроизведения трека при клике
function playTrack(index) {
    if (myAudio) {
        myAudio.pause();
        // Очищаем старый Blob URL если это был Яндекс.Диск
        if (myAudio.src.startsWith('blob:')) {
            URL.revokeObjectURL(myAudio.src);
        }
    }

    document.getElementById('pl').setAttribute('src', 'img/пауза.png');

    // Если это Яндекс.Диск — проксируем
    if (pleylistF[index].includes('disk.yandex')) {
        loadAndPlayTrack(index, false);
    } else {
        // Локальные файлы
        myAudio = new Audio(pleylistF[index]);
        tec = index;

        for (let i = 0; i < pleylistF.length; i++) {
            const el = document.getElementById(i);
            if (el) el.setAttribute('style', 'background-color: rgb(70, 70, 70)');
        }
        document.getElementById(index).setAttribute('style', 'background-color: rgb(100, 100, 100)');

        myAudio.play();
        update();
        saveProgress();
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
    playTrack(tec - 1)
}

function sled() {
    if (tec >= pleylistF.length - 1) return
    myAudio.pause()
    playTrack(tec + 1)
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
            playTrack(tec + 1)
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

    document.getElementById('pl').setAttribute('src', 'img/плей.png')

    // Для Яндекс.Диска нужно пересоздать аудио с прокси
    if (pleylistF[tec].includes('disk.yandex')) {
        createProxiedAudio(pleylistF[tec])
            .then(audio => {
                myAudio = audio;
                myAudio.currentTime = saved.time;

                myAudio.addEventListener('loadedmetadata', function() {
                    if (saved.time < myAudio.duration) {
                        myAudio.currentTime = saved.time;
                    }
                    isRestoring = false;
                }, { once: true });

                if (myAudio.readyState >= 1) {
                    if (saved.time < myAudio.duration) {
                        myAudio.currentTime = saved.time;
                    }
                    isRestoring = false;
                }
            });
    } else {
        myAudio = new Audio(pleylistF[tec])
        myAudio.currentTime = saved.time

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
    }

    return true
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
    // Очищаем Blob URL при уходе
    audioBlobUrls.forEach(url => URL.revokeObjectURL(url));
})

document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        saveProgress()
    }
})