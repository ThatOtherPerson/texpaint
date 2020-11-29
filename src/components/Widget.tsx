import * as React from 'react';
import { createContext, useContext, useEffect, useRef } from 'react';
import { vec3 } from 'gl-matrix';
import WindowManager from '../windowManager';

const MOUSE_EVENTS = [
    'onClick',
    'onContextMenu',
    'onDoubleClick',
    'onDrag',
    'onDragEnd',
    'onDragEnter',
    'onDragExit',
    'onDragLeave',
    'onDragOver',
    'onDragStart',
    'onDrop',
    'onMouseDown',
    'onMouseEnter',
    'onMouseLeave',
    'onMouseMove',
    'onMouseOut',
    'onMouseOver',
    'onMouseUp',
];

const POINTER_EVENTS = [
    'onPointerDown',
    'onPointerMove',
    'onPointerUp',
    'onPointerCancel',
    'onGotPointerCapture',
    'onLostPointerCapture',
    'onPointerEnter',
    'onPointerLeave',
    'onPointerOver',
    'onPointerOut',
];

export default function Widget({ type, widgetProps, ...props }) {
    const windowManager = useContext(WindowContext);
    const div = useRef(null);

    useEffect(() => {
        const bounds = div.current.getBoundingClientRect();
        const position = vec3.create();
        vec3.set(position, bounds.x, bounds.y, 0);

        const drawId = windowManager.addToDrawList(
            type,
            position,
            bounds.width,
            bounds.height,
            widgetProps,
            props.zindex || 0
        );

        return () => {
            windowManager.removeFromDrawList(drawId);
        };
    });

    const mouseRelativeHandler = (fn?: (e: React.MouseEvent) => void) => {
        if (!fn) return;

        return (e: React.MouseEvent) => {
            const bounds = div.current.getBoundingClientRect();
            e.clientX -= bounds.x;
            e.clientY -= bounds.y;

            fn(e);
        };
    };

    const pointerHandler = (fn?: (e: React.PointerEvent) => void) => {
        if (!fn) return;

        return (e: React.PointerEvent) => {
            const bounds = div.current.getBoundingClientRect();
            e.clientX -= bounds.x;
            e.clientY -= bounds.y;

            if (e.pointerType === 'mouse') {
                e.pressure = 1.0;
            }

            fn(e);
        };
    };

    for (let i = 0; i < MOUSE_EVENTS.length; i++) {
        const eventName = MOUSE_EVENTS[i];
        if (props.hasOwnProperty(eventName)) {
            props[eventName] = mouseRelativeHandler(props[eventName]);
        }
    }

    for (let i = 0; i < POINTER_EVENTS.length; i++) {
        const eventName = POINTER_EVENTS[i];
        if (props.hasOwnProperty(eventName)) {
            props[eventName] = pointerHandler(props[eventName]);
        }
    }

    return (
        <div {...props} ref={div} className={`widget ${props.className}`}></div>
    );
}

export const WindowContext: React.Context<WindowManager> = createContext(null);
