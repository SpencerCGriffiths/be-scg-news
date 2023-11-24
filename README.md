# Northcoders News API

Welcome to my SCG News project! 

This project is the backend API of a forum site simillar to reddit. 

**SETTING UP THE PROJECT**

To clone this repo and to begin working on your own public version follow the below instructions: 

1. Make your own public repo on github (do not initialise the project with a readme, .gitignore or license)

2. Clone this repo on to your local machine. 

3. Set your own public repo as the "remote" so that your updates point towards your own repo, create a main branch and ensure it is updated. 

git remote set-url origin YOUR_NEW_REPO_URL_HERE
git branch -M main
git push -u origin main




In order to run this file locally you will need to install the dependencies in the package.json file. 

To do this please initially run command: 
~ npm install 




To run test and development databases as well as operate production this project will require .env files to point towards the correct databases and endpoints. These are .env.test and .env.development and .env.production . Please create these files locally following the below template. 

1. 
.env.test 

contents: 
PGDATABASE=nc_news_test 

2. 
.env.development

contents: 
PGDATABASE=nc_news

3. 
.env.production

contents: 
DATABASE_URL=postgres://hubmvkje:RwcEr4hccRQ_plEymSNsX4PIBbq6d8im@surus.db.elephantsql.com/hubmvkje


You should ensure that these files are included in a .gitignore file (please check as the gitignore file may have already been made for you)

**RUNNING THE PROJECT** 

now that you have set up the files that are required you are able to seed the local database. In order to do this run the commands: 

npm run setup-dbs 
- this will establish the database
npm run seed
- this will seed the local database
npm run start 
- this will start the listen.js folder for incoming requests
npm run seed-prod
- this will seed the production database

You will be able to run test with: 

npm run test 

***NOTE*** 
husky is installed within this repo and as such all tests will run before pushing. This is the expected behaviour of this repo
***NOTE***

You can access the production database from where it is hosted at: 

https://readaway.onrender.com

you may wish to access /api which will provide you with all of the end points available for the site: 

https://readaway.onrender.com/api 

# Requirments: 
you will require the below versions of Node.js and Postgres: 
Node v.20.8.0 
Postgres v.14.9