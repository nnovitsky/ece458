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
      logged_in: window.sessionStorage.getItem('token') ? true : false,
      user: {
        username: '',
        admin: false,
        permissions_groups: [],
      },
      error_message: '',
      redirect: null,
      isLoading: false,
    };
    console.log('constructor');
  }

  async componentDidMount() {
    if (this.state.logged_in) {
      await authServices.getCurrentUser().then((result) => {
        if (result.success) {
          this.setState({
            user: {
              ...this.state.user,
              username: result.data.username,
              admin: result.data.groups.includes("admin"),
              permissions_groups: result.data.groups,
            }
          })
        } else {
          this.emptySessionStorage();
          this.setState({
            logged_in: false,
            user: {
              ...this.state.user,
              username: '',
              admin: false,
              permissions_groups: [],
            }
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
    console.log('oauth login');
    this.setState({
      isLoading: true
    });
    authServices.getOauthToken(code).then(result => {
      if (result.success) {
        window.sessionStorage.setItem('token', result.data.token);
        console.log(result.data.user);
        this.setState({
          logged_in: true,
          redirect: true,
          isLoading: false,
          user: {
            ...this.state.user,
            username: result.data.user.username,
            admin: result.data.user.groups.includes("admin"),
            permissions_groups: result.data.user.groups,
          }
          
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
          window.sessionStorage.setItem('token', json.token);
          this.setState({
            logged_in: true,
            redirect: true,
            user: {
              ...this.state.user,
              username: json.user.username,
              admin: json.user.groups.includes("admin"),
              permissions_groups: json.user.groups,
            }
          });
          this.setState({ error_message: '' });
        }
      });
  };


  handle_logout = () => {
    this.emptySessionStorage();
    this.setState({
      logged_in: false,
      redirect: false,
      user: {
        ...this.state.user,
        username: '',
        admin: false,
        permissions_groups: [],
      }
    });
  };

  clearOauthStorage = () => {
    window.sessionStorage.removeItem('oauth');
  }

  emptySessionStorage = () => {
    window.sessionStorage.clear();
  }


  // called with a page component that should only be displayed if the user is logged in
  // if not, they will be redirected to login
  loggedInPath = (protectedComponent) => {
    const token = window.sessionStorage.getItem('token');
    const isLoggedIn = token && typeof (token) !== 'undefined';
    if(isLoggedIn) {
      return protectedComponent;
    } else {
      this.handle_logout();
      return <Redirect to={{ pathname: '/' }}/>
    }
  }

  // called with a page component that should only be displayed if the user is an admin
  // if not, they will be redirected to the user profile page
  adminPath = (adminComponent) => {
    return this.state.user.admin ? adminComponent : <Redirect to={{ pathname: '/user-profile' }} />;
  }

  render(

    form = <LoginPage handle_login={this.handle_login} error_message={this.state.error_message} isLoggedIn={this.state.logged_in} />,
  ) {
    const permissions = this.state.user.permissions_groups;
    return (
      <Beforeunload onBeforeunload={this.clearOauthStorage}>
        <BrowserRouter>
          <div>
            <GenericLoader isShown={this.state.isLoading}></GenericLoader>
            <Navigation logged_in={this.state.logged_in} handle_logout={this.handle_logout} is_admin={this.state.user.admin} user={this.state.user.username} />
            <Switch>
              {/* routes below require being logged in */}
              <Route path="/models" render={() => this.loggedInPath(<ModelTablePage permissions={permissions}/>)} exact />
              <Route path="/models-detail/:pk" render={() => this.loggedInPath(<ModelDetailPage permissions={permissions}/>)} exact />
              <Route path="/instruments" render={() => this.loggedInPath(<InstrumentTablePage permissions={permissions}/>)} exact />
              <Route path="/instruments-detail/:pk" render={() => this.loggedInPath(<InstrumentDetailView username={this.state.user.username} permissions={permissions}/>)} exact />
              <Route path="/user-profile" render={() => this.loggedInPath(<UserProfilePage />)} exact />
              {/* routes below require user to be an admin */}
              <Route path="/import" render={() => this.adminPath(<ImportPage />)} exact />
              <Route path="/admin" render={() => this.adminPath(<AdminPage is_admin={this.state.user.admin} username={this.state.user.username} />)} exact />
              <Route path="/categories" render={() => this.adminPath(<CategoriesPage is_admin={this.state.user.admin} />)} exact />
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
