/*
 * Copyright (c) 2021 Gobierno de España
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import QRCode from 'qrcode';

const defaultOptions = {
	errorCorrectionLevel: 'L',
	quality: 1,
	margin: 2,
};

const defaultSvgOptions = Object.assign({}, defaultOptions, {type: 'svg'});

export const generateDataURL = async (data, options) => {
	const mergedOptions = Object.assign({}, defaultOptions, options);
	return QRCode.toDataURL(data, mergedOptions);
};

export const generateSvg = async (data, options) => {
	const mergedOptions = Object.assign({}, defaultSvgOptions, options);
	return QRCode.toString(data, mergedOptions);
};
