
import React from 'react'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types';

class ProtectedRoute extends React.Component {

    render() {
        const Component = this.props.component;
        //probably change
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