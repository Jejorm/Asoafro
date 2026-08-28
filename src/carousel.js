import EmblaCarousel from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'

const addTogglePrevNextBtnsActive = (emblaApi, prevBtn, nextBtn) => {
    const togglePrevNextBtnsState = () => {
        if (emblaApi.canScrollPrev()) prevBtn.removeAttribute('disabled')
        else prevBtn.setAttribute('disabled', 'disabled')

        if (emblaApi.canScrollNext()) nextBtn.removeAttribute('disabled')
        else nextBtn.setAttribute('disabled', 'disabled')
    }

    emblaApi
        .on('select', togglePrevNextBtnsState)
        .on('init', togglePrevNextBtnsState)
        .on('reInit', togglePrevNextBtnsState)

    return () => {
        prevBtn.removeAttribute('disabled')
        nextBtn.removeAttribute('disabled')
    }
}

const addPrevNextBtnsClickHandlers = (emblaApi, prevBtn, nextBtn) => {
    const scrollPrev = () => {
        emblaApi.scrollPrev()
    }
    const scrollNext = () => {
        emblaApi.scrollNext()
    }
    prevBtn.addEventListener('click', scrollPrev, false)
    nextBtn.addEventListener('click', scrollNext, false)

    const removeTogglePrevNextBtnsActive = addTogglePrevNextBtnsActive(
        emblaApi,
        prevBtn,
        nextBtn
    )

    return () => {
        removeTogglePrevNextBtnsActive()
        prevBtn.removeEventListener('click', scrollPrev, false)
        nextBtn.removeEventListener('click', scrollNext, false)
    }
}

const addDotBtns = (emblaApi, dotsNode) => {
    let dotNodes = []

    const addDotBtnsWithClickHandlers = () => {
        dotsNode.innerHTML = emblaApi
            .scrollSnapList()
            .map(
                (_, index) =>
                    `<button class="embla__dot" type="button" aria-label="Ir a la imagen ${index + 1}"></button>`
            )
            .join('')

        dotNodes = Array.from(dotsNode.querySelectorAll('.embla__dot'))
        dotNodes.forEach((dotNode, index) => {
            dotNode.addEventListener(
                'click',
                () => emblaApi.scrollTo(index),
                false
            )
        })
    }

    const toggleDotBtnsActive = () => {
        const previous = emblaApi.previousScrollSnap()
        const selected = emblaApi.selectedScrollSnap()
        dotNodes[previous]?.classList.remove('embla__dot--selected')
        dotNodes[selected]?.classList.add('embla__dot--selected')
    }

    emblaApi
        .on('reInit', addDotBtnsWithClickHandlers)
        .on('reInit', toggleDotBtnsActive)
        .on('select', toggleDotBtnsActive)

    // `init` already fired while EmblaCarousel() was constructing, so the
    // first build has to be kicked off by hand — same as the snap display.
    addDotBtnsWithClickHandlers()
    toggleDotBtnsActive()

    return () => {
        dotsNode.innerHTML = ''
    }
}

const updateSelectedSnapDisplay = (emblaApi, snapDisplay) => {
    const updateSnapDisplay = (emblaApi) => {
        const selectedSnap = emblaApi.selectedScrollSnap()
        const snapCount = emblaApi.scrollSnapList().length
        const pad = (value) => String(value).padStart(2, '0')
        snapDisplay.innerHTML = `${pad(selectedSnap + 1)} / ${pad(snapCount)}`
    }

    emblaApi.on('select', updateSnapDisplay).on('reInit', updateSnapDisplay)
    updateSnapDisplay(emblaApi)

    return () => {
        emblaApi.off('select', updateSnapDisplay).off('reInit', updateSnapDisplay)
    }
}

// The autoplay pause/resume toggle. Autoplay that starts on its own and never
// stops fails WCAG 2.2.2, so the button is the explicit stop mechanism. It only
// exists when the Autoplay plugin was actually loaded (i.e. not when the visitor
// prefers reduced motion — there is nothing to pause then).
const addAutoplayToggle = (emblaApi, toggleBtn) => {
    const autoplay = emblaApi?.plugins()?.autoplay
    if (!autoplay || !toggleBtn) return () => {}

    toggleBtn.classList.remove('hidden')
    toggleBtn.classList.add('flex')

    const pauseIcon = toggleBtn.querySelector('.embla__autoplay-pause')
    const playIcon = toggleBtn.querySelector('.embla__autoplay-play')

    const render = () => {
        const playing = autoplay.isPlaying()
        // Inline display, not a `hidden` utility: the unlayered global
        // `svg { display: block }` reset in Layout.astro outweighs Tailwind's
        // layered `.hidden`, so the class would never take effect on an <svg>.
        pauseIcon.style.display = playing ? '' : 'none'
        playIcon.style.display = playing ? 'none' : ''
        toggleBtn.setAttribute('aria-pressed', String(!playing))
        toggleBtn.setAttribute(
            'aria-label',
            playing
                ? 'Pausar el cambio automático de imágenes'
                : 'Reanudar el cambio automático de imágenes'
        )
    }

    const onClick = () => {
        if (autoplay.isPlaying()) autoplay.stop()
        else autoplay.play()
        render()
    }

    toggleBtn.addEventListener('click', onClick)
    emblaApi.on('autoplay:play', render).on('autoplay:stop', render)
    render()

    return () => {
        toggleBtn.removeEventListener('click', onClick)
        emblaApi.off('autoplay:play', render).off('autoplay:stop', render)
    }
}

const addNavBtnListeners = (emblaApi, ...navButtons) => {
    const onNavClick = () => {
        const autoplay = emblaApi?.plugins()?.autoplay
        if (!autoplay) return

        const resetOrStop =
            autoplay.options.stopOnInteraction === false
                ? autoplay.stop
                : autoplay.reset

        resetOrStop()
    }

    navButtons.forEach((navButton) =>
        navButton.addEventListener('click', onNavClick, true)
    )

    return () => {
        navButtons.forEach((navButton) =>
            navButton.removeEventListener('click', onNavClick, true)
        )
    }
}

const OPTIONS = { loop: true }

const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
).matches

const emblaNode = document.querySelector('.embla')
const viewportNode = emblaNode.querySelector('.embla__viewport')
const prevBtnNode = emblaNode.querySelector('.embla__button--prev')
const nextBtnNode = emblaNode.querySelector('.embla__button--next')
const dotsNode = emblaNode.querySelector('.embla__dots')
const snapDisplayNode = emblaNode.querySelector('.embla__selected-snap-display')
const autoplayBtnNode = emblaNode.querySelector('.embla__autoplay')

const emblaApi = EmblaCarousel(
    viewportNode,
    OPTIONS,
    prefersReducedMotion ? [] : [Autoplay({ playOnInit: true, delay: 3000 })]
)

const removePrevNextBtnsClickHandlers = addPrevNextBtnsClickHandlers(
    emblaApi,
    prevBtnNode,
    nextBtnNode
)
const removeDotBtns = addDotBtns(emblaApi, dotsNode)
const stopSelectedSnapDisplay = updateSelectedSnapDisplay(
    emblaApi,
    snapDisplayNode
)

const removeNavBtnListeners = addNavBtnListeners(
    emblaApi,
    prevBtnNode,
    nextBtnNode,
    dotsNode
)
const removeAutoplayToggle = addAutoplayToggle(emblaApi, autoplayBtnNode)

emblaApi.on('destroy', removePrevNextBtnsClickHandlers)
emblaApi.on('destroy', removeDotBtns)
emblaApi.on('destroy', stopSelectedSnapDisplay)
emblaApi.on('destroy', removeNavBtnListeners)
emblaApi.on('destroy', removeAutoplayToggle)
