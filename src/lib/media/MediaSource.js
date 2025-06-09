import { SOURCE_ } from "./media";

export class MediaSource {
  name;
  constructor(name, id) {
    this.name = name;
    if (!Object.values(SOURCE_).includes(id)) {
      throw new Error(
        "Source identifier is not declared in `mediaIdentifier.js`"
      );
    }
    this.id = id;
  }

  fetchPicture(taxonID, connector) {
    if (!this.isCompatible(connector)) {
      throw new Error("This media source is not available !");
    }
    throw new Error("Not implemented");
  }
  isCompatible(connector) {
    throw new Error("Not Implemented");
  }
}
