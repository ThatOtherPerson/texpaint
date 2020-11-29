import { vec3 } from 'gl-matrix';
import * as React from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ColorSelect from './widgets/colorSelect';
import ColorWheel from './components/ColorWheel';
import { WindowContext } from './components/Widget';
import WindowManager from './windowManager';
import TextureDisplay from './widgets/textureDisplay';
import TexturePaint from './components/TexturePaint';
import Mesh from './mesh';
import MeshPaint from './components/MeshPaint';
import MeshDisplay from './widgets/meshDisplay';
import Widget from './widget';

const Renderer = ({
    widgets,
    children,
}: {
    widgets: (new () => Widget)[];
    children: any;
}) => {
    const canvas = useRef(null);
    const [windowManager, setWindowManager] = useState(null);

    useEffect(() => {
        if (windowManager === null) {
            setWindowManager(new WindowManager(canvas.current, widgets));
        } else {
            windowManager.draw();
        }
    });

    return (
        <>
            <WindowContext.Provider value={windowManager}>
                {windowManager ? children : 'GL not yet started'}
            </WindowContext.Provider>
            <canvas id="application" ref={canvas} />
        </>
    );
};

const BrushColor = () => {
    const windowManager = useContext(WindowContext);

    const [brushColor, setBrushColor] = useState(vec3.create());
    const [showColorSelector, setShowColorSelector] = useState(false);

    const color = vec3.create();
    vec3.mul(color, brushColor, [255, 255, 255]);
    vec3.round(color, color);

    return (
        <div
            className="color-select"
            style={{ backgroundColor: showColorSelector && '#7f7f7f' }}
        >
            <button
                className="brush-color"
                style={{ backgroundColor: `rgb(${color})` }}
                onClick={() => setShowColorSelector(!showColorSelector)}
            />

            {showColorSelector && (
                <ColorWheel
                    brushColor={brushColor}
                    setBrushColor={(c: vec3) => {
                        setBrushColor(c);
                        windowManager.brushEngine.color = c;
                    }}
                />
            )}
        </div>
    );
};

const TopBar = ({ on2d, on3d, setMesh }) => {
    const windowManager = useContext(WindowContext);

    const handleOpen = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.click();

        input.addEventListener('change', function () {
            const file = this.files[0];
            const reader = new FileReader();

            if (file.type.startsWith('image')) {
                reader.onload = (e: ProgressEvent<FileReader>) => {
                    windowManager.slate.load(e.target.result as string);
                    windowManager.drawOnNextFrame();
                };
                reader.readAsDataURL(file);
            } else if (file.name.endsWith('.obj')) {
                reader.onload = (e: ProgressEvent<FileReader>) => {
                    const meshes = Mesh.fromWaveformObj(
                        windowManager.gl,
                        e.target.result as string
                    );
                    console.log(meshes[0]);
                    meshes[0].setTexture(windowManager.slate.texture);
                    setMesh(meshes[0]);
                };
                reader.readAsBinaryString(file);
            } else {
                throw new Error('unsupported file format');
            }
        });
    };

    return (
        <div className="top-bar">
            <button id="2d-button" onClick={on2d}>
                2D Texture
            </button>
            <button id="3d-button" onClick={on3d}>
                3D Object
            </button>
            <button onClick={handleOpen}>Open</button>
            <div style={{ flexGrow: 1, textAlign: 'right' }}>
                <BrushColor />
            </div>
        </div>
    );
};

const App = () => {
    const [showTexture, setShowTexture] = useState(false);
    const [showMesh, setShowMesh] = useState(true);
    const [mesh, setMesh] = useState(null);

    return (
        <div
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
            <Renderer widgets={[ColorSelect, TextureDisplay, MeshDisplay]}>
                <TopBar
                    on2d={() => setShowTexture(!showTexture)}
                    on3d={() => setShowMesh(!showMesh)}
                    setMesh={setMesh}
                />
                <div style={{ flexGrow: 1, display: 'flex' }}>
                    {showTexture && <TexturePaint />}
                    {showMesh && <MeshPaint mesh={mesh} />}
                </div>
            </Renderer>
        </div>
    );
};

window.addEventListener('load', () => {
    ReactDOM.render(<App />, document.getElementById('container'));
});