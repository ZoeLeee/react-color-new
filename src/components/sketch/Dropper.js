import React from 'react'
import { DropSVG } from './svg'
import reactCSS from 'reactcss'
import { ColorDropper } from '../../helpers/color-dropper/ColorDropper'

export const Dropper = ({
    hex,
    onChange,
    dropper = {}
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
        const pipette = new ColorDropper({
            scale: 2,
            useMagnifier: true,
            listener: {
                onOk: ({ color }) => {
                    onChange({ hex: color, source: 'hex' });
                    pipette.destroy()
                },
            },
            ...dropper
        });
        if (window.EyeDropper) {
            pipette.start()
        } else {
            setTimeout(() => pipette.start(), 100);
        }
    }

    return <div style={styles.dropper} onClick={getColorByTool}>
        <DropSVG hex={hex} />
    </div>
} 
