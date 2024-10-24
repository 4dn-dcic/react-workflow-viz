'use strict';

import React from 'react';
import { requestAnimationFrame, cancelAnimationFrame } from '../utilities'


export class ScaleController extends React.PureComponent {

    static defaultProps = {
        minScale: 0.01,
        maxScale: 1.25,
        initialScale: 1,
        zoomToExtentsOnMount: true
    };

    constructor(props){
        super(props);
        this.handleWheelMove = this.handleWheelMove.bind(this);
        this.handleInnerContainerMounted = this.handleInnerContainerMounted.bind(this);
        this.handleInnerContainerWillUnmount = this.handleInnerContainerWillUnmount.bind(this);
        this.innerElemReference = null;
    }

    componentDidMount(){
        // const {
        //     containerWidth,
        //     containerHeight,
        //     minScale: propMinScale,
        //     maxScale,
        //     graphWidth,
        //     graphHeight,
        //     zoomToExtentsOnMount = true
        // } = this.props;

        // if (typeof containerWidth !== "number" || typeof containerHeight !== "number") {
        //     // Maybe will become set in componentDidUpdate later.
        //     return false;
        // }

        // if (isNaN(containerWidth) || isNaN(containerHeight)) {
        //     throw new Error("Width or height is NaN.");
        // }

        // const minScaleUnbounded = Math.min(
        //     (containerWidth / graphWidth),
        //     (containerHeight / graphHeight)
        // );

        // // Decrease by 5% for scrollbars, etc.
        // const nextMinScale = Math.floor(
        //     Math.min(1, maxScale, Math.max(propMinScale, minScaleUnbounded))
        // * 95) / 100;
        // const retObj = { minScale: nextMinScale };

        // // First time that we've gotten dimensions -- set scale to fit.
        // // Also, if nextMinScale > scale or we had scale === minScale before.
        // // TODO: Maybe do this onMount also
        // if (zoomToExtentsOnMount) {
        //     retObj.scale = nextMinScale;
        // }
        // requestAnimationFrame(() => {
        //     this.setState(retObj);
        // });
    }

    componentDidUpdate(pastProps, pastState){
        const {
            enableMouseWheelZoom,
            enablePinchZoom,
            zoomToExtentsOnMount,
            containerWidth,
            containerHeight,
            graphWidth,
            graphHeight,
            minScale: propMinScale,
            maxScale
        } = this.props;
        // const { scale, minScale: stateMinScale } = this.state;
        // const {
        //     enableMouseWheelZoom: pastWheelEnabled,
        //     enablePinchZoom: pastPinchEnabled,
        //     containerWidth: pastWidth,
        //     containerHeight: pastHeight,
        //     graphWidth: pastGraphWidth,
        //     graphHeight: pastGraphHeight
        // } = pastProps;

        // // Remove or attach listeners if needed.
        // const listenNow = (enableMouseWheelZoom || enablePinchZoom);
        // const listenBefore = (pastWheelEnabled || pastPinchEnabled);

        // if (this.innerElemReference){
        //     if (listenNow && !listenBefore){
        //         this.innerElemReference.addEventListener("wheel", this.handleWheelMove, { "passive": false, "capture": true });
        //     } else if (!listenNow && listenBefore){
        //         this.innerElemReference.removeEventListener("wheel", this.handleWheelMove);
        //     }
        // }

        // // Update minScale (& possibly scale itself)
        // // We read `pastState` here before updating set
        // // vs using functional updater because want to avoid
        // // React's state change queuing mechanisms / reading
        // // most accurate prev value not important.
        // if (containerWidth !== pastWidth ||
        //     containerHeight !== pastHeight ||
        //     graphWidth !== pastGraphWidth ||
        //     graphHeight !== pastGraphHeight
        // ){
        //     const minScaleUnbounded = Math.min(
        //         (containerWidth / graphWidth),
        //         (containerHeight / graphHeight)
        //     );

        //     // Decrease by 5% for scrollbars, etc.
        //     const nextMinScale = Math.floor(
        //         Math.min(1, maxScale, Math.max(propMinScale, minScaleUnbounded))
        //     * 95) / 100;
        //     const retObj = { minScale: nextMinScale };

        //     // First time that we've gotten dimensions -- set scale to fit.
        //     // Also, if nextMinScale > scale or we had scale === minScale before.
        //     // TODO: Maybe do this onMount also
        //     if (nextMinScale > scale || stateMinScale === scale || (zoomToExtentsOnMount && (!pastHeight || !pastWidth))) {
        //         retObj.scale = nextMinScale;
        //     }
        //     requestAnimationFrame(() => {
        //         this.setState(retObj);
        //     });
        // }
    }


    /**
     * If `enableMouseWheelZoom` or `enablePinchZoom` are enabled, will
     * zoom in response to mouse wheel events or ctrl+mousewheel & touchpad
     * pinch events, respectively.
     */
    handleWheelMove(evt){
        const { deltaY, deltaX, ctrlKey } = evt;
        const { enableMouseWheelZoom, enablePinchZoom, scale, setScale } = this.props;

        if (!enableMouseWheelZoom && !enablePinchZoom) {
            return false;
        }

        // Chrome registers touchpad-based pinching as scrollwheel with ctrlKey.
        if (enablePinchZoom && !enableMouseWheelZoom && !ctrlKey) {
            return false;
        }

        if (!enablePinchZoom && enableMouseWheelZoom && ctrlKey) {
            return false;
        }

        if (enableMouseWheelZoom && Math.abs(deltaX) > 0){
            // Not perfect --
            // Make sure is mousewheel and not bidirectional touchpad,
            // for which we might still wanna allow left/right movement.
            return false;
        }

        evt.preventDefault();
        evt.stopPropagation();

        // `ctrlKey=true` implies 2nd ctrl key being pressed -or- touchpad pinching
        const deltaMultiplier = ctrlKey ? 0.01 : 0.0005;

        // React uses own state change queuing system, which guessing
        // gets bypassed w. raf, so below line might work better, since
        // `state.scale` unchanged.. (vs. functional updater)
        setScale(scale - (deltaY * deltaMultiplier));
    }

    handleInnerContainerMounted(innerElem){
        const { onMount, enableMouseWheelZoom, enablePinchZoom } = this.props;
        if (typeof onMount === "function"){
            onMount(...arguments);
        }
        this.innerElemReference = innerElem;
        // We need to listen to `wheel` events directly (not thru React)
        // as react doesn't handle these (it seems / afaik).
        if (enableMouseWheelZoom || enablePinchZoom) {
            // Chrome & some other browsers set passive:true by default.
            innerElem.addEventListener("wheel", this.handleWheelMove, { "passive": false, "capture": true });
        }
    }

    handleInnerContainerWillUnmount(innerElem){
        const { onWillUnmount } = this.props;
        if (typeof onMount === "function"){
            onWillUnmount(...arguments);
        }
        if (this.innerElemReference === null) {
            console.error("No inner elem, exiting");
            return;
        }
        if (this.innerElemReference !== innerElem) {
            throw new Error("Inner elem is different, exiting");
        }
        this.innerElemReference.removeEventListener("wheel", this.handleWheelMove);
        this.innerElemReference = null;
    }

    render(){
        const { children, initialScale = null, scale, setScale, minScale, ...passProps } = this.props;
        const childProps = {
            ...passProps,
            scale: scale || 1,
            minScale: minScale,
            setScale: setScale,
            onMount: this.handleInnerContainerMounted,
            onWillUnmount: this.handleInnerContainerWillUnmount
        };
        return React.Children.map(children, (child) => React.cloneElement(child, childProps) );
    }

}

/**
 * Component which provides UI for adjusting scale and
 * calls `ScaleController`'s `setScale` function.
 *
 * Uses `requestAnimationFrame` (`raf`) for smooth and performant
 * zooming transitions.
 *
 * To assert whether `raf` makes a meaningful difference, try to comment out
 * the `raf`-related lines in `onSliderChange` method (except for `setScale(nextVal)`)
 * and compare performance/smoothness :-D
 *
 * React _does_ seem to use requestAnimationFrame under the hood but maybe only
 * for batched updates, as animation frames aren't always requested (Chrome dev
 * tools > performance > profiling).
 *
 * We're getting performance gain from using `raf` in onSliderChange potentially
 * because we're listening to `SyntheticEvent`s passed in from React element, which
 * may be throttled or deferred until after state changes (vs native events).
 */
export class ScaleControls extends React.PureComponent {

    static defaultProps = {
        scaleChangeInterval: 15, // milliseconds
        scaleChangeUpFactor: 1.025,
        scaleChangeDownFactor: 0.975
    };

    constructor(props){
        super(props);
        this.onZoomOutDown = this.onZoomOutDown.bind(this);
        this.onZoomOutUp = this.onZoomOutUp.bind(this);
        this.onZoomInDown = this.onZoomInDown.bind(this);
        this.onZoomInUp = this.onZoomInUp.bind(this);
        this.cancelAnimationFrame = this.cancelAnimationFrame.bind(this);
        this.onSliderChange = this.onSliderChange.bind(this);
        this.state = {
            zoomOutPressed: false,
            zoomInPressed: false
        };
        this.nextAnimationFrame = null;
    }

    cancelAnimationFrame(){
        if (this.nextAnimationFrame !== null) {
            cancelAnimationFrame(this.nextAnimationFrame);
            this.nextAnimationFrame = null;
        }
    }

    onZoomOutDown(evt){
        evt.preventDefault();
        evt.stopPropagation();
        const { setScale, scaleChangeInterval, scaleChangeDownFactor, scale: initScale } = this.props;
        this.setState({ zoomOutPressed: true }, ()=>{
            const start = Date.now();
            //const diff = (scaleChangeDownFactor * initScale) - initScale;

            const performZoom = () => {
                const { scale, minScale } = this.props;
                if (scale <= minScale){ // Button becomes disabled so `onZoomOutUp` is not guaranteed to be called.
                    this.setState({ zoomOutPressed: false });
                    this.nextAnimationFrame = null;
                    return;
                }
                setScale(
                    //initScale + (diff * Math.floor((Date.now() - start) / scaleChangeInterval))
                    initScale *
                    (scaleChangeDownFactor ** Math.floor((Date.now() - start) / scaleChangeInterval))
                );
                this.nextAnimationFrame = requestAnimationFrame(performZoom);
            };

            this.nextAnimationFrame = requestAnimationFrame(performZoom);
        });
    }

    onZoomOutUp(evt){
        evt.preventDefault();
        evt.stopPropagation();
        this.cancelAnimationFrame();
        this.setState({ zoomOutPressed: false });
    }

    onZoomInDown(evt){
        evt.preventDefault();
        evt.stopPropagation();
        const { setScale, scaleChangeInterval, scaleChangeUpFactor, scale: initScale } = this.props;
        this.setState({ zoomInPressed: true }, ()=>{
            const start = Date.now();
            //const diff = (scaleChangeUpFactor * initScale) - initScale;

            const performZoom = () => {
                const { scale, maxScale } = this.props;
                if (scale >= maxScale){ // Button becomes disabled so `onZoomOutUp` is not guaranteed to be called.
                    this.setState({ zoomInPressed: false });
                    this.nextAnimationFrame = null;
                    return;
                }
                setScale(
                    //initScale + (diff * Math.floor((Date.now() - start) / scaleChangeInterval))
                    initScale *
                    (scaleChangeUpFactor ** Math.floor((Date.now() - start) / scaleChangeInterval))
                );
                this.nextAnimationFrame = requestAnimationFrame(performZoom);
            };

            this.nextAnimationFrame = requestAnimationFrame(performZoom);
        });
    }

    onZoomInUp(evt){
        evt.preventDefault();
        evt.stopPropagation();
        this.cancelAnimationFrame();
        this.setState({ zoomInPressed: false });
    }

    onSliderChange(evt){
        evt.preventDefault();
        evt.stopPropagation();
        const { setScale } = this.props;
        const nextVal = parseFloat(evt.target.value);
        this.cancelAnimationFrame();
        this.nextAnimationFrame = requestAnimationFrame(() => {
            setScale(nextVal);
            this.nextAnimationFrame = null;
        });
    }

    render(){
        const {
            scale = null,
            setScale = null,
            minScale = 0.1,
            maxScale = 1
        } = this.props;

        if (typeof setScale !== "function" || typeof scale !== "number" || isNaN(scale)) {
            return null;
        }

        return (
            <div className="zoom-controls-container">
                <div className="zoom-buttons-row">
                    <button type="button" className="zoom-btn zoom-out"
                        onMouseDown={this.onZoomOutDown} onMouseUp={this.onZoomOutUp}
                        onTouchStart={this.onZoomOutDown} onTouchEnd={this.onZoomOutUp}
                        disabled={minScale >= scale}>
                        <i className="icon icon-fw fa-fw icon-search-minus fa-search-minus fas"/>
                    </button>
                    <div className="zoom-value no-user-select">
                        { Math.round(scale * 100) }
                        <i className="icon icon-fw fa-fw icon-percentage fa-percentage fas small"/>
                    </div>
                    <button type="button" className="zoom-btn zoom-in"
                        onMouseDown={this.onZoomInDown} onMouseUp={this.onZoomInUp}
                        onTouchStart={this.onZoomInDown} onTouchEnd={this.onZoomInUp}
                        disabled={maxScale <= scale}>
                        <i className="icon icon-fw fa-fw icon-search-plus fa-search-plus fas"/>
                    </button>
                </div>
                <div className="zoom-slider">
                    <input type="range" min={minScale} max={maxScale} value={scale} step={0.01}
                        onChange={this.onSliderChange} />
                </div>
            </div>
        );
    }
}

export function scaledStyle(graphHeight, graphWidth, scale){
    return {
        width: (graphWidth * scale),
        height: (graphHeight * scale),
        transform : "scale3d(" + scale + "," + scale + ",1)"
    };
}
