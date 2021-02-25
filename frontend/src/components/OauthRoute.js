
import React from 'react'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types';

class ProtectedRoute extends React.Component {

    
    render() {
        const Component = this.props.component;
        //probably change
        console.log(window.location.href)
        var code = window.location.href.split("oauth/consume?code=")[1]
        console.log(code)
        if(typeof(code) !== 'undefined')
        {
            console.log("entered with oauth")
        }
        else
        {
            console.log("entered without oauth")
        }

        // Change to isAuthenticated to setting to auth token gotten from backend 
        // 
        const isAuthenticated = localStorage.getItem('token');
       
        return isAuthenticated && typeof(isAuthenticated)!== 'undefined' ? (
            <Component is_admin={this.props.is_admin}/>
        ) : (
            <Redirect to={{ pathname: '/' }} />
        );
    }
}

export default ProtectedRoute;

ProtectedRoute.propTypes = {
    is_admin: PropTypes.bool
}