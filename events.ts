import { mat4, vec3 } from 'gl-matrix';

import getWindowManager from './windowManager';

let _dirty = false;

let imageDisplay = null;

const DOM_DELTA_PIXEL = 0;
const DOM_DELTA_LINE = 1;
const DOM_DELTA_PAGE = 2;

const handleResize = () => {
    getWindowManager().viewportToWindow();
};

const handleWheel = (e) => {
    e.preventDefault();
    let amount = e.deltaY;

    switch (e.deltaMode) {
        case DOM_DELTA_PIXEL:
            amount /= 100;
            break;
        case DOM_DELTA_LINE:
            amount /= 3;
            break;
        case DOM_DELTA_PAGE:
            amount *= document.body.clientHeight;
            amount /= 100;
            break;
    }

    imageDisplay.handleWheel(amount);
};

const handleMouseDown = (e) => {
    imageDisplay.handleMouseDown(e.button);
};

const handleMouseUp = (e) => {
    imageDisplay.handleMouseUp(e.button);
};

const handleMouseMove = (e) => {
    const currentMousePosition = mouseEventToVec3(e);
    imageDisplay.handleMouseMove(currentMousePosition);
};

const handleKeyup = (e) => {
    if (e.isComposing || e.keyCode === 229) {
        return;
    }

    if (e.keyCode === 79) {
        const fileSelector = <HTMLInputElement>(
            document.getElementById('file-selector')
        );
        fileSelector.click();
        fileSelector.addEventListener('change', function () {
            const file = this.files[0];

            if (!file.type.startsWith('image')) {
                throw new Error('file is not an image');
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                imageDisplay.load(e.target.result);
            };
            reader.readAsDataURL(file);
        });
    }
};

const handleKeydown = (e) => {
    if (e.isComposing || e.keyCode === 229) {
        return;
    }

    // Z
    if (e.keyCode === 90 && e.ctrlKey) {
        if (e.shiftKey) {
            imageDisplay.redo();
        } else {
            imageDisplay.undo();
        }
    }

    // R
    if (e.keyCode === 82 && e.ctrlKey) {
        imageDisplay.redo();
    }
};

const handlePointerDown = (e) => {
    if (e.pointerType === 'mouse') return;
    e.preventDefault();
    imageDisplay.handlePointerDown(e);
};

const handlePointerUp = (e) => {
    if (e.pointerType === 'mouse') return;
    e.preventDefault();
    imageDisplay.handlePointerUp(e);
};

const handlePointerMove = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    e.preventDefault();
    const currentPointerPosition = mouseEventToVec3(e);
    imageDisplay.handlePointerMove(currentPointerPosition, e);
};

const handleTouchMove = (e) => {
    e.preventDefault();
};

const mouseEventToVec3 = (e) => {
    const coord = vec3.create();
    vec3.set(coord, e.clientX, e.clientY, 0);
    return coord;
};

const registerEventHandler = (msg, fn) => {
    window.addEventListener(
        msg,
        (e) => {
            fn(e);
            _dirty = true;
        },
        { passive: false }
    );
};

export default function registerEventHandlers(imgDsp) {
    imageDisplay = imgDsp;

    registerEventHandler('resize', handleResize);

    registerEventHandler('wheel', handleWheel);
    registerEventHandler('mousedown', handleMouseDown);
    registerEventHandler('mouseup', handleMouseUp);
    registerEventHandler('mousemove', handleMouseMove);

    registerEventHandler('keyup', handleKeyup);
    registerEventHandler('keydown', handleKeydown);

    // handles Wacom tablet

    registerEventHandler('pointerdown', handlePointerDown);
    registerEventHandler('pointerup', handlePointerUp);
    registerEventHandler('pointermove', handlePointerMove);

    // iOS events

    registerEventHandler('ontouchmove', handleTouchMove);
}

export function dirty() {
    // TODO: probably something more like React, only updating if state has changed
    if (_dirty) {
        _dirty = false;
        return true;
    }

    return false;
}
