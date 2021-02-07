import React from 'react';
import PropTypes from 'prop-types';

import { NavLink } from 'react-router-dom';

function Navigation(props) {
    const logged_in_nav = (
        <nav>
            <ul>
                <li><NavLink to="/models">Models&nbsp;</NavLink></li>
                <li><NavLink to="/instruments">Instruments&nbsp;</NavLink></li>
                <li><NavLink to="/import">Import&nbsp;</NavLink></li>
                <li><NavLink to="/user-profile">User Profile&nbsp;</NavLink></li>
                <li><NavLink to="/admin">Admin&nbsp;</NavLink></li>
                <li><NavLink onClick={props.handle_logout} to="/">Logout&nbsp;</NavLink></li>
            </ul>
        </nav>
    );

    const logged_out_nav = (
        <nav>
            <ul>
            </ul>
        </nav>
    );

    return (
        <div>{props.logged_in ? logged_in_nav : logged_out_nav}</div>
    );
}

export default Navigation;

Navigation.propTypes = {
    logged_in: PropTypes.bool.isRequired,
    handle_logout: PropTypes.func.isRequired
}