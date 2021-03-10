
import React from 'react'
import { Redirect } from 'react-router-dom'
import PropTypes from 'prop-types';

class AdminRoute extends React.Component {

    render() {
        const Component = this.props.component;
       
        return this.props.is_admin ? (
            <Component />
        ) : (
            <Redirect to={{ pathname: '/user-profile' }} />
        );
    }
}

export default AdminRoute;

AdminRoute.propTypes = {
    is_admin: PropTypes.bool.isRequired,
  };