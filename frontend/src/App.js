import './App.css';

import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import LoginPage from './components/login/LoginPage';
import AdminPage from './components/admin/AdminPage';
import UserProfilePage from './components/user/UserProfilePage';
import ImportPage from './components/import/ImportPage';
import ModelTablePage from './components/model/ModelDetailView';
import ModelDetailPage from './components/model/ModelDetailView';
import InstrumentTablePage from './components/instrument/InstrumentTablePage';
import InstrumentDetailView from './components/instrument/InstrumentDetailView';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

import AuthServices from './api/authServices';

const authServices = new AuthServices();

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      logged_in: localStorage.getItem('token') ? true : false,
      username: '',
      error_message: ''
    };
  }

  componentDidMount() {
    if (this.state.logged_in) {
      authServices.getCurrentUser(localStorage.getItem('token'))
        .then(res => res.json())
        .then(json => {
          if (typeof json.username === 'undefined') {
            localStorage.removeItem('token');
            this.setState({
              logged_in: false,
              username: ''
            });
          }
          else {
            this.setState({ username: json.username })
          };
        });
    }
    else {
      console.log("Not Logged in")
    }
  }

  handle_login = (e, data) => {
    if (data.username === "" || data.password === "") {
      this.setState({ error_message: 'Please complete all fields' });
    }
    else {
      e.preventDefault();
      authServices.login(data)
        .then(res => res.json())
        .then(json => {
          if (typeof json.user === 'undefined') {
            this.setState({ error_message: 'Incorrect Login Credentials' });
          }
          else {
            localStorage.setItem('token', json.token);
            this.setState({
              logged_in: true,
              username: json.user.username
            });
          }
        });
    }
  };

  handle_logout = () => {
    localStorage.removeItem('token');
    this.setState({ logged_in: false, username: '' });
  };


  render(
    form = <LoginPage handle_login={this.handle_login} error_message={this.state.error_message} />
  ) {
    return (
      <BrowserRouter>
        <div>
          <Navigation logged_in={this.state.logged_in} handle_logout={this.handle_logout} />
          <Switch>
            <ProtectedRoute path="/models" component={ModelTablePage} exact />
            <ProtectedRoute path="/models/:pk" component={ModelDetailPage} exact />
            <ProtectedRoute path="/instruments" component={InstrumentTablePage} exact />
            <ProtectedRoute path="/instruments/:pk" component={InstrumentDetailView} exact />
            <ProtectedRoute path="/user-profile" component={UserProfilePage} exact />
            <ProtectedRoute path="/admin" component={AdminPage} exact />
            <Route path="/" exact />
          </Switch>
          {this.state.logged_in ? null : form}
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
