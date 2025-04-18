const GAME = { inventory: new Set(), flags: {} };

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
    if (d.Body) this.engine.show(d.Body);

    if (d.Item && !GAME.inventory.has(d.Item)) {
      GAME.inventory.add(d.Item);
      this.engine.show(`<em>You take the ${d.Item}.</em>`);
    }

    if (d.Choices) {
      for (const c of d.Choices) {
        const okItem  = c.RequiresItem     ? GAME.inventory.has(c.RequiresItem) : true;
        const okFlag  = c.RequiresFlag     ? GAME.flags[c.RequiresFlag]         : true;
        const notFlag = c.RequiresFlagNot  ? !GAME.flags[c.RequiresFlagNot]     : true;
        if (okItem && okFlag && notFlag) this.engine.addChoice(c.Text, c);
      }
    } else this.engine.addChoice("The end.");
  }

  handleChoice(c) {
    if (!c) { this.engine.gotoScene(End); return; }
    this.engine.show("&gt; " + c.Text);
    if (c.SetFlag) GAME.flags[c.SetFlag] = true;

    const t = this.engine.storyData.Locations[c.Target];
    switch (t.Type) {
      case "AlarmStudy": this.engine.gotoScene(AlarmStudy, c.Target); break;
      case "GuardDog":   this.engine.gotoScene(GuardDog,   c.Target); break;
      case "Safe":       this.engine.gotoScene(Safe,       c.Target); break;
      default:           this.engine.gotoScene(Location,   c.Target);
    }
  }
}

class AlarmStudy extends Location {
  create(key) {
    this.engine.show(
      GAME.flags.alarmOff
        ? "The computer now reads SECURITY SYSTEM – STATUS <strong>DISABLED</strong>."
        : "Books and an ancient computer fill the study. The screen blinks SECURITY SYSTEM – STATUS <strong>ACTIVE</strong>."
    );
    super.create(key);
  }
}

class GuardDog extends Location {
  create(key) {
    if (!GAME.flags.dogDistracted) {
      this.engine.show("A hallway stretches toward the office and master bedroom. A guard dog patrols here, watching you closely.");
    } else {
      this.engine.show("The guard dog is happily chewing the treat in a corner; the hallway is clear.");
    }
    super.create(key);
  }
}

class Safe extends Location {
  create() {
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
