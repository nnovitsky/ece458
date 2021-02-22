import React from 'react';
import PropTypes from 'prop-types';
import "../App.css"
import { NavLink } from 'react-router-dom';
import profileIcon from '../assets/Profile.png';


function Navigation(props) {

    const logged_in_nav = (
        <nav>
            <ul>
                <li><img style={{height: "20px"}}src={profileIcon} alt="Logo" /></li>
                <li>{props.user}   </li>
                <li><NavLink to="/user-profile">   Profile&nbsp;</NavLink></li>
                <li><NavLink to="/models">Models&nbsp;</NavLink></li>
                <li><NavLink to="/instruments">Instruments&nbsp;</NavLink></li>
                { props.is_admin ? <li><NavLink to="/import">Import&nbsp;</NavLink></li> : null }
                { props.is_admin ? <li><NavLink to="/admin">Admin&nbsp;</NavLink></li> : null }
                <li className="col order-last" style={{textAlign: "right"}}><NavLink onClick={props.handle_logout} to="/">Logout&nbsp;</NavLink></li>
            </ul>
        </nav>
    );
//offset-md-7
    const logged_out_nav = (
        <nav>
            <ul>
            </ul>
        </nav>
    );

    return (
        
        <div>
            {props.logged_in ? logged_in_nav : logged_out_nav}
        </div>
    );
}

export default Navigation;

Navigation.propTypes = {
    logged_in: PropTypes.bool.isRequired,
    handle_logout: PropTypes.func.isRequired,
    is_admin: PropTypes.bool.isRequired,
    user: PropTypes.string
}