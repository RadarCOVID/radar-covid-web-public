/*
 * Copyright (c) 2021 Gobierno de España
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

/* global require, module*/
const merge = require('webpack-merge');
const baseConfigGenerator = require('./webpack.config.base.js');
const prodConfig = require('./webpack.config.prod.js');
const devConfig = require('./webpack.config.dev.js');
const prodEnv = require('../config/prod.env');
const preEnv = require('../config/pre.env');
const devEnv = require('../config/dev.env');

function webpackEnvironmentSelector(env) {
	let config;
	let environment;

	if (env.production) {
		config = prodConfig;
		environment = prodEnv;
	}
	if (env.preproduction) {
		config = prodConfig;
		environment = preEnv;
	}
	if (env.development) {
		config = devConfig;
		environment = devEnv;
	}

	const baseConfig = baseConfigGenerator(environment);

	return merge(baseConfig, config);
}

module.exports = webpackEnvironmentSelector;
