const GAME = {
    inventory: new Set(),
    flags: {}
  };
  
  class Start extends Scene {
    create() {
      this.engine.setTitle(this.engine.storyData.Title);
      this.engine.show("You crouch in the shadows outside a quiet suburban home. Time to go in…");
      this.engine.addChoice("Slip inside");
    }
    handleChoice() { this.engine.gotoScene(Location, this.engine.storyData.InitialLocation); }
  }
  
  class Location extends Scene {
    create(key) {
      const d = this.engine.storyData.Locations[key];
      this.engine.show(d.Body);
  
      if (d.Item && !GAME.inventory.has(d.Item)) {
        GAME.inventory.add(d.Item);
        this.engine.show(`<em>You take the ${d.Item}.</em>`);
      }
  
      if (d.Choices && d.Choices.length) {
        for (const c of d.Choices) {
          const hasItem = c.RequiresItem ? GAME.inventory.has(c.RequiresItem) : true;
          const flagOK  = c.RequiresFlag  ? GAME.flags[c.RequiresFlag]        : true;
          const flagNot = c.RequiresFlagNot ? !GAME.flags[c.RequiresFlagNot]  : true;
          if (hasItem && flagOK && flagNot) this.engine.addChoice(c.Text, c);
        }
      } else {
        this.engine.addChoice("The end.");
      }
    }
  
    handleChoice(c) {
      if (!c) { this.engine.gotoScene(End); return; }
      this.engine.show("&gt; " + c.Text);
      if (c.SetFlag) GAME.flags[c.SetFlag] = true;
  
      const target = this.engine.storyData.Locations[c.Target];
      switch (target.Type) {
        case "GuardDog": this.engine.gotoScene(GuardDog, c.Target); break;
        case "Safe":     this.engine.gotoScene(Safe,     c.Target); break;
        default:         this.engine.gotoScene(Location, c.Target);
      }
    }
  }
  
  class GuardDog extends Location {
    create(key) {
      if (GAME.inventory.has("Treat")) {
        this.engine.show("You toss the treat. The guard dog trots off happily.");
        GAME.flags.dogDistracted = true;
        this.engine.gotoScene(Location, key);
        return;
      }
      this.engine.show("A large dog blocks your way, growling.");
      this.engine.addChoice("Back away quietly");
    }
    handleChoice() { this.engine.goBack(); }
  }
  
  class Safe extends Location {
    create(key) {
      if (GAME.inventory.has("KeyCode")) {
        this.engine.show("You punch in the code; the safe swings open. Jackpot!");
        this.engine.addChoice("Grab the loot and escape");
      } else {
        this.engine.show("A heavy safe. You'll need the key code.");
        this.engine.addChoice("Leave it for now");
      }
    }
    handleChoice() {
      GAME.inventory.has("KeyCode") ? this.engine.gotoScene(End) : this.engine.goBack();
    }
  }
  
  class End extends Scene {
    create() {
      this.engine.show("<hr>");
      this.engine.show("Jewels in hand, you slip into the night. Job done.");
      this.engine.show(`<small>${this.engine.storyData.Credits}</small>`);
    }
  }
  
  Engine.load(Start, "myStory.json");
  