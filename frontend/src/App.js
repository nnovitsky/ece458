import './App.css';

import React, { Component } from 'react';
import { BrowserRouter, Switch, Redirect, Route } from 'react-router-dom';
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
import OauthRoute from './components/OauthRoute';
import GenericLoader from './components/generic/GenericLoader.js';
import AuthServices from './api/authServices';
import Configs from './api/config.js';

//const URL = 'http://localhost:3000/'
const URL = Configs + '/'
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
      isLoading: false,
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
    authServices.getOauthToken(code).then(result => {
      if (result.success) {
        localStorage.setItem('token', result.data.token);
        this.setState({
          logged_in: true,
          username: result.data.user.username,
          admin: result.data.user.groups.includes("admin"),
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
    this.setState({ error_message: '' })
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
              username: json.user.username,
              admin: json.user.groups.includes("admin"),
              redirect: true
            });
            this.setState({ error_message: '' });
          }
        });
  };


  handle_logout = () => {
    localStorage.removeItem('token');
    this.emptyLocalStorage();
    this.emptySessionStorage();
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

  emptySessionStorage = () => {
    window.sessionStorage.clear();
  }


  // called with a page component that should only be displayed if the user is logged in
  // if not, they will be redirected to login
  loggedInPath = (protectedComponent) => {
    const isAuthenticated = localStorage.getItem('token');

    return isAuthenticated && typeof (isAuthenticated) !== 'undefined' ? protectedComponent : <Redirect to="/" />;
  }

  // called with a page component that should only be displayed if the user is an admin
  // if not, they will be redirected to the user profile page
  adminPath = (adminComponent) => {
    return this.state.admin ? adminComponent : <Redirect to={{ pathname: '/user-profile' }} />;
  }

  render(
    
    form = <LoginPage handle_login={this.handle_login} error_message={this.state.error_message} isLoggedIn={this.state.logged_in} />,
  ) {
    console.log("Location: "+ window.location.href)
    return (
      <Beforeunload onBeforeunload={this.emptyLocalStorage}>
        <BrowserRouter>
          <div>
            <GenericLoader isShown={this.state.isLoading}></GenericLoader>
            <Navigation logged_in={this.state.logged_in} handle_logout={this.handle_logout} is_admin={this.state.admin} user={this.state.username} />
            <Switch>
              {/* routes below require being logged in */}
              <Route path="/models" render={() => this.loggedInPath(<ModelTablePage is_admin={this.state.admin} />)} exact />
              <Route path="/models-detail/:pk" render={() => this.loggedInPath(<ModelDetailPage is_admin={this.state.admin} />)} exact />
              <Route path="/instruments" render={() => this.loggedInPath(<InstrumentTablePage is_admin={this.state.admin} />)} exact />
              <Route path="/instruments-detail/:pk" render={() => this.loggedInPath(<InstrumentDetailView is_admin={this.state.admin} />)} exact />
              <Route path="/instruments-detail/:pk" render={() => this.loggedInPath(<InstrumentDetailView is_admin={this.state.admin} />)} exact />
              <Route path="/user-profile" render={() => this.loggedInPath(<UserProfilePage />)} exact />
              {/* routes below require user to be an admin */}
              <Route path="/import" render={() => this.adminPath(<ImportPage />)} exact />
              <Route path="/admin" render={() => this.adminPath(<AdminPage is_admin={this.state.admin} />)} exact />
              <Route path="/categories" render={() => this.adminPath(<CategoriesPage is_admin={this.state.admin} />)} exact />
              {/* routes below are oauth */}
            <OauthRoute path="/oauth/consume" handle_oauth_login={this.handle_oath_login} exact />

          </Switch>
          {this.state.logged_in ? null : form}
          {this.state.redirect ? (<Redirect to="/user-profile" />) : null}
          {this.state.logged_in && window.location.href === URL ? (<Redirect to="/user-profile" />) : null}
        </div>
      </BrowserRouter>
      </Beforeunload>
    );
  }
}

export default App;
