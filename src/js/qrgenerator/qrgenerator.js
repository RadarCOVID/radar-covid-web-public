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

let qrProtoBufAndDate = undefined;
export function setQrProtoBufAndDate(value) {
	qrProtoBufAndDate = value;
}

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
	setQrProtoBufAndDate({qrEntry, qrTrace, data});
	await generateQRPrivate();
};

async function generateQRPrivate() {
	if (!qrProtoBufAndDate) return;

	//URL Download SVG
	const asyncPrivatePng = await generateDataURL(`${URL_PATH}/qr?v=2#${qrProtoBufAndDate.qrTrace}`, {
		width: 168,
		color: {dark: '#6A226D'},
	});
	const svgButton = document.getElementById('download-qr-btn');
	if (svgButton) {
		const svgBase64 = asyncPrivatePng.toString().split('base64,')[1];
		const svgBlob = createBlobToBase64(svgBase64, 'image/png');
		setDownloadFileToLink(svgButton, svgBlob, qrProtoBufAndDate.data.title.toString().concat('.png'));
	}

	// View image in html
	const privateImg = await generateSvg(`${URL_PATH}/qr?v=2#${qrProtoBufAndDate.qrTrace}`, {
		width: 168,
		color: {dark: '#6A226D'},
	});
	const privateQRCard = document.querySelector('#private-qr-card .qr-code');
	if (privateQRCard) privateQRCard.innerHTML = privateImg;
}

export async function generateQRPublic() {
	if (!qrProtoBufAndDate) return;

	// URL Download PDF
	const pdfButton = document.getElementById('download-pdf-btn');
	const pdfBytes = await generatePDF(qrProtoBufAndDate.qrEntry, qrProtoBufAndDate.qrTrace, qrProtoBufAndDate.data);
	const blob = new Blob([pdfBytes], {type: 'application/pdf', title: qrProtoBufAndDate.data.title});
	if (pdfButton) {
		setDownloadFileToLink(pdfButton, blob, qrProtoBufAndDate.data.title.toString().concat('.pdf'));
	}

	// View image in html
	const publicImg = await generateSvg(`${URL_PATH}/qr?v=2#${qrProtoBufAndDate.qrEntry}`, {
		width: 168,
		color: {dark: '#a066a2'},
	});
	const publicQRCard = document.querySelector('#public-qr-card .qr-code');
	if (publicQRCard) publicQRCard.innerHTML = publicImg;
}

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
		element.setAttribute('target', '_blank');
		element.setAttribute('href', window.URL.createObjectURL(blob));
		element.setAttribute('download', name);
	}
}

export function downloadFile(e) {
	if (navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident|CriOS(?=\/))\/?\s*(\d+)/i)[1] !== 'Safari') {
		showNotification('WEB_PUBLIC_NOTIFICATION_NO_DOWNLOAD_ALLOWED', 6000);
		return;
	}
	if (e && e.target && e.target.saveFileParam) {
		saveAs(e.target.saveFileParam.blob, e.target.saveFileParam.name);
	}
}
