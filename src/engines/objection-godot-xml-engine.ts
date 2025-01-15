import { create } from "xmlbuilder2";

export type Location = 'left' | 'center' | 'right';

/** Interfaces directly with the XML source code. Only primitive functions will be here*/
export class OGXMLEngine {
  private xmlDocument = create({ standalone: true }).ele("");

  protected addWait(time = 1) {
    this.addTagWithProperties("wait", [
      { key: "secs", value: time.toString() },
    ]);
    return this;
  }

  protected addNameTag(text = "") {
    this.addTagWithProperties("nametag", [{ key: "text", value: text }]);
    return this;
  }

  protected addPlayTag() {
    this.addTagWithProperties("play");
    return this;
  }

  protected addBox() {
    this.addTagWithProperties("box", [{ key: "set", value: "in" }]);
    return this;
  }

  protected removeBox() {
    this.addTagWithProperties("box", [{ key: "set", value: "out" }]);
    return this;
  }

  protected addArrow() {
    this.addTagWithProperties("arrow", [{ key: "action", value: "show" }]);
    return this;
  }

  protected removeArrow() {
    this.addTagWithProperties("arrow", [{ key: "action", value: "hide" }]);
    return this;
  }

  protected flash(duration = 0.15) {
    this.addTagWithProperties("flash", [
      { key: "duration", value: duration.toString() },
    ]);
    return this;
  }

  protected shake(magnitude = 5, duration = 0.3) {
    this.addTagWithProperties("shake", [
      { key: "duration", value: duration.toString() },
      { key: "magnitude", value: magnitude.toString() },
    ]);
    return this;
  }

  protected sprite(pos: Location, res: string, anim: string) {
    this.addTagWithProperties("sprite", [
      { key: "pos", value: pos },
      { key: "res", value: res },
      { key: "anim", value: anim },
    ]);
    return this;
  }

  protected startMusic(track: string) {
    this.addTagWithProperties("music", [
      { key: "action", value: "play" },
      { key: "res", value: track },
    ]);
    return this;
  }

  protected stopMusic() {
    this.addTagWithProperties("music", [{ key: "action", value: "stop" }]);
    return this;
  }

  protected playSound(sound: string) {
    this.addTagWithProperties("sound", [{ key: "res", value: sound }]);
    return this;
  }

  protected setBlip(blipType: "male" | "female" | "typewriter" | "none") {
    this.addTagWithProperties("blip", [{ key: "type", value: blipType }]);
    return this;
  }

  protected camera(type: "cut" | "pan", location: Location) {
    this.addTagWithProperties(type, [{ key: "to", value: location }]);
    return this;
  }

  protected bigtext(
    topMessage: string,
    bottomMsg: string,
    color: string,
    movementDirection: "vertical" | "horizontal"
  ) {
    this.addTagWithProperties("bigtext", [
      { key: "top", value: topMessage },
      { key: "bottom", value: bottomMsg },
      { key: "color", value: color },
      { key: "ir", value: movementDirection === "vertical" ? "ud" : "lr" },
    ]);
    return this;
  }

  protected evidence(file: string, side: "left" | "right") {
    this.addTagWithProperties("evidence", [
      { key: "res", value: file },
      { key: "side", value: side },
      { key: "action", value: "show" },
    ]);
    return this;
  }

  protected hideEvidence(immediate = false, side: "left" | "right") {
    this.addTagWithProperties("evidence", [
      { key: "action", value: immediate ? "hide_immediate" : "hide" },
      { key: "side", value: side },
    ]);
    return this;
  }

  protected bubble(type: "objection" | "holdit" | "takethat") {
    this.addTagWithProperties("bubble", [{ key: "type", value: type }]);
    return this;
  }

  protected gavel(
    repetions: number,
    timeBetweenRepetitions: number,
    timeAfterRepetitions: number
  ) {
    this.addTagWithProperties("gavel", [
      { key: "num", value: repetions.toString() },
      { key: "between", value: timeBetweenRepetitions.toString() },
      { key: "after", value: timeAfterRepetitions.toString() },
    ]);
    return this;
  }

  protected veredict(
    text: string,
    groupBy: "word" | "letter",
    fontColor: string,
    outlineColor: string
  ) {
    this.addTagWithProperties("veredict", [
      { key: "text", value: text },
      { key: "group_by", value: groupBy },
      { key: "font_color", value: fontColor },
      { key: "font_outline_color", value: outlineColor },
    ]);
    return this;
  }

  protected segmentTitle(
    text: string,
    fontColor: string,
    outlineColor: string,
    timeIn: number,
    timeOut: number
  ) {
    this.addTagWithProperties("segment_title", [
      { key: "text", value: text },
      { key: "font_color", value: fontColor },
      { key: "font_outline_color", value: outlineColor },
      { key: "time_in", value: timeIn.toString() },
      { key: "time_out", value: timeOut.toString() },
    ]);
    return this;
  }

  protected removeSegmentTitle(
  ) {
    this.addTagWithProperties("segment_title");
    return this;
  }

  public finish() {
    const originalFormatted = this.xmlDocument.end({
      headless: true,
      prettyPrint: false

    });
    const definitiveDocument = originalFormatted.substring(
      2,
      originalFormatted.length - 3
    );
    return definitiveDocument;
  }

  protected addText(text: string) {
    this.xmlDocument.txt(text);
    return this;
  }

  private addTagWithProperties(
    tag: string,
    properties: { key: string; value: string }[] = []
  ) {
    const element = this.xmlDocument.ele(tag);
    properties.forEach((prop) => element.att(prop.key, prop.value));
  }
}
