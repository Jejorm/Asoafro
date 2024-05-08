import EmblaCarousel from 'embla-carousel'
import AutoHeight from 'embla-carousel-auto-height'
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

const updateSelectedSnapDisplay = (emblaApi, snapDisplay) => {
    const updateSnapDisplay = (emblaApi) => {
        const selectedSnap = emblaApi.selectedScrollSnap()
        const snapCount = emblaApi.scrollSnapList().length
        snapDisplay.innerHTML = `${selectedSnap + 1} / ${snapCount}`
    }

    emblaApi.on('select', updateSnapDisplay).on('reInit', updateSnapDisplay)
    updateSnapDisplay(emblaApi)

    return () => {
        emblaApi.off('select', updateSnapDisplay).off('reInit', updateSnapDisplay)
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

const emblaNode = document.querySelector('.embla')
const viewportNode = emblaNode.querySelector('.embla__viewport')
const prevBtnNode = emblaNode.querySelector('.embla__button--prev')
const nextBtnNode = emblaNode.querySelector('.embla__button--next')
const snapDisplayNode = emblaNode.querySelector('.embla__selected-snap-display')

const emblaApi = EmblaCarousel(viewportNode, OPTIONS, [AutoHeight(), Autoplay({
    playOnInit: true, delay: 3000
})])

const removePrevNextBtnsClickHandlers = addPrevNextBtnsClickHandlers(
    emblaApi,
    prevBtnNode,
    nextBtnNode
)
const stopSelectedSnapDisplay = updateSelectedSnapDisplay(
    emblaApi,
    snapDisplayNode
)

const removeNavBtnListeners = addNavBtnListeners(emblaApi, prevBtnNode, nextBtnNode)

emblaApi.on('destroy', removePrevNextBtnsClickHandlers)
emblaApi.on('destroy', stopSelectedSnapDisplay)
emblaApi.on('destroy', removeNavBtnListeners)

