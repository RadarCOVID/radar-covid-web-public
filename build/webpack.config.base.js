/*
 * Copyright (c) 2021 Gobierno de España
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * SPDX-License-Identifier: MPL-2.0
 */

/* global require, __dirname, module*/
const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtract = require('mini-css-extract-plugin');

const basePath = __dirname;
const imageBasePath = 'sites/radar-covid.test/themes/custom/radar/images/qr_codes/';
const fontBasePath = 'sites/radar-covid.test/themes/custom/radar/fonts/';

function webpackConfigGenerator(env) {
	const sourcemaps = !!env.development;

	return {
		resolve: {
			extensions: ['.js', '.json'],
		},
		entry: ['@babel/polyfill', path.resolve(basePath, '../src/js/index.js')],
		output: {
			path: path.resolve(basePath, '../dist'),
			filename: 'main.js',
		},
		module: {
			rules: [
				{
					test: /\.js/,
					exclude: /node_modules/,
					use: ['babel-loader'],
				},
				{
					test: /\.css/,
					exclude: /node_modules/,
					use: [
						MiniCSSExtract.loader,
						{loader: 'css-loader', options: {sourceMap: sourcemaps}},
						{loader: 'postcss-loader', options: {sourceMap: sourcemaps}},
					],
				},
				{
					test: /\.(png|svg|jpg|gif)$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: '[name].[ext]',
								outputPath: (!env.development) ? '/' + imageBasePath : imageBasePath
							}
						}
					]
				},
				{
					test: /\.(woff(2)?|ttf|eot|otf)(\?v=\d+\.\d+\.\d+)?$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: '[name].[ext]',
								outputPath: (!env.development) ? '/' + fontBasePath : fontBasePath
							}
						}
					]
				},
				{
					test: /\.(pdf)$/,
					use: [
						{
							loader: 'file-loader',
							options: {
								name: '[name].[ext]',
								outputPath: 'pdfs/'
							}
						}
					]
				},
				{
					test: /\.html$/i,
					loader: 'html-loader',
				}
			],
		},
		plugins: [
			new HTMLWebpackPlugin({
				inject: 'body',
				template: './src/index.html',
				filename: 'index.html',
			}),
			new MiniCSSExtract({
				filename: '[name].css',
				chunkFilename: '[id].css',
			}),
			new webpack.DefinePlugin({
				ENV: JSON.stringify(env),
				URL_PATH: JSON.stringify(env.API_URL),
				KEYPAIR: JSON.stringify(env.KEY_PAIR)
			}),
		],
	};
}

module.exports = webpackConfigGenerator;
