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
import {downloadFile, generateKeys} from './qrgenerator/qrgenerator';
import qrcodeParser from 'qrcode-parser';
import {sendData} from './qrupload/qrupload';
import qrPublicDummy from '../images/QR_Public.svg';
import qrPrivateDummy from '../images/QR_Private.svg';
import i18next from 'i18next';

const inputNoneFileQR = document.getElementById('input-none-file-qr');
const stepButtons = document.getElementsByClassName('step-button');
const divInputCode = document.getElementsByClassName('div-input-code');
const deleteFileName = document.getElementById('delete-file-name');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const downloadQrBtn = document.getElementById('download-qr-btn');
const privateQrCard = document.getElementById('private-qr-card');
const publicQrCard = document.getElementById('public-qr-card');

let fileData;
let timeOutNotification;

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
	const textarea = document.querySelector('textarea');
	if (textarea) {
		textarea.value = '';
	}

	const publicQRCard = document.querySelector('#public-qr-card .qr-code');
	if (publicQRCard) publicQRCard.innerHTML = `<img src="${qrPublicDummy}" alt="QR_Public">`;
	const privateQRCard = document.querySelector('#private-qr-card .qr-code');
	if (privateQRCard) privateQRCard.innerHTML = `<img src="${qrPrivateDummy}" alt="QR_Private">`;
	if (downloadPdfBtn) removeAttributeAndEvent(downloadPdfBtn);
	if (downloadQrBtn) removeAttributeAndEvent(downloadQrBtn);

	setStyle('id', 'error-input-name-establishment', 'display', 'none');
	setStyle('id', 'error-input-verification-code', 'display', 'none');
	setStyle('id', 'error-input-file-qr', 'display', 'none');
	setStyle('class', 'msg-download', 'display', 'none', 0);
	setStyle('class', 'qrcode-cards', 'display', 'none', 0);

	setActiveQRPrivate(true);
	deleteFiles();
}

function removeAttributeAndEvent(element) {
	if (element) {
		element.removeAttribute('href');
		element.removeAttribute('download');
		element.removeEventListener('click', downloadFile);
		element.saveFileParam = undefined;
	}
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
	if (downloadQrBtn) downloadQrBtn.addEventListener('click', function (e) {
		if (e.target.href || e.target.saveFileParam) {
			showNotification('WEB_PUBLIC_NOTIFICATION_QENERATE_QR_PRIVATE', 3000);
			setActiveQRPrivate(false);
		}
	});
	if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', function (e) {
		if (publicQrCard && publicQrCard.className.includes('card-disable')) {
			e.preventDefault();
			return;
		}
		if (e.target.href || e.target.saveFileParam) {
			showNotification('WEB_PUBLIC_NOTIFICATION_QENERATE_QR_PUBLIC', 3000);
		}
	});
	const inputNameEstablishment = document.getElementsByName('input-name-establishment');
	if (inputNameEstablishment && inputNameEstablishment.length > 0) {
		for (let input of inputNameEstablishment) {
			input.addEventListener('keypress', function (e) {
				if (e.key === 'Enter') {
					setGenerateCodeQR();
				}
			});
		}
	}
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
				input.addEventListener('keyup', function (e) {
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
}

function validateNameEstablishment() {
	const inputName = (window.innerWidth >=768) ? document.getElementsByName('input-name-establishment')[0] : document.getElementsByName('input-name-establishment')[1];
	const regExpStartWithSpace = /(^\s)/;
	const regExpSpecialCharacterFollowedBySymbol = /(\W[äÄëËïÏöÖüÜáéíóúÁÉÍÓÚÂÊÎÔÛâêîôûàèìòùÀÈÌÒÙñÑ])|([äÄëËïÏöÖüÜáéíóúÁÉÍÓÚÂÊÎÔÛâêîôûàèìòùÀÈÌÒÙñÑ]\W)/;
	const regExpDoubleFollowedSymbol = /(\W\W)/;
	const regExpSymbolFollowedSpaceFollowedSymbol = /(\W\s\W)/;
	if (!inputName || !inputName.value || inputName.value.toString().trim() === '' || regExpStartWithSpace.test(inputName.value) || regExpSymbolFollowedSpaceFollowedSymbol.test(inputName.value)) return true;
	for (let intI = 0; intI < inputName.value.toString().length; intI++) {
		let validateText = inputName.value.toString().substr(intI, 2).trim();
		if (validateText.length > 1 && regExpDoubleFollowedSymbol.test(validateText) && !regExpSpecialCharacterFollowedBySymbol.test(validateText)) return true;
	}
	return false;
}

function validateADigitAlphanumericInputCode(e, input) {
	const regExp = /^[A-Za-z0-9]$/;
	const arrayValidKeyNoAlphanumeric = ['Tab', 'ArrowRight', 'ArrowLeft', 'Delete', 'Backspace'];
	if (!regExp.test(input.value) && !arrayValidKeyNoAlphanumeric.find(valid => valid === e.key)) {
		input.value = (input.value.length > 1) ? input.value.substring(0, 1) : '';
	}
	if (regExp.test(input.value)) {
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
		setStyle('class', 'msg-download', 'display', 'block', 0);
		setStyle('class', 'qrcode-cards', 'display', 'flex', 0);
		showNotification('WEB_PUBLIC_NOTIFICATION_GENERATE_QR', 3000);
		setActiveQRPrivate(true);
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

export function setActiveQRPrivate(reset) {
	if (downloadQrBtn) {
		if (reset) downloadQrBtn.innerText = i18next.t('WEB_PUBLIC_DOWNLOAD_QR_BTN');
		else downloadQrBtn.innerText = i18next.t('WEB_PUBLIC_RE_DOWNLOAD_QR_BTN');
	}
	if (privateQrCard && publicQrCard) {
		privateQrCard.classList.remove('card-active');
		privateQrCard.classList.remove('card-disable');
		publicQrCard.classList.remove('card-active');
		publicQrCard.classList.remove('card-disable');
		if (reset) {
			privateQrCard.classList.add('card-active');
			publicQrCard.classList.add('card-disable');
		} else {
			publicQrCard.classList.add('card-active');
		}
	}
}

export function showNotification(name, time) {
	const notificationMsg = document.getElementById('notification-msg');
	if (timeOutNotification) clearTimeout(timeOutNotification);
	if (notificationMsg) {
		notificationMsg.innerText = i18next.t(name);
		setStyle('id', 'notification', 'display', 'grid');
		timeOutNotification = setTimeout(() => {
			notificationMsg.innerText = '';
			setStyle('id', 'notification', 'display', 'none');
		}, time);
	}
}

window.addEventListener('resize', function () {
	setSettingsAccordingToSize();
}, true);

initApp();
