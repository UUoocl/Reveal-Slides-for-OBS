/**
 * Handles sending and receiving presentation state to the notes source
 * via websockets
 */

const RevealNotes = {
  id: "notes",
  init: (reveal) => {
    
    //find the window or iframe running the script
    const location = getWindowLocation()
    
    /*
    connect to obs web socket server
    */
    const obs = new OBSWebSocket();
    wsConnect();
    async function wsConnect() {
      if(location === 'slides' || location === 'current-iframe'){
      await connectOBS(obs);
      }
    }

    function getWindowLocation(){
    let windowLocation
      if(window.frameElement){
      windowLocation = window.frameElement.id
    }else{windowLocation = "slides"}
    return windowLocation
  }
    
    //Add Keyboard binding to send next and previous messages
    //if next (n) or previous (p) is pressed on the slides window run the method
    //if the command comes from the SpeakerView, send a websocket message to the main slide window
    Reveal.addKeyBinding(
      { keyCode: 80, key: "p", description: "Next Slide" },
      () => {
        if (location === "slides") {
          Reveal.prev();
        } else {
          sendMethod("prev",location);
        }
      
      }
      );
      
      Reveal.addKeyBinding(
        { keyCode: 78, key: "n", description: "previous Slide" },
        () => {
          if (location === "slides") {
            Reveal.next();
          } else {
            sendMethod("next", location);
          }
        }
        );
        
        /**
         * Send Websocket next, prev or go to slide message to the Slides window.
        */
       function sendMethod(action, location) {
        sendToAdvSS(action)
         let websocketMessage = {
           namespace: "reveal-slides",
           type: action,
           notes: "",
           markdown: false,
           whitespace: "normal",
           state: Reveal.getState(),
          };
          //Websocket message
          console.log("sending method", location , websocketMessage)
          obs.call("CallVendorRequest", {
            vendorName: "obs-browser",
            requestType: "emit_event",
            requestData: {
              event_name: `${location}-change-slide`,
              event_data: { websocketMessage },
            },
          });
        }
        
        /**
         * Calls the specified Reveal.js method with the provided argument
         * and then pushes the result to the notes frame.
        */
    
    function callRevealApi( method ) {
      console.log("method", method)
      let methodName = method.detail.websocketMessage.type
      console.log(methodName);
      Reveal[methodName].apply();

      /* Send response to notes window      
      speakerWindow.postMessage( JSON.stringify( {
        namespace: 'reveal-notes',
        type: 'return',
        result,
        callId
      } ), '*' );   */
    }


    /**
     * Posts the current slide data to the notes window.
     * Create a websocket message to update the SpeakerView
     * The SpeakerView html will listen for the message
     */
    function post(event) {

      console.log("post func",event);
      if(location === "slides"){
        console.log("slideElement", Reveal.getCurrentSlide());
        let slideElement = Reveal.getCurrentSlide(),
        notesElements = slideElement.querySelectorAll("aside.notes"),
        fragmentElement = slideElement.querySelector(".current-fragment");
        console.log(event);
        let messageData = {
          namespace: "reveal-notes",
          type: 'state',
          notes: "",
          markdown: false,
          whitespace: "normal",
          state: Reveal.getState(),
        };
        
        // Look for notes defined in a slide attribute
        if (slideElement.hasAttribute("data-notes")) {
          messageData.notes = slideElement.getAttribute("data-notes");
          messageData.whitespace = "pre-wrap";
        }
        
        // Look for notes defined in a fragment
        if (fragmentElement) {
          let fragmentNotes = fragmentElement.querySelector("aside.notes");
          if (fragmentNotes) {
            messageData.notes = fragmentNotes.innerHTML;
            messageData.markdown =
            typeof fragmentNotes.getAttribute("data-markdown") === "string";
            
            // Ignore other slide notes
            notesElements = null;
          } else if (fragmentElement.hasAttribute("data-notes")) {
            messageData.notes = fragmentElement.getAttribute("data-notes");
            messageData.whitespace = "pre-wrap";
            
            // In case there are slide notes
            notesElements = null;
          }
        }
        
        // Look for notes defined in an aside element
        if (notesElements && notesElements.length) {
          // Ignore notes inside of fragments since those are shown
          // individually when stepping through fragments
          notesElements = Array.from(notesElements).filter(
            (notesElement) => notesElement.closest(".fragment") === null
            );
            
            messageData.notes = notesElements
            .map((notesElement) => notesElement.innerHTML)
            .join("\n");
            messageData.markdown =
            notesElements[0] &&
            typeof notesElements[0].getAttribute("data-markdown") === "string";
          }
          
          //speakerWindow.postMessage(JSON.stringify(messageData), "*");
          //send message to speaker view
          const websocketMessage = JSON.stringify(messageData);
          console.log(websocketMessage);
          
          obs.call("CallVendorRequest", {
            vendorName: "obs-browser",
            requestType: "emit_event",
            requestData: {
              event_name: `update-speaker-view-event`,
              event_data: { websocketMessage },
            },
          });

          //send event message to Advance Scene Switcher
          sendToAdvSS(JSON.stringify(event.type))
          
        // Look for Advance Scene Switcher attribute
        if (slideElement.hasAttribute("data-AdvSS")) {
          sendToAdvSS(slideElement.getAttribute("data-AdvSS"))
        }
      }
    }


    function sendToAdvSS(message){
    obs.call("CallVendorRequest", {
      vendorName: "AdvancedSceneSwitcher",
      requestType: "AdvancedSceneSwitcherMessage",
      requestData: {
        "message": message,
      },
    });
  }
        
        
    /**
     * Listen for WebSocket messages
     */
    window.addEventListener("current-iframe-change-slide", callRevealApi);
    window.addEventListener("speakerview-event", routeWSmsg);

    /**
     * Determine which window handles the message
     */
    async function routeWSmsg(event) {
      console.log("event recieved", event);
      //get the method
      //get the method
      let data = JSON.parse(event.detail.websocketMessage);
      data = JSON.stringify(data);
      data = JSON.parse(data);
      console.log("data:", data);

      //check if this window is the slides or Speaker View
      if (window.frameElement) {
        if (event.type === "slide-event") {
          if (window.frameElement.id === "current-iframe") {
            console.log("SV handled message");
            await callRevealApi(data.type);
          }
        }
      }
      if (event.type === "speaker-view-event") {
        callRevealApi(data.type);
      }
    }

//Send event message from the main Slide to the SpeakerView
    document.addEventListener("DOMContentLoaded", async () => {
      Reveal.on("slidechanged", post);
      Reveal.on("fragmentshown", post);
      Reveal.on("fragmenthidden", post);
      Reveal.on("overviewhidden", post);
      Reveal.on("overviewshown", post);
      Reveal.on("paused", post);
      Reveal.on("resumed", post);

//Send Slide show events from the main Slide window to OBS
  Reveal.on('overviewshown', event => {
    let overviewshownScene = document.querySelector("[data-overview-shown]");
    if(overviewshownScene && location === "slides"){
      window.obsstudio.setCurrentScene(overviewshownScene.getAttribute('data-overview-shown'));
      }});

  Reveal.on('overviewhidden', event => {
    switch(true){
      case event.currentSlide.hasAttribute("data-slide-changed") && location === "slides":
        window.obsstudio.setCurrentScene(event.currentSlide.attributes.getNamedItem("data-slide-changed").value);
        console.log(manualSceneChange,". slide Change")
        break;
      case event.currentSlide.hasAttribute("data-slide-transitioned") && location === "slides":
        window.obsstudio.setCurrentScene(event.currentSlide.attributes.getNamedItem("data-slide-transitioned").value);
        console.log(manualSceneChange,". slide transitioned")
        break;
    }});
    
  Reveal.on('slidechanged', event => {
    console.log("attribut check", event.currentSlide.hasAttribute("data-slide-changed"))
    if(event.currentSlide.hasAttribute("data-slide-changed")  && !Reveal.isOverview() && location === "slides"){
      console.log(event.currentSlide.attributes.getNamedItem("data-slide-changed").value)
      window.obsstudio.setCurrentScene(event.currentSlide.attributes.getNamedItem("data-slide-changed").value);
      }});

  Reveal.on('slidetransitionend', event => {
    if(event.currentSlide.hasAttribute("data-slide-transitioned") && location === "slides"){
      window.obsstudio.setCurrentScene(event.currentSlide.attributes.getNamedItem("data-slide-transitioned").value);
      }});
  
  Reveal.on('fragmentshown', event => {
    if(event.fragment.hasAttribute("data-fragment-shown") && location === "slides"){
      window.obsstudio.setCurrentScene(event.fragment.attributes.getNamedItem("data-fragment-shown").value);
      }});
          
  Reveal.on('fragmenthidden', event => {
    if(event.fragment.hasAttribute("data-fragment-hidden") && location === "slides"){
      window.obsstudio.setCurrentScene(event.fragment.attributes.getNamedItem("data-fragment-hidden").value);
      }}); 

      // Post the initial state
      //post();
      //Reveal.next()
      Reveal.prev()

      // Post the initial state
    });
  },
};
