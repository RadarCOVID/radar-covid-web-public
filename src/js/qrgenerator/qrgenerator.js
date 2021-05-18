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
import { saveAs } from 'file-saver';
import {showNotification} from '../index';

export const generateKeys = async () => {
	const inputName = (window.innerWidth >=768) ? document.getElementsByName('input-name-establishment')[0] : document.getElementsByName('input-name-establishment')[1];
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

	//URL Download SVG
	const asyncPrivatePng = await generateDataURL(`${URL_PATH}/qr?v=2#${qrTrace}`, {
		width: 168,
		color: {dark: '#6A226D'},
	});
	const svgButton = document.getElementById('download-qr-btn');
	if (svgButton) {
		const svgBase64 = asyncPrivatePng.toString().split('base64,')[1];
		const svgBlob = createBlobToBase64(svgBase64, 'image/png');
		setDownloadFileToLink(svgButton, svgBlob, data.title.toString().concat('.png'));
	}
	// URL Download PDF
	const pdfButton = document.getElementById('download-pdf-btn');
	const pdfBytes = await generatePDF(qrEntry, qrTrace, data);
	const blob = new Blob([pdfBytes], {type: 'application/pdf', title: data.title});
	if (pdfButton) {
		setDownloadFileToLink(pdfButton, blob, data.title.toString().concat('.pdf'));
	}
	// View image in html
	const privateImg = await generateSvg(`${URL_PATH}/qr?v=2#${qrTrace}`, {
		width: 168,
		color: {dark: '#6A226D'},
	});
	const privateQRCard = document.querySelector('#private-qr-card .qr-code');
	if (privateQRCard) privateQRCard.innerHTML = privateImg;
	const publicImg = await generateSvg(`${URL_PATH}/qr?v=2#${qrEntry}`, {
		width: 168,
		color: {dark: '#a066a2'},
	});
	const publicQRCard = document.querySelector('#public-qr-card .qr-code');
	if (publicQRCard) publicQRCard.innerHTML = publicImg;
};

function createBlobToBase64(base64, type) {
	const byteCharacters = atob(base64);
	const byteNumbers = new Array(byteCharacters.length);
	for (let i = 0; i < byteCharacters.length; i++) {
		byteNumbers[i] = byteCharacters.charCodeAt(i);
	}
	const byteArray = new Uint8Array(byteNumbers);
	return new Blob([byteArray], {type: type});
}

function setDownloadFileToLink(element, blob, name) {
	if (element) {
		if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPad/i))) {
			element.saveFileParam = {
				blob: blob,
				name: name
			};
			element.addEventListener('click', downloadFile, false);
			return;
		}
		element.setAttribute('href', window.URL.createObjectURL(blob));
		element.setAttribute('download', name);
	}
}

export function downloadFile(e) {
	const publicQrCard = document.getElementById('public-qr-card');
	if (publicQrCard && publicQrCard.className.includes('card-disable')) return;
	if (navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident|CriOS(?=\/))\/?\s*(\d+)/i)[1] !== 'Safari') {
		showNotification('WEB_PUBLIC_NOTIFICATION_NO_DOWNLOAD_ALLOWED', 6000);
		return;
	}
	if (e && e.target && e.target.saveFileParam) {
		saveAs(e.target.saveFileParam.blob, e.target.saveFileParam.name);
	}
}
