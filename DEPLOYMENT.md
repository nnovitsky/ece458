# Deployment Guide
Fantastic Four
1. Carrie Hunner 
2. Natalie Novitsky 
3. Jack Wood
4. Juliet Yznaga

## Initial Technologies and Installations
- Ubuntu 20.04 with ssh key configured and user with sudo privileges
- Added with permissions to fork the ece458 GitHub project owned by Natalie Novitsky
- Python3 installed on Ubuntu 20.04: should be pre-installed 
```
$ sudo apt update
$ sudo apt -y upgrade
$ python3 -V
```
- GitHub installed on Ubuntu 20.04 
```
$ sudo apt install git
$ git --version
$ git config --global user.name "Your User Name"
$ git config --global user.email you@example.com
```
- NodeJS installed on Ubuntu 20.04
- Npm installed on Ubuntu 20.04
```
$ sudo apt install nodejs
$ sudo apt install npm
```

## Set Up Your Ubuntu Environment

```
$ sudo apt-get update
$ sudo apt-get install python-pip python-dev libpq-dev postgresql postgresql-contrib nginx
```

## Move the Project Code to Your Ubuntu Machine
Create a folder on your machine to hold the project code through the command line.
```
$ mkdir hpt_project_folder
```

Fork this repository on [ece458](https://github.com/nnovitsky/ece458) by using the fork icon in the top right 
corner in the git interface.

On your Ubuntu manchine, move into the directory you created and clone the repository now in your account. 
Checkout into the production branch `dev_postgres`
```
$ cd hpt_project_folder
$ git clone .......
$ git checkout dev_postgres
```
## Create a PostgreSQL Database and User

Now we will create a Postgres database for this project. Exit the repository and
log into an interactive Postgres session by typing:
```
$ sudo -u postgres psql
```

Now we will create the database:
```
postgres=# CREATE DATABASE hpt_db;
```

Next, create a database user for our project. Make sure to choose a secure password:
```
postgres=# CREATE USER  hpt_project_user WITH PASSWORD 'protected_password';
```

Now, we can give our new user access to administer our new database:
```
postgres=# GRANT ALL PRIVILEGES ON DATABASE hpt_db TO hpt_project_user;
```

Finally, exit the Postgres session
```
postgres=# \q
```

## Accessing the Virtual Environment 
We will now create a virtual environment. First, install the necessary packages:
```
$ sudo -H pip3 install --upgrade pip
$ sudo -H pip3 install virtualenv
```
Move into the backend folder, then create and access the virtual machine:
```
$ cd home/hpt_project_folder/ece458/backend 
$ virtualenv venv
$ source venv/bin/activate
```
Next, make sure gunicorn and psycopg2 are installed on your machine:
```
(venv) pip install django gunicorn psycopg2
```
Download the backend requirements coming from the ece458 folder:
```
(venv) cd ..
(venv) pip3 install -r requirements.txt
```

## Edit the settings.py File 

Edit the settings.py file to allow your host. settings.py is located in the hpt folder in the backend:
```
$ cd backend/hpt
```
```bash
ALLOWED_HOSTS = ['your_server_domain']
```

In settings.py, change the databases attributes to your corresponding database we configured above:
```bash
DATABASES = {
	'local': {
		'ENGINE': 'django.db.backends.sqlite3',
		'NAME': BASE_DIR /  'db.sqlite3',
	},
	'default': {
		'ENGINE': 'django.db.backends.postgresql_psycopg2',
		'NAME': 'hpt_db',
		'USER': 'hpt_project_user',
		'PASSWORD': 'protected_password',
		'HOST': 'localhost',
		'PORT': '5432',
	}
}
```

## Initial Django Project Setup
We will next need to make sure your python path is correct. Run this command to set your path:
```
(venv) export PYTHONPATH=/home/hpt_project_folder/ece458
```
Migrate initial database schema to your new PostgreSQL database. You will need 
to navigate back to the backend folder where the manage.py file is located to 
do this:
```
(venv) cd backend
(venv) python3 manage.py makemigrations
(venv) python3 manage.py migrate
``` 
Create an administrative user for the project. You will be prompted to give a
username, email and password to be used for the Django admin page:
```
(venv) python3 manage.py createsuperuser
```
Collect all of the static content into the static directory configuration we configured:
```
(venv) python3 manage.py collectstatic
```
Test out your project by typing this command (make sure you are still in the backend folder): 
```
(venv) python3 manage.py runserver 0.0.0.0:8000
```
To ensure it's working visit your server domain followed by :8000
```
http://server_domain_or_IP:8000
```
You should see the default Django index page. If you append `/api/admin` to the end of the URL in the address bar, you will be prompted for the administrative username and password you created with the `createsuperuser` command. Make sure your username and password works. When you have confirmed, end the session
by typing `ctrl-C` into the terminal.

## Testing you Project with Gunicorn 
Make sure the Gunicorn can serve the application by typing:
```
(venv) gunicorn --bind 0.0.0.0:8000 hpt.wsgi
```
This will start Gunicorn on the same interface that the Django development server was running on. You can go back and test the app again 
with your username and password. Note that this app will not have the styling which was present when you ran the backend with runserver.

Once we know our project can be served by Gunicorn, you can stop Gunicorn and close the virtual environment. 
`ctrl-C`
```
(venv) deactivate
```

## Create a Gunicorn systemd Service File

Create and open a systemd service file for Gunicorn with sudo privileges in your text editor
```
$ sudo nano /etc/systemd/system/gunicorn.service
```
We will add a `[Unit]`  `[Service]` and `[Install]` section. 
- The `[Unit]` will specify the name of the service and tell the system to only start this after the networking targest has been reached. 
- The `[Service]` section clarifies what the service file should execute. The User specifies the user of the vcm and grants them ownership of the process. The Group gives ownership to `www-data` so that Nginx can communicate easily with Gunicorn. The Environment tag clarifies the `PYTHONPATH` which should be used to launch Gunicorn. WorkingDirectory specifies where the service file should start executing and the ExecStart tag gives the commands that should be executed.
- The `[Install]` section has only one tag, WantedBy which allows multiple users to access our server. Here is the full file:

```
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User= your_ubuntu_server_user
Group=www-data
WorkingDirectory=/home/hpt_project_folder/ece458/backend
Environment="PYTHONPATH=/home/hpt_project_folder/ece458/"
ExecStart=/home/hpt_project_folder/ece458/backend/venv/bin/gunicorn --access-logfile - --workers 3 --bind 
unix:/home/hpt_project_folder/ece458/backend/backend.sock hpt.wsgi

[Install]
WantedBy=multi-user.target
```
Now we can start the Gunicorn service we created and enable it so that it starts at boot:
```
$ sudo systemctl start gunicorn
$ sudo systemctl enable gunicorn
```
Check the status of gunicorn and see if it was able to start
```
$ sudo systemctl start status
```
Make sure the sock file was created by looking into your project directory
```
$ ls /home/hpt_project_folder/backend
```
If the status call indicated an error, or the backend.sock folder was not created, there was an issue with starting Gunicorn. You can find a more in-depth log of what occurred by using the command and pressing `[shift + g]` to navigate to the bottom of the log
```
$ sudo journalctl -u gunicorn
```
Most likely, one of the paths was incorrectly inputted into the service file. Check your paths and if an error still persists, try to execute the ExecStart commands yourself in the command line. To do this, navigate to your project folder and execute:
```
$ cd /home/hpt_project_folder/backend
$ venv/bin/gunicorn --access-logfile - --workers 3 --bind /home/hpt_project_folder/backend/backend.sock hpt.wsgi
```
Anytime you make an edit to the `/etc/systemd/system/gunicorn.service` file, make sure to reload the daemon to reread your new service definition and restart Gunicorn 
```
$ sudo systemctl daemon-reload
$ sudo systemctl restart gunicorn
```

## Configure Nginx to Proxy Pass to Gunicorn 

With our backend running on Gunicorn, we can now work on Nginx and configure it to pass traffic to the process. We begin by creating a new server block in Nginx's sites-available directory.
```
$ sudo  nano /etc/nginx/sites-available/hpt_project
```

First, we will open up a new server block and specify that the server should listen on port 80 which is the normal port for internet traffic. We will also specify that it should respond to our server's host name. 
```
server {
    listen 80;
    server_name server_domain;
    root /home/hpt_project_folder/ece458/frontend/build;
    index index.html;
}
```
Next, we will specify for Nginx to ignore any issues with finding a favicon and we will tell it where to find the static assets in our Django backend. 
```
server {
    listen 80;
    server_name server_domain_or_IP;
    root /home/hpt_project_folder/ece458/frontend/build;
    index index.html;
    
    location = /favicon.ico { access_log off; log_not_found off; }
    location /static/ {
        root /home/hpt_project_folder/ece458/frontend/build;
    }
  }
```
Last, we will create a `location /api {}` to direct to our Django endpoints. Inside of this location, we will include the standard proxy_params file included with Nginx and then pass traffic to the socket that our Gunicorn process created. 

```
server {
    listen 80;
    server_name server_domain_or_IP;
    root /home/hpt_project_folder/ece458/frontend/build;
    index index.html;
    
    location = /favicon.ico { access_log off; log_not_found off; }
    location /static/ {
        root /home/hpt_project_folder/ece458/frontend/build;
    }
    
	location /api {
        include proxy_params;
        proxy_pass http://unix:/home/hpt_project_folder/ece458/backend/backend.sock;
    }
 }
```

Save and close the file `/etc/nginx/sites-available/hpt_project`. Next, we must enable the file by linking it to the `sites-enabled` directory. This
can be done by typing:
```
$ sudo ln -s /etc/nginx/sites-available/hpt_project /etc/nginx/sites-enabled
```
Then test your Nginx configuration for syntax errors by typing:
```
$ sudo nginx -t
```
If no errors are reported, restart Nignx  by typing:
```
$ sudo systemctl restart nginx
```
## Preparing the React Frontend to Launch 
The next step is to create a build of the frontend static files for the server to display. This is done by navigating to the `home/hpt_project_folder/ece458` directory and then navigating to the frontend folder
```
$ cd home/hpt_project_folder/ece458/frontend
```
First make sure that the frontend has all the necessary node modules by running
```
$ npm install 
```
The npm dependencies were installed using the `--save-dev` flag which allows the user to only make one call to `npm install` to grab the necessary tools
Next you will need to add your own server into the configure.js file in order for the frontend to hit the Django endpoints. Navigate to the configure.js file, add your server host and remove the unecessary hosts:

```
$ cd home/hpt_project_folder/ece458/frontend/src/api
$ nano config.js
```
Edit the config.js to point to your host and save the file:
```
const API_URL = 'https://your-hostname';

export default API_URL;
```
Next, build the frontend into static files to be served by running the command 
```
$ npm run build
```
This will create a `/frontend/build` directory which holds all of the static content for our server to display. Restart Nignx to ensure the files will get served
```
$ sudo systemctl restart nginx
```  

## Setting up LetsEcrypt and SSL Certification 
The final step is to protect the project information with https by getting a certificate with Certbot. Navigate to the [Certbot page](https://certbot.eff.org/)
To follow the steps on the website, select that your website is running Nginx on Ubuntu 20.04 and you will be served instructions directly from Certbot. Below, I will outline a condensed version of their instructions to certify your hpt_project page. 

You should already by ssh'd into the server running Nginx, but if you left it, ssh back into your Ubunto 20.04 server with a user with sudo privileges. 

Install Snapd. Although Ubuntu 20.04 servers should come ready with this feature, my own Ubuntu 20.04 server did not. First, check if you have Snapd by typing
```
$ sudo snap install hello-world
hello-world 6.4 from Canonical✓ installed
$ hello-world
Hello World!
```
If Snapd is correctly installed, the output will look as above.  If Snapd is not installed, use the command line to install 
```
$ sudo apt install snapd
```
Then, once installed, check that it is correctly installed using the hello-world example above.
Next, ensure that your version of Snapd is up to date with the following instruction 
```
$ sudo snap install core; sudo snap refresh core
```
If you have any Certbot packages, you should remove them before installing Certbot Snap to ensure that when you run `certbot` as a command, the snap is used rather than the installation from your OS package manager. Do this by typing
```
$ sudo apt-get remove certbot
```
The next step is to install Certbot using this command 
```
$ sudo snap install --classic certbot
```
To ensure the `certbot` command can be run, execute this command on the command line 
```
$ sudo ln -s /snap/bin/certbot /usr/bin/certbot
```
Now, we will specify how we would like to run Certbot. We want Certbot to edit the Nginx configuration automatically to serve it and turn on HTTPS in a single step. Specify this to Certbot with the command 
```
$ sudo certbot --nginx
```
With this, we have allowed Certbot to edit our 'sites-available' page to configure https security. Now your site is ready to launch!
Navigate to `https://your-hostname` and login to the HPT interface using your superuser credentials. Here, you can add and import models/instruments and create new users to populate the database.

## Setting up Automatic Deployment
In Evolution Two, the Fantastic Four configured automatic deployment to their dev virtual machine which was beneficial to testing and continuous integration. This secton will describe how to set up automatic deployment through GitHub Actions. The first step is to ensure that you have connecton to your Ubuntu 20.04 server as a user with an SSH key. This was a requirement for the above section. 

The next step is to configure your GitHub repo with certain Secrects to allow GitHub to log into the server and deploy the code. Got to the GitHub website and navigate to the repository (which you now own) which you just forked and deployed. Go to the Settings tab. There will be options of tabs on the right to choose from. Click `[Secrects]`. In GitHub, Secrects are encrypted environment variables which provide a secure mechanism to hold confidential information such as passwords and secrect keys to be used in GitHub Actions. For our purpose, they will allow us to give GitHub the secrect key to our VM, the user accociated with the key and the hostname of the VM in a secure way.

Now you will add Secrects to your repository to allow GitHub to identify your VM and login. Under the Secrests tab, click `[New Repository Secret]`. Add the three following secrects with the exact names shown:
```
NAME: DEPLOY_USER
VALUE: The username which you use to log into your server

NAME: DEPLOY_KEY
VALUE: The secret key associated with your user to log into your server

NAME: DEPLOY_HOST
VALUE: The hostname of your server
```

Once you have added these Secrects, the next step is to create a GitHub action which uses these secrets to deploy the code. Navigate to `[Actions]` tab of your repository and select `[Set up a workflow for yourself]`. If you have created a workflow for this repo before, click `[New Workflow]`.

GitHub will navigate you to a new `.yml` file which it automatically creates and puts in the `.github/workflows` folder of your repo (GitHub creates this folder if it doesn't already exist). Rename the file from `main.yml` to `deploy.yml`. 

Delete all the code in the file which is prepopulated by GitHub. Add the following code to the file. This code sets up the workflow in proper GitHub fashion and initializes a connection with the server using the Secrects which were created in the previous step:

```
name: SSH Deploy
on: 
  push:
    branches: 
      - dev_postgres
  pull_request:
    branches:
      - dev_postgres
jobs:
  deploy:
    name: "Deploy to staging"
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - name: Configure SSH
        run: |
          mkdir -p ~/.ssh/
          echo "$SSH_KEY" > ~/.ssh/staging.key
          chmod 600 ~/.ssh/staging.key
          cat >>~/.ssh/config <<END
          Host test_server
            HostName $SSH_HOST
            User $SSH_USER
            IdentityFile ~/.ssh/staging.key
            StrictHostKeyChecking no
          END
        env:
          SSH_USER: ${{ secrets.DEPLOY_USER }}
          SSH_KEY: ${{ secrets.DEPLOY_KEY }}
          SSH_HOST: ${{ secrets.DEPLOY_HOST }}
```
Below is some insight as to how these lines function:
`name:` Names the action, this is the name which will apear when the action is run. 
`on: push/pull` This line specifies to run this action every time code is pushed/pulled to the dev_postgres branch. 
`jobs:` This is a line required by GitHub actions to specify the work which this action will perform.
`deploy: name:` This name within the jobs sections is the name of the first 'test' which will be run. This would be the name of the first Unit test if this action were being used for testing. Instead, we break up steps of deployement into different chunks to more easilly debug if something in deployment goes wrong. This first chunk enters our server. 
`steps` This specifies what the action will do. In this case, the action will run terminal commands using our configured Secrests (environment variables) to enter into the server. 

Now that we have a job which is able to enter the server, we will add the actions to be performed once in the server. First, the action will need to stop the server running.
```
	- name: Stop the server
        run: ssh test_server 'sudo systemctl stop gunicorn && sudo systemctl stop nginx'
```
Next, we want the action to pull any new code which was pushed. Not having to manually download new code is what sets up continuous integration.
```
	- name: Check out the source
        run: ssh test_server 'cd /your/path/to/ece458 && git pull'
```
Check to see if any new requirements were added. 
```
	- name: Start venv and Download Requirements.txt
        run: ssh test_server 'cd /your/path/to/ece458/backend && source venv/bin/activate && export PYTHONPATH=/your/path/to/ece458 
	&& cd /your/path/to/ece458 && pip3 install -r requirements.txt'
```
Perform the necessary migrations, make a build of the frontend and restart the server
```
	- name: Perform migrations
        run: ssh test_server 'cd /your/path/to/ece458/backend && source venv/bin/activate && export PYTHONPATH=/your/path/to/ece458 
	&& cd /your/path/to/ece458/backend && python3 manage.py migrate && python3 manage.py collectstatic --noinput'


      - name: Build Frontend
        run: ssh test_server 'cd /your/path/to/ece458/frontend && npm install && npm run build'

      
      - name: Start the server
        if: ${{ always() }}
        run: ssh test_server 'sudo systemctl start gunicorn && sudo systemctl start nginx'
```
Below is the full file all put together
```
name: SSH Deploy
on: 
  push:
    branches: 
      - dev_postgres
  pull_request:
    branches:
      - dev_postgres
jobs:
  deploy:
    name: "Deploy to staging"
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - name: Configure SSH
        run: |
          mkdir -p ~/.ssh/
          echo "$SSH_KEY" > ~/.ssh/staging.key
          chmod 600 ~/.ssh/staging.key
          cat >>~/.ssh/config <<END
          Host test_server
            HostName $SSH_HOST
            User $SSH_USER
            IdentityFile ~/.ssh/staging.key
            StrictHostKeyChecking no
          END
        env:
          SSH_USER: ${{ secrets.DEPLOY_USER }}
          SSH_KEY: ${{ secrets.DEPLOY_KEY }}
          SSH_HOST: ${{ secrets.DEPLOY_HOST }}
	  
	  
	- name: Stop the server
        run: ssh test_server 'sudo systemctl stop gunicorn && sudo systemctl stop nginx'
	
	
	- name: Check out the source
        run: ssh test_server 'cd /your/path/to/ece458 && git pull'
	
	
	- name: Start venv and Download Requirements.txt
        run: ssh test_server 'cd /your/path/to/ece458/backend && source venv/bin/activate && export PYTHONPATH=/your/path/to/ece458 
	&& cd /your/path/to/ece458 && pip3 install -r requirements.txt'
	
	
	- name: Perform migrations
        run: ssh test_server 'cd /your/path/to/ece458/backend && source venv/bin/activate && export PYTHONPATH=/your/path/to/ece458 
	&& cd /your/path/to/ece458/backend && python3 manage.py migrate && python3 manage.py collectstatic --noinput'


	- name: Build Frontend
        run: ssh test_server 'cd /your/path/to/ece458/frontend && npm install && npm run build'

   
	- name: Start the server
        if: ${{ always() }}
        run: ssh test_server 'sudo systemctl start gunicorn && sudo systemctl start nginx'
```

Save this file and on every push/pull to the dev branch, the deployed branch will receive changes.

## Oauth Implementation

This new evolution implements oauth login with Duke Netid. To have this feature implemented on your code, you must first reach out to Danai Adkisson and add this redirect URI to your account. 

`https://your_host_name/oauth/consume`

Next, edit the oauth file which communicates with Duke Oauth in the backend. Open the file `ece458/backend/tables/oauth.py` to edit. To this file, you will need to add your client id, client secret and redirect uri. 
In line 43 add your client id.
```
if "OAUTH_CLIENT_ID" in os.environ:
        client_id = os.environ["OAUTH_CLIENT_ID"]
else:
        client_id = "your_client_id"
```
In line 47, add your client secret.
```
if "OAUTH_CLIENT_ID" in os.environ:
	client_secret = os.environ["OAUTH_CLIENT_SECRET"]
else:
	client_secret = "your_client_secret"
```
In line 66, add your redirect uri.
```
if "OAUTH_REDIRECT_URI" in os.environ:
	redirect_uri = os.environ["OAUTH_REDIRECT_URI"]
else:
	redirect_uri = "https://your_host_name/oauth/consume"
```

The last change to make is to add your redirect URI to the frontend login page so the user is redirected to log in through Duke Netid. 
Naviagte to `ece458/frontend/src/components/login/LoginPage.js` and open the file to edit. In the state of the page, change the oauth link to point to your redirect URI You will need to add your client id as well as your host name. 
```
    state = {
        username: '',
        password: '',
        redirect: null,
        oauthLink: 'https://oauth.oit.duke.edu/oidc/authorize?client_id=you_client_id&redirect_uri=https%3Ayour_host_name/
			oauth/consume&response_type=code',
    };
```
Once you have completed these steps, Oauth will be set up with the project. You will need to enter your server through ssh and restart gunicorn as well as run another build of the frontend.

```
$ sudo systemctl restart gunicorn
$ cd /your/path/to/ece458/frontend
$ npm run build
```
## Setting up React Environment Variables

Environment variables make the Oauth and API sections of the React app simpler and more robust. The first step is to connect via SSH to yur server and navigate to the frontend folder of your project. Next, you will create a .env file to hold your environment variables
```
$ cd /your/path/to/ece458/frontend
$ sudo nano .env
```
The newly created .env file will open up in editor. Configure the file to hold your Oauth variables as well as your API url. 
```
REACT_APP_OAUTH_REQUEST_URL = https://your_request_url
REACT_APP_OAUTH_CLIENT_ID = your_client_id
REACT_APP_OAUTH_REDIRECT_URI = https%3A//your_domain/oauth/consume
REACT_APP_API_URL = https://your_domain
```
Now we will edit parts of the React code to use these variables instead. First, naviagte to `ece458/frontend/src/components/login/LoginPage.js` and open the file to edit. Change the oauthlink to now use your environment variables. 
```
const baseURL = process.env.REACT_APP_OAUTH_REQUEST_URL;
const clientID = process.env.REACT_APP_OAUTH_CLIENT_ID;
const redirectURI = process.env.REACT_APP_OAUTH_REDIRECT_URI

class login extends React.Component {
    state = {
        username: '',
        password: '',
        redirect: null,
        oauthLink: `${baseURL}?client_id=${clientID}&redirect_uri=${redirectURI}&response_type=code`
    };
```
Save your changes and then naviagte to `ece458/frontend/src/api/config.js` and open the file to edit. Change the API_URL to use your environment variable as shown below:
```
const API_URL = REACT_APP_API_URL;

export default API_URL;
```
Save your changes and exit the editor. Last, navigate to your `ece458/frontend` folder and run a new build to apply the changes.
```
$ npm run build
```
Now your project will be making use of modular envorponment variables instead of hard-coded strings.


## Aliasing Your Server

Once you have your mangaement system up and running, you might have the desire to change the domain url which users type into the browser to navigate to your site. In this section, I will explain how to set up this new domain for the project. The first step is to create your alias and have it point to the IP of your server domain. Depending on how you have reserved your server, this can be done in a variety of ways. If you have your server reserved through the Duke Computing Manager, you can set up an alias by navigatng to the reservation management tab of your server and clicking the `[Create an alias]` button. You can type in your desire url name here and once it is activated, it will show up at the bottom of your server manager under `Aliases`. 

In order to apply this Alias to your project, open a terminal window and connect to your server via SSH with a user that has sudo privileges. Next, open the Nginx 
sites-available file with the following terminal command: 
```
$ sudo  nano /etc/nginx/sites-available/hpt_project
```
This is the file you edited in the `Configure Nginx to Proxy Pass to Gunicorn`  section. This file will contain the lines you write previously as well as some lines which were added by Certbot for SSL Certification. We will change the lines we wrote and not touch the specific Certbot verification lines. Change all domains in the sites-available page from your old server name to your new alias name as demonstrated below:

```
server {
    server_name YOUR_NEW_ALIAS; # Change this to your new alias
    root /home/hpt_project_folder/ece458/frontend/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location /static/ {
        root /home/hpt_project_folder/ece458/frontend/build;
    }

        location /api {
        include proxy_params;
        proxy_pass http://unix:/home/hpt_project_folder/ece458/backend/backend.sock;
    }
	
    # Lines added be Certbot, do not change 
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/hptmanager-dev.colab.duke.edu/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/hptmanager-dev.colab.duke.edu/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
    # Lines added be Certbot, do not change ^^^^^
}
server {
	# Change this to your new alias
    if ($host = YOUR_NEW_ALIAS) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name YOUR_NEW_ALIAS; # Change this to your new alias
    return 404; # managed by Certbot
}
```
Once you have done this, you must get again get SSL certfied with your new alias. Since this server already has Snap adb Certbot after completng the Section (), you can run this line to allow Certbot to edit this new sites-available and SSL certify it. Follow the Certbot steps and when Certbot prompts you to choose the alias you want to add, choose YOUR_NEW_ALIAS. 
```
$ sudo certbot --nginx
```
Once your alias is SSL certified, restart Nginx to apply your changes.
```
$ sudo systemctl restart nginx
```
It may take a few minutes for your SSL certification to be applied. Wait a few mintues then navigate to your new alias n your browser. The login page of your project will now appear when you navigate to your new URL!

IMPORTANT: For all aspects of OAuth to work with your new alias name, you will need to contact your OAuth connection and add your new aliased URL to the redirect URI of your Client ID account. All aspects of the project will not work unless you add the aliased url as an acceptable Redirect URI to your Client ID account.

Once you know you can naviagte to your site via your new alias, the last step is to set up our api calls to point to this new url. All that you need to do is change the API_URL environment variable. Open the .env file in the terminal and edit the API_URL to point to your new alias
```
$ cd /your/path/to/ece458/frontend
$ sudo nano .env
```
In the .env file change the REACT_APP_OAUTH_REQUEST_URL and REACT_APP_API_URL.
```
REACT_APP_OAUTH_REQUEST_URL = https://your_request_url
REACT_APP_OAUTH_CLIENT_ID = your_client_id
REACT_APP_OAUTH_REDIRECT_URI = https%3A//YOUR_NEW_ALIAS_DOMAIN/oauth/consume
REACT_APP_API_URL = https://YOUR_NEW_ALIAS_DOMAIN 
```
Save your changes and exit the editor. Last, navigate to your `ece458/frontend` folder and run a new build to apply the changes.
```
$ npm run build
```
Finally, change the Redirect URI in the backend to point to your new Redirect URI. Open the file `ece458/backend/tables/oauth.py` to edit.

In line 66, change your redirect uri.
```
if "OAUTH_REDIRECT_URI" in os.environ:
	redirect_uri = os.environ["OAUTH_REDIRECT_URI"]
else:
	redirect_uri = "https://YOUR_NEW_ALIAS_DOMAIN/oauth/consume"
```
Finally, update gunicorn and Nginx.
```
$ sudo systemctl restart gunicorn
$ sudo systemctl restart nginx
```
Now you can use your project and make api calls with the new alias. 
