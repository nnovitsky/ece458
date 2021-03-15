
import React from 'react'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types';

class OauthRoute extends React.Component {

    render() {

        if(localStorage.getItem('oauth') === null)
        {
            this.props.handle_oauth_login(window.location.href.split("oauth/consume?code=")[1]);
        }
        localStorage.setItem('oauth', 'true');
        window.sessionStorage.setItem('oauth', 'true');

        return (
            <Redirect to={{ pathname: '/' }} />
        )
    }
}

export default OauthRoute;

OauthRoute.propTypes = {
    handle_oauth_login: PropTypes.func.isRequired,
}
