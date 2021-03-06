import 'd2l-fetch/d2l-fetch.js';
import SirenParse from 'siren-parser';

/*
* General utility functions that can be used in many places.
*/

// Creates a URL with a query from an Action and an object of required parameters
export function createActionUrl(action, parameters) {
	if (!action) {
		return;
	}
	parameters = parameters || {};
	action.fields = action.fields || [];
	const query = {};
	let val;

	action.fields.forEach((field) => {
		if (parameters.hasOwnProperty(field.name)) {
			val = parameters[field.name];
		} else {
			val = field.value;
		}

		if (val && typeof val === 'object' && val.constructor === Array) {
			let collapsedVal = '';
			for (let i = 0; i < val.length; i++) {
				if (i === 0) {
					collapsedVal += val[i];
				} else {
					collapsedVal += `${field.name}=${val[i]}`;
				}
				if (i < val.length - 1) { collapsedVal += '&'; }
			}
			query[field.name] = collapsedVal;
		} else {
			query[field.name] = val;
		}
	});

	const queryString = Object.keys(query).map((key) => {
		return `${key}=${query[key]}`;
	}).join('&');

	if (!queryString) {
		return action.href;
	}

	if (action.href.indexOf('?') > -1) {
		// href already has some query params, append ours
		return `${action.href}&${queryString}`;
	}

	return `${action.href}?${queryString}`;
}

// Creates a unique identifier for a Siren Entity (really just the self Link href)
export function getEntityIdentifier(entity) {
	// An entity's self href should be unique, so use it as an identifier
	const selfLink = entity.getLinkByRel('self');
	return selfLink.href;
}

export function getOrgUnitIdFromHref(organizationHref) {
	const match = /[0-9]+$/.exec(organizationHref);

	if (!match) {
		return;
	}
	return match[0];
}

export function parseEntity(entity) {
	return SirenParse(entity);
}

/* Ideally we would be using performSirenAction from siren-sdk/src/es6/SirenAction.js instead of this.
 * However, the LMS is encoding the "via" field of the "set-role-filters" action, which cause it to be
 * double-encoded and not understood by the LMS. The LMS needs to be updated, which will affect legacy as well.
 */
export function fetchSirenEntity(url, clearCache) {
	if (!url) {
		return;
	}

	const headers = {
		Accept: 'application/vnd.siren+json'
	};

	if (clearCache) {
		headers['cache-control'] = 'no-cache';
	}

	return window.d2lfetch
		.fetch(new Request(url, {
			headers: headers
		}))
		.then(_responseToSirenEntity);
}

export function performanceMark(name) {
	if (window.performance && window.performance.mark) {
		window.performance.mark(name);
	}
}

export function performanceMeasure(name, startMark, endMark, fireEvent) {
	if (window.performance && window.performance.measure) {
		window.performance.measure(name, startMark, endMark);
		const measure = window.performance.getEntriesByName(name, 'measure');
		if (measure.length === 1 && fireEvent) {
			document.dispatchEvent(new CustomEvent('d2l-performance-measure', {
				bubbles: true,
				detail: {
					name: name,
					value: measure[0]
				}
			}));
		}
	}
}

// This is only used by fetchSirenEntity above and can be removed once that function is removed
function _responseToSirenEntity(response) {
	if (response.ok) {
		return response
			.json()
			.then((json) => {
				return SirenParse(json);
			});
	}
	return Promise.reject(`${response.status} ${response.statusText}`);
}
