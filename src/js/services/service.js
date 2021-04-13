/*
 * Copyright (c) 2021 Gobierno de España
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import axios from 'axios';

const HTTP = axios.create({
	// eslint-disable-next-line no-undef
	baseURL: URL_PATH,
	headers: {
		'Content-Type': 'application/json'
	}
});

export function postCaseCodeVerify(data) {
	let url = '/notifyme/v1/casecode/verify';
	return HTTP.post(url, data);
}

export function postTraceKeys(data, token) {
	let header = {Authorization: 'Bearer ' + token};
	let url = '/notifyme/v1/traceKeys';
	return HTTP.post(url, data, {headers: header});
}

export function getLocaleTexts () {
	let url = 'configuration/masterData/locales?locale=es-ES&platform=Web&version=1.0.0';
	return HTTP.get(url);
}

export function getTexts (locale) {
	let url = `configuration/texts?locale=${locale}&platform=Web&version=1.0.0&application=PublicQR`;
	return HTTP.get(url);
}
