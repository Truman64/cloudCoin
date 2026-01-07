import axios from "axios";
import { ENDPOINTS } from "./endpoints";

function createClient(baseURL) {
  return axios.create({
    baseURL,
    timeout: 8000
  });
}

export const clients = {
  aws: createClient(ENDPOINTS.aws),
  gcloud: createClient(ENDPOINTS.gcloud),
  rpi: createClient(ENDPOINTS.rpi)
};
