/*
 * Copyright (c) 2021 Gobierno de España
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

/* global URL_PATH*/
import {generateDataURL} from './generateQrCode';
import {PDFDocument} from 'pdf-lib';
import pdfTemplate from '../../pdf/template.pdf';

const generatePDF = async (publicMessage, privateMessage, data) => {
	const existingPdfBytes = await fetch(pdfTemplate).then(res => res.arrayBuffer());
	const pdfDoc = await PDFDocument.load(existingPdfBytes);

	pdfDoc.setTitle(data.title, { showInWindowTitleBar: true });
	const pages = pdfDoc.getPages();
	const firstPage = pages[0];
	const {width, height} = firstPage.getSize();

	const asyncPublicPng = generateDataURL(`${URL_PATH}/qr?v=2#${publicMessage}`, {
		width: 258,
		color: {dark: '#000000'},
	}).then(async (url) => {
		return pdfDoc.embedPng(url);
	});
	const publicPng = await asyncPublicPng;
	firstPage.drawImage(publicPng, {
		x: (width / 2 - publicPng.width / 2),
		y: (height / 2 - publicPng.height) + 60,
		width: publicPng.width,
		height: publicPng.height,
	});

	return pdfDoc.save();
};

export default generatePDF;
