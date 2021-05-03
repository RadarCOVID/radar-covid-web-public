/*
 * Copyright (c) 2021 Gobierno de España
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import i18next from 'i18next';
import esLocale from './locale/es';
import {getLocaleTexts, getTexts} from '../services/service';

let arrayLocaleBack;
let messagesBack = {};
let localeParam = 'es-ES';
let locationParam = '';

getLocaleTexts().then(resp => {
	if (resp && resp.data) {
		arrayLocaleBack = resp.data;
	}
}).finally(() => {
	if (!arrayLocaleBack || arrayLocaleBack.length === 0) {
		configDefaultI18next();
		return;
	}
	if (location && location.pathname !== '' && location.pathname.split('/')[1] !== '') {
		locationParam = location.pathname.split('/')[1];
	}
	const locale = (arrayLocaleBack.find(l => l.id.toLowerCase().split('-')[0] === locationParam.toLowerCase())) ? arrayLocaleBack.find(l => l.id.toLowerCase().split('-')[0] === locationParam.toLowerCase()) : arrayLocaleBack.find(l => l.id.toLowerCase() === localeParam.toLowerCase());
	if (!locale) {
		configDefaultI18next();
		return;
	}
	const id = locale.id;
	getTexts(id).then(resp => {
		if (resp && resp.data) {
			messagesBack[id.split('-')[0]] = {translation: resp.data};
		}
	}).finally(() => {
		if (Object.keys(messagesBack).length > 0) {
			localeParam = id.split('-')[0];
			initI18next(messagesBack);
		} else {
			configDefaultI18next();
		}
	});
});

function configDefaultI18next() {
	localeParam = 'es';
	initI18next({'es': {translation: esLocale}});
}

function initI18next(resources) {
	i18next.init({
		lng: localeParam,
		debug: true,
		resources: resources
	}).then(function () {
		for (let key in esLocale) {
			const arrayInnerHTML = ['WEB_PUBLIC_MSG_GROUP_INFORMATION_1', 'WEB_PUBLIC_MSG_GROUP_INFORMATION_2', 'WEB_PUBLIC_MSG_GROUP_INFORMATION_4',
				'WEB_PUBLIC_MSG_INFORMATION_BOX_2', 'WEB_PUBLIC_MSG_INFORMATION_REMEMBER_1_1', 'WEB_PUBLIC_MSG_INFORMATION_REMEMBER_2_1'];
			const arrayPlaceholder = ['WEB_PUBLIC_INPUT_NAME_ESTABLISHMENT', 'WEB_PUBLIC_TEXTAREA_NAME_ESTABLISHMENT', 'WEB_PUBLIC_INPUT_FILE_QR'];
			let inner = 'innerText';
			if (arrayInnerHTML.find(e => e === key)) {
				inner = 'innerHTML';
			} else if (arrayPlaceholder.find(e => e === key)) {
				inner = 'placeholder';
			}
			setText(key, inner);
		}
	});
}

export function setText(key, inner) {
	const element = document.querySelector(`[data-i18n="${key}"]`);
	if (element) {
		element[inner] = i18next.t(key);
	}
}
