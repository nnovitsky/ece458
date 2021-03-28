# Backup Guide

Instructions on how to set up a database backup system for this project.

## Backing Up

### Setting Up Backup Server

1. On a separate backup server (Ubuntu system in this example), create the necessary directory structure. For this example, we begin in base directory /home/vcm/ then create a new directory 'backups', with subdirectories 'scripts' and 'prod' (name of project version to back up). Within 'prod', we have 'daily', 'weekly', and 'monthly'. Each of these subdirectories holds backup files for the project running on 'prod' server, taken at daily, weekly, and monthly intervals, respectively. At the end of this section is the tree structure of /home/vcm/.
2. Install required packages: 
`sudo apt-get install mailutils; sudo apt-get install zip` (mailutils will require a selection of mail configuration to configure Postfix, select 'Internet Site' and accept default or change name if desired).
3. In /home/vcm/backups/, generate 3 text files to send in the body of success emails for daily, weekly, and monthly backup confirmation emails (named 'message_daily.txt', 'message_weekly.txt', and 'message_monthly.txt' in this example).
4. In /home/vcm/backups/scripts/, copy the 3 .sh files included in this repository in /ece458/backups/ ('daily_backup.sh', 'weekly_backup.sh', and 'monthly_backup.sh'). Adjust variables as described in comments in files to reflect server names, passwords, and paths in your system.
5. For each of the 3 scripts added, run `chmod -x /home/vcm/backups/scripts/daily_backup.sh` (replacing script name with each script added) to grant root permission to run the scripts. 
6. Use ssh-keygen to add persistent login to your prod server: `ssh-keygen; ssh-copy-id vcm@vcm-18278.vm.duke.edu` (replacing `vcm@vcm-18278.vm.duke.edu` with your prod server's address).
7. Edit the backup server's cron jobs to automatically run the three scripts at appropriate intervals. `crontab -e` opens the cron task editor, then paste the following into that file (changing the MAILTO field to the desired recipient of any error logs from the cron jobs): 

```
# Change this field to set recipient of errors/logs from running scripts
MAILTO=nen4@duke.edu

@daily bash /home/vcm/backups/scripts/daily_backup.sh

@weekly bash /home/vcm/backups/scripts/weekly_backup.sh

@monthly bash /home/vcm/backups/scripts/monthly_backup.sh
```

Tree Structure of Backup Server:

    /home/vcm/
    └── backups
       ├── prod
       │   ├── daily
       │   │   └── [files from daily backups]
       │   ├── monthly
       │   │   └── [files from monthly backups]
       │   └── weekly
       │       └── [files from weekly backups]
       ├── message_daily.txt
       ├── message_monthly.txt
       ├── message_weekly.txt
       └── scripts
           ├── daily_backup.sh
           ├── monthly_backup.sh
           └── weekly_backup.sh



### Generating Backups

Daily, weekly, and monthly backups will be generated automatically as .zip files containing the PostgresSQL dump and a zipped folder with all calibration event artifacts currently saved on the prod server. Backups older than the set time frame (7 days for daily backups, 4 weeks for weekly backups, and 12 months for monthly backups) will be automatically deleted when the backup scripts are run.

To manually run the scripts, cd into /home/vcm/backups/scripts/ and run `bash daily_backup.sh` (changing script name to desired script to run).

## Restoring

### Setting Up Prod Server 
1. Use ssh-keygen to add persistent login to your backup server: `ssh-keygen; ssh-copy-id vcm@vcm-18807.vm.duke.edu` (replacing `vcm@vcm-18807.vm.duke.edu` with your backup server's address).
2. Install required package: `sudo apt-get install zip` (this will also install `unzip`).
3. Copy restoration script and validation script ('restore_backup.sh' and 'validate_backup.sh' in /ece458/backups/ folder) onto dev server (ours are in /home/vcm/ directory) and update variables in the scripts as described in the comments to reflect server names, database credentials, and paths in your system.

### Restoring Backups

To perform a backup, run `bash restore_backup.sh` from directory you put it in setup step 3 (ours is /home/vcm/) on prod server.

The script will ask for a folder (0-daily, 1-weekly, 2-monthly); input a number to select which group of backup files you'd like to use. You will then be asked to input the name of the backup file from this folder to use for restoration (given a list of existing filenames). You will be asked to verify that you would like to overwrite the existing database and calibration event artifacts--enter 'y' to proceed. The database will be overwritten with the contents of this backup, and the contents of /ece458/backend/media/cal_event_artifacts/ will be replaced with the files from this backup. 

At any input stage, enter 'x' to quit the program. 


### Validating Backups

To validate a backup, run `bash validate_backup.sh` from directory you put it in setup step 3 (ours is /home/vcm/) on prod server.

Similarly to the script that restores a backup, you will be asked to select a folder, then a filename to validate. The backup file will be temporarily loaded onto the prod server, unzipped, and uploaded to a temporary test database (called "trial"). You will be shown a list of the files in the 'cal_event_artifacts' folder for this backup, as well as the most recent login date in the restored users table. This field is updated whenever a user logs in, implying that data created/modified up to that login is included in the backup. The test database is deleted, along with backup files, at the end of the validation script.
