import axios from "axios";
import {config} from "../config/config";

const callApi = async (videoUrl) => {

  const options = {
    method: 'GET',
    url: config.apiUrl,
    params: {
      url: videoUrl
    },
    headers: {
      'X-RapidAPI-Key': config.X_RapidAPI_Key,
      'X-RapidAPI-Host': config.X_RapidAPI_Host
    }
  };
  
  try {
    const response = await axios.request(options);
    if(response.data.status===0){
      return response.data;
    }else if(response.data.status===404){
      return 404;
    }else{
      return null;
    }
    
  } catch (error) {
    //console.error(error);
    return error;
  }
};
export default callApi;
