export class MediaSource {
  name;
  constructor(name) {
    this.name = name;
  }

  fetchMedia(taxonID, connector) {
    throw new Error("Not implemented");
  }
  isCompatible(connector) {
    throw new Error("Not Implemented");
  }
}
