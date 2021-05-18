'use strict';
const http = require('http');
const sapiens = require('./data_structures');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const uuid = require('uuid');

const app = express();
const server = http.Server(app);

const host = 'localhost';
const port = 8080;


