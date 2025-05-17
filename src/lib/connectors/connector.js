import { toast } from "vue3-toastify";
import { useI18n } from "vue-i18n";
import { warn } from "vue";

class Connector {
  name;
  language;
  constructor(options) {
    this.options = options;
    this.params = this.options;
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
  searchTaxon(searchString = "", params = {}) {}
  getTaxonDetailPage(taxonId) {
    throw new Error("Not implemented");
  }
  fetchVernacularName(taxonID) {
    throw new Error("Not implemented");
  }
}

export { Connector };
