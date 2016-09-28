/**
 *
 *  Material Design Lite
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

 // jscs:disable jsDoc

'use strict';

// Include Gulp & Tools We'll Use

import browserSync from 'browser-sync';

import gulp from 'gulp';

import gulpLoadPlugins from 'gulp-load-plugins';

import pkg from './package.json';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;
const hostedLibsUrlPrefix = 'https://code.getmdl.io';
const templateArchivePrefix = 'mdl-template-';
const bucketProd = 'gs://www.getmdl.io';
const bucketStaging = 'gs://mdl-staging';
const bucketCode = 'gs://code.getmdl.io';
const banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @license <%= pkg.license %>',
  ' * @copyright 2015 Google, Inc.',
  ' * @link https://github.com/google/material-design-lite',
  ' */',
  ''].join('\n');

let codeFiles = '';

const AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// ***** Development tasks ****** //

// Lint JavaScript
gulp.task('lint', () => {
  return gulp.src([
      'src/**/*.js',
      'gulpfile.babel.js'
    ])
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jscs())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jscs.reporter())
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')))
    .pipe($.if(!browserSync.active, $.jscs.reporter('fail')));
});

// ***** Production build tasks ****** //

// Compile and Automatically Prefix Stylesheets (dev)
gulp.task('styles:dev', () => {
  return gulp.src('src/**/*.scss')
    .pipe($.sass({
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe($.size({title: 'styles'}));
});


// Compile and Automatically Prefix Stylesheets (production)
gulp.task('styles', () => {
  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src('src/material-design-lite.scss')
    // Generate Source Maps
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.cssInlineImages({webRoot: 'src'}))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp'))
    // Concatenate Styles
    .pipe($.concat('material.css'))
    .pipe($.header(banner, {pkg}))
    .pipe(gulp.dest('dist'))
    // Minify Styles
    .pipe($.if('*.css', $.csso()))
    .pipe($.concat('material.min.css'))
    .pipe($.header(banner, {pkg}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'styles'}));
});


// Clean Output Directory
gulp.task('clean', () => del(['dist', '.publish']));
