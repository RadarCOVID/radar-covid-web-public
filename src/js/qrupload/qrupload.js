/*
 * Copyright (c) 2021 Gobierno de España
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

/* global KEYPAIR*/
import {genPreTrace, genTrace, mcl, QRCodeTrace, sodium, verifyTrace, waitReady} from '@c4dt/libcrowdnotifier';
import {resetApp, setStyle, showNotification} from '../index';
import {postCaseCodeVerify, postTraceKeys} from '../services/service';

const ONE_HOUR_IN_MILLISECONDS = 1000 * 60 * 60;

const getTrace = (qrTrace, counts) => {
	const masterTraceRecordProto = qrTrace.masterTraceRecord;
	const masterPublicKey = new mcl.G2();
	masterPublicKey.deserialize(masterTraceRecordProto.masterPublicKey);
	const masterSecretKeyLocation = new mcl.Fr();
	masterSecretKeyLocation
		.deserialize(masterTraceRecordProto.masterSecretKeyLocation);
	const masterTraceRecord = {
		mpk: masterPublicKey,
		mskl: masterSecretKeyLocation,
		info: masterTraceRecordProto.info,
		nonce1: masterTraceRecordProto.nonce1,
		nonce2: masterTraceRecordProto.nonce2,
		ctxtha: masterTraceRecordProto.cipherTextHealthAuthority,
	};
	const count = parseInt(counts);
	const [preTrace, traceProof] = genPreTrace(masterTraceRecord, count);
	const healthAuthority = {
		keyType: '',
		privateKey: sodium.from_hex(KEYPAIR.privateKey),
		publicKey: sodium.from_hex(KEYPAIR.publicKey)
	};
	const trace = genTrace(healthAuthority, preTrace);

	if (!verifyTrace(masterTraceRecordProto.info, count, trace, traceProof)) {
		console.error('Error Trace');
		return;
	}
	return {
		identity: sodium.to_base64(trace.id),
		secretKeyForIdentity: sodium.to_base64(trace.skid.serialize())
	};
};

const getAffectedHours = (from, to) => {
	const startHour = Math.floor(from / ONE_HOUR_IN_MILLISECONDS);
	const endHour = Math.floor(to / ONE_HOUR_IN_MILLISECONDS);
	const result = [];
	for (let i = startHour; i <= endHour; i++) {
		result.push(i);
	}
	return result;
};

const getPayloadQRFile = (fileData) => {
	const codeSplit = fileData.split('#');
	return (codeSplit && codeSplit.length > 0) ? codeSplit[1] : '';
};

export const uploadData = async (payload, codeCaseData) => {
	await waitReady();

	const affectedHours = getAffectedHours(codeCaseData.startTime, codeCaseData.endTime);
	const qrTrace = QRCodeTrace.decode(sodium.from_base64(payload));
	const traces = [];
	const nonce = sodium.randombytes_buf(24);
	affectedHours.forEach(function (hour) {
		const trace = getTrace(qrTrace, hour);
		traces.push({
			identity: trace.identity,
			secretKeyForIdentity: trace.secretKeyForIdentity,
			startTime: codeCaseData.startTime,
			endTime: codeCaseData.endTime,
			message: sodium.to_base64(sodium.crypto_secretbox_easy('', nonce, qrTrace.notificationKey)),
			nonce: sodium.to_base64(nonce)
		});
	});

	return traces;
};

export const sendData = (codeVerification, fileData) => {
	setStyle('id', 'loading', 'display', 'block');
	postCaseCodeVerify({code: codeVerification}).then(resp => {
		if (resp && resp.data) {
			uploadData(getPayloadQRFile(fileData), resp.data).then(dataSend => {
				if (dataSend) {
					postTraceKeys(dataSend, resp.data.token).then(() => {
						resetApp();
						showNotification('WEB_PUBLIC_NOTIFICATION_SEND_QR');
					}).catch(() => {
						setStyle('id', 'error-input-verification-code', 'display', 'block');
						console.error('Error trace key');
					}).finally(() => {
						setStyle('id', 'loading', 'display', 'none');
					});
				} else {
					setStyle('id', 'error-input-verification-code', 'display', 'block');
					setStyle('id', 'loading', 'display', 'none');
					console.error('Error upload data');
				}
			});
		}
	}).catch(() => {
		setStyle('id', 'error-input-verification-code', 'display', 'block');
		setStyle('id', 'loading', 'display', 'none');
		console.error('Error code verification');
	});
};
