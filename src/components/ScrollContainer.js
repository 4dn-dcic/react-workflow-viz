'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';


export default class ScrollContainer extends React.PureComponent {

    constructor(props){
        super(props);
        this.state = {
            'mounted' : false,
            'isHeightDecreasing' : null,
            'outerHeight' : props.outerHeight,
            'pastHeight' : null
        };
        this.containerRef = React.createRef();
        this.heightTimer = null;
    }

    componentDidMount(){
        this.setState({ 'mounted' : true });
    }

    componentDidUpdate(prevProps, pastState){
        const { outerHeight: updateOuterHeight } = this.props;
        if (updateOuterHeight !== prevProps.outerHeight){
            const isHeightDecreasing = updateOuterHeight < prevProps.outerHeight;
            this.setState({
                'isHeightDecreasing' : isHeightDecreasing,
                'pastHeight' : isHeightDecreasing ? prevProps.outerHeight : null,
                'outerHeight': updateOuterHeight
            }, ()=>{
                this.heightTimer && clearTimeout(this.heightTimer);
                this.heightTimer = setTimeout(()=>{
                    this.setState({ 'isHeightDecreasing' : null, 'pastHeight' : null });
                }, 500);
            });
        }
    }

    render(){
        const { innerMargin, innerWidth, children, contentWidth, width, minHeight } = this.props;
        const { outerHeight, pastHeight, isHeightDecreasing, mounted } = this.state;
        const innerCls = (
            'scroll-container'
            + (isHeightDecreasing ? ' height-decreasing' : '')
            + (isHeightDecreasing === false ? ' height-increasing' : '')
        );
        const innerStyle = {
            'width' : Math.max(contentWidth, width),
            'height': outerHeight,
            'overflowY' : outerHeight < minHeight ? "hidden" : null
        };

        if (minHeight > outerHeight){
            innerStyle.paddingTop = innerStyle.paddingBottom = Math.floor((minHeight - outerHeight) / 2);
        }

        return (
            <div className="scroll-container-wrapper" ref={this.containerRef} style={{ width, minHeight }}>
                <div className={innerCls} style={innerStyle}>
                    {
                        React.Children.map(children, (child)=>
                            React.cloneElement(
                                child,
                                _.extend(
                                    _.omit(this.props, 'children'),
                                    {
                                        'scrollContainerWrapperElement' : this.containerRef.current || null,
                                        'scrollContainerWrapperMounted' : mounted,
                                        'outerHeight' : pastHeight || outerHeight
                                    }
                                )
                            )
                        )
                    }
                </div>
            </div>
        );
    }

}
