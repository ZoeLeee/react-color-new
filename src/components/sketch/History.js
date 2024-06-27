import React, { Component, PureComponent } from 'react'
import reactCSS from 'reactcss'
import { Swatch } from '../common';

const key = "REACT_COLOR_HISTORYS";

export class SketchHistoryColors extends (PureComponent || Component) {
    constructor(props) {
        super(props)
        this.state = {
            history: [],
        }
    }

    handleClick = (hex, e) => {
        if (this.props.onClick) {
            this.props.onClick({
                hex,
                source: 'hex',
            }, e)
        }
    }

    componentDidMount() {
        const list = JSON.parse(localStorage.getItem(key) || '[]') || []
        this.setState({ history: list.filter(item => !!item) })
    }

    componentWillUnmount() {
        if (!this.props.hex) return;
        const list = [this.props.hex, ...this.state.history].slice(0, 16);
        localStorage.setItem(key, JSON.stringify(list));
    }

    render() {
        const colors = this.state.history;
    
        const styles = reactCSS({
            'default': {
                colors: {
                    margin: '0 -10px',
                    padding: '10px 0 0 10px',
                    borderTop: '1px solid #eee',
                    display: 'flex',
                    flexWrap: 'wrap',
                    position: 'relative',
                },
                swatchWrap: {
                    width: '16px',
                    height: '16px',
                    margin: '0 10px 10px 0',
                },
                swatch: {
                    borderRadius: '3px',
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.15)',
                },
            },
            'no-presets': {
                colors: {
                    display: 'none',
                },
            },
        }, {
            'no-presets': !colors || !colors.length,
        })
        return <div style={styles.colors} className="flexbox-fix">
            {colors.map((colorObjOrString,index) => {
                const c = typeof colorObjOrString === 'string'
                    ? { color: colorObjOrString }
                    : colorObjOrString
                const key = `${c.color}${c.title || ''}_${index}`
                return (
                    <div key={key} style={styles.swatchWrap}>
                        <Swatch
                            {...c}
                            style={styles.swatch}
                            onClick={this.handleClick}
                            onHover={this.props.onSwatchHover}
                            focusStyle={{
                                boxShadow: `inset 0 0 0 1px rgba(0,0,0,.15), 0 0 4px ${c.color}`,
                            }}
                        />
                    </div>
                )
            })}
        </div>
    }
}