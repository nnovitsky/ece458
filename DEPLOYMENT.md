# Deployment Guide
Fantastic Four
1. Carrie Hunner 
2. Natalie Novitsky 
3. Jack Wood
4. Juliet Yznaga

## Initial Technologies
- Ubuntu 20.04 with ssh key configured and user with sudo privileges
- Python3
- Git
- NodeJS 
- Npm 


## Set Up Your Ubuntu Environment

```
sudo apt-get update
sudo apt-get install python-pip python-dev libpq-dev postgresql postgresql-contrib nginx
```

## Move the Project Code to Your Ubuntu Machine
Create a folder on your machine to hold the project code through the command line.
```
mkdir hpt_project_folder
```
Move into this directory and clone the repository
```
cd hpt_project_folder
git clone .......
```
## Create a PostgreSQL Database and User

Log into an interactive Postgres session by typing:

```sudo -u postgres psql```

Create a database:

```
postgres=# CREATE DATABASE hpt_db;
```

Next, create a database user for our project. Make sure to select a secure password:

```
postgres=# CREATE USER  hpt_project_user WITH PASSWORD 'protected_password';
```

Now, we can give our new user access to administer our new database:

```
postgres=# GRANT ALL PRIVILEGES ON DATABASE hpt_db TO hpt_project_user;
```

Exit the Postgres session
```
postgres=# \q
```

## Accessing the Virtual Environment 

Move into the backend folder and access the virtual machine:
```
venv source/bin/activate
```
Make sure  gunicorn and psycopg2 is installed on your machine
```
(venv) pip install django gunicorn psycopg2
```


## Edit the settings.py File 

Edit the settings.py file to allow your host
```bash
ALLOWED_HOSTS = ['your_server_domain_or_IP', 'second_domain_or_IP', . . .]
```

In settings.py, change the databases attributes
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
Change your python path
```
(venv) export PYTHONPATH=/home/directory/folder_above_backend
```
Migrate initial database schema to you PostgreSQL database
```
python3 manage.py makemigrations
(venv) python3 manage.py migrate
``` 
Create an administrative user for the project
```
(venv)python3 manage.py createsuperuser
```
Collect all of the static content into the static directory configuration we configured
```
(venv) python3 manage.py collectstatic
```
Test out your project by typing 
```
(venv) python3 manage.py runserver 0.0.0.0:8000
```
To ensure it's working visit your server domain followed by :8000
```
http://server_domain_or_IP:8000
```
You should see the default Django index page. If you append `/admin` to the end of the URL in the address bar, you will be prompted for the administrative username and password you created with the `createsuperuser` command.

## Testing you Project with Gunicorn 
Make sure the Gunicorn can serve the application by typing:
```
(venv) gunicorn --bind 0.0.0.0:8000 hpt.wsgi
```
This will start Gunicorn on the same interface that the Django development server was running on. You can go back and test the app again.

Once we know our project can be served by Gunicorn, you can close the virtual environment. 
```
(venv) deactivate
```

## Create a Gunicorn systemd Service File

Create and open a systemd service file for Gunicorn with sudo privileges in your text editor
```
sudo  nano /etc/systemd/system/gunicorn.service
```
We will add a `[Unit]`  `[Service]` and `[Install]` section. 
- The `[Unit]` will specify ????? 
- The `[Service]` section clarifies what the service file should execute. The User specifies the user of the vcm and grants them ownership of the process. The Group gives ownership to `www-data` so that Nginx can communicate easily with Gunicorn. The Environment tag clarifies the `PYTHONPATH` which should be used to launch Gunicorn. WorkingDirectory specifies where the service file should start executing and the ExecStart tag gives the commands that should be executed.
- The `[Install]` section has only one tag, WantedBy which allows multiple users to access our server. Here is the full file:

```
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User= your_ubuntu_server_user
Group=www-data
WorkingDirectory=/home/hpt_project_folder/backend
Environment="PYTHONPATH=/home/vcm/evo1/ece458/"
ExecStart=/home/hpt_project_folder/backend/venv/bin/gunicorn --access-logfile - --workers 3 --bind unix:/home/hpt_project_folder/backend/backend.sock hpt.wsgi

[Install]
WantedBy=multi-user.target
```
Now we can start the Gunicorn service we created and enable it so that it starts at boot:
```
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```
Check the status of gunicorn and see if it was able to start
```
sudo systemctl start status
```
Make sure the sock file was created by looking into your project directory
```
ls /home/hpt_project_folder/backend
```
If the status call indicated an error, or the backend.sock folder was not created, there was an issue with starting Gunicorn. You can find a more in-depth log of what occurred by using the command and pressing `shift + g` to navigate to the bottom of the log
```
sudo journalctl -u gunicorn
```
Most likely, one of the paths was incorrectly inputted into the service file. Check your paths and if an error still persists, try to execute the ExecStart commands yourself in the command line. Navigate to your project folder and execute:
```
cd /home/hpt_project_folder/backend
venv/bin/gunicorn --access-logfile - --workers 3 --bind /home/hpt_project_folder/backend/backend.sock hpt.wsgi
```
Anytime you make an edit to the `/etc/systemd/system/gunicorn.service` file, make sure to reload the daemon to reread your new service definition and restart Gunicorn 
```
sudo systemctl daemon-reload
sudo systemctl restart gunicorn
```
To ensure it's working visit your server domain followed by :8000. You should see the default Django page. By adding /admin to the url, you will be directed to the admin login and should be able to login with your superuser
```
http://server_domain_or_IP/admin
```

## Configure Nginx to Proxy Pass to Gunicorn 

With our backend running on Gunicorn, we can now work on Nginx and configure it to pass traffic to the process. We begin by creating a new server block in Nginx's sites-available directory.
```
sudo  nano /etc/nginx/sites-available/hpt_project
```

First, we will open up a new server block and specify that the server should listen on port 80 which is the normal port for internet traffic. We will also specify that it should respond to our server's host name. 
```
server {
    listen 80;
    server_name server_domain_or_IP;
}
```
Next, we will specify for Nginx to ignore any issues with finding a favicon and we will tell it where to find the static assets in our Django backend. 
```
server {
    listen 80;
    server_name server_domain_or_IP;
    
    location = /favicon.ico { access_log off; log_not_found off; }
    location /static/ {
        root /home/sammy/myproject;
    }
  }
```
Last, we will create a `location / {}` block to match all other requests. Inside of this location, we will include the standard proxy_params file included with Nginx and then pass traffic to the socket that our Gunicorn process created. 

```
server {
    listen 80;
    server_name server_domain_or_IP;
    
    location = /favicon.ico { access_log off; log_not_found off; }
    location /static/ {
        root /home/sammy/myproject;
    }
    
	location / {
        include proxy_params;
        proxy_pass http://unix:/home/sammy/myproject/myproject.sock;
    }
 }
```

Save and close the file `/etc/nginx/sites-available/hpt_project`. Next, we must enable the file by linking it to the `sites-enabled` directory like so:
```
sudo ln -s /etc/nginx/sites-available/hpt_project /etc/nginx/sites-enabled
```
Then test your Nginx configuration for syntax errors by typing:
```
sudo nginx -t
```
If no errors are reported, restart Nignx  by typing:
```
sudo systemctl restart nginx
```
## Preparing the React Frontend to Launch 
The next step is to create a build of the frontend static files for the server to display. This is done by navigating to the `home/hpt_project/ece458` directory and then navigating to the frontend folder
```
cd frontend
```
First make sure that the frontend has all the necessary node modules by running
```
npm install 
```
The npm dependencies were installed using the `--save-dev` flag which allows the user to only make one call to `npm install` to grab the necessary tools
Next, build the frontend into static files to be served by running the command 
```
npm run build
```
This will create a `/frontend/build` directory which holds all of the content for our server to display. Restart Nignx then navigate to your browser to see if the frontend is being displayed
```
sudo systemctl restart nginx
```  
Navigate to `http://server_domain_or_IP/` to see if it worked. 

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
sudo snap install core; sudo snap refresh core
```
If you have any Certbot packages, you should remove them before installing Certbot Snap to ensure that when you run `certbot` as a command, the snap is used rather than the installation from your OS package manager. Do this by typing
```
sudo apt-get remove certbot
```
The next step is to install Certbot using this command 
```
sudo snap install --classic certbot
```
To ensure the `certbot` command can be run, execute this command on the command line 
```
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```
Now, we will specify how we would like to run Certbot. We want Certbot to edit the Nginx configuration automatically to serve it and turn on HTTPS in a single step. Specify this to Certbot with the command 
```
sudo certbot --nginx
```
??????NEED STUFF ABOUT USERNAME AND EMAIL???????
