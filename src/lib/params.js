import { reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { getConnector } from "@/lib/connectors/utils";
import { parse, stringify } from "wellknown";
import { buffer } from "@turf/turf";

function fetchParams(params_ = {}) {
  const params = reactive({
    radius: 1,
    wktSelected: "",
    dateMin: null,
    dateMax: null,
    connector: getConnector(null, {}),
  });

  const params_from_url = useRoute().query;
  if ("radius" in params_from_url) {
    params.radius = parseInt(params_from_url.radius);
  }
  if ("wkt" in params_from_url) {
    params.wktSelected = params_from_url.wkt;
    if (
      params.wktSelected &&
      (params.wktSelected.includes("POINT") ||
        params.wktSelected.includes("LINESTRING"))
    ) {
      const buffered = buffer(parse(params.wktSelected), params.radius);
      params.wktSelected = stringify(buffered);
    }
  }
  if ("dateMin" in params_from_url) {
    params.dateMin = params_from_url.dateMin;
  }
  if ("dateMax" in params_from_url) {
    params.dateMax = params_from_url.dateMax;
  }
  if ("connector" in params_from_url) {
    params.connector = getConnector(params_from_url.connector, {
      ...params_from_url,
      params_,
    });
  }
  return params;
}

export { fetchParams };
