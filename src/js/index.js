/*
 * Copyright (c) 2021 Gobierno de España
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import '../css/index.css';
import './i18n/addTexts';
import {generateKeys} from './qrgenerator/qrgenerator';
import qrcodeParser from 'qrcode-parser';
import {sendData} from './qrupload/qrupload';
import qrPublicDummy from '../images/QR_Public.svg';
import qrPrivateDummy from '../images/QR_Private.svg';

let fileData;
const inputNoneFileQR = document.getElementById('input-none-file-qr');
const stepButtons = document.getElementsByClassName('step-button');
const divInputCode = document.getElementsByClassName('div-input-code');
const deleteFileName = document.getElementById('delete-file-name');

function initApp() {
	window.scrollTo(0, 0);

	setStyle('class', 'page-information', 'display', 'flex', 0);
	setStyle('class', 'page-qr', 'display', 'none', 0);
	setStyle('id', 'msg-information-box-1-step-2', 'display', 'none');
	setStyle('id', 'msg-information-box-2-step-2', 'display', 'none');
	setStyle('id', 'msg-information-box-3-step-2', 'display', 'none');

	addEventClickToButtons();
	setSettingsAccordingToSize();
}

export function resetApp() {
	const inputs = document.querySelectorAll('input');
	if (inputs && inputs.length > 0) {
		for (let input of inputs) {
			input.value = '';
		}
	}

	const publicQRCard = document.querySelector('#public-qr-card .qr-code');
	if (publicQRCard) publicQRCard.innerHTML = `<img src="${qrPublicDummy}" alt="QR_Public">`;
	const privateQRCard = document.querySelector('#private-qr-card .qr-code');
	if (privateQRCard) privateQRCard.innerHTML = `<img src="${qrPrivateDummy}" alt="QR_Private">`;
	const pdfButton = document.getElementById('download-pdf-btn');
	if (pdfButton) pdfButton.removeAttribute('href');
	const svgButton = document.getElementById('download-qr-btn');
	if (svgButton) {
		svgButton.removeAttribute('download');
		svgButton.removeAttribute('href');
	}

	setStyle('id', 'error-input-name-establishment', 'display', 'none');
	setStyle('id', 'error-input-verification-code', 'display', 'none');
	setStyle('id', 'error-input-file-qr', 'display', 'none');

	deleteFiles();
}

function addEventClickToButtons() {
	const establishmentButton = document.getElementById('establishment-button');
	if (establishmentButton) establishmentButton.addEventListener('click', setIAmAnEstablishmentOrEvent);
	const deleteFileButton = document.getElementById('delete-file-button');
	if (deleteFileButton) deleteFileButton.addEventListener('click', deleteFiles);
	const optionInformationBox = document.getElementById('open-information-box');
	if (optionInformationBox) optionInformationBox.addEventListener('click', openInformationBox);
	const generateQRBtn = document.getElementById('generate-qr-btn');
	if (generateQRBtn) generateQRBtn.addEventListener('click', setGenerateCodeQR);
	const senQRBtn = document.getElementById('send-qr-btn');
	if (senQRBtn) senQRBtn.addEventListener('click', sendQRPrivate);
	const inputNameEstablishment = document.getElementById('input-name-establishment');
	if (inputNameEstablishment) inputNameEstablishment.addEventListener('keypress', function (e) {
		if (e.key === 'Enter') {
			setGenerateCodeQR();
		}
	});
	const inputFileQR = document.getElementById('input-file-qr');
	if (inputFileQR) inputFileQR.addEventListener('click', function () {
		if (inputNoneFileQR) inputNoneFileQR.click();
	});
	const stepSelect = document.getElementById('step-select');
	if(stepSelect) stepSelect.addEventListener('change', function (value) {
		changeStepSelect(value.target.selectedOptions[0].id);
	});

	if (stepButtons && stepButtons.length > 0) {
		for (let button of stepButtons) {
			button.addEventListener('click', function () {
				changeStepButton(button.firstElementChild.id);
			});
		}
	}
	if (divInputCode[0] && divInputCode[0].childElementCount > 0) {
		for (let input of divInputCode[0].children) {
			if (input.nodeName === 'INPUT') {
				input.addEventListener('keydown', function (e) {
					validateADigitAlphanumericInputCode(e, input);
				});
			}
		}
	}

	const notificationClose = document.getElementById('notification-close');
	if(notificationClose) notificationClose.addEventListener('click', function () {
		setStyle('id', 'notification', 'display', 'none');
	});
}

function setSettingsAccordingToSize() {
	const body = document.querySelector('html');
	const loading = document.getElementById('loading');
	setTimeout(() => {
		loading.style.width = (body && loading) ? body.offsetWidth + 'px' : 'auto';
		loading.style.height = (body && loading) ? body.offsetHeight + 'px' : 'auto';
	}, 50);
	if (window.innerWidth > 1024) {
		openInformationBox();
	}
}

function setIAmAnEstablishmentOrEvent() {
	window.scrollTo(0, 0);
	setStyle('class', 'page-information', 'display', 'none', 0);
	setStyle('class', 'page-qr', 'display', 'flex', 0);
	setStyle('class', 'msg-information-box', 'marginBottom', '0px', 1);
	setStyle('id', 'step-button-send-content', 'display', 'none');
	setStyle('id', 'msg-information-box-3-send', 'display', 'none');
	if (inputNoneFileQR) inputNoneFileQR.addEventListener('change', handleFiles, false);
	setSettingsAccordingToSize();
}

function openInformationBox() {
	const contentInformationBox = document.getElementById('content-information-box');
	const dropdown = document.getElementById('dropdown');
	if (contentInformationBox) {
		if (window.innerWidth < 1025 && (!contentInformationBox.style.display || contentInformationBox.style.display === 'block')) {
			setStyle('id', 'content-information-box', 'display', 'none');
			if (dropdown) dropdown.classList.add('icon-drop-rotate');
		} else {
			setStyle('id', 'content-information-box', 'display', 'block');
			if (dropdown) dropdown.classList.remove('icon-drop-rotate');
		}
	}
}

function changeStepButton(id) {
	if (stepButtons && stepButtons.length > 0) {
		for (let step of stepButtons) {
			if (step.className.includes('active-step')) {
				step.classList.remove('active-step');
			}
			if (step.children && step.children.length > 0) {
				if (step.children[0].id === id) {
					if (!step.className.includes('active-step')) {
						step.classList.add('active-step');
					}
				}
				setStyle('id', step.children[0].id + '-content', 'display', (step.children[0].id === id) ? 'flex' : 'none');
			}
		}
	}
	resetApp();
	changeTextStep(id);
	setSettingsAccordingToSize();
}

function changeStepSelect(id) {
	setStyle('id', 'step-button-generate-content', 'display', (id.toString().includes('generate')) ? 'flex' : 'none');
	setStyle('id', 'step-button-send-content', 'display', (id.toString().includes('send')) ? 'flex' : 'none');
	resetApp();
	changeTextStep(id);
	setSettingsAccordingToSize();
}

function changeTextStep(id) {
	setStyle('class', 'msg-information-box', 'marginBottom', (id === 'step-button-generate' || id === 'step-select-generate') ? '0px' : '32px', 1);
	setStyle('id', 'msg-information-box-1', 'display', (id === 'step-button-generate' || id === 'step-select-generate') ? 'block' : 'none');
	setStyle('id', 'msg-information-box-1-step-2', 'display', (id === 'step-button-generate' || id === 'step-select-generate') ? 'none' : 'block');
	setStyle('id', 'msg-information-box-2', 'display', (id === 'step-button-generate' || id === 'step-select-generate') ? 'block' : 'none');
	setStyle('id', 'msg-information-box-2-step-2', 'display', (id === 'step-button-generate' || id === 'step-select-generate') ? 'none' : 'block');
	setStyle('id', 'msg-information-box-3-step-2', 'display', (id === 'step-button-generate' || id === 'step-select-generate') ? 'none' : 'flex');
	setStyle('id', 'image-page-qr2-desktop', 'marginTop', (id === 'step-button-generate' || id === 'step-select-generate') ? '0px' : '171px');
}

function validateNameEstablishment() {
	const inputName = document.getElementById('input-name-establishment');
	const regExpStartWithSpace = /(^\s)/;
	const regExpSpecialCharacterFollowedBySymbol = /(\W[äÄëËïÏöÖüÜáéíóúÁÉÍÓÚÂÊÎÔÛâêîôûàèìòùÀÈÌÒÙñÑ])|([äÄëËïÏöÖüÜáéíóúÁÉÍÓÚÂÊÎÔÛâêîôûàèìòùÀÈÌÒÙñÑ]\W)/;
	const regExpDoubleFollowedSymbol = /(\W\W)/;
	if (!inputName || !inputName.value || inputName.value.toString().trim() === '' || regExpStartWithSpace.test(inputName.value)) return true;
	for (let intI = 0; intI < inputName.value.toString().length; intI++) {
		let validateText = inputName.value.toString().substr(intI, 2).trim();
		if (validateText.length > 1 && regExpDoubleFollowedSymbol.test(validateText) && !regExpSpecialCharacterFollowedBySymbol.test(validateText)) return true;
	}
	return false;
}

function validateADigitAlphanumericInputCode(e, input) {
	const regExp = /^[A-Za-z0-9]$/;
	const arrayValidKeyNoAlphanumeric = ['Tab', 'ArrowRight', 'ArrowLeft', 'Delete', 'Backspace'];
	if (!regExp.test(e.key) && !arrayValidKeyNoAlphanumeric.find(valid => valid === e.key)) {
		e.preventDefault();
		return;
	}
	if (regExp.test(e.key)) {
		if (input.nextElementSibling && input.nextElementSibling.nextElementSibling) {
			setTimeout(() => {
				input.nextElementSibling.nextElementSibling.select();
			}, 50);
		}
	}
	if (e.key === 'Delete' || e.key === 'Backspace') {
		if (input.previousElementSibling && input.previousElementSibling.previousElementSibling) {
			setTimeout(() => {
				input.previousElementSibling.previousElementSibling.select();
			}, 50);
		}
	}
}

function validateCodeVerification() {
	let code = '';
	if (divInputCode[0] && divInputCode[0].childElementCount > 0 && divInputCode[0].childElementCount / 2 === 12) {
		for (let input of divInputCode[0].children) {
			if (input.nodeName === 'INPUT') {
				if (!input.value || input.value.toString().trim() === '' || parseInt(input.value) > 10) {
					return false;
				}
				code += input.value;
			}
		}
	}
	return code;
}

function setGenerateCodeQR() {
	if (validateNameEstablishment()) {
		setStyle('id', 'error-input-name-establishment', 'display', 'block');
		return;
	}
	setStyle('id', 'error-input-name-establishment', 'display', 'none');
	setStyle('id', 'loading', 'display', 'block');
	generateKeys().finally(() => {
		setStyle('id', 'loading', 'display', 'none');
		showNotification('WEB_PUBLIC_NOTIFICATION_GENERATE_QR');
	});
}

function handleFiles(e) {
	const file = e.target.files[0];
	if (deleteFileName) deleteFileName.innerText = file.name;
	setStyle('id', 'delete-file', 'display', 'flex');
	if (file.type === 'image/png') {
		const reader = new FileReader();
		reader.onloadend = () => {
			setStyle('id', 'loading', 'display', 'block');
			qrcodeParser(reader.result).then(res => {
				fileData = res.data;
				setStyle('id', 'error-input-file-qr', 'display', 'none');
				setStyle('id', 'loading', 'display', 'none');
			}).catch(() => {
				deleteFiles();
				setStyle('id', 'error-input-file-qr', 'display', 'block');
				setStyle('id', 'loading', 'display', 'none');
			});
		};
		reader.readAsDataURL(file);
	} else {
		setStyle('id', 'error-input-file-qr', 'display', 'block');
		fileData = undefined;
	}
}

export function setStyle(key, name, option, value, index) {
	let element;
	if (key === 'id') {
		element = document.getElementById(name);
	} else if (key === 'class' && typeof index === 'number') {
		element = document.getElementsByClassName(name)[index];
	} else if (key === 'data-i18n') {
		element = document.querySelector(`[data-i18n="${name}"]`);
	}
	if (element) {
		element.style[option] = value;
	}
}

function deleteFiles() {
	if (deleteFileName) deleteFileName.innerText = '';
	setStyle('id', 'delete-file', 'display', 'none');
	setStyle('id', 'error-input-file-qr', 'display', 'none');
	if (inputNoneFileQR) inputNoneFileQR.value = '';
	fileData = undefined;
}

function sendQRPrivate() {
	if (!fileData) {
		setStyle('id', 'error-input-file-qr', 'display', 'block');
		return;
	}
	if (!validateCodeVerification()) {
		setStyle('id', 'error-input-verification-code', 'display', 'block');
		return;
	}
	setStyle('id', 'error-input-verification-code', 'display', 'none');
	setStyle('id', 'error-input-file-qr', 'display', 'none');
	sendData(validateCodeVerification(), fileData);
}

export function showNotification(name) {
	setStyle('data-i18n', name, 'display', 'block');
	setStyle('id', 'notification', 'display', 'grid');
	setTimeout(() => {
		setStyle('data-i18n', name, 'display', 'none');
		setStyle('id', 'notification', 'display', 'none');
	}, 3000);
}

window.addEventListener('resize', function () {
	setSettingsAccordingToSize();
}, true);

initApp();
