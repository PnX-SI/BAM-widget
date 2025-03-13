import { toast } from "vue3-toastify";

class Connector {
  name;
  constructor(options) {
    this.options = options;
  }
  verifyOptions(params_names = []) {
    params_names.forEach((name) => {
      if (!this.options.hasOwnProperty(name)) {
        toast.error(`Please indicate the ${name} parameter`);
      }
    });
  }
  fetchOccurrence(params) {
    throw new Error("Not implemented");
  }
  fetchMedia(idTaxon) {
    throw new Error("Not implemented");
  }
  fetchTaxonInfo(idTaxon) {
    throw new Error("Not implemented");
  }
  fetchTaxonStatus(idTaxon) {
    throw new Error("Not implemented");
  }
}

export { Connector };
