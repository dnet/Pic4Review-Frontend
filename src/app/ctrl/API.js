import CONST from '../constants';
import Feature from '../model/Feature';
import Mission from '../model/Mission';
import request from 'browser-request';

/**
 * API controller handles communication with the Pic4Review API.
 */
class API {
	/**
	 * Get mission details
	 * @param {int} mid The mission ID
	 * @return {Promise} A promise resolving on mission with its full details
	 */
	static GetMissionDetails(mid) {
		return new Promise((resolve, reject) => {
			request(CONST.P4R_URL + '/missions/' + mid, (err, res, body) => {
				if(err) {
					reject(err);
				}
				else {
					try {
						const data = JSON.parse(body);
						resolve(Mission.CreateFromAPI(data.mission));
					}
					catch(e) {
						reject(e);
					}
				}
			});
		});
	}
}

export default API;
