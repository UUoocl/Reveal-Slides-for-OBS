# Reveal-Slides-for-OBS
reveal.js Plugin to use the Speaker Viewer in OBS.  

reveal.js is the HTML presentation framework for creating stunning presentations on the web. 
OBS Studio is a free and open source software for video recording and live streaming.  OBS can play reveal.js slides in its embedded browser.  One limitation is that the OBS Browser doesn't allow pop up windows.  This means the reveal.js Speaker View can't open 😢

The Reveal Slides for OBS plugin modifies the Speaker View so that a pop up window is not needed 🙌.  The Speaker View and Slides are added to OBS as separate Browser Sources and WebSocket messages keep them in sync.  

![image](https://github.com/UUoocl/Reveal-Slides-for-OBS/assets/99063397/cb05bdab-b681-47de-911f-0a343c542d30)

### Features
- Control OBS with slide attributes.
- new Speaker View Teleprompter layout. Scroll your notes. 
- Send messages to the Advanced Scene Switcher Plugin

## Setup Reveal Slides for OBS
#### reveal.js deck folder structure
- {Your slide deck}.html
- websocketDetails.js
- /plugin
	- /notes
		- notes.js
		- obs-ws.js
		- obsConnect.js
		- speaker-view.html
	- /{other plugins}
- /dist
  
### Get OBS WebSocket Info
1. Download the Reveal Slides for OBS plugin from this repo.  
2. Replace the "notes" folder in your existing reveal.js slide deck with the "notes" folder in this repo
3. Open OBS, in the file menu click Tools > WebSocket Server Settings.
	- Check the "Enable WebSocket server" box
	- click the "Show Connect Info" button

![image](https://github.com/UUoocl/Reveal-Slides-for-OBS/assets/99063397/c7b9e380-331c-4843-83f3-f23178e1af07)

Enter your OBS WebSocket Server details in the "websockerDetails.js" file.
 - open "websocket.js" in a text editor like [Visual Studio Code](https://code.visualstudio.co)


### Update your Slide deck HTML file
Towards the bottom of your Slide deck's HTML file there will be a < script > tags.

Add the following  script sources. 
 ``` HTML
    <script src="websocketDetails.js"></script>
    <script src="plugin/notes/obs-ws.js" ></script>
    <script src="plugin/notes/obsConnect.js" ></script>
```

### Add reveal.js slides to OBS
1. Add a Browser Source 
>	- check the 'Local File' box
>	- uncheck other option boxes
>	- Set the Page permissions to "Full access..."

 ![image](https://github.com/UUoocl/Reveal-Slides-for-OBS/assets/99063397/ccb5c7d4-54b2-4299-83ce-7fe83b3e3883)

2. Click the "Interact" button to navigate the Speaker View.  Use the keyboard key N nad P to move to the next (n) or previous (p) slide.  

![image](https://github.com/UUoocl/Reveal-Slides-for-OBS/assets/99063397/b0020e79-550d-469a-98bb-e52bbe96bd7b)


## Control OBS with reveal.js slides
Reveal Slides for OBS supports data attributes that control changing Scenes in OBS.  

Example data attribute
```HTML
<section data-slide-changed="Scene1">
```
In reveal.js each slide starts with a < section > tag.  In the example when this slide loads, OBS will change to a scene names "Scene 1".

The following OBS actions are available.  
#### Slide change started event
Markdown
```
<!-- .slide: data-slide-changed="scene name" -->
```
HTML
```
<section data-slide-changed="scene name">
```
#### Slide change ended event
Markdown
```
<!-- .slide: data-slide-transitioned="scene name" -->
```
HTML
```
<Section data-slide-transitioned="scene name">
```

#### Add a name to a slide
```
<!-- .slide: data-slide-name="scene name" -->
```


### Slide Fragment Commands

#### Fragment Shown
Add fragment events to the < div > element for the given fragment. 
Add fragment events to a Markdown file using these tags after a fragment
```
<!-- element class data-fragment-shown="scene name" -->
<!-- element class data-fragment-hidden="scene name  -->
```


## Speaker View Teleprompter Layout
When a slide with notes is loaded, the text will begin scrolling.  
Adjust the text size and scroll speed. 
|Action      |Key      |
|:-----|:-----|
|Next slide|n|
|Previous slide|p|
|⏪Slowdown scrolling      |F8|
|⏸️Pause scrolling      |F9     |
|⏩Speed up scrolling      |F10      |
|➕Increase notes text size      | =   |
|➖Decrease notes text size      |-     |
|Default layout|1|
|Wide layout|2|
|Tall layout|3|
|Notes only layout|4|
|Teleprompter layout|5|
|Upcoming Slide only|6|

## How to make reveal.js slides
Try the online visual slide editor at [slides.com][https://slides.com/]

Another option is the [Advanced Slides](https://github.com/MSzturc/obsidian-advanced-slides) Plug-in for Obsidian.  This is a great markdown slide editor with unique features. 

### learn more about OBS WebSockets
https://github.com/obsproject/obs-browser?tab=readme-ov-file#available-events

https://github.com/obs-websocket-community-projects/obs-websocket-js
