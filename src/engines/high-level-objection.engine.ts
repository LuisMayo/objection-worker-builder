import { spawn } from "node:child_process";
import { characters } from "../characters";
import { Character } from "../types/character-type";
import { EngineJob, User } from "../types/job";
import { randomElementAndIdxFromArr, randomElementFromArr } from "../utils";
import { OGXMLEngine } from "./objection-godot-xml-engine";
import fs from "node:fs/promises";

export class ObjectionEngine extends OGXMLEngine {
  readonly maxSentenceLength = 80;
  // currentGame = 'pwr';

  constructor() {
    super();
    this.startMusic("res://audio/music/pwr/trial.mp3");
  }

  buildJob(job: EngineJob) {
    const users = new Map<
      string,
      { displayName: string; character: Character }
    >();
    let phoenixPicked = false;
    let edgeworthPicked = false;
    let availableForPickup = characters.filter(
      (characters) => !["phoenix", "edgeworth"].includes(characters.name)
    );

    for (const comment of job.comments) {
      // Setting the user info
      const userId =
        comment.user.id ??
        comment.user.displayName ??
        comment.user?.preferedCharacter ??
        Math.random().toString();

      if (!users.has(userId)) {
        const desiredCharacter = comment.user.preferedCharacter
          ? characters.find(
              (character) => character.name === comment.user.preferedCharacter
            )
          : null;
        let finalCharacter: Character;
        if (desiredCharacter) {
          finalCharacter = desiredCharacter;
        } else {
          if (!phoenixPicked) {
            finalCharacter = characters.find(
              (character) => character.name === "phoenix"
            )!;
            phoenixPicked = true;
          } else if (!edgeworthPicked) {
            finalCharacter = characters.find(
              (character) => character.name === "edgeworth"
            )!;
            edgeworthPicked = true;
          } else {
            const { element, idx } =
              randomElementAndIdxFromArr(availableForPickup);
            finalCharacter = element;
            availableForPickup.splice(idx, 1);
            if (availableForPickup.length === 0) {
              availableForPickup = characters.slice();
            }
          }
        }
        users.set(userId, {
          displayName: comment.user.displayName ?? finalCharacter.name,
          character: finalCharacter,
        });
      }

      const user = users.get(userId)!;

      if (Math.random() < 0.15) {
        this.showObjection(user.character);
      }

      const evidenceSide =
        (user.character.position ?? "left") === "left" ? "right" : "left";
      if (comment.evidence) {
        this.evidence(comment.evidence, evidenceSide);
      }
      this.makeCharacterTalk(
        user.character,
        user.displayName,
        comment.text ?? ""
      );
      if (comment.evidence) {
        this.hideEvidence(false, evidenceSide);
      }
    }
  }

  async doRender(job: EngineJob) {
    const xml = this.finish();
    const scriptLocation = job.tmpDir.concat("/script.xml");
    await fs.writeFile(scriptLocation, xml, {
      encoding: "utf-8",
    });
    return new Promise<string>((resolve, reject) => {
      const movieDir = job.tmpDir.concat("/movie.avi");
      spawn("xvfb-run", [
        "-an",
        "90",
        "-s",
        '-screen 0 256x192x24',
        "./godot-objection/objection-godot-stable.x86_64",
        "--write-movie",
        movieDir,
        "--fixed-fps",
        "30",
        `-- --render-script="${scriptLocation}"`,
      ], {stdio: 'inherit'})
      .on("exit", (code) => {
        if (code === 0) {
          resolve(movieDir);
        } else {
          reject();
        }
      });
    });
  }

  private showObjection(character: Character) {
    this.stopMusic()
      .bubble("objection")
      .removeBox()
      .removeArrow()
      .removeSegmentTitle()
      .playSound(
        character.objection ??
          "res://ui/exclamations/exclamation_sounds/objection-generic.wav"
      )
      .addWait(1)
      .addPlayTag()
      .startMusic("res://audio/music/pwr/press.mp3");
  }

  private makeCharacterTalk(
    character: Character,
    userName: string,
    text: string
  ) {
    const location = character.position ?? "center";
    const texts: string[] = [];
    let remainingText = text;
    while (remainingText.length > this.maxSentenceLength) {
      texts.push(remainingText.slice(0, this.maxSentenceLength));
      remainingText = remainingText.slice(this.maxSentenceLength);
    }
    texts.push(remainingText);

    this.addBox()
      .camera(Math.random() < 0.3 ? "pan" : "cut", location)
      .addNameTag(userName)
      .setBlip(character.gender)
      .sprite(
        location,
        `res://characters/${character.name}/${character.name}.tres`,
        randomElementFromArr(character.animations)
      );
    for (const definitiveText of texts) {
      this.addText(definitiveText)
        .addArrow()
        .addWait(3)
        .removeArrow()
        .addPlayTag();
    }
    this.removeArrow().removeBox().addPlayTag();
  }
}
