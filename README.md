# Northcoders News API

Welcome to my SCG News project! 

In order to run this file locally you will need to install the dependencies in the package.json file. 

To do this please initially run command: 
~ npm install 

To run both test and development databases this project will require .env files to point towards the correct databases. These are .env.test and .env.development. Please create these files locally following the below template. 

1. 
.env.test 

contents: 
PGDATABASE=nc_news_test 

2. 
.env.development

contents: 
PGDATABASE=nc_news

