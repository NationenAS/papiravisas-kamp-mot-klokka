/* Appear */
const appearElements = document.querySelectorAll('.appear'),
    appearObs = new IntersectionObserver(e => {
    e.forEach(entry => {
        let t = entry.target
        if (entry.isIntersecting) t.classList.add('appeared')
    })
})
appearElements.forEach(e => { appearObs.observe(e) })

/* Video autoplay */
const videos = document.querySelectorAll('video'),
    videoObs = new IntersectionObserver(e => {
    e.forEach(entry => {
        let t = entry.target
        if (!entry.isIntersecting && !t.paused) t.pause()
        else if (entry.isIntersecting && t.paused) t.play()
    })
}, { threshold: 0.6 })
videos.forEach(e => { videoObs.observe(e) })

/* Route */ 
const route = [
    {
        'name': 'Trykk',
        'offset': 980,
        'distance': 0,
        'timestamp': '2022-08-15T14:51Z',
        'ferries': 0      
    },
    {
        'name': 'I trykken',
        'offset': 980,
        'distance': 0,
        'timestamp': '2022-08-15T14:51Z',
        'ferries': 0      
    },
    {
        'name': 'Avgang',
        'offset': 980,
        'distance': 0,
        'timestamp': '2022-08-15T19:08Z',
        'ferries': 0
    },
    {
        'name': 'Halsa ferjekai',
        'offset': 662,
        'distance': 103,        
        'timestamp': '2022-08-15T20:40Z',
        'ferries': 0
    },
    {
        'name': 'Molde ferjekai',
        'offset': 433,
        'distance': 177,
        'timestamp': '2022-08-15T22:45Z',
        'ferries': 1
    },
    {
        'name': 'Solavågen ferjekai',
        'offset': 188,
        'distance': 200,
        'timestamp': '2022-08-16T00:40Z',
        'ferries': 2
    },
    {
        'name': 'Ørsta sentrum',
        'offset': 61,
        'distance': 296,
        'timestamp': '2022-08-16T02:02Z',
        'ferries': 3
    },
    {
        'name': 'Abonnent',
        'offset': 0,
        'distance': 316,
        'timestamp': '2022-08-16T02:33Z',
        'ferries': 3
    }
]

// Config
let travelStatus = 0, // Array index
    routeTime = 8000,
    __mapContainer = document.querySelector('.route-map-container'),
    __info = document.querySelector('.route-info'),
    __path = document.querySelector('.route-map-route'),
    __point = document.querySelector('.route-point-indicator'),
    __hours = document.querySelector('.route-hours'),
    __minutes = document.querySelector('.route-minutes'),
    __ferries = document.querySelector('.route-ferries'),
    __distance = document.querySelector('.route-distance')

// General functions
function mToHm(min) {
    return {'hrs': Math.floor(min / 60), 'min': min % 60}
}
function getLineProgressCoordinates(path, from, to, progress) {
    px = Math.round(from + ((to - from) * progress))
    pt = path.getPointAtLength(px)
    return {'x': Math.round(pt.x), 'y': Math.round(pt.y)}
}
function setActivePoint(path, point, px) {
    pt = path.getPointAtLength(px)
    point.style.cx = pt.x
    point.style.cy = pt.y
    point.style.transformOrigin = pt.x + "px " + pt.y + "px"
}

// Animate
function travelAnimate(from, to) {
    let s = null
    let px = to.offset - from.offset
    let duration = Math.max((Math.abs(px) / route[0].offset) * routeTime, 1500) // Duration in ms, minimum 1500
    let minutes = ((new Date(to.timestamp)) - (new Date(from.timestamp))) / 60000
    let minutesFrom = ((new Date(from.timestamp)) - (new Date(route[0].timestamp))) / 60000
    let distance = to.distance - from.distance
    let ferries = to.ferries - from.ferries
    let toInvert = route[0].offset - to.offset
	let fromInvert = route[0].offset - from.offset
    function step(t) {
        if (!s) s = t // First frame timestamp
        let ms = t - s // Ms passed
        let progress = (ms / duration).toPrecision(2) // Ratio of duration
        progress = -(Math.cos(Math.PI * progress) - 1) / 2 // Easing in/out
        let stopwatch = mToHm(Math.round(minutesFrom + (minutes * progress)))
        let car = getLineProgressCoordinates(__path, fromInvert, toInvert, progress)
        __hours.innerHTML = stopwatch.hrs
        __minutes.innerHTML = stopwatch.min
        __ferries.innerHTML = Math.round(from.ferries + (ferries * progress))
        __distance.innerHTML = Math.round(from.distance + (distance * progress))
        __path.style.strokeDashoffset = Math.round(from.offset + (px * progress)) + 'px'
        // __point.style.cx = car.x
		// __point.style.cy = car.y
        __point.style.transform = `translate(${car.x}px, ${car.y}px)`
        if (ms < duration) window.requestAnimationFrame(step)
        // else (setActivePoint(__path, __point, toInvert))
    }
    window.requestAnimationFrame(step)
}

// Set route for animation and update travel status
function travelTo(d) {
    let i = route.findIndex((a) => a.name == d)
    if (i != travelStatus) {
        travelAnimate(route[travelStatus], route[i])
        travelStatus = i
    }
}

// Observe section triggers
var sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        let t = entry.target
        let s = t.parentNode
        if (entry.isIntersecting && s.dataset.section) {
            let sectionName = s.dataset.section
            s.classList.add('active')
            s.querySelector('.route-map-target').append(__mapContainer)
            s.querySelector('.route-info-target').append(__info)
            setTimeout(() => { travelTo(sectionName) }, 1000)
        }
        else s.classList.remove('active')
    })
}, { threshold: 0.1 })
const sections = document.querySelectorAll('.route-trigger')
sections.forEach(s => sectionObserver.observe(s))


/* Toggle dark mode */
function toggleDark(el) {
    document.body.classList.toggle('dark')
    let dark = document.body.classList.contains('dark')
    el.innerHTML = dark ? "Bli lys ☀️" : "Gjør mørk 🌙"
    el.parentNode.querySelector('span').innerHTML = dark ? "Hei! Du leser nå artikkelen i mørk utgave. Synes du det er rart, kan du endre til lys utgave." : "Hei! Du leser nå artikkelen i lys utgave. Ble det for kjedelig, endre til mørk!"
}