import React from 'react';
 
import { NavLink } from 'react-router-dom';
 
const Navigation = () => {
    return (
       <div>
          <NavLink to="/">Login &nbsp;</NavLink>
          <NavLink to="/model-table">Models &nbsp;</NavLink>
          <NavLink to="/instrument-table">Instruments &nbsp;</NavLink>
          <NavLink to="/user-profile">User Profile &nbsp;</NavLink>
          <NavLink to="/admin">Admin &nbsp;</NavLink>
       </div>
    );
}
 
export default Navigation;