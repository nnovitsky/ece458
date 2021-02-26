import React from 'react';

import './LogoTitleHeader.css';
import logo from '../../assets/HPT_logo_crop.png';

// Creates a header row with the logo and a title next to the logo, with an optional button row floating to the right

// props
// title: string of text displayed as the title
// buttons: can be an array or some button element, will have some styling to have it float right
const logoTitleHeader = (props) => {
    return (
        <div className="logo-title-header">
            <img src={logo} alt="Logo" />
            <h1>{props.title}</h1>
            <div className="logo-title-header-buttons-div">
                {props.buttons}
            </div>
        </div>
    )
}

export default logoTitleHeader;

logoTitleHeader.defaultProps = {
    buttons: null,
}