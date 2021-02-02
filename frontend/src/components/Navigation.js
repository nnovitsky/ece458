import React from 'react';
 
import { NavLink } from 'react-router-dom';
 
const Navigation = () => {
    return (
       <div>
           <nav>
               <ul>
                   <li><NavLink to="/">Login&nbsp;</NavLink></li>
                    <li><NavLink to="/models">Models&nbsp;</NavLink></li>
                    <li><NavLink to="/instruments">Instruments&nbsp;</NavLink></li>
                   <li><NavLink to="/user-profile">User Profile&nbsp;</NavLink></li>
                   <li><NavLink to="/admin">Admin&nbsp;</NavLink></li>
               </ul>
           </nav>
       </div>
    );
}
 
export default Navigation;