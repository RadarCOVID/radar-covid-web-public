/*
 * Copyright (c) 2021 Gobierno de España
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

import {
	genCode,
	MasterTrace,
	QRCodeContent,
	QRCodeEntry,
	QRCodeTrace,
	sodium,
	waitReady,
} from '@c4dt/libcrowdnotifier';

const generateProtoBufs = async (
	name,
	location,
	room,
	venueType,
	public_key,
	validFrom,
	validTo
) => {
	await waitReady();

	const healthAuthorityPublicKey = sodium.from_hex(`${public_key}`);
	const notificationKey = sodium.crypto_secretbox_keygen();

	if (!venueType) {
		venueType = undefined;
	}
	if (!location) {
		location = undefined;
	}
	if (!room) {
		room = undefined;
	}

	const data = QRCodeContent.create({
		name: name,
		location: location,
		room: room,
		venueType: venueType,
		notificationKey: notificationKey,
		validFrom: validFrom.getTime(),
		validTo: validTo.getTime()
	});

	const infoBinary = QRCodeContent.encode(data).finish();
	const locationCode = genCode(healthAuthorityPublicKey, infoBinary);

	const mtr = new MasterTrace({
		masterPublicKey: locationCode.mtr.mpk.serialize(),
		masterSecretKeyLocation: locationCode.mtr.mskl.serialize(),
		info: locationCode.mtr.info,
		nonce1: locationCode.mtr.nonce1,
		nonce2: locationCode.mtr.nonce2,
		cipherTextHealthAuthority: locationCode.mtr.ctxtha,
	});

	// trace
	const qrTrace = new QRCodeTrace({
		version: 2,
		masterTraceRecord: mtr,
		notificationKey: notificationKey
	});

	// entry
	const qrEntry = QRCodeEntry.create({
		version: 2,
		data,
		masterPublicKey: locationCode.ent.serialize(),
		entryProof: locationCode.pEnt,
	});

	return {
		qrTrace: sodium.to_base64(QRCodeTrace.encode(qrTrace).finish()),
		qrEntry: sodium.to_base64(QRCodeEntry.encode(qrEntry).finish()),
	};
};

export default generateProtoBufs;
