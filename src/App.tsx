import { onCleanup, onMount, createSignal } from 'solid-js'

const getRandomInt = (max: number): number => {
    return Math.floor(Math.random() * max)
}

interface ShapeAttributes {
    [key: string]: number | string
}

const createRandomElement = (namespace: string, tagName: string): SVGElement => {
    const element = document.createElementNS(namespace, tagName) as SVGElement
    const attributes = getAttributesForShape(tagName)

    Object.keys(attributes).forEach(attr => {
        element.setAttribute(attr, attributes[attr].toString())
    })

    element.style.fill = `rgb(${getRandomInt(256)}, ${getRandomInt(256)}, ${getRandomInt(256)})`
    return element
}

const getAttributesForShape = (tagName: string): ShapeAttributes => {
    const baseValue = 500
    const baseSize = 50
    switch (tagName) {
        case 'circle':
            return { cx: getRandomInt(baseValue), cy: getRandomInt(baseValue), r: getRandomInt(baseSize) }
        case 'rect':
            return { x: getRandomInt(baseValue - baseSize), y: getRandomInt(baseValue - baseSize), width: getRandomInt(baseSize), height: getRandomInt(baseSize) }
        case 'ellipse':
            return { cx: getRandomInt(baseValue), cy: getRandomInt(baseValue), rx: getRandomInt(baseSize), ry: getRandomInt(baseSize / 2) }
        case 'line':
            return { x1: getRandomInt(baseValue), y1: getRandomInt(baseValue), x2: getRandomInt(baseValue), y2: getRandomInt(baseValue) }
        case 'polyline':
        case 'polygon':
            return { points: `${getRandomInt(baseValue)},${getRandomInt(baseValue)} ${getRandomInt(baseValue)},${getRandomInt(baseValue)} ${getRandomInt(baseValue)},${getRandomInt(baseValue)}` }
        default:
            console.error('Unsupported tag name')
            return {}
    }
}

const fade = (element: Element, start: number, end: number, duration: number, callback?: () => void): void => {
    let opacity = start
    let delta = (end - start) / (duration / 50)
    const timer = setInterval(() => {
        opacity += delta;
        (element as any).style.opacity = opacity.toString()

        if ((delta > 0 && opacity >= end) || (delta < 0 && opacity <= end)) {
            clearInterval(timer)
            if (callback) callback()
        }
    }, 50)
}

export const useAnimatedSvg = (namespace: string, tagName: string) => {
    const [svgRef, setSvgRef] = createSignal<SVGElement>()

    onMount(() => {
        const svg = svgRef()
        if (!svg) return

        const updateSvg = () => {
            fade(svg as Element, 1, 0, 500, () => {
                while (svg.firstChild) {
                    svg.removeChild(svg.firstChild)
                }

                for (let i = 0; i < 10; i++) {
                    svg.appendChild(createRandomElement(namespace, tagName))
                }

                fade(svg as Element, 0, 1, 500)
            })
        }

        updateSvg()
        const interval = setInterval(updateSvg, 3000)

        onCleanup(() => clearInterval(interval))
    })

    return setSvgRef
}

export default function App() {
    const setSvgRef = useAnimatedSvg('http://www.w3.org/2000/svg', 'circle')

    return (
        <div>
            <svg ref={setSvgRef} style={{ width: '500px', height: '500px', border: '1px solid black' }} />
        </div>
    )
}
