#An Absolute Beginner's Guide to Corsica on a Raspberry PI
#####Rev 0.9

These instructions are also available as an [Instructable](https://www.instructables.com/id/A-Digital-Sign-Server-on-a-Raspberry-Pi/).

Digital signs are everywhere. You see them in airports, malls, department stores and even street corners. You don't need a lot of expensive custom hardware to build your own digital sign system. This Instructable show how to build a digital signage server that can drive dozens of displays. Each display can be as simple as a monitor and a Raspberry PI.

Thanks to the Node Ninjas at Mozilla you can even run the server on a Raspberry Pi using Corsica.

Corsica is an extensible digital signage solution that can be implemented on most POSIX systems. It consists of a server and display clients. Client machines do not require special software and simply run any modern web browser, although everyone on the Corsica team does highly recommend [Firefox](https://getfirefox.com).

The server consumes very few resources and will happily run on a Raspberry Pi or other very small machine. A Corsica server running on a Raspberry Pi 3+ can easily support more than 100 client displays. These instructions are written specifically for a Raspberry Pi running the Raspian operating system (a Debian derivative). These instructions also assume you are using the [Firefox](https://getfirefox.com) browser. Most other modern browsers should also work.

##The Raspian Command Line

These instructions will show you how to configure Corsica through the command line. If you're using Raspian with the graphical user interface (GUI), you get to the command line via the terminal application. If you're running Raspian-lite then you can connect a keyboard and monitor and use the command line directly, or you can connect over the network using SSH. For more information on how to enable and use SSH see the [Raspian SSH documentation](https://www.raspberrypi.org/documentation/remote-access/ssh/README.md).

You'll need to know the DNS name or the IP address of your Raspberry Pi. The default name on most LANs will be raspberrypi.local. If that doesn't work, there are instructions in the [Raspian documentation](https://www.raspberrypi.org/documentation/remote-access/ip-address.md) that will help you discover the correct name and IP address.

##Software Installation

Corsica uses [node.js](http://nodejs.org/) and [npm](https://npmjs.org/). Node lets you run server-side Javascript, and npm is the node package manager.

To install these on a Raspberry Pi first check the version of the processor in your system:

	uname -m

If the result starts with armv6, see this [blog post](http://weworkweplay.com/play/raspberry-pi-nodejs/). For Raspberry Pi 3 systems and others with armv7 and later processors:

	curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash - 
	sudo apt install nodejs

If you're unfamiliar with Node, you can learn more at [nodesource.com](http://nodesource.com/blog/an-absolute-beginners-guide-to-using-npm/).

Next, install the Corsica Command Line Tools:

	sudo npm install -g corsica-cli 

To see the available commands, type

	corsica --help

As of this writing the available commands are:

    setup -- to setup a Corsica server 

    start [options] -- to start the Corsica server 
    
    restart [options] -- to restart a running Corsica Server

    stop -- to stop a running Corsica server 

    add-plugin [name] -- to install a plugin 

    remove-plugin [name] -- to remove an installed plugin 

    list-plugins -- to list the installed plugins 

    update -- to update both Corsica and its plugins

Now you can use the tools to set-up the Corsica software:

corsica setup

Corsica setup will ask where you want to install corsica and show you the default location:

Where to install Corsica:  (/home/pi/corsica-server)

You can simply press return.

You'll see some npm warning messages. These are safe to ignore.

When the setup says "Done!", you have installed Corsica.

You can start Corsica in your terminal session with:

    corsica start

And stop it with control-C.

But if you do start it that way it will only run as long as your terminal session runs. When you close your terminal session corsica will stop.

If you start Corsica in the background it will run until even after you disconnect your terminal session. You can do that with

corsica start --background

To stop a corsica instance running in the background type:

corsica stop

##Configuration

Your set up will probably need some customization. There are two kinds of customization in Corsica: configuration and settings. Configuration is mostly static and used by the core. Settings are dynamic and used mostly by plugins. More on settings later.

Configuration comes from the environment, and is for very static things such as the port to listen on, or the plugins to load. There are four sources for config:

1. lib/config.json - This is where the defaults are stored, and a good place to see some of what can be configured. You shouldn't change values here.

2. config.js - Settings found in this file are loaded as if they were from the environment. The syntax is oneconfiguration per line, e.g. `PORT=8080`. If the values here are valid JSON, they will be parsed as such. Settings here will override the defaults in `lib/config.json`. The config.js file initially specifies the port number on which Corsica listens, and the plugins used by the system.

3. .env - If the hidden file named .env is in the Corsica directory settings there are loaded as if they were from the environment. The syntax is the same as in config.js. This file does not exist in the default configuration.

4. Environment variables - You can put configuration information in system environment variables if you prefer. If you're unfamiliar with environment variables it's safe to ignore this option.

##Connecting Display Screens

Once you start Corsica it will run a web server on port 8080 of your machine unless you've changed the port number in the .env file. You'll need to know either the hostname or the IP address of your Pi. The default name for a new Raspberry Pi installation is raspberrypi. If you haven't changed it you can just open a browser on your display client machine and browse to:

http://raspberrypi.local:8080

You should see the yellow and black Corsica logo. A bubble will pop up with the Corsica name of your client. You can (and should) change the name of your client to something that indicates the location of this particular display screen. The easiest way to do this is to use Potch's corsica-repl. (Potch is a principal developer of Corsica, and he's promised to put repl into the core of Corsica sometime soon).

Open a browser tab and browse to:

	http://potch.github.io/corsica-repl?server=http://raspberrypi.local:8080/

(That assumes raspberrypi.local is the name of your Corsica Server).

We'll use "TestClient" as the name of the client display for the rest of this tutorial. Go to the dropdown in the lower right corner of the screen and find the client name that popped up. Then in the command line at the bottom left of the screen type:

	admin type=rename name=TestClient

Leave the corsica-repl tab open and switch to browser tab showing the Corsica logo and refresh the page. You'll see the new name in the pop-up bubble. If it vanishes too quickly, hover your mouse in the lower right corner and the "Fullscreen" button will appear with the new name to the left.

##Adding Content

After displaying the Corsica logo the client will display some cartoon animals on a blue background.

The default tag in the state.json file contains a list of web page addresses. You can present any web page this way, although the layout of some pages makes them less suited for use with Corsica.

A Corsica client displays content from one or more tags to which it subscribes. New clients come already subscribed to a tag named "default".

Cartoon animals are cute, but let's add some useful content to the screen rotation on our test client.

Return to the corsica-repl tab and in the command line at the lower left type:

	admin type=subscribe tag=weather      

Switch back to the display client tab and refresh the page.

A weather forecast for San Jose, California, will be added to the list of urls displayed.

Our sample state.json file contains three tags named "default", "weather" and "images". The "images" tag contains links to more cartoon animal graphics (.png) files. Let's add those by switching back to the corsica-repl tab and typing:

	admin type=subscribe tag=images

Again, return to the display client tab and refresh the page. You'll see some new animals added to the rotation. But notice that the new animals appear on the left edge of the page with a white background. That's because the cartoons with the blue background are listed in state.json as urls that point to a proper web page written in html. The new cartoons with the white backgrounds are listed in state.json as urls that just point to the .png graphics files with no enclosing html.

We can improve the way those graphics are displayed by Corsica, but to do that we'll have to "extend" Corsica itself.

##Extending Corsica

More than a dozen npm Corsica plugins are available on the [nodesource.com](http://nodesource.com/blog/an-absolute-beginners-guide-to-using-npm/). Follow that link and enter "corsica" in the search box at the top of the page to see a list of them.

We'll use one of those npm plugins to let you display our new animals. It's also useful to to display any image you find on the web, without displaying distracting graphics surrounding the image.

Go to the corsica-repl tab in your browser and subscribe to the images tag:

admin type=subscribe tag=images

Open the corsica display client tab on your browser and refresh the page. You should see the new animals displayed centered on the screen with a dark blue background.

##Customizing Content

Lets take a look at the difference between what the urls in the default tag do and those in the images tag.

Take a look at state.json by going to the Corsica command line and typing:

	cat ~/corsica-server/state.json

In the "default" section of that file you will find a line that looks like:

	"https://ramilewski.github.io/corsica-support/show.html?image=kitty.png",

This url is a link to a web page with a cartoon of a kitten. That web page displays an image, but it also supplies a background that is a gradient that starts at the top of the page as a blue color, and fades to white at the bottom of the page. That background is created by the CSS and HTML of the web page. It is not part of the graphic itself.

The "images" sections of the page has a line that looks like:

	"https://ramilewski.github.io/corsica-support/bunny.png bg=#2244BB",

This is a url that specifies a link to the .png image of a rabbit. There is no actual web page for that image. The corsica-image plug-in will show the image centered in a background of the color specified in the "bg=#2244BB" argument on that line.

"#2244BB" is hexadecimal notation for a dark blue color. For a tool to help you specify any color in hex notation see the [MDN Color Picker](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Colors/Color_picker_tool).

In displaying this line Corsica has used the corsica-image plugin to render the display. This means that if you find an image you want to display on your Corsica client displays, you can create a line in state.json that will display just that image, but not any other distracting content of the surrounding page. To find the url of an image in Firefox, right-click the image and select "Copy Image Location" in the context menu that appears.

The "weather" section of state.json has only one url. This fetches a weather forecast from https://forecast.io. But unless you live in San Jose, that forecast isn't very useful. To get a forecast for your location you need to know it's latitude and longitude in decimal degrees. If you don't, there's a [web-based tool](https://www.latlong.net/) that will let you find it.

Right now the url in the line in state.json that specifies the weather forecast looks like:

	"https://forecast.io/embed/#lat=37.3352&lon=-121.8871&name=San%20Jose%20CA&color=#4466bb zoom=300"

To get the forecast for your location, change the lat and lon entries in that line and change the name to your location. Use %20 instead of spaces in the place name. The color parameter specifies the color of the bars between the high and low temperatures. The zoom parameter is used to adjust the size of the forecast to fit on the display screen.

When you create your own state.json file, remember that if you have a "default" tag, any content specified in that tag will appear on any browser that connects to the server without further configuration.

#### Display Timing

At the top of state.json there are some settings that control how long each image is shown on the screen.

	"settings::timer": {
	    "resetTime": 30000,
	    "jitter": 5000,

All of the times are measured in milliseconds (thousandths of a second). The resetTime is the maximum time each image is on the screen before the next screen is displayed. Jitter is multiplied by a random number between -1 and 1 and the result is added to resetTime. This provides some variety in display times. You can set jitter to 0 if you wish. The settings shown will set the default timing between 25 and 35 seconds.

You can also set different times for each display client:

	"settings::timer": {
	        "resetTime": 30000,
	        "jitter": 5000,
	        "resetOnConnect": true,
	        "screens": {
	           "TestClient": {
	                "resetTime": 10000,
	                "jitter": 1000
	            }
	        }
	    },

Here we've set the display time for our TestClient to between 9 and 11 seconds.

##Conclusion

We've shown how to install and configure a Corsica server on a Raspberry Pi. With what you've learned here, you can build a versatile, very low cost digital signage system.
You can use Raspberry Pis not only as the server in your system, but also to drive client displays.

There are many more plugins on the npm website that you can use to add other capabilities to your Corsica installation, including displaying:

* Images from Flickr
* Tweets
* Conversations in an IRC channel
* Video files
* YouTube videos
* Slides in Google presentations
* XKCD cartoons
* Content from an RSS feed

###Credits

Corsica is the creation of third-degree blackbelt Node Ninjas from Mozilla led by potch, lonnen and mythmon.
These instructions for Corsica on Raspberry Pis were cobbled together by Richard.

You can usually find everyone lurking around the #corsica channel on irc.mozilla.org.
