#!bin/bash

# Script to generate daily backups

today=$(date +"%Y-%m-%d")
# change to your dev server name
server="vcm@vcm-18868.vm.duke.edu"

# change to desired confirmation email recipient
email="nen4@duke.edu"

# change to path to daily backup files and message files (if not structure defined in BACKUP_GUIDE)
dailypath="/home/vcm/backups/dev/daily/"
messagepath="/home/vcm/backups/message_daily.txt"

# change to database credentials for your database
dbuser="admin_hpt_user"
dbpass="fantasticfour2021!"
dbname="evolution_two"

# change to path to /media/ directory (of this repository) on your dev server
artifactpath="/home/jay18/evo2/ece458/backend/media/"

# generate postgresql dump of database named 'evolution_two' using provided credentials, from localhost on $server, save on backup server as $today.sql
ssh ${server} "PGPASSWORD=$dbpass pg_dump -U $dbuser -h localhost $dbname --clean" > ${dailypath}${today}.sql

# generate zip file of calibration artifacts on $server
ssh ${server} "cd $artifactpath; sudo zip -q -r temp.zip cal_event_artifacts"

# scp artifact zip file to backup server
scp ${server}:${artifactpath}temp.zip ${dailypath}artifacts.zip

cd ${dailypath}

# zip artifacts and sql dump together as $today.zip
zip -q -r ${today}.zip artifacts.zip ${today}.sql

# remove temp zip file from $server
ssh ${server} "cd $artifactpath; sudo rm temp.zip"

# remove temp artifacts and sql files from backup server
rm artifacts.zip

rm ${today}.sql

f7days=$(date +%s --date="-7 days")

# remove backup .zip files from backup server that are older than 7 days
for file in ${dailypath}*.zip; do fdate=$(basename $file .zip); fsec=$(date +%s --date=${fdate}); if [[ $fsec -lt $f7days ]]; then rm $file; fi; done

# send confirmation email
mail -s "Successful backup on $today." ${email} < ${messagepath}