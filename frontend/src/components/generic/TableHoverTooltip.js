import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Button from 'react-bootstrap/Button';

// floats right and can be embedded in a header

const tableHoverTooltip = () => {
    const renderTooltip = props => (
        <Tooltip {...props}>Hover over any table cell for more information</Tooltip>
    );

    return (
            <OverlayTrigger placement="right" overlay={renderTooltip}>
                <Button style={{marginLeft: "10px"}}>?</Button>
            </OverlayTrigger>
    );
}

export default tableHoverTooltip;