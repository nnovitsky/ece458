import React from 'react';
import PropTypes from 'prop-types';
import "./Login.css";

class login extends React.Component {
    state = {
        username: '',
        password: ''
    };

    handle_change = e => {
        const name = e.target.name;
        const value = e.target.value;
        this.setState(prevstate => {
            const newState = { ...prevstate };
            newState[name] = value;
            return newState;
        });
    };

    render() {
        return (
            <div style={{textAlign: "center"}}>
            {/* <form onSubmit={handleLogin}> */}
            <form onSubmit={e => this.props.handle_login(e, this.state)}>
                <h2>Log In</h2>
                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    name="username"
                    value={this.state.username}
                    onChange={this.handle_change}
                />
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    name="password"
                    value={this.state.password}
                    onChange={this.handle_change}
                />
                <input type="submit" />
            </form>
            </div>
        );
    }
}

export default login;

const handleLogin = (e) => {
    console.log("Login Holder");
}

login.propTypes = {
    handle_login: PropTypes.func.isRequired
  };