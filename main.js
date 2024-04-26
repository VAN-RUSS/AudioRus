let myAudio = 0



let tec = 0
let Name_Russian = 'Стеллар 2. Трибут'
let Name_papka = 'stellar_2' + '/'
let KolVo_files = 6
let container
let pleylistF = []
let a = -1
let pr = 0
function tec2(a) {
    tec = a
}
function xep(Name_papka, Name_Russian) {
    myAudio = new Audio(Name_papka + '00.mp3');
    while (a < KolVo_files - 1){
        a += 1
        c = a
        if (a < 10) {
            c = '0' + a
        }
        pleylistF.push(Name_papka + c + '.mp3')
        container = '<div class="pleylist_3" id="' + a + '" onclick="document.getElementById(tec).setAttribute(`style`, `background-color: rgb(70, 70, 70)`); tec2(' + a + '); myAudio.pause(); myAudio = new Audio(`' + pleylistF[a] + '`); document.getElementById(`pl`).setAttribute(`src`, `img/плей.png`); document.getElementById(`' + a + '`).setAttribute(`style`, `background-color: rgb(100, 100, 100)`);"><p class="pleylist_2">' + c + ' ' + Name_Russian + '</p></div>'
        document.getElementById('pleylist').innerHTML += container
    }
}

document.getElementsByClassName('line')[0].onmousedown = function(event) {
    event = event || window.event
    let a = event.offsetX / document.getElementsByClassName('line')[0].offsetWidth 
    document.getElementById('l').setAttribute('style', 'width: ' + a + '%;')
    a = a * Math.floor(myAudio.duration)
    myAudio.currentTime = a
}



function pred() {
    myAudio.pause()
    myAudio = new Audio(pleylistF[tec - 1]); 
    document.getElementById(tec - 1).setAttribute(`style`, `background-color: rgb(100, 100, 100)`);
    document.getElementById(tec).setAttribute(`style`, `background-color: rgb(70, 70, 70)`);
    document.getElementById(`pl`).setAttribute(`src`, `img/пауза.png`);
    myAudio.play()
    tec -= 1
}
function sled() {
    myAudio.pause()
    myAudio = new Audio(pleylistF[tec + 1]); 
    document.getElementById(tec).setAttribute(`style`, `background-color: rgb(70, 70, 70)`);
    document.getElementById(tec + 1).setAttribute(`style`, `background-color: rgb(100, 100, 100)`);
    document.getElementById(`pl`).setAttribute(`src`, `img/пауза.png`);
    myAudio.play()
    tec += 1
}


function update() {
let sec
let min = 0
let maxSec
let maxSec2
let maxMin
let maxTime
setInterval(function(){
    if (myAudio.duration == myAudio.currentTime) {
    myAudio.pause()
    myAudio = new Audio(pleylistF[tec + 1]); 
    document.getElementById(tec).setAttribute(`style`, `background-color: rgb(70, 70, 70)`);
    document.getElementById(tec + 1).setAttribute(`style`, `background-color: rgb(100, 100, 100)`);
    document.getElementById(`pl`).setAttribute(`src`, `img/пауза.png`);
    myAudio.play()
    tec += 1
    }
    maxSec = Math.floor(myAudio.duration)
    maxMin = Math.floor(maxSec / 60)
    maxSec2 = maxSec - (maxMin * 60)
    if (maxSec2 < 10) {
        maxSec2 = '0' + maxSec2
    }
    maxTime = maxMin + ':' + maxSec2
    sec = Math.floor(myAudio.currentTime)
    min = Math.floor(sec / 60)
    sec2 = sec - (min * 60)
    if (sec2 < 10) {
        sec2 = '0' + sec2
    }
    document.getElementById('p').textContent = min + ':' + sec2 + '/' + maxTime
    document.getElementById('l').setAttribute('style', 'width: ' + Math.floor(myAudio.currentTime) / maxSec * 100 + '%;')
}, 100)
}

update()

function clicker() {
    let a = document.getElementById('pl')
    if (a.getAttribute('src') == 'img/пауза.png') {
        a.setAttribute('src', 'img/плей.png')
        myAudio.pause()
    }
    else {
        if (a.getAttribute('src') == "img/плей.png") {
        a.setAttribute('src', 'img/пауза.png')
        myAudio.play()
    }}
}
