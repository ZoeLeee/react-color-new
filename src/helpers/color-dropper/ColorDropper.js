import domtoimage from './DomToImage';
import { drawTooltip, getCanvas, getCanvasRectColor, loadImage, rbgaObjToHex, renderColorInfo, } from './Helper';

/**
 * color dropper
 */
export class ColorDropper {
    constructor(props) {
        this.container = {};
        this.listener = {};
        this.rect = { x: 0, y: 0, width: 0, height: 0 };
        this.canvas = {};
        this.scale = 1;
        this.magnifier = null;
        this.colorContainer = null;
        this.colors = [];
        this.tooltipVisible = true;
        this.useMagnifier = false;
        this.eyeDropper = null;

        
        if(props.getDropper){
            props.getDropper(this)
        }

        /**
         * 处理鼠标移动
         */
        this.handleMove = (e) => {
            const { color, colors } = this.getPointColors(e);
            const { onChange = () => '' } = this.listener;
            const { pageX, pageY } = e;
            const point = { x: pageX + 15, y: pageY + 15 };
            const colorContainer = renderColorInfo({
                containerDom: this.colorContainer,
                color,
                colors,
                point,
            });
            if (!this.colorContainer) {
                this.colorContainer = colorContainer;
                document.body.appendChild(colorContainer);
            }
            onChange({ color, colors });
        };
        /**
         * 处理鼠标按下
         */
        this.handleDown = (e) => {
            const { onOk = () => '' } = this.listener;
            const res = this.getPointColors(e);
            onOk(res);
            this.destroy();
        };
        /**
         * 鼠标进入截图区域
         */
        this.handleEnter = () => {
            if (this.colorContainer) {
                this.colorContainer.style.display = 'block';
            }
        };
        /**
         * 鼠标移出截图区域
         */
        this.handleOut = () => {
            if (this.colorContainer) {
                this.colorContainer.style.display = 'none';
            }
        };
        /**
         * 处理键盘按下Esc退出拾色
         */
        this.handleKeyDown = (e) => {
            if (e.code === 'Escape') {
                this.destroy();
            }
        };
        try {
            const { container, listener, scale = 1, useMagnifier = false } = props;
            this.container = container || document.body;
            this.listener = listener || {};
            this.rect = this.container.getBoundingClientRect();
            this.scale = scale > 4 ? 4 : scale;
            this.useMagnifier = useMagnifier;
            // 浏览器支持颜色吸管工具
            if ('EyeDropper' in window) {
                console.info('使用谷歌浏览器的颜色选择器功能');
                this.eyeDropper = new window.EyeDropper();
                return;
            }
            // 去除noscript标签，可能会导致
            const noscript = document.body.querySelector('noscript');
            if (noscript && noscript.parentNode) {
                noscript.parentNode.removeChild(noscript);
            }
            this.initCanvas();
        }
        catch (err) {
            console.error(err);
            this.destroy();
        }
    }
    /**
     * 初始化canvas
     */
    initCanvas() {
        const { rect, scale } = this;
        const { x, y, width, height } = rect;
        const { canvas, ctx } = getCanvas({
            width: rect.width,
            height: rect.height,
            scale,
            attrs: {
                class: 'color-pipette-canvas-container',
                style: `
           position: fixed;
           left: ${x}px;
           top: ${y}px;
           z-index: 10000;
           cursor: pointer;
           width: ${width}px;
           height: ${height}px;
         `,
            },
        });
        this.canvas = canvas;
        this.ctx = ctx;
    }
    /**
     * 开始
     */
    start() {
        if (this.eyeDropper) {
            this.eyeDropper
                .open()
                .then((res) => {
                    const { sRGBHex: color } = res;
                    if (this.listener && this.listener.onOk)
                        this.listener.onOk({ color, colors: [] });
                })
                .catch((err) => console.error(err));
            return;
        }
        try {
            this.drawCanvas().then(res => {
                document.body.appendChild(this.canvas);

                this.canvas.style.outline="2px dashed #ccc";
       
                // 添加监听
                this.canvas.addEventListener('mousemove', this.handleMove);
                this.canvas.addEventListener('mousedown', this.handleDown);
                this.canvas.addEventListener('mouseenter', this.handleEnter);
                this.canvas.addEventListener('mouseout', this.handleOut);
                document.addEventListener('keydown', this.handleKeyDown);
            })

        }
        catch (err) {
            console.error(err);
            this.destroy();
        }
    }
    /**
     * 结束销毁dom，清除事件监听
     */
    destroy() {
        if( this.canvas){
            this.canvas.removeEventListener('mousemove', this.handleMove);
            this.canvas.removeEventListener('mousedown', this.handleDown);
            this.canvas.removeEventListener('mouseenter', this.handleEnter);
            this.canvas.removeEventListener('mouseout', this.handleOut);
        }
    
        document.removeEventListener('keydown', this.handleKeyDown);
        if (this.canvas && this.canvas.parentNode)
            this.canvas.parentNode.removeChild(this.canvas);
        if (this.colorContainer && this.colorContainer.parentNode)
            this.colorContainer.parentNode.removeChild(this.colorContainer);
    }
    /**
     * 将dom节点画到canvas里
     */
    drawCanvas() {
        return domtoimage
            .toPng(this.container, { scale: this.scale })
            .then(base64 => {
                if (!base64) {
                    return;
                }
                loadImage(base64).then(img => {
                    if (!img) {
                        return;
                    }
                    this.ctx.drawImage(img, 0, 0, this.rect.width, this.rect.height);
                });

            })
            .catch((err) => {
                console.error(err);
                return '';
            });

    }
    /**
     * 获取鼠标点周围的颜色整列
     */
    getPointColors(e) {
        const { ctx, rect, scale } = this;
        let { pageX: x, pageY: y } = e;
        x -= rect.x;
        y -= rect.y;
        const color = this.getPointColor(x, y);
        const size = 19;
        const half = Math.floor(size / 2);
        const info = { x: x - half, y: y - half, width: size, height: size };
        const colors = getCanvasRectColor(ctx, info, scale);
        return { color, colors };
    }
    /**
     * 获取鼠标点的颜色
     */
    getPointColor(x, y) {
        const { scale } = this;
        const { data } = this.ctx.getImageData(x * scale, y * scale, 1, 1);
        const r = data[0];
        const g = data[1];
        const b = data[2];
        const a = data[3] / 255;
        const rgba = { r, g, b, a };
        return rbgaObjToHex(rgba);
    }
}