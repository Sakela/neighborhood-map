# Neighbourhood Map Project with Udacity (Project 5)

This project is a single page application that takes advantage of Knockout.js framework to organize the code structure with MVVM design pattern.
> MVVM is just the name used by Knockout to describe the process of connecting Model to the View with some mediator.

This application allows you to search for cities and most popular venues in them. The map functionality is driven by Google Maps API, and the data about the venues is kindly provided by Foursquare API.

You can play around with the [Neighbourhood Map app in here](https://sakela.github.io/neighborhood-map/) 

## Getting Started
* All the development source code is located in ```src/``` folder.
* Production code is located in ```dist/``` folder.

Download the Github repo of the project or clone it to your computer
```sh
$ cd to the folder you want to save project
$ git clone https://github.com/Sakela/neighborhood-map.git
```
To run the application you need to go to the destination where you have saved the project and open Index.html file in any browser of your choice from the root of the project's folder.

This project utilizes Grunt as its Task Runner.
To work with Grunt you will need to use Node Package Manager (NPM) that you can use by downloading [NodeJS](https://nodejs.org/en/).
You can learn on how to get started with [Grunt here](https://gruntjs.com/getting-started)
```sh
npm install -g grunt-cli                      //Install Grunt CLI globally
npm install grunt --save-dev                  //Install grunt
npm install grunt-contrib-imagemin --save-dev //Install dependencies
npm install grunt-contrib-cssmin --save-dev 
```
*Install all other dependencies in the same manner*

#### Tasks ran with Grunt
- imagemin (minify all images)
- cssmin (minify CSS files)
- uglify (optimize JS files)
- htmlmin (minify HTML file)

To run all tasks just type:
```sh
grunt                                         // in the command line
```

#### Run local web server
In order to test the application with local server you need to install [Python](https://www.python.org/downloads/) and download a tool called [ngrok](https://ngrok.com/download).
* In the command line go to Neighborhood-Map folder
* Type python ```python -m SimpleHTTPServer 8080``` to start server
* Navigate to the folder where you downloaded ```ngrok``` in the terminal
* Run ```ngrok http 8080```
Now you can test application with the retrieved URL.

### Project Functionality
The application is responsive and can be used across modern browsers, tablets, and phones. Achieved with CSS media queries. 
UI content updates without reloading the page with help of Knockout Observables. Two way binding between the venue from the list and corresponding marker. The venues filtered with Input field that takes name of the locations and using Regular Expression filters through the list of venues.
Data request errors handled gracefully with Ajax error method. The user as well notified about any errors in search of the city. 