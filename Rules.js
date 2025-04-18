const ITEM_CLASSES={};
class GameWorldItem{
  constructor(m){this.meta=m;}
  pickupText(){return this.meta.onPickup||"You take the "+this.meta.name+".";}
}
class Lamp extends GameWorldItem{constructor(m){super(m);this.on=false;}
  toggle(scene){this.on=!this.on;scene.engine.show(this.on?"You switch the lamp on.":"You switch the lamp off.");}}
class Key extends GameWorldItem{}
class TranslatorFish extends GameWorldItem{}
ITEM_CLASSES.Lamp=Lamp;ITEM_CLASSES.Key=Key;ITEM_CLASSES.TranslatorFish=TranslatorFish;

const ITEM_REGISTRY={};
function initItems(json){
  for(const[id,meta]of Object.entries(json)){
    const Cls=ITEM_CLASSES[meta.class]||GameWorldItem;
    ITEM_REGISTRY[id]=new Cls(meta);
  }
}

const GAME={inventory:new Set(),flags:{}};
function hasLitLamp(){return GAME.inventory.has("lamp")&&ITEM_REGISTRY.lamp.on;}

class Start extends Scene{
  create(){this.engine.setTitle(this.engine.storyData.Title);
    this.engine.show("You crouch in the shadows outside a quiet suburban home. Time to go in…");
    this.engine.addChoice("Slip inside");}
  handleChoice(){this.engine.gotoScene(Location,this.engine.storyData.InitialLocation);}
}

class Location extends Scene{
  create(key){
    const d=this.engine.storyData.Locations[key];
    if(d.Dark&&!hasLitLamp()){
      this.engine.show("It's pitch‑black. You could trip or make noise!");
      this.engine.addChoice("Retreat",null);
      return;
    }
    if(d.Body) this.engine.show(d.Body);

    if(d.Items){
      for(const id of d.Items){
        if(!GAME.inventory.has(id)){
          GAME.inventory.add(id);
          this.engine.show(`<em>${ITEM_REGISTRY[id].pickupText()}</em>`);
        }
      }
    }

    if(d.Choices){
      for(const c of d.Choices){
        const okItem = c.RequiresItem ? GAME.inventory.has(c.RequiresItem):true;
        const okFlag = c.RequiresFlag ? GAME.flags[c.RequiresFlag]       :true;
        const notFlag= c.RequiresFlagNot?!GAME.flags[c.RequiresFlagNot]  :true;
        if(okItem&&okFlag&&notFlag)this.engine.addChoice(c.Text,c);
      }
    }else this.engine.addChoice("The end.");
  }

  handleChoice(c){
    if(!c){this.engine.goBack();return;}
    this.engine.show("&gt; "+c.Text);
    if(c.SetFlag)GAME.flags[c.SetFlag]=true;
    const t=this.engine.storyData.Locations[c.Target];
    switch(t?.Type){
      case"AlarmStudy": this.engine.gotoScene(AlarmStudy,c.Target); break;
      case"GuardDog"  : this.engine.gotoScene(GuardDog,  c.Target); break;
      case"Safe"      : this.engine.gotoScene(Safe,      c.Target); break;
      case"Carousel"  : this.engine.gotoScene(Carousel,  c.Target); break;
      default         : this.engine.gotoScene(Location,  c.Target);
    }
  }
}

class AlarmStudy extends Location{
  create(key){
    this.engine.show(GAME.flags.alarmOff?
      "The computer now reads SECURITY SYSTEM – STATUS <strong>DISABLED</strong>.":
      "Books and an ancient computer fill the study. The screen blinks SECURITY SYSTEM – STATUS <strong>ACTIVE</strong>.");
    super.create(key);
  }
}

class GuardDog extends Location{
  create(key){
    this.engine.show(GAME.flags.dogDistracted?
      "The guard dog chews the treat contentedly. The hallway is clear.":
      "A hallway stretches toward the office and master bedroom. A guard dog patrols here.");
    super.create(key);
  }
}

class Safe extends Location{
  create(){
    if(GAME.inventory.has("keycode")){
      this.engine.show("You punch in the code; the safe swings open. Jackpot!");
      this.engine.addChoice("Grab the loot and escape");
    }else{
      this.engine.show("A heavy safe. You'll need the key code.");
      this.engine.addChoice("Leave it for now");
    }
  }
  handleChoice(){GAME.inventory.has("keycode")?this.engine.gotoScene(End):this.engine.goBack();}
}

class Carousel extends Scene{
  create(){this.engine.show(this.engine.storyData.Locations.CarouselRoom.Body);
    const exits=["Foyer","Kitchen","LivingRoom","MasterBedroom"];
    const nxt=exits[Math.floor(Math.random()*exits.length)];
    this.engine.show("<em>You feel dizzy…</em>");
    this.engine.gotoScene(Location,nxt);}
}

class End extends Scene{
  create(){this.engine.show("<hr>Jewels in hand, you slip into the night. Job done.");
    this.engine.show(`<small>${this.engine.storyData.Credits}</small>`);}
}

fetch("items.json")
  .then(r=>r.json())
  .then(j=>{initItems(j);Engine.load(Start,"myStory.json");});
