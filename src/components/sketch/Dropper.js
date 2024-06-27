import React from 'react'
import { DropSVG } from './svg'
import reactCSS from 'reactcss'

export const Dropper = ({
    hex,
    onChange
}) => {

    const styles = reactCSS({
        'default': {
            dropper: {
                width: '24px',
                height: '24px',
                position: 'relative',
                marginTop: '4px',
                marginLeft: '4px',
                borderRadius: '3px',
                cursor: "pointer"
            },
        },
    })

    const getColorByTool = () => {
        const eyeDropper = new window.EyeDropper();
        const abortController = new AbortController();

        eyeDropper
            .open({ signal: abortController.signal })
            .then((result) => {
                const color = result.sRGBHex;
                onChange({ hex: color, source: 'hex' });
            })
            .catch((e) => {
                console.error("e: ", e);
            });
    }


    if (!window.EyeDropper) {
        console.warn("浏览器不支持");
        return null
    }

    return <div style={styles.dropper} onClick={getColorByTool}>
        <DropSVG hex={hex} />
    </div>
} 
