# Neighbourhood Map Project with Udacity (Project 6)

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

### Project Functionality
The application is responsive and can be used across modern browsers, tablets, and phones. Achieved with CSS media queries. 
UI content updates without reloading the page with help of Knockout Observables. Two way binding between the venue from the list and corresponding marker. The venues filtered with Input field that takes name of the locations and using Regular Expression filters through the list of venues.
Data request errors handled gracefully with Ajax error method. The user as well notified about any errors in search of the city. 