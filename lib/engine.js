
// Scene base class

class Scene {
    constructor(engine) {
      this.engine = engine;     // reference back to Engine
    }
    // Overridden by subclasses
    create(arg) {}
    handleChoice(choiceObj) {}
  }
  

  // Engine singleton

  const Engine = {

    storyData: null,        // JSON data
    currentScene: null,
    history: [],            // [{SceneClass,arg}]
    _outputId: "output",    // default div id
  
    setOutputElement(id) {
      this._outputId = id;
    },
  
    setTitle(txt) { document.title = txt; },
  
    show(html) {
      const p = document.createElement("p");
      p.innerHTML = html;
      this._out().appendChild(p);
    },
  
    addChoice(text, choiceObj = null) {
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = text;
      link.onclick = (e) => {
        e.preventDefault();
        this.currentScene.handleChoice(choiceObj);
      };
      this._out().appendChild(link);
      this._out().appendChild(document.createElement("br"));
    },
  
    gotoScene(SceneClass, arg = undefined) {
      this.history.push({ SceneClass, arg });
      this._run(SceneClass, arg);
    },
  
    goBack() {
      if (this.history.length > 1) {
        this.history.pop();             // remove current
        const prev = this.history[this.history.length - 1];
        this._run(prev.SceneClass, prev.arg);
      }
    },
  
    clear() { this._out().innerHTML = ""; },
  
    load(StartScene, jsonPath) {
      fetch(jsonPath)
        .then(r => {
          if (!r.ok) throw new Error("Failed to load " + jsonPath);
          return r.json();
        })
        .then(data => {
          this.storyData = data;
          // default output element if user didn't create one
          if (!document.getElementById(this._outputId)) {
            const d = document.createElement("div");
            d.id = this._outputId;
            document.body.appendChild(d);
          }
          this.gotoScene(StartScene);
        })
        .catch(err => {
          console.error(err);
          alert("Error loading story JSON. See console.");
        });
    },
  

    _run(SceneClass, arg) {
      this.clear();
      this.currentScene = new SceneClass(this);
      if (this.currentScene.create) this.currentScene.create(arg);
    },
  
    _out() { return document.getElementById(this._outputId); }
  };
  
  // Expose globals for Rules.js
  window.Scene  = Scene;
  window.Engine = Engine;
  