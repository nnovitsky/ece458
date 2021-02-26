import './App.css';

import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Beforeunload } from 'react-beforeunload';

import LoginPage from './components/login/LoginPage';
import AdminPage from './components/admin/AdminPage';
import UserProfilePage from './components/user/UserProfilePage';
import ImportPage from './components/import/ImportPage';
import ModelTablePage from './components/model/ModelTablePage';
import ModelDetailPage from './components/model/ModelDetailView';
import InstrumentTablePage from './components/instrument/InstrumentTablePage';
import InstrumentDetailView from './components/instrument/InstrumentDetailView';
import CategoriesPage from './components/categories/CategoriesPage';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import OauthRoute from './components/OauthRoute';
import GenericLoader from './components/generic/GenericLoader.js';

import AuthServices from './api/authServices';
import { isThisISOWeek } from 'date-fns/esm';
const authServices = new AuthServices();

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      logged_in: localStorage.getItem('token') ? true : false,
      username: '',
      error_message: '',
      admin: false,
      redirect: null,
      isLoading: false
    };
  }

  componentDidMount() {
    if (this.state.logged_in) {
      authServices.getCurrentUser().then((result) => {
        if (result.success) {
          this.setState({
            username: result.data.username,
            admin: result.admin,
          })
        } else {
          this.emptyLocalStorage();
          localStorage.removeItem('token');
          this.setState({
            logged_in: false,
            username: '',
            admin: false
          });
        }
      }
      )
    }
    else {
      console.log("Not Logged in")
    }
  }

  handle_oath_login = (code) => {
    this.setState({
      isLoading: true
    });
    console.log("Calling handle oath/login")
    authServices.getOauthToken(code).then(result => {
      if (result.success) {
        localStorage.setItem('token', result.data.token);
        this.setState({
          logged_in: true,
          username: result.data.user.username,
          admin: result.data.user.is_staff,
          redirect: true,
          isLoading: false
        });
      }
      else {
        this.setState({
          error_message: '',
          isLoading: false
        });
      }
    })

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
            console.log(json)
            this.setState({ error_message: 'Incorrect Login Credentials' });
          }
          else {
            localStorage.setItem('token', json.token);
            this.setState({
              logged_in: true,
              username: json.user.username,
              admin: json.user.groups.includes("admin"),
              redirect: true
            });
            this.setState({ error_message: '' });
          }
        });
    }
  };


  handle_logout = () => {
    localStorage.removeItem('token');
    this.emptyLocalStorage();
    this.setState({
      logged_in: false,
      username: '',
      admin: false,
      redirect: false
    });
  };

  emptyLocalStorage = () => {
    localStorage.removeItem('oauth');
  }



  render(
    form = <LoginPage handle_login={this.handle_login} error_message={this.state.error_message} isLoggedIn={this.state.logged_in} />,
  ) {
    return (
    <Beforeunload onBeforeunload={this.emptyLocalStorage}>
      <BrowserRouter>
        <div>
        <GenericLoader isShown={this.state.isLoading}></GenericLoader>
          <Navigation logged_in={this.state.logged_in} handle_logout={this.handle_logout} is_admin={this.state.admin} user={this.state.username} />
          <Switch>
            <ProtectedRoute path="/models" component={ModelTablePage} is_admin={this.state.admin} exact />
            <ProtectedRoute path="/models/:pk" component={ModelDetailPage} is_admin={this.state.admin} exact />
            <ProtectedRoute path="/instruments" component={InstrumentTablePage} is_admin={this.state.admin} exact />
            <ProtectedRoute path="/instruments/:pk" component={InstrumentDetailView} is_admin={this.state.admin} exact />
            <AdminRoute is_admin={this.state.admin} path="/import" component={ImportPage} exact />
            <ProtectedRoute path="/user-profile" component={UserProfilePage} exact />
            <AdminRoute is_admin={this.state.admin} path="/admin" component={AdminPage} exact />
            <OauthRoute path="/oauth/consume" handle_oauth_login={this.handle_oath_login} exact />
            <AdminRoute is_admin={this.state.admin} path="/categories" component={CategoriesPage} exact />
          </Switch>
          {this.state.logged_in ? null : form}
          {this.state.redirect ? (<Redirect to="/user-profile" />) : null}
        </div>
      </BrowserRouter>
      </Beforeunload>
    );
  }
}

export default App;
