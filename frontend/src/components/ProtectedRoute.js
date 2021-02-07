
import React from 'react'
import { Redirect } from 'react-router-dom'

class ProtectedRoute extends React.Component {

    render() {
        const Component = this.props.component;
        //probably change
        const isAuthenticated = localStorage.getItem('token');

        console.log("About to figure out redirect");
       
        return isAuthenticated && typeof(isAuthenticated)!== 'undefined' ? (
            <Component />
        ) : (
            <Redirect to={{ pathname: '/' }} />
        );
    }
}

export default ProtectedRoute;