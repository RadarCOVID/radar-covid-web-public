/*
 * Copyright (c) 2021 Gobierno de España
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

/* global KEYPAIR, URL_PATH*/
import generateProtoBufs from './generateProtoBufs';
import {generateDataURL, generateSvg} from './generateQrCode';
import generatePDF from './generatePdf';

export const generateKeys = async () => {
	const inputName = document.getElementById('input-name-establishment');
	if (!inputName || !inputName.value || inputName.value.trim() === '') return;

	const data = {
		title: inputName.value,
		subtitle: '',
		addition: '',
		category: '',
		validDate: new Date().toJSON()
	};
	data.validFrom = new Date(
		Date.parse(data.validDate.trim().replace(' ', 'T'))
	);
	data.validFrom.setHours(0, 0, 0, 0);
	data.validTo = new Date(data.validFrom.getTime());
	data.validTo.setFullYear(data.validTo.getFullYear() + 1);

	// Generate ProtoBufs
	const {qrTrace, qrEntry} = await generateProtoBufs(
		data.title,
		data.subtitle,
		data.addition,
		data.category,
		KEYPAIR.publicKey,
		data.validFrom,
		data.validTo
	);

	// URL Download PDF
	const pdfButton = document.getElementById('download-pdf-btn');
	const pdfBytes = await generatePDF(qrEntry, qrTrace, data);
	const blob = new Blob([pdfBytes], {type: 'application/pdf'});
	if (pdfButton) {
		pdfButton.setAttribute('download', data.title);
		pdfButton.setAttribute('href', window.URL.createObjectURL(blob));
	}

	//URL Download SVG
	const asyncPrivatePng = await generateDataURL(`${URL_PATH}/qr?v=2#${qrTrace}`, {
		width: 168,
		color: {dark: '#6A226D'},
	});
	const svgButton = document.getElementById('download-qr-btn');
	if (svgButton) {
		svgButton.setAttribute('download', data.title);
		svgButton.setAttribute('href', asyncPrivatePng);
	}

	// View image in html
	const publicImg = await generateSvg(`${URL_PATH}/qr?v=2#${qrEntry}`, {
		width: 168,
		color: {dark: '#a066a2'},
	});
	const privateImg = await generateSvg(`${URL_PATH}/qr?v=2#${qrTrace}`, {
		width: 168,
		color: {dark: '#6A226D'},
	});
	const publicQRCard = document.querySelector('#public-qr-card .qr-code');
	if (publicQRCard) publicQRCard.innerHTML = publicImg;
	const privateQRCard = document.querySelector('#private-qr-card .qr-code');
	if (privateQRCard) privateQRCard.innerHTML = privateImg;
};
