(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Monkey"] = factory();
	else
		root["Monkey"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "monkey/dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(fetch) {'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	// import EventEmitter from './bower_components/eventEmitter/EventEmitter.js';

	/*!
	* Monkey v0.0.8
	* Apache 2.0 - http://www.apache.org/licenses/LICENSE-2.0.html
	* Gianni Carlo - http://oli.me.uk/
	* @preserve
	*/

	var EventEmitter = __webpack_require__(2);
	var MonkeyEnums = __webpack_require__(3);
	var MOKMessage = __webpack_require__(4);
	var NodeRSA = __webpack_require__(5);
	var CryptoJS = __webpack_require__(49).CryptoJS;

	__webpack_require__(57).polyfill();
	__webpack_require__(61);

	;(function () {
	  'use strict';

	  /**
	  * Class for managing Monkey communication.
	  * Can be extended to provide event functionality in other classes.
	  *
	  * @class Monkey Manages everything.
	  */

	  function Monkey() {}

	  // Shortcuts to improve speed and size
	  var proto = Monkey.prototype;
	  var exports = this;

	  proto.enums = new MonkeyEnums();
	  // var originalGlobalValue = exports.Monkey;
	  /**
	  * Alias a method while keeping the context correct, to allow for overwriting of target method.
	  *
	  * @param {String} name The name of the target method.
	  * @return {Function} The aliased method
	  * @api private
	  */
	  function alias(name) {
	    return function aliasClosure() {
	      return this[name].apply(this, arguments);
	    };
	  }

	  proto.addListener = function addListener(evt, callback) {
	    var emitter = this._getEmitter();
	    emitter.addListener(evt, callback);

	    return this;
	  };

	  proto._getEmitter = function _getEmitter() {
	    if (this.emitter == null) {
	      this.emitter = new EventEmitter();
	    }
	    return this.emitter;
	  };

	  proto.removeEvent = function removeEvent(evt) {
	    var emitter = this._getEmitter();
	    emitter.removeEvent(evt);
	    return this;
	  };

	  proto.status = 0;

	  proto.session = {
	    id: null,
	    user: null,
	    lastTimestamp: 0,
	    lastMessageId: 0,
	    expireSession: 0,
	    debuggingMode: false
	  };

	  /*
	  * Session stuff
	  */

	  proto.init = function init(appKey, appSecret, userObj, shouldExpireSession, isDebugging) {
	    if (appKey == null || appSecret == null) {
	      throw 'Monkey - To initialize Monkey, you must provide your App Id and App Secret';
	      return;
	    }

	    this.appKey = appKey;
	    this.appSecret = appSecret;

	    //setup session
	    if (userObj != null) {
	      this.session.user = userObj;
	      this.session.id = userObj.monkeyId;
	    }

	    if (shouldExpireSession) {
	      this.session.expireSession = 1;
	    }

	    if (isDebugging) {
	      this.session.debuggingMode = true;
	    }

	    this.keyStore = {};

	    this.domainUrl = 'monkey.criptext.com';
	    //setup socketConnection
	    this.socketConnection = null;

	    this.requestSession();
	    return this;
	    // this.session =
	  };

	  /*
	   * COMMUNICATION
	   */

	  proto.prepareMessageArgs = function prepareMessageArgs(recipientMonkeyId, props, optionalParams, optionalPush) {
	    var args = {
	      app_id: this.appKey,
	      sid: this.session.id,
	      rid: recipientMonkeyId,
	      props: JSON.stringify(props),
	      params: JSON.stringify(optionalParams)
	    };

	    switch (typeof optionalPush === 'undefined' ? 'undefined' : _typeof(optionalPush)) {
	      case "object":
	        {
	          if (optionalPush == null) {
	            optionalPush = {};
	          }
	          break;
	        }
	      case "string":
	        {
	          optionalPush = this.generateStandardPush(optionalPush);
	          break;
	        }
	      default:
	        optionalPush = {};
	        break;
	    }

	    args["push"] = JSON.stringify(optionalPush);

	    return args;
	  };

	  proto.sendCommand = function sendCommand(command, args) {
	    var finalMessage = JSON.stringify({ cmd: command, args: args });
	    console.log("================");
	    console.log("Monkey - sending message: " + finalMessage);
	    console.log("================");
	    this.socketConnection.send(finalMessage);

	    return this;
	  };

	  proto.sendOpenToUser = function sendOpenToUser(monkeyId) {
	    this.sendCommand(this.enums.MOKMessageProtocolCommand.OPEN, { rid: monkeyId });
	  };

	  proto.sendMessage = function sendMessage(text, recipientMonkeyId, optionalParams, optionalPush) {
	    var props = {
	      device: "web",
	      encr: 0
	    };

	    return this.sendText(this.enums.MOKMessageProtocolCommand.MESSAGE, text, recipientMonkeyId, props, optionalParams, optionalPush);
	  };

	  proto.sendEncryptedMessage = function sendEncryptedMessage(text, recipientMonkeyId, optionalParams, optionalPush) {
	    var props = {
	      device: "web",
	      encr: 1
	    };

	    return this.sendText(this.enums.MOKMessageProtocolCommand.MESSAGE, text, recipientMonkeyId, props, optionalParams, optionalPush);
	  };

	  proto.sendText = function sendText(cmd, text, recipientMonkeyId, props, optionalParams, optionalPush) {
	    var args = this.prepareMessageArgs(recipientMonkeyId, props, optionalParams, optionalPush);
	    args.msg = text;
	    args.type = this.enums.MOKMessageType.TEXT;

	    var message = new MOKMessage(cmd, args);

	    args.id = message.id;
	    args.oldId = message.oldId;

	    if (message.isEncrypted()) {
	      message.encryptedText = aesEncrypt(text, this.session.id);
	      args.msg = message.encryptedText;
	    }

	    this.sendCommand(cmd, args);

	    return message;
	  };

	  proto.sendNotification = function sendNotification(recipientMonkeyId, optionalParams, optionalPush) {
	    var props = {
	      device: "web"
	    };

	    var args = prepareMessageArgs(recipientMonkeyId, props, optionalParams, optionalPush);
	    args.type = this.enums.MOKMessageType.NOTIF;

	    var message = new MOKMessage(this.enums.MOKMessageProtocolCommand.MESSAGE, args);

	    args.id = message.id;
	    args.oldId = message.oldId;

	    this.sendCommand(this.enums.MOKMessageProtocolCommand.MESSAGE, args);

	    return message;
	  };

	  proto.publish = function publish(text, channelName, optionalParams) {
	    var props = {
	      device: "web",
	      encr: 0
	    };

	    return this.sendText(this.enums.MOKMessageProtocolCommand.PUBLISH, text, channelName, props, optionalParams);
	  };

	  proto.sendFile = function sendFile(data, recipientMonkeyId, fileName, mimeType, fileType, shouldCompress, optionalParams, optionalPush, callback) {
	    var props = {
	      device: "web",
	      encr: 0,
	      file_type: fileType,
	      ext: this.mok_getFileExtension(fileName),
	      filename: fileName
	    };

	    if (shouldCompress) {
	      props.cmpr = "gzip";
	    }

	    if (mimeType) {
	      props.mime_type = mimeType;
	    }

	    return this.uploadFile(data, recipientMonkeyId, fileName, props, optionalParams, function (error, message) {
	      if (error) {
	        callback(error, message);
	      }

	      callback(null, message);
	    });
	  };

	  proto.sendEncryptedFile = function sendEncryptedFile(data, recipientMonkeyId, fileName, mimeType, fileType, shouldCompress, optionalParams, optionalPush, callback) {
	    var props = {
	      device: "web",
	      encr: 1,
	      file_type: fileType,
	      ext: this.mok_getFileExtension(fileName),
	      filename: fileName
	    };

	    if (shouldCompress) {
	      props.cmpr = "gzip";
	    }

	    if (mimeType) {
	      props.mime_type = mimeType;
	    }

	    return this.uploadFile(data, recipientMonkeyId, fileName, props, optionalParams, optionalPush, function (error, message) {
	      if (error) {
	        callback(error, message);
	      }

	      callback(null, message);
	    });
	  };

	  proto.uploadFile = function uploadFile(fileData, recipientMonkeyId, fileName, props, optionalParams, optionalPush, callback) {
	    fileData = this.cleanFilePrefix(fileData);

	    var binData = this.mok_convertDataURIToBinary(fileData);
	    props.size = binData.size;

	    var args = this.prepareMessageArgs(recipientMonkeyId, props, optionalParams, optionalPush);
	    args.msg = fileName;
	    args.type = this.enums.MOKMessageType.FILE;

	    var message = new MOKMessage(MOKMessageProtocolCommand.MESSAGE, args);

	    args.id = message.id;
	    args.oldId = message.oldId;
	    args.props = message.props;
	    args.params = message.params;

	    if (message.isCompressed()) {
	      fileData = this.compress(fileData);
	    }

	    if (message.isEncrypted()) {
	      fileData = this.aesEncrypt(fileData, monkey.session.id);
	    }

	    var fileToSend = new Blob([fileData.toString()], { type: message.props.file_type });
	    fileToSend.name = fileName;

	    var data = new FormData();
	    //agrega el archivo y la info al form
	    data.append('file', fileToSend);
	    data.append('data', JSON.stringify(args));

	    this.basicRequest('POST', '/file/new/base64', data, true, function (err, respObj) {
	      if (err) {
	        console.log('Monkey - upload file Fail');
	        onComplete(err.toString(), message);
	        return;
	      }
	      console.log('Monkey - upload file OK');
	      message.id = respObj.data.messageId;
	      onComplete(null, message);
	    });

	    return message;
	  };

	  proto.getPendingMessages = function getPendingMessages() {
	    this.requestMessagesSinceTimestamp(this.session.lastTimestamp, 15, false);
	  };

	  proto.processGetMessages = function processGetMessages(messages, remaining) {
	    this.processMultipleMessages(messages);

	    if (remaining > 0) {
	      this.requestMessagesSinceId(this.session.lastMessageId, 15, false);
	    }
	  };

	  proto.processSyncMessages = function processSyncMessages(messages, remaining) {
	    this.processMultipleMessages(messages);

	    if (remaining > 0) {
	      this.requestMessagesSinceTimestamp(this.session.lastTimestamp, 15, false);
	    }
	  };

	  proto.processMultipleMessages = function processMultipleMessages(messages) {
	    messages.map(function (message) {
	      var msg = new MOKMessage(this.enums.MOKMessageProtocolCommand.MESSAGE, message);
	      this.processMOKProtocolMessage(msg);
	    });
	  };

	  proto.processMOKProtocolMessage = function processMOKProtocolMessage(message) {
	    console.log("===========================");
	    console.log("MONKEY - Message in process: " + message.id + " type: " + message.protocolType);
	    console.log("===========================");

	    switch (message.protocolType) {
	      case this.enums.MOKMessageType.TEXT:
	        {
	          this.incomingMessage(message);
	          break;
	        }
	      case this.enums.MOKMessageType.FILE:
	        {
	          fileReceived(message);
	          break;
	        }
	      default:
	        {
	          this._getEmitter().emit('onNotification', message);
	          break;
	        }
	    }
	  };

	  proto.incomingMessage = function incomingMessage(message) {
	    if (message.isEncrypted()) {
	      try {
	        message.text = this.aesDecryptIncomingMessage(message);
	      } catch (error) {
	        console.log("===========================");
	        console.log("MONKEY - Fail decrypting: " + message.id + " type: " + message.protocolType);
	        console.log("===========================");
	        //get keys
	        this.getAESkeyFromUser(message.senderId, message, function (response) {
	          if (response != null) {
	            this.incomingMessage(message);
	          }
	        });
	        return;
	      }

	      if (message.text == null) {
	        //get keys
	        this.getAESkeyFromUser(message.senderId, message, function (response) {
	          if (response != null) {
	            this.incomingMessage(message);
	          }
	        });
	      }

	      return;
	    }

	    message.text = message.encryptedText;

	    if (message.id > 0) {
	      this.session.lastTimestamp = message.datetimeCreation;
	      this.session.lastMessageId = message.id;
	    }

	    switch (message.protocolCommand) {
	      case this.enums.MOKMessageProtocolCommand.MESSAGE:
	        {
	          this._getEmitter().emit('onMessage', message);
	          break;
	        }
	      case this.enums.MOKMessageProtocolCommand.PUBLISH:
	        {
	          this._getEmitter().emit('onChannelMessages', message);
	          break;
	        }
	    }
	  };

	  proto.fileReceived = function fileReceived(message) {
	    if (message.id > 0) {
	      this.session.lastTimestamp = message.datetimeCreation;
	      this.session.lastMessageId = message.id;
	    }

	    this._getEmitter().emit('onMessage', message);
	  };

	  proto.processMOKProtocolACK = function processMOKProtocolACK(message) {
	    console.log("===========================");
	    console.log("MONKEY - ACK in process");
	    console.log("===========================");

	    //Aditional treatment can be done here
	    this._getEmitter().emit('onAcknowledge', message);
	  };

	  proto.requestMessagesSinceTimestamp = function requestMessagesSinceTimestamp(lastTimestamp, quantity, withGroups) {
	    var args = {
	      since: lastTimestamp,
	      qty: quantity
	    };

	    if (withGroups == true) {
	      args.groups = 1;
	    }

	    this.sendCommand(this.enums.MOKMessageProtocolCommand.SYNC, args);
	  };

	  proto.requestMessagesSinceId = function requestMessagesSinceId(lastMessageId, quantity, withGroups) {
	    var args = {
	      messages_since: lastMessageId,
	      qty: quantity
	    };

	    if (withGroups == true) {
	      args.groups = 1;
	    }

	    this.sendCommand(this.enums.MOKMessageProtocolCommand.GET, args);
	  };

	  proto.startConnection = function startConnection(monkey_id) {
	    this.status = this.enums.Status.CONNECTING;
	    var token = this.appKey + ":" + this.appSecret;

	    if (this.session.debuggingMode) {
	      //no ssl
	      this.socketConnection = new WebSocket('ws://' + this.domainUrl + '/websockets?monkey_id=' + monkey_id + '&p=' + token, 'criptext-protocol');
	    } else {
	      this.socketConnection = new WebSocket('wss://' + this.domainUrl + '/websockets?monkey_id=' + monkey_id + '&p=' + token, 'criptext-protocol');
	    }

	    this.socketConnection.onopen = function () {
	      this.status = this.enums.Status.ONLINE;
	      this._getEmitter().emit('onConnect', { monkey_id: this.session.id });

	      this.sendCommand(this.enums.MOKMessageProtocolCommand.SET, { online: 1 });
	      this.getPendingMessages();
	    }.bind(this);

	    this.socketConnection.onmessage = function (evt) {
	      console.log('Monkey - incoming message: ' + evt.data);
	      var jsonres = JSON.parse(evt.data);

	      if (jsonres.args.app_id == null) {
	        jsonres.args.app_id = this.appKey;
	      }

	      var msg = new MOKMessage(jsonres.cmd, jsonres.args);
	      switch (parseInt(jsonres.cmd)) {
	        case this.enums.MOKMessageProtocolCommand.MESSAGE:
	          {
	            this.processMOKProtocolMessage(msg);
	            break;
	          }
	        case this.enums.MOKMessageProtocolCommand.PUBLISH:
	          {
	            this.processMOKProtocolMessage(msg);
	            break;
	          }
	        case this.enums.MOKMessageProtocolCommand.ACK:
	          {
	            //msg.protocolCommand = MOKMessageProtocolCommand.ACK;
	            //msg.monkeyType = set status value from props
	            this.processMOKProtocolACK(msg);
	            break;
	          }
	        case this.enums.MOKMessageProtocolCommand.GET:
	          {
	            //notify watchdog
	            switch (jsonres.args.type) {
	              case this.enums.MOKGetType.HISTORY:
	                {
	                  var arrayMessages = jsonres.args.messages;
	                  var remaining = jsonres.args.remaining_messages;

	                  this.processGetMessages(arrayMessages, remaining);
	                  break;
	                }
	              case this.enums.MOKGetType.GROUPS:
	                {
	                  msg.protocolCommand = this.enums.MOKMessageProtocolCommand.GET;
	                  msg.protocolType = this.enums.MOKMessageType.NOTIF;
	                  //monkeyType = MOKGroupsJoined;
	                  msg.text = jsonres.args.messages;

	                  this._getEmitter().emit('onNotification', msg);
	                  break;
	                }
	            }

	            break;
	          }
	        case this.enums.MOKMessageProtocolCommand.SYNC:
	          {
	            //notify watchdog
	            switch (jsonres.args.type) {
	              case this.enums.MOKSyncType.HISTORY:
	                {
	                  var arrayMessages = jsonres.args.messages;
	                  var remaining = jsonres.args.remaining_messages;

	                  this.processSyncMessages(arrayMessages, remaining);
	                  break;
	                }
	              case this.enums.MOKSyncType.GROUPS:
	                {
	                  msg.protocolCommand = this.enums.MOKMessageProtocolCommand.GET;
	                  msg.protocolType = this.enums.MOKMessageType.NOTIF;
	                  //monkeyType = MOKGroupsJoined;
	                  msg.text = jsonres.args.messages;
	                  this._getEmitter().emit('onNotification', msg);
	                  break;
	                }
	            }

	            break;
	          }
	        case this.enums.MOKMessageProtocolCommand.OPEN:
	          {
	            msg.protocolCommand = this.enums.MOKMessageProtocolCommand.OPEN;
	            this._getEmitter().emit('onNotification', msg);
	            break;
	          }
	        default:
	          {
	            this._getEmitter().emit('onNotification', msg);
	            break;
	          }
	      }
	    }.bind(this);

	    this.socketConnection.onclose = function (evt) {
	      //check if the web server disconnected me
	      if (evt.wasClean) {
	        console.log('Monkey - Websocket closed - Connection closed... ' + evt);
	        this.status = this.enums.Status.OFFLINE;
	      } else {
	        //web server crashed, reconnect
	        console.log('Monkey - Websocket closed - Reconnecting... ' + evt);
	        this.status = this.enums.Status.CONNECTING;
	        setTimeout(this.startConnection(monkey_id), 2000);
	      }
	      this._getEmitter().emit('onDisconnect');
	    }.bind(this);
	  };

	  /*
	  * Security
	  */

	  proto.getAESkeyFromUser = function getAESkeyFromUser(monkeyId, pendingMessage, callback) {
	    this.basicRequest('POST', '/user/key/exchange', { monkey_id: this.session.id, user_to: monkeyId }, false, function (err, respObj) {
	      if (err) {
	        console.log('Monkey - error on getting aes keys ' + err);
	        return;
	      }

	      console.log('Monkey - Received new aes keys');
	      var newParamKeys = this.aesDecrypt(respObj.data.convKey, this.session.id).split(":");
	      var newAESkey = newParamKeys[0];
	      var newIv = newParamKeys[1];

	      var currentParamKeys = this.keyStore[respObj.data.session_to];

	      this.keyStore[respObj.data.session_to] = { key: newParamKeys[0], iv: newParamKeys[1] };

	      if (typeof currentParamKeys == 'undefined') {
	        return callback(pendingMessage);
	      }

	      //check if it's the same key
	      if (newParamKeys[0] == currentParamKeys.key && newParamKeys[1] == currentParamKeys.iv) {
	        this.requestEncryptedTextForMessage(pendingMessage, function (decryptedMessage) {
	          callback(decryptedMessage);
	        });
	        return;
	      }
	      //it's a new key
	      callback(pendingMessage);
	    });
	  };

	  proto.requestEncryptedTextForMessage = function requestEncryptedTextForMessage(message, callback) {
	    this.basicRequest('GET', '/message/' + message.id + '/open/secure', {}, false, function (err, respObj) {
	      if (err) {
	        console.log('Monkey - error on requestEncryptedTextForMessage: ' + err);
	        return callback(null);
	      }

	      console.log(respObj);
	      message.encryptedText = respObj.data.message;
	      message.encryptedText = this.aesDecrypt(message.encryptedText, this.session.id);
	      if (message.encryptedText == null) {
	        if (message.id > 0) {
	          this.session.lastTimestamp = message.datetimeCreation;
	          this.session.lastMessageId = message.id;
	        }
	        return callback(null);
	      }
	      message.encryptedText = message.text;
	      message.setEncrypted(false);
	      return callback(message);
	    });
	  };

	  proto.aesDecryptIncomingMessage = function aesDecryptIncomingMessage(message) {
	    return this.aesDecrypt(message.encryptedText, message.senderId);
	  };

	  proto.aesDecrypt = function aesDecrypt(dataToDecrypt, monkeyId) {
	    var aesObj = this.keyStore[monkeyId];
	    var aesKey = CryptoJS.enc.Base64.parse(aesObj.key);
	    var initV = CryptoJS.enc.Base64.parse(aesObj.iv);
	    var cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(dataToDecrypt) });
	    var decrypted = CryptoJS.AES.decrypt(cipherParams, aesKey, { iv: initV }).toString(CryptoJS.enc.Utf8);

	    return decrypted;
	  };

	  proto.decryptFile = function decryptFile(fileToDecrypt, monkeyId) {
	    var aesObj = this.keyStore[monkeyId];

	    var aesKey = CryptoJS.enc.Base64.parse(aesObj.key);
	    var initV = CryptoJS.enc.Base64.parse(aesObj.iv);

	    var decrypted = CryptoJS.AES.decrypt(fileToDecrypt, aesKey, { iv: initV }).toString(CryptoJS.enc.Base64);

	    // console.log('el tipo del archivo decriptado: '+ typeof(decrypted));
	    return decrypted;
	  };

	  proto.aesEncrypt = function aesEncrypt(dataToEncrypt, monkeyId) {
	    var aesObj = this.keyStore[monkeyId];
	    var aesKey = CryptoJS.enc.Base64.parse(aesObj.key);
	    var initV = CryptoJS.enc.Base64.parse(aesObj.iv);

	    var encryptedData = CryptoJS.AES.encrypt(dataToEncrypt, aesKey, { iv: initV });

	    return encryptedData.toString();
	  };

	  proto.decryptBulkMessages = function decryptBulkMessages(messages, decryptedMessages, onComplete) {
	    if (!(typeof messages != "undefined" && messages != null && messages.length > 0)) {
	      return onComplete(decryptedMessages);
	    }

	    var message = messages.shift();

	    if (message.isEncrypted() && message.protocolType != MOKMessageType.FILE) {
	      try {
	        message.text = this.aesDecryptIncomingMessage(message);
	      } catch (error) {
	        console.log("===========================");
	        console.log("MONKEY - Fail decrypting: " + message.id + " type: " + message.protocolType);
	        console.log("===========================");
	        //get keys
	        this.getAESkeyFromUser(message.senderId, message, function (response) {
	          if (response != null) {
	            messages.unshift(message);
	          }

	          this.decryptBulkMessages(messages, decryptedMessages, onComplete);
	        });
	        return;
	      }

	      if (message.text == null) {
	        //get keys
	        this.getAESkeyFromUser(message.senderId, message, function (response) {
	          if (response != null) {
	            messages.unshift(message);
	          }

	          this.decryptBulkMessages(message, decryptedMessages, onComplete);
	        });
	        return;
	      }
	    } else {
	      message.text = message.encryptedText;
	    }

	    decryptedMessages.push(message);

	    this.decryptBulkMessages(messages, decryptedMessages, onComplete);
	  };

	  proto.decryptDownloadedFile = function decryptDownloadedFile(fileData, message, callback) {
	    if (message.isEncrypted()) {
	      var decryptedData = null;
	      try {
	        var currentSize = fileData.length;
	        console.log("Monkey - encrypted file size: " + currentSize);

	        //temporal fix for media sent from web
	        if (message.props.device == "web") {
	          decryptedData = this.aesDecrypt(fileData, message.senderId);
	        } else {
	          decryptedData = this.decryptFile(fileData, message.senderId);
	        }

	        var newSize = decryptedData.length;
	        console.log("Monkey - decrypted file size: " + newSize);

	        if (currentSize == newSize) {
	          this.getAESkeyFromUser(message.senderId, message, function (response) {
	            if (response != null) {
	              this.decryptDownloadedFile(fileData, message, callback);
	            } else {
	              callback("Error decrypting downloaded file");
	            }
	          });
	          return;
	        }
	      } catch (error) {
	        console.log("===========================");
	        console.log("MONKEY - Fail decrypting: " + message.id + " type: " + message.protocolType);
	        console.log("===========================");
	        //get keys
	        this.getAESkeyFromUser(message.senderId, message, function (response) {
	          if (response != null) {
	            this.decryptDownloadedFile(fileData, message, callback);
	          } else {
	            callback("Error decrypting downloaded file");
	          }
	        });
	        return;
	      }

	      if (decryptedData == null) {
	        //get keys
	        this.getAESkeyFromUser(message.senderId, message, function (response) {
	          if (response != null) {
	            this.decryptDownloadedFile(fileData, message, callback);
	            return;
	          }
	          callback("Error decrypting downloaded file");
	        });
	        return;
	      }

	      fileData = decryptedData;
	    }

	    if (message.isCompressed()) {
	      fileData = decompress(fileData);
	    }

	    callback(null, fileData);
	  };

	  function compress(fileData) {
	    var binData = this.mok_convertDataURIToBinary(fileData);
	    var gzip = new Zlib.Gzip(binData);
	    var compressedBinary = gzip.compress(); //descompress
	    // Uint8Array to base64
	    var compressedArray = new Uint8Array(compressedBinary);
	    var compressedBase64 = this.mok_arrayBufferToBase64(compressedArray);

	    //this should be added by client 'data:image/png;base64'
	    return compressedBase64;
	  }

	  function decompress(fileData) {
	    var binData = this.mok_convertDataURIToBinary(fileData);
	    var gunzip = new Zlib.Gunzip(binData);
	    var decompressedBinary = gunzip.decompress(); //descompress
	    // Uint8Array to base64
	    var decompressedArray = new Uint8Array(decompressedBinary);
	    var decompressedBase64 = this.mok_arrayBufferToBase64(decompressedArray);

	    //this should be added by client 'data:image/png;base64'
	    return decompressedBase64;
	  }

	  proto.generateAndStoreAES = function generateAndStoreAES() {
	    var key = CryptoJS.enc.Hex.parse(this.randomString(32)); //256 bits
	    var iv = CryptoJS.enc.Hex.parse(this.randomString(16)); //128 bits
	    this.session.myKey = btoa(key);
	    this.session.myIv = btoa(iv);
	    //now you have to encrypt
	    return this.session.myKey + ":" + this.session.myIv;
	  };

	  proto.randomString = function randomString(length) {
	    var key = "";
	    var hex = "0123456789abcdef";
	    for (var i = 0; i < length; i++) {
	      key += hex.charAt(Math.floor(Math.random() * 16));
	    }
	    return key;
	  };

	  /*
	  * API CONNECTOR
	  */

	  proto.requestSession = function requestSession() {
	    this.session.exchangeKeys = new NodeRSA({ b: 2048 }, { encryptionScheme: 'pkcs1' });
	    var isSync = false;
	    var endpoint = '/user/session';
	    var params = { user_info: this.session.user, monkey_id: this.session.id, expiring: this.session.expireSession };

	    if (this.session.id != null) {
	      endpoint = '/user/key/sync';
	      isSync = true;
	      params['public_key'] = this.session.exchangeKeys.exportKey('public');
	    }

	    this.status = this.enums.Status.HANDSHAKE;

	    this.basicRequest('POST', endpoint, params, false, function (err, respObj) {

	      if (err) {
	        console.log('Monkey - ' + err);
	        return;
	      }

	      if (respObj.data.monkeyId == null) {
	        console.log('Monkey - no Monkey ID returned');
	        return;
	      }

	      if (isSync) {
	        console.log('Monkey - reusing Monkey ID : ' + this.session.id);

	        this.session.lastTimestamp = respObj.data.last_time_synced;
	        this.session.lastMessageId = respObj.data.last_message_id;

	        var decryptedAesKeys = this.session.exchangeKeys.decrypt(respObj.data.keys, 'utf8');

	        var myAesKeys = decryptedAesKeys.split(":");
	        this.session.myKey = myAesKeys[0];
	        this.session.myIv = myAesKeys[1];
	        //var myKeyParams=generateSessionKey();// generates local AES KEY
	        this.keyStore[monkeyId] = { key: this.session.myKey, iv: this.session.myIv };

	        this.startConnection(monkeyId);
	        return;
	      }

	      this.session.id = respObj.data.monkeyId;

	      var connectParams = { monkey_id: this.session.id };

	      this._getEmitter().emit('onSession', connectParams);

	      var myKeyParams = this.generateAndStoreAES(); // generates local AES KEY

	      var key = new NodeRSA(respObj.data.publicKey, 'public', { encryptionScheme: 'pkcs1' });
	      var encryptedAES = key.encrypt(myKeyParams, 'base64');

	      connectParams['usk'] = encryptedAES;

	      this.keyStore[this.session.id] = { key: this.session.myKey, iv: this.session.myIv };

	      this.basicRequest('POST', '/user/connect', connectParams, false, function (error, response) {
	        if (error) {
	          console.log('Monkey - ' + error);
	          return;
	        }
	        this.startConnection(this.session.id);
	      }.bind(this));
	    }.bind(this));
	  }; /// end of function requestSession

	  proto.subscribe = function subscribe(channel, callback) {
	    this.basicRequest('POST', '/channel/subscribe/' + channel, { monkey_id: this.session.id }, false, function (err, respObj) {
	      if (err) {
	        console.log('Monkey - ' + err);
	        return;
	      }
	      this._getEmitter().emit('onSubscribe', respObj);
	    }.bind(this));
	  };

	  proto.getAllConversations = function getAllConversations(onComplete) {
	    this.basicRequest('GET', '/user/' + this.session.id + '/conversations', {}, false, function (err, respObj) {
	      if (err) {
	        console.log('Monkey - FAIL TO GET ALL CONVERSATIONS');
	        onComplete(err.toString());
	        return;
	      }
	      console.log('Monkey - GET ALL CONVERSATIONS');
	      onComplete(null, respObj);
	    });
	  };

	  proto.getConversationMessages = function getConversationMessages(conversationId, numberOfMessages, lastMessageId, onComplete) {
	    if (lastMessageId == null) {
	      lastMessageId = '';
	    }

	    this.basicRequest('GET', '/conversation/messages/' + monkey.session.id + '/' + conversationId + '/' + numberOfMessages + '/' + lastMessageId, {}, false, function (err, respObj) {
	      if (err) {
	        console.log('FAIL TO GET CONVERSATION MESSAGES');
	        onComplete(err.toString());
	        return;
	      }
	      console.log('GET CONVERSATION MESSAGES');

	      var messages = respObj.data.messages;

	      var messagesArray = messages.reduce(function (result, message) {
	        var msg = new MOKMessage(MOKMessageProtocolCommand.MESSAGE, message);
	        result.push(msg);
	        return result;
	      }, []);

	      this.decryptBulkMessages(messagesArray, [], function (decryptedMessages) {
	        onComplete(null, decryptedMessages);
	      });
	    });
	  };

	  proto.getMessagesSince = function getMessagesSince(timestamp, onComplete) {
	    this.basicRequest('GET', '/user/' + this.session.id + '/messages/' + timestamp, {}, false, function (err, respObj) {
	      if (err) {
	        console.log('Monkey - FAIL TO GET MESSAGES');
	        onComplete(err.toString());
	        return;
	      }
	      console.log('Monkey - GET MESSAGES');
	      onComplete(null, respObj);
	    });
	  };

	  proto.downloadFile = function downloadFile(message, onComplete) {
	    this.basicRequest('GET', '/file/open/' + message.text + '/base64', {}, false, function (err, fileData) {
	      if (err) {
	        console.log('Monkey - Download File Fail');
	        onComplete(err.toString());
	        return;
	      }
	      console.log('Monkey - Download File OK');
	      this.decryptDownloadedFile(fileData, message, function (error, finalData) {
	        if (error) {
	          console.log('Monkey - Fail to decrypt downloaded file');
	          onComplete(error);
	          return;
	        }
	        onComplete(null, finalData);
	      });
	    });
	  }; /// end of function downloadFile

	  proto.postMessage = function postMessage(messageObj) {
	    this.basicRequest('POST', '/message/new', messageObj, false, function (err, respObj) {
	      if (err) {
	        console.log(err);
	        return;
	      }

	      if (parseInt(respObj.status) == 0) {
	        // now you can start the long polling calls or the websocket connection you are ready.
	        // we need to do a last validation here with an encrypted data that is sent from the server at this response, to validate keys are correct and the session too.
	        console.log("Message sent is " + JSON.stringify(respObj));
	        console.log("Message sent is " + respObj.data.messageId);
	      } else {
	        //throw error
	        console.log("Error in postMessage " + respObj.message);
	      }
	    });
	  };

	  proto.createGroup = function createGroup(members, groupInfo, optionalPush, optionalId, callback) {
	    //check if I'm already in the proposed members
	    if (members.indexOf(this.session.id) == -1) {
	      members.push(this.session.id);
	    }

	    var params = {
	      monkey_id: this.session.id,
	      members: members.join(),
	      info: groupInfo,
	      group_id: optionalId,
	      push_all_members: optionalPush
	    };

	    this.basicRequest('POST', '/group/create', params, false, function (err, respObj) {
	      if (err) {
	        console.log("Monkey - error creating group: " + err);
	        return callback(err);
	      }
	      console.log("Monkey - Success creating group" + respObj.data.group_id);

	      return callback(null, respObj.data);
	    });
	  };

	  proto.addMemberToGroup = function addMemberToGroup(groupId, newMemberId, optionalPushNewMember, optionalPushExistingMembers, callback) {
	    var params = {
	      monkey_id: this.session.id,
	      new_member: newMemberId,
	      group_id: groupId,
	      push_new_member: optionalPushNewMember,
	      push_all_members: optionalPushExistingMembers
	    };

	    this.basicRequest('POST', '/group/addmember', params, false, function (err, respObj) {
	      if (err) {
	        console.log('Monkey - error adding member: ' + err);
	        return callback(err);
	      }

	      return callback(null, respObj.data);
	    });
	  };

	  proto.removeMemberFromGroup = function removeMemberFromGroup(groupId, memberId, callback) {
	    this.basicRequest('POST', '/group/delete', { monkey_id: memberId, group_id: groupId }, false, function (err, respObj) {
	      if (err) {
	        console.log('Monkey - error removing member: ' + err);
	        return callback(err);
	      }

	      return callback(null, respObj.data);
	    });
	  };

	  proto.getInfoById = function getInfoById(monkeyId, callback) {
	    var endpoint = '/info/' + monkeyId;

	    //check if it's a group
	    if (monkeyId.indexOf("G:") > -1) {
	      endpoint = '/group' + endpoint;
	    } else {
	      endpoint = '/user' + endpoint;
	    }

	    this.basicRequest('GET', endpoint, {}, false, function (err, respObj) {
	      if (err) {
	        console.log('Monkey - error get info: ' + err);
	        return callback(err);
	      }

	      return callback(null, respObj.data);
	    });
	  };

	  proto.basicRequest = function basicRequest(method, endpoint, params, isFile, callback) {

	    var basic = this.getAuthParamsBtoA(this.appKey + ":" + this.appSecret);

	    var reqUrl = this.domainUrl + endpoint;

	    if (this.session.debuggingMode) {
	      reqUrl = 'http://' + reqUrl;
	    } else {
	      reqUrl = 'https://' + reqUrl;
	    }

	    var headersReq = {
	      'Accept': '*/*',
	      'Authorization': 'Basic ' + basic
	    };

	    var data = params;
	    //check if it's not file
	    if (!isFile) {
	      headersReq['Content-Type'] = 'application/json';
	      data = JSON.stringify({ data: JSON.stringify(params) });
	    }

	    fetch(reqUrl, {
	      method: method,
	      credentials: 'include',
	      headers: headersReq,
	      body: data
	    }).then(this.checkStatus).then(this.parseJSON).then(function (respObj) {
	      callback(null, respObj);
	    }).catch(function (error) {
	      callback(error);
	    }); // end of AJAX CALL
	  };

	  /*
	  * Utils
	  */

	  proto.generateStandardPush = function generateStandardPush(stringMessage) {
	    return {
	      "text": stringMessage,
	      "iosData": {
	        "alert": stringMessage,
	        "sound": "default"
	      },
	      "andData": {
	        "alert": stringMessage
	      }
	    };
	  };

	  proto.generateLocalizedPush = function generateLocalizedPush(locKey, locArgs, defaultText, sound) {
	    var localizedPush = {
	      "iosData": {
	        "alert": {
	          "loc-key": locKey,
	          "loc-args": locArgs
	        },
	        "sound": sound ? sound : "default"
	      },
	      "andData": {
	        "loc-key": locKey,
	        "loc-args": locArgs
	      }
	    };

	    if (defaultText) {
	      localizedPush.text = defaultText;
	    }

	    return localizedPush;
	  };

	  proto.checkStatus = function checkStatus(response) {
	    if (response.status >= 200 && response.status < 300) {
	      return response;
	    } else {
	      var error = new Error(response.statusText);
	      error.response = response;
	      throw error;
	    }
	  };

	  proto.parseJSON = function parseJSON(response) {
	    return response.json();
	  };

	  proto.mok_convertDataURIToBinary = function mok_convertDataURIToBinary(dataURI) {
	    var raw = window.atob(dataURI);
	    var rawLength = raw.length;
	    var array = new Uint8Array(new ArrayBuffer(rawLength));

	    for (var i = 0; i < rawLength; i++) {
	      array[i] = raw.charCodeAt(i);
	    }
	    return array;
	  };

	  proto.mok_arrayBufferToBase64 = function mok_arrayBufferToBase64(buffer) {
	    var binary = '';
	    var bytes = new Uint8Array(buffer);
	    var len = bytes.byteLength;
	    for (var i = 0; i < len; i++) {
	      binary += String.fromCharCode(bytes[i]);
	    }
	    return window.btoa(binary);
	  };

	  proto.cleanFilePrefix = function cleanFilePrefix(fileData) {
	    var cleanFileData = fileData;

	    //check for possible ;base64,
	    if (fileData.indexOf(",") > -1) {
	      cleanFileData = fileData.slice(fileData.indexOf(",") + 1);
	    }

	    return cleanFileData;
	  };

	  proto.mok_getFileExtension = function mok_getFileExtension(fileName) {
	    var arr = fileName.split('.');
	    var extension = arr[arr.length - 1];

	    return extension;
	  };

	  proto.getAuthParamsBtoA = function getAuthParamsBtoA(connectAuthParamsString) {

	    //window.btoa not supported in <=IE9
	    if (window.btoa) {
	      var basic = window.btoa(connectAuthParamsString);
	    } else {
	      //for <= IE9
	      var base64 = {};
	      base64.PADCHAR = '=';
	      base64.ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	      base64.makeDOMException = function () {
	        // sadly in FF,Safari,Chrome you can't make a DOMException
	        var e, tmp;

	        try {
	          return new DOMException(DOMException.INVALID_CHARACTER_ERR);
	        } catch (tmp) {
	          // not available, just passback a duck-typed equiv
	          // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error
	          // https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Error/prototype
	          var ex = new Error("DOM Exception 5");

	          // ex.number and ex.description is IE-specific.
	          ex.code = ex.number = 5;
	          ex.name = ex.description = "INVALID_CHARACTER_ERR";

	          // Safari/Chrome output format
	          ex.toString = function () {
	            return 'Error: ' + ex.name + ': ' + ex.message;
	          };
	          return ex;
	        }
	      };

	      base64.getbyte64 = function (s, i) {
	        // This is oddly fast, except on Chrome/V8.
	        //  Minimal or no improvement in performance by using a
	        //   object with properties mapping chars to value (eg. 'A': 0)
	        var idx = base64.ALPHA.indexOf(s.charAt(i));
	        if (idx === -1) {
	          throw base64.makeDOMException();
	        }
	        return idx;
	      };

	      base64.decode = function (s) {
	        // convert to string
	        s = '' + s;
	        var getbyte64 = base64.getbyte64;
	        var pads, i, b10;
	        var imax = s.length;
	        if (imax === 0) {
	          return s;
	        }

	        if (imax % 4 !== 0) {
	          throw base64.makeDOMException();
	        }

	        pads = 0;
	        if (s.charAt(imax - 1) === base64.PADCHAR) {
	          pads = 1;
	          if (s.charAt(imax - 2) === base64.PADCHAR) {
	            pads = 2;
	          }
	          // either way, we want to ignore this last block
	          imax -= 4;
	        }

	        var x = [];
	        for (i = 0; i < imax; i += 4) {
	          b10 = getbyte64(s, i) << 18 | getbyte64(s, i + 1) << 12 | getbyte64(s, i + 2) << 6 | getbyte64(s, i + 3);
	          x.push(String.fromCharCode(b10 >> 16, b10 >> 8 & 0xff, b10 & 0xff));
	        }

	        switch (pads) {
	          case 1:
	            b10 = getbyte64(s, i) << 18 | getbyte64(s, i + 1) << 12 | getbyte64(s, i + 2) << 6;
	            x.push(String.fromCharCode(b10 >> 16, b10 >> 8 & 0xff));
	            break;
	          case 2:
	            b10 = getbyte64(s, i) << 18 | getbyte64(s, i + 1) << 12;
	            x.push(String.fromCharCode(b10 >> 16));
	            break;
	        }
	        return x.join('');
	      };

	      base64.getbyte = function (s, i) {
	        var x = s.charCodeAt(i);
	        if (x > 255) {
	          throw base64.makeDOMException();
	        }
	        return x;
	      };

	      base64.encode = function (s) {
	        if (arguments.length !== 1) {
	          throw new SyntaxError("Not enough arguments");
	        }
	        var padchar = base64.PADCHAR;
	        var alpha = base64.ALPHA;
	        var getbyte = base64.getbyte;

	        var i, b10;
	        var x = [];

	        // convert to string
	        s = '' + s;

	        var imax = s.length - s.length % 3;

	        if (s.length === 0) {
	          return s;
	        }
	        for (i = 0; i < imax; i += 3) {
	          b10 = getbyte(s, i) << 16 | getbyte(s, i + 1) << 8 | getbyte(s, i + 2);
	          x.push(alpha.charAt(b10 >> 18));
	          x.push(alpha.charAt(b10 >> 12 & 0x3F));
	          x.push(alpha.charAt(b10 >> 6 & 0x3f));
	          x.push(alpha.charAt(b10 & 0x3f));
	        }
	        switch (s.length - imax) {
	          case 1:
	            b10 = getbyte(s, i) << 16;
	            x.push(alpha.charAt(b10 >> 18) + alpha.charAt(b10 >> 12 & 0x3F) + padchar + padchar);
	            break;
	          case 2:
	            b10 = getbyte(s, i) << 16 | getbyte(s, i + 1) << 8;
	            x.push(alpha.charAt(b10 >> 18) + alpha.charAt(b10 >> 12 & 0x3F) + alpha.charAt(b10 >> 6 & 0x3f) + padchar);
	            break;
	        }
	        return x.join('');
	      };
	      basic = base64.encode(connectAuthParamsString);
	    }

	    return basic;
	  };
	  /**
	  * Alias of addListener
	  */
	  // proto.on = alias('addListener');

	  /**
	  * Reverts the global {@link Monkey} to its previous value and returns a reference to this version.
	  *
	  * @return {Function} Non conflicting EventEmitter class.
	  */
	  Monkey.noConflict = function noConflict() {
	    exports.Monkey = originalGlobalValue;
	    return Monkey;
	  };

	  // Expose the class either via AMD, CommonJS or the global object
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return Monkey;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
	    module.exports = Monkey;
	  } else {
	    exports.Monkey = Monkey;
	  }
	})();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },
/* 1 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/*** IMPORTS FROM imports-loader ***/
	(function() {

	(function(self) {
	  'use strict';

	  if (self.fetch) {
	    return
	  }

	  function normalizeName(name) {
	    if (typeof name !== 'string') {
	      name = String(name)
	    }
	    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	      throw new TypeError('Invalid character in header field name')
	    }
	    return name.toLowerCase()
	  }

	  function normalizeValue(value) {
	    if (typeof value !== 'string') {
	      value = String(value)
	    }
	    return value
	  }

	  function Headers(headers) {
	    this.map = {}

	    if (headers instanceof Headers) {
	      headers.forEach(function(value, name) {
	        this.append(name, value)
	      }, this)

	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        this.append(name, headers[name])
	      }, this)
	    }
	  }

	  Headers.prototype.append = function(name, value) {
	    name = normalizeName(name)
	    value = normalizeValue(value)
	    var list = this.map[name]
	    if (!list) {
	      list = []
	      this.map[name] = list
	    }
	    list.push(value)
	  }

	  Headers.prototype['delete'] = function(name) {
	    delete this.map[normalizeName(name)]
	  }

	  Headers.prototype.get = function(name) {
	    var values = this.map[normalizeName(name)]
	    return values ? values[0] : null
	  }

	  Headers.prototype.getAll = function(name) {
	    return this.map[normalizeName(name)] || []
	  }

	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(normalizeName(name))
	  }

	  Headers.prototype.set = function(name, value) {
	    this.map[normalizeName(name)] = [normalizeValue(value)]
	  }

	  Headers.prototype.forEach = function(callback, thisArg) {
	    Object.getOwnPropertyNames(this.map).forEach(function(name) {
	      this.map[name].forEach(function(value) {
	        callback.call(thisArg, value, name, this)
	      }, this)
	    }, this)
	  }

	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true
	  }

	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result)
	      }
	      reader.onerror = function() {
	        reject(reader.error)
	      }
	    })
	  }

	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader()
	    reader.readAsArrayBuffer(blob)
	    return fileReaderReady(reader)
	  }

	  function readBlobAsText(blob) {
	    var reader = new FileReader()
	    reader.readAsText(blob)
	    return fileReaderReady(reader)
	  }

	  var support = {
	    blob: 'FileReader' in self && 'Blob' in self && (function() {
	      try {
	        new Blob();
	        return true
	      } catch(e) {
	        return false
	      }
	    })(),
	    formData: 'FormData' in self,
	    arrayBuffer: 'ArrayBuffer' in self
	  }

	  function Body() {
	    this.bodyUsed = false


	    this._initBody = function(body) {
	      this._bodyInit = body
	      if (typeof body === 'string') {
	        this._bodyText = body
	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	        this._bodyBlob = body
	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	        this._bodyFormData = body
	      } else if (!body) {
	        this._bodyText = ''
	      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
	        // Only support ArrayBuffers for POST method.
	        // Receiving ArrayBuffers happens via Blobs, instead.
	      } else {
	        throw new Error('unsupported BodyInit type')
	      }

	      if (!this.headers.get('content-type')) {
	        if (typeof body === 'string') {
	          this.headers.set('content-type', 'text/plain;charset=UTF-8')
	        } else if (this._bodyBlob && this._bodyBlob.type) {
	          this.headers.set('content-type', this._bodyBlob.type)
	        }
	      }
	    }

	    if (support.blob) {
	      this.blob = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      }

	      this.arrayBuffer = function() {
	        return this.blob().then(readBlobAsArrayBuffer)
	      }

	      this.text = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return readBlobAsText(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as text')
	        } else {
	          return Promise.resolve(this._bodyText)
	        }
	      }
	    } else {
	      this.text = function() {
	        var rejected = consumed(this)
	        return rejected ? rejected : Promise.resolve(this._bodyText)
	      }
	    }

	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      }
	    }

	    this.json = function() {
	      return this.text().then(JSON.parse)
	    }

	    return this
	  }

	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase()
	    return (methods.indexOf(upcased) > -1) ? upcased : method
	  }

	  function Request(input, options) {
	    options = options || {}
	    var body = options.body
	    if (Request.prototype.isPrototypeOf(input)) {
	      if (input.bodyUsed) {
	        throw new TypeError('Already read')
	      }
	      this.url = input.url
	      this.credentials = input.credentials
	      if (!options.headers) {
	        this.headers = new Headers(input.headers)
	      }
	      this.method = input.method
	      this.mode = input.mode
	      if (!body) {
	        body = input._bodyInit
	        input.bodyUsed = true
	      }
	    } else {
	      this.url = input
	    }

	    this.credentials = options.credentials || this.credentials || 'omit'
	    if (options.headers || !this.headers) {
	      this.headers = new Headers(options.headers)
	    }
	    this.method = normalizeMethod(options.method || this.method || 'GET')
	    this.mode = options.mode || this.mode || null
	    this.referrer = null

	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(body)
	  }

	  Request.prototype.clone = function() {
	    return new Request(this)
	  }

	  function decode(body) {
	    var form = new FormData()
	    body.trim().split('&').forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=')
	        var name = split.shift().replace(/\+/g, ' ')
	        var value = split.join('=').replace(/\+/g, ' ')
	        form.append(decodeURIComponent(name), decodeURIComponent(value))
	      }
	    })
	    return form
	  }

	  function headers(xhr) {
	    var head = new Headers()
	    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
	    pairs.forEach(function(header) {
	      var split = header.trim().split(':')
	      var key = split.shift().trim()
	      var value = split.join(':').trim()
	      head.append(key, value)
	    })
	    return head
	  }

	  Body.call(Request.prototype)

	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {}
	    }

	    this.type = 'default'
	    this.status = options.status
	    this.ok = this.status >= 200 && this.status < 300
	    this.statusText = options.statusText
	    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
	    this.url = options.url || ''
	    this._initBody(bodyInit)
	  }

	  Body.call(Response.prototype)

	  Response.prototype.clone = function() {
	    return new Response(this._bodyInit, {
	      status: this.status,
	      statusText: this.statusText,
	      headers: new Headers(this.headers),
	      url: this.url
	    })
	  }

	  Response.error = function() {
	    var response = new Response(null, {status: 0, statusText: ''})
	    response.type = 'error'
	    return response
	  }

	  var redirectStatuses = [301, 302, 303, 307, 308]

	  Response.redirect = function(url, status) {
	    if (redirectStatuses.indexOf(status) === -1) {
	      throw new RangeError('Invalid status code')
	    }

	    return new Response(null, {status: status, headers: {location: url}})
	  }

	  self.Headers = Headers;
	  self.Request = Request;
	  self.Response = Response;

	  self.fetch = function(input, init) {
	    return new Promise(function(resolve, reject) {
	      var request
	      if (Request.prototype.isPrototypeOf(input) && !init) {
	        request = input
	      } else {
	        request = new Request(input, init)
	      }

	      var xhr = new XMLHttpRequest()

	      function responseURL() {
	        if ('responseURL' in xhr) {
	          return xhr.responseURL
	        }

	        // Avoid security warnings on getResponseHeader when not allowed by CORS
	        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
	          return xhr.getResponseHeader('X-Request-URL')
	        }

	        return;
	      }

	      xhr.onload = function() {
	        var status = (xhr.status === 1223) ? 204 : xhr.status
	        if (status < 100 || status > 599) {
	          reject(new TypeError('Network request failed'))
	          return
	        }
	        var options = {
	          status: status,
	          statusText: xhr.statusText,
	          headers: headers(xhr),
	          url: responseURL()
	        }
	        var body = 'response' in xhr ? xhr.response : xhr.responseText;
	        resolve(new Response(body, options))
	      }

	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'))
	      }

	      xhr.open(request.method, request.url, true)

	      if (request.credentials === 'include') {
	        xhr.withCredentials = true
	      }

	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob'
	      }

	      request.headers.forEach(function(value, name) {
	        xhr.setRequestHeader(name, value)
	      })

	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
	    })
	  }
	  self.fetch.polyfill = true
	})(typeof self !== 'undefined' ? self : this);


	/*** EXPORTS FROM exports-loader ***/
	module.exports = global.fetch;
	}.call(global));
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      }
	      throw TypeError('Uncaught, unspecified "error" event.');
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;(function () {
	  'use strict';

	  /**
	  * Class for managing Monkey enums.
	  *
	  * @class MonkeyEnums Manages Monkey declared enums.
	  */
	  function MonkeyEnums() {}

	  // Shortcuts to improve speed and size
	  var proto = MonkeyEnums.prototype;

	  proto.Status = {
	    OFFLINE:0,
	    HANDSHAKE:1,
	    CONNECTING:2,
	    ONLINE:3
	  }

	  proto.MOKMessageProtocolCommand = {
	    MESSAGE:200,
	    GET:201,
	    TRANSACTION:202,
	    OPEN:203,
	    SET:204,
	    ACK:205,
	    PUBLISH:206,
	    DELETE:207,
	    CLOSE:208,
	    SYNC:209,
	    MESSAGENOTDELIVERED:50,
	    MESSAGEDELIVERED:51,
	    MESSAGEREAD:52
	  }

	  proto.MOKMessageType = {
	    TEXT:1,
	    FILE:2,
	    TEMP_NOTE:3,
	    NOTIF:4,
	    ALERT:5
	  }

	  proto.MOKMessageFileType = {
	    AUDIO:1,
	    VIDEO:2,
	    PHOTO:3,
	    ARCHIVE:4
	  }

	  proto.MOKGetType = {
	    HISTORY:1,
	    GROUPS:2
	  }

	  proto.MOKSyncType = {
	    HISTORY:1,
	    GROUPS:2
	  }
	  /**
	  * Alias of addListener
	  */
	  // proto.on = alias('addListener');

	  /**
	  * Reverts the global {@link Monkey} to its previous value and returns a reference to this version.
	  *
	  * @return {Function} Non conflicting EventEmitter class.
	  */
	  MonkeyEnums.noConflict = function noConflict() {
	    exports.MonkeyEnums = originalGlobalValue;
	    return MonkeyEnums;
	  };

	  // Expose the class either via AMD, CommonJS or the global object
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return MonkeyEnums;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	  else if (typeof module === 'object' && module.exports){
	    module.exports = MonkeyEnums;
	  }
	  else {
	    exports.MonkeyEnums = MonkeyEnums;
	  }
	})();


/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/*
	    Protocol Enums
	 */

	/*
	    Start Message class definition
	 */

	module.exports = function () {
	    function MOKMessage(command, args) {
	        _classCallCheck(this, MOKMessage);

	        if (args.app_id != null) {
	            this.app_id = args.app_id;
	        }
	        this.protocolCommand = command;
	        this.protocolType = parseInt(args.type);

	        this.senderId = args.sid;
	        this.recipientId = args.rid;

	        this.datetimeOrder = this.getCurrentTimestamp();
	        this.datetimeCreation = args.datetime == null ? this.datetimeOrder : args.datetime;

	        this.readByUser = false;

	        //parse props
	        if (args.props != null && typeof args.props != "undefined" && args.props != "") {
	            if (typeof args.props === "string") {
	                this.props = JSON.parse(args.props);
	            } else {
	                this.props = args.props;
	            }
	        } else {
	            this.props = { encr: 0 };
	        }

	        //parse params
	        if (args.params != null && args.params != "" && typeof args.params != "undefined") {
	            if (typeof args.params === "string") {
	                this.params = JSON.parse(args.params);
	            } else {
	                this.params = args.params;
	            }
	        }

	        //parse message id
	        if (args.id == null) {
	            //didn't come from the socket
	            this.id = this.generateRandomMessageId();
	            this.oldId = this.id;

	            this.props.old_id = this.id;
	        } else {
	            //it came from the socket
	            this.id = args.id;
	            this.oldId = this.props.old_id;
	        }

	        this.encryptedText = args.msg;
	        this.text = args.msg;

	        switch (command) {
	            case 205:
	                {
	                    this.buildAcknowledge(this.props);
	                    break;
	                }
	            default:
	                {
	                    break;
	                }
	        }
	    }

	    _createClass(MOKMessage, [{
	        key: "generateRandomMessageId",
	        value: function generateRandomMessageId() {
	            return Math.round(new Date().getTime() / 1000 * -1) + Math.random().toString(36).substring(14);
	        }
	    }, {
	        key: "getCurrentTimestamp",
	        value: function getCurrentTimestamp() {
	            return new Date().getTime() / 1000;
	        }
	    }, {
	        key: "buildAcknowledge",
	        value: function buildAcknowledge(props) {
	            if (typeof props.message_id != "undefined" || props.message_id != null) {
	                this.id = props.message_id;
	            }
	            if (typeof props.new_id != "undefined" || props.new_id != null) {
	                this.id = props.new_id;
	            }
	            if (typeof props.old_id != "undefined" || props.old_id != null) {
	                this.oldId = props.old_id;
	            }
	        }
	    }, {
	        key: "compressionMethod",
	        value: function compressionMethod() {
	            if (this.isCompressed) {
	                return this.props.cmpr;
	            }
	            return null;
	        }
	    }, {
	        key: "isCompressed",
	        value: function isCompressed() {
	            if (this.props == null || typeof this.props.cmpr == "undefined" || this.props.cmpr == null) {
	                console.log("MONKEY - props null");
	                return false;
	            }
	            return this.props.cmpr ? true : false;
	        }
	    }, {
	        key: "isEncrypted",
	        value: function isEncrypted() {
	            if (this.props == null || typeof this.props.encr == "undefined" || this.props.encr == null) {
	                console.log("MONKEY - props null");
	                return false;
	            }
	            return this.props.encr == 1 ? true : false;
	        }
	    }]);

	    return MOKMessage;
	}();

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*!
	 * RSA library for Node.js
	 *
	 * Copyright (c) 2014 rzcoder
	 * All Rights Reserved.
	 *
	 * License BSD
	 */

	var rsa = __webpack_require__(10);
	var crypt = __webpack_require__(13);
	var ber = __webpack_require__(38).Ber;
	var _ = __webpack_require__(11)._;
	var utils = __webpack_require__(11);
	var schemes = __webpack_require__(32);
	var formats = __webpack_require__(45);

	module.exports = (function () {
	    var SUPPORTED_HASH_ALGORITHMS = {
	        node10: ['md4', 'md5', 'ripemd160', 'sha', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512'],
	        node: ['md4', 'md5', 'ripemd160', 'sha', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512'],
	        iojs: ['md4', 'md5', 'ripemd160', 'sha', 'sha1', 'sha224', 'sha256', 'sha384', 'sha512'],
	        browser: ['md5', 'ripemd160', 'sha1', 'sha256', 'sha512']
	    };

	    var DEFAULT_ENCRYPTION_SCHEME = 'pkcs1_oaep';
	    var DEFAULT_SIGNING_SCHEME = 'pkcs1';

	    var DEFAULT_EXPORT_FORMAT = 'private';
	    var EXPORT_FORMAT_ALIASES = {
	        'private': 'pkcs1-private-pem',
	        'private-der': 'pkcs1-private-der',
	        'public': 'pkcs8-public-pem',
	        'public-der': 'pkcs8-public-der',
	    };

	    /**
	     * @param key {string|buffer|object} Key in PEM format, or data for generate key {b: bits, e: exponent}
	     * @constructor
	     */
	    function NodeRSA(key, format, options) {
	        if (!(this instanceof NodeRSA)) {
	            return new NodeRSA(key, format, options);
	        }

	        if (_.isObject(format)) {
	            options = format;
	            format = undefined;
	        }

	        this.$options = {
	            signingScheme: DEFAULT_SIGNING_SCHEME,
	            signingSchemeOptions: {
	                hash: 'sha256',
	                saltLength: null
	            },
	            encryptionScheme: DEFAULT_ENCRYPTION_SCHEME,
	            encryptionSchemeOptions: {
	                hash: 'sha1',
	                label: null
	            },
	            environment: utils.detectEnvironment(),
	            rsaUtils: this
	        };
	        this.keyPair = new rsa.Key();
	        this.$cache = {};

	        if (Buffer.isBuffer(key) || _.isString(key)) {
	            this.importKey(key, format);
	        } else if (_.isObject(key)) {
	            this.generateKeyPair(key.b, key.e);
	        }

	        this.setOptions(options);
	    }

	    /**
	     * Set and validate options for key instance
	     * @param options
	     */
	    NodeRSA.prototype.setOptions = function (options) {
	        options = options || {};
	        if (options.environment) {
	            this.$options.environment = options.environment;
	        }

	        if (options.signingScheme) {
	            if (_.isString(options.signingScheme)) {
	                var signingScheme = options.signingScheme.toLowerCase().split('-');
	                if (signingScheme.length == 1) {
	                    if (SUPPORTED_HASH_ALGORITHMS.node.indexOf(signingScheme[0]) > -1) {
	                        this.$options.signingSchemeOptions = {
	                            hash: signingScheme[0]
	                        };
	                        this.$options.signingScheme = DEFAULT_SIGNING_SCHEME;
	                    } else {
	                        this.$options.signingScheme = signingScheme[0];
	                        this.$options.signingSchemeOptions = {
	                            hash: null
	                        };
	                    }
	                } else {
	                    this.$options.signingSchemeOptions = {
	                        hash: signingScheme[1]
	                    };
	                    this.$options.signingScheme = signingScheme[0];
	                }
	            } else if (_.isObject(options.signingScheme)) {
	                this.$options.signingScheme = options.signingScheme.scheme || DEFAULT_SIGNING_SCHEME;
	                this.$options.signingSchemeOptions = _.omit(options.signingScheme, 'scheme');
	            }

	            if (!schemes.isSignature(this.$options.signingScheme)) {
	                throw Error('Unsupported signing scheme');
	            }

	            if (this.$options.signingSchemeOptions.hash &&
	                SUPPORTED_HASH_ALGORITHMS[this.$options.environment].indexOf(this.$options.signingSchemeOptions.hash) === -1) {
	                throw Error('Unsupported hashing algorithm for ' + this.$options.environment + ' environment');
	            }
	        }

	        if (options.encryptionScheme) {
	            if (_.isString(options.encryptionScheme)) {
	                this.$options.encryptionScheme = options.encryptionScheme.toLowerCase();
	                this.$options.encryptionSchemeOptions = {};
	            } else if (_.isObject(options.encryptionScheme)) {
	                this.$options.encryptionScheme = options.encryptionScheme.scheme || DEFAULT_ENCRYPTION_SCHEME;
	                this.$options.encryptionSchemeOptions = _.omit(options.encryptionScheme, 'scheme');
	            }

	            if (!schemes.isEncryption(this.$options.encryptionScheme)) {
	                throw Error('Unsupported encryption scheme');
	            }

	            if (this.$options.encryptionSchemeOptions.hash &&
	                SUPPORTED_HASH_ALGORITHMS[this.$options.environment].indexOf(this.$options.encryptionSchemeOptions.hash) === -1) {
	                throw Error('Unsupported hashing algorithm for ' + this.$options.environment + ' environment');
	            }
	        }

	        this.keyPair.setOptions(this.$options);
	    };

	    /**
	     * Generate private/public keys pair
	     *
	     * @param bits {int} length key in bits. Default 2048.
	     * @param exp {int} public exponent. Default 65537.
	     * @returns {NodeRSA}
	     */
	    NodeRSA.prototype.generateKeyPair = function (bits, exp) {
	        bits = bits || 2048;
	        exp = exp || 65537;

	        if (bits % 8 !== 0) {
	            throw Error('Key size must be a multiple of 8.');
	        }

	        this.keyPair.generate(bits, exp.toString(16));
	        this.$cache = {};
	        return this;
	    };

	    /**
	     * Importing key
	     * @param keyData {string|buffer|Object}
	     * @param format {string}
	     */
	    NodeRSA.prototype.importKey = function (keyData, format) {
	        if (!keyData) {
	            throw Error("Empty key given");
	        }

	        if (format) {
	            format = EXPORT_FORMAT_ALIASES[format] || format;
	        }

	        if (!formats.detectAndImport(this.keyPair, keyData, format) && format === undefined) {
	            throw Error("Key format must be specified");
	        }

	        this.$cache = {};
	    };

	    /**
	     * Exporting key
	     * @param [format] {string}
	     */
	    NodeRSA.prototype.exportKey = function (format) {
	        format = format || DEFAULT_EXPORT_FORMAT;
	        format = EXPORT_FORMAT_ALIASES[format] || format;

	        if (!this.$cache[format]) {
	            this.$cache[format] = formats.detectAndExport(this.keyPair, format);
	        }

	        return this.$cache[format];
	    };

	    /**
	     * Check if key pair contains private key
	     */
	    NodeRSA.prototype.isPrivate = function () {
	        return this.keyPair.isPrivate();
	    };

	    /**
	     * Check if key pair contains public key
	     * @param [strict] {boolean} - public key only, return false if have private exponent
	     */
	    NodeRSA.prototype.isPublic = function (strict) {
	        return this.keyPair.isPublic(strict);
	    };

	    /**
	     * Check if key pair doesn't contains any data
	     */
	    NodeRSA.prototype.isEmpty = function (strict) {
	        return !(this.keyPair.n || this.keyPair.e || this.keyPair.d);
	    };

	    /**
	     * Encrypting data method with public key
	     *
	     * @param buffer {string|number|object|array|Buffer} - data for encrypting. Object and array will convert to JSON string.
	     * @param encoding {string} - optional. Encoding for output result, may be 'buffer', 'binary', 'hex' or 'base64'. Default 'buffer'.
	     * @param source_encoding {string} - optional. Encoding for given string. Default utf8.
	     * @returns {string|Buffer}
	     */
	    NodeRSA.prototype.encrypt = function (buffer, encoding, source_encoding) {
	        return this.$$encryptKey(false, buffer, encoding, source_encoding);
	    };

	    /**
	     * Decrypting data method with private key
	     *
	     * @param buffer {Buffer} - buffer for decrypting
	     * @param encoding - encoding for result string, can also take 'json' or 'buffer' for the automatic conversion of this type
	     * @returns {Buffer|object|string}
	     */
	    NodeRSA.prototype.decrypt = function (buffer, encoding) {
	        return this.$$decryptKey(false, buffer, encoding);
	    };

	    /**
	     * Encrypting data method with private key
	     *
	     * Parameters same as `encrypt` method
	     */
	    NodeRSA.prototype.encryptPrivate = function (buffer, encoding, source_encoding) {
	        return this.$$encryptKey(true, buffer, encoding, source_encoding);
	    };

	    /**
	     * Decrypting data method with public key
	     *
	     * Parameters same as `decrypt` method
	     */
	    NodeRSA.prototype.decryptPublic = function (buffer, encoding) {
	        return this.$$decryptKey(true, buffer, encoding);
	    };

	    /**
	     * Encrypting data method with custom key
	     */
	    NodeRSA.prototype.$$encryptKey = function (usePrivate, buffer, encoding, source_encoding) {
	        try {
	            var res = this.keyPair.encrypt(this.$getDataForEncrypt(buffer, source_encoding), usePrivate);

	            if (encoding == 'buffer' || !encoding) {
	                return res;
	            } else {
	                return res.toString(encoding);
	            }
	        } catch (e) {
	            throw Error('Error during encryption. Original error: ' + e);
	        }
	    };

	    /**
	     * Decrypting data method with custom key
	     */
	    NodeRSA.prototype.$$decryptKey = function (usePublic, buffer, encoding) {
	        try {
	            buffer = _.isString(buffer) ? new Buffer(buffer, 'base64') : buffer;
	            var res = this.keyPair.decrypt(buffer, usePublic);

	            if (res === null) {
	                throw Error('Key decrypt method returns null.');
	            }

	            return this.$getDecryptedData(res, encoding);
	        } catch (e) {
	            throw Error('Error during decryption (probably incorrect key). Original error: ' + e);
	        }
	    };

	    /**
	     *  Signing data
	     *
	     * @param buffer {string|number|object|array|Buffer} - data for signing. Object and array will convert to JSON string.
	     * @param encoding {string} - optional. Encoding for output result, may be 'buffer', 'binary', 'hex' or 'base64'. Default 'buffer'.
	     * @param source_encoding {string} - optional. Encoding for given string. Default utf8.
	     * @returns {string|Buffer}
	     */
	    NodeRSA.prototype.sign = function (buffer, encoding, source_encoding) {
	        if (!this.isPrivate()) {
	            throw Error("This is not private key");
	        }

	        var res = this.keyPair.sign(this.$getDataForEncrypt(buffer, source_encoding));

	        if (encoding && encoding != 'buffer') {
	            res = res.toString(encoding);
	        }

	        return res;
	    };

	    /**
	     *  Verifying signed data
	     *
	     * @param buffer - signed data
	     * @param signature
	     * @param source_encoding {string} - optional. Encoding for given string. Default utf8.
	     * @param signature_encoding - optional. Encoding of given signature. May be 'buffer', 'binary', 'hex' or 'base64'. Default 'buffer'.
	     * @returns {*}
	     */
	    NodeRSA.prototype.verify = function (buffer, signature, source_encoding, signature_encoding) {
	        if (!this.isPublic()) {
	            throw Error("This is not public key");
	        }
	        signature_encoding = (!signature_encoding || signature_encoding == 'buffer' ? null : signature_encoding);
	        return this.keyPair.verify(this.$getDataForEncrypt(buffer, source_encoding), signature, signature_encoding);
	    };

	    /**
	     * Returns key size in bits
	     * @returns {int}
	     */
	    NodeRSA.prototype.getKeySize = function () {
	        return this.keyPair.keySize;
	    };

	    /**
	     * Returns max message length in bytes (for 1 chunk) depending on current encryption scheme
	     * @returns {int}
	     */
	    NodeRSA.prototype.getMaxMessageSize = function () {
	        return this.keyPair.maxMessageLength;
	    };

	    /**
	     * Preparing given data for encrypting/signing. Just make new/return Buffer object.
	     *
	     * @param buffer {string|number|object|array|Buffer} - data for encrypting. Object and array will convert to JSON string.
	     * @param encoding {string} - optional. Encoding for given string. Default utf8.
	     * @returns {Buffer}
	     */
	    NodeRSA.prototype.$getDataForEncrypt = function (buffer, encoding) {
	        if (_.isString(buffer) || _.isNumber(buffer)) {
	            return new Buffer('' + buffer, encoding || 'utf8');
	        } else if (Buffer.isBuffer(buffer)) {
	            return buffer;
	        } else if (_.isObject(buffer)) {
	            return new Buffer(JSON.stringify(buffer));
	        } else {
	            throw Error("Unexpected data type");
	        }
	    };

	    /**
	     *
	     * @param buffer {Buffer} - decrypted data.
	     * @param encoding - optional. Encoding for result output. May be 'buffer', 'json' or any of Node.js Buffer supported encoding.
	     * @returns {*}
	     */
	    NodeRSA.prototype.$getDecryptedData = function (buffer, encoding) {
	        encoding = encoding || 'buffer';

	        if (encoding == 'buffer') {
	            return buffer;
	        } else if (encoding == 'json') {
	            return JSON.parse(buffer.toString());
	        } else {
	            return buffer.toString(encoding);
	        }
	    };

	    return NodeRSA;
	})();

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer, global) {/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */
	/* eslint-disable no-proto */

	'use strict'

	var base64 = __webpack_require__(7)
	var ieee754 = __webpack_require__(8)
	var isArray = __webpack_require__(9)

	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50
	Buffer.poolSize = 8192 // not used by this implementation

	var rootParent = {}

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
	 *     on objects.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	  ? global.TYPED_ARRAY_SUPPORT
	  : typedArraySupport()

	function typedArraySupport () {
	  function Bar () {}
	  try {
	    var arr = new Uint8Array(1)
	    arr.foo = function () { return 42 }
	    arr.constructor = Bar
	    return arr.foo() === 42 && // typed array instances can be augmented
	        arr.constructor === Bar && // constructor can be set
	        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	  } catch (e) {
	    return false
	  }
	}

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	/**
	 * Class: Buffer
	 * =============
	 *
	 * The Buffer constructor returns instances of `Uint8Array` that are augmented
	 * with function properties for all the node `Buffer` API functions. We use
	 * `Uint8Array` so that square bracket notation works as expected -- it returns
	 * a single octet.
	 *
	 * By augmenting the instances, we can avoid modifying the `Uint8Array`
	 * prototype.
	 */
	function Buffer (arg) {
	  if (!(this instanceof Buffer)) {
	    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
	    if (arguments.length > 1) return new Buffer(arg, arguments[1])
	    return new Buffer(arg)
	  }

	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    this.length = 0
	    this.parent = undefined
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    return fromNumber(this, arg)
	  }

	  // Slightly less common case.
	  if (typeof arg === 'string') {
	    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
	  }

	  // Unusual.
	  return fromObject(this, arg)
	}

	function fromNumber (that, length) {
	  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < length; i++) {
	      that[i] = 0
	    }
	  }
	  return that
	}

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

	  // Assumption: byteLength() return value is always < kMaxLength.
	  var length = byteLength(string, encoding) | 0
	  that = allocate(that, length)

	  that.write(string, encoding)
	  return that
	}

	function fromObject (that, object) {
	  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

	  if (isArray(object)) return fromArray(that, object)

	  if (object == null) {
	    throw new TypeError('must start with number, buffer, array or string')
	  }

	  if (typeof ArrayBuffer !== 'undefined') {
	    if (object.buffer instanceof ArrayBuffer) {
	      return fromTypedArray(that, object)
	    }
	    if (object instanceof ArrayBuffer) {
	      return fromArrayBuffer(that, object)
	    }
	  }

	  if (object.length) return fromArrayLike(that, object)

	  return fromJsonObject(that, object)
	}

	function fromBuffer (that, buffer) {
	  var length = checked(buffer.length) | 0
	  that = allocate(that, length)
	  buffer.copy(that, 0, 0, length)
	  return that
	}

	function fromArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Duplicate of fromArray() to keep fromArray() monomorphic.
	function fromTypedArray (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  // Truncating the elements is probably not what people expect from typed
	  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
	  // of the old Buffer constructor.
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	function fromArrayBuffer (that, array) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    array.byteLength
	    that = Buffer._augment(new Uint8Array(array))
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromTypedArray(that, new Uint8Array(array))
	  }
	  return that
	}

	function fromArrayLike (that, array) {
	  var length = checked(array.length) | 0
	  that = allocate(that, length)
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
	// Returns a zero-length buffer for inputs that don't conform to the spec.
	function fromJsonObject (that, object) {
	  var array
	  var length = 0

	  if (object.type === 'Buffer' && isArray(object.data)) {
	    array = object.data
	    length = checked(array.length) | 0
	  }
	  that = allocate(that, length)

	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255
	  }
	  return that
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype
	  Buffer.__proto__ = Uint8Array
	} else {
	  // pre-set for values that may exist in the future
	  Buffer.prototype.length = undefined
	  Buffer.prototype.parent = undefined
	}

	function allocate (that, length) {
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = Buffer._augment(new Uint8Array(length))
	    that.__proto__ = Buffer.prototype
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that.length = length
	    that._isBuffer = true
	  }

	  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
	  if (fromPool) that.parent = rootParent

	  return that
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (subject, encoding) {
	  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

	  var buf = new Buffer(subject, encoding)
	  delete buf.parent
	  return buf
	}

	Buffer.isBuffer = function isBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length
	  var y = b.length

	  var i = 0
	  var len = Math.min(x, y)
	  while (i < len) {
	    if (a[i] !== b[i]) break

	    ++i
	  }

	  if (i !== len) {
	    x = a[i]
	    y = b[i]
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'binary':
	    case 'base64':
	    case 'raw':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	}

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

	  if (list.length === 0) {
	    return new Buffer(0)
	  }

	  var i
	  if (length === undefined) {
	    length = 0
	    for (i = 0; i < list.length; i++) {
	      length += list[i].length
	    }
	  }

	  var buf = new Buffer(length)
	  var pos = 0
	  for (i = 0; i < list.length; i++) {
	    var item = list[i]
	    item.copy(buf, pos)
	    pos += item.length
	  }
	  return buf
	}

	function byteLength (string, encoding) {
	  if (typeof string !== 'string') string = '' + string

	  var len = string.length
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'binary':
	      // Deprecated
	      case 'raw':
	      case 'raws':
	        return len
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	  var loweredCase = false

	  start = start | 0
	  end = end === undefined || end === Infinity ? this.length : end | 0

	  if (!encoding) encoding = 'utf8'
	  if (start < 0) start = 0
	  if (end > this.length) end = this.length
	  if (end <= start) return ''

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'binary':
	        return binarySlice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	  var str = ''
	  var max = exports.INSPECT_MAX_BYTES
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	    if (this.length > max) str += ' ... '
	  }
	  return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return 0
	  return Buffer.compare(this, b)
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
	  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
	  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
	  byteOffset >>= 0

	  if (this.length === 0) return -1
	  if (byteOffset >= this.length) return -1

	  // Negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	  if (typeof val === 'string') {
	    if (val.length === 0) return -1 // special case: looking for empty string always fails
	    return String.prototype.indexOf.call(this, val, byteOffset)
	  }
	  if (Buffer.isBuffer(val)) {
	    return arrayIndexOf(this, val, byteOffset)
	  }
	  if (typeof val === 'number') {
	    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	    }
	    return arrayIndexOf(this, [ val ], byteOffset)
	  }

	  function arrayIndexOf (arr, val, byteOffset) {
	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arr.length; i++) {
	      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
	        if (foundIndex === -1) foundIndex = i
	        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
	      } else {
	        foundIndex = -1
	      }
	    }
	    return -1
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	// `get` is deprecated
	Buffer.prototype.get = function get (offset) {
	  console.log('.get() is deprecated. Access using array indexes instead.')
	  return this.readUInt8(offset)
	}

	// `set` is deprecated
	Buffer.prototype.set = function set (v, offset) {
	  console.log('.set() is deprecated. Access using array indexes instead.')
	  return this.writeUInt8(v, offset)
	}

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0
	  var remaining = buf.length - offset
	  if (!length) {
	    length = remaining
	  } else {
	    length = Number(length)
	    if (length > remaining) {
	      length = remaining
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length
	  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2
	  }
	  for (var i = 0; i < length; i++) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16)
	    if (isNaN(parsed)) throw new Error('Invalid hex string')
	    buf[offset + i] = parsed
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8'
	    length = this.length
	    offset = 0
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset
	    length = this.length
	    offset = 0
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0
	    if (isFinite(length)) {
	      length = length | 0
	      if (encoding === undefined) encoding = 'utf8'
	    } else {
	      encoding = length
	      length = undefined
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    var swap = encoding
	    encoding = offset
	    offset = length | 0
	    length = swap
	  }

	  var remaining = this.length - offset
	  if (length === undefined || length > remaining) length = remaining

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8'

	  var loweredCase = false
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'binary':
	        return binaryWrite(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase()
	        loweredCase = true
	    }
	  }
	}

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	}

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf)
	  } else {
	    return base64.fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end)
	  var res = []

	  var i = start
	  while (i < end) {
	    var firstByte = buf[i]
	    var codePoint = null
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1]
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1]
	          thirdByte = buf[i + 2]
	          fourthByte = buf[i + 3]
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD
	      bytesPerSequence = 1
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	      codePoint = 0xDC00 | codePoint & 0x3FF
	    }

	    res.push(codePoint)
	    i += bytesPerSequence
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = ''
	  var i = 0
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    )
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i] & 0x7F)
	  }
	  return ret
	}

	function binarySlice (buf, start, end) {
	  var ret = ''
	  end = Math.min(buf.length, end)

	  for (var i = start; i < end; i++) {
	    ret += String.fromCharCode(buf[i])
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length

	  if (!start || start < 0) start = 0
	  if (!end || end < 0 || end > len) end = len

	  var out = ''
	  for (var i = start; i < end; i++) {
	    out += toHex(buf[i])
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end)
	  var res = ''
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length
	  start = ~~start
	  end = end === undefined ? len : ~~end

	  if (start < 0) {
	    start += len
	    if (start < 0) start = 0
	  } else if (start > len) {
	    start = len
	  }

	  if (end < 0) {
	    end += len
	    if (end < 0) end = 0
	  } else if (end > len) {
	    end = len
	  }

	  if (end < start) end = start

	  var newBuf
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = Buffer._augment(this.subarray(start, end))
	  } else {
	    var sliceLen = end - start
	    newBuf = new Buffer(sliceLen, undefined)
	    for (var i = 0; i < sliceLen; i++) {
	      newBuf[i] = this[i + start]
	    }
	  }

	  if (newBuf.length) newBuf.parent = this.parent || this

	  return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }

	  return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length)
	  }

	  var val = this[offset + --byteLength]
	  var mul = 1
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul
	  }

	  return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var val = this[offset]
	  var mul = 1
	  var i = 0
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkOffset(offset, byteLength, this.length)

	  var i = byteLength
	  var mul = 1
	  var val = this[offset + --i]
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul
	  }
	  mul *= 0x80

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	  return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length)
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset] | (this[offset + 1] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length)
	  var val = this[offset + 1] | (this[offset] << 8)
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length)
	  return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length)
	  return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var mul = 1
	  var i = 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  byteLength = byteLength | 0
	  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

	  var i = byteLength - 1
	  var mul = 1
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 1] = (value >>> 8)
	    this[offset] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = 0
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset] = value & 0xFF
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1)

	    checkInt(this, value, offset, byteLength, limit - 1, -limit)
	  }

	  var i = byteLength - 1
	  var mul = 1
	  var sub = value < 0 ? 1 : 0
	  this[offset + i] = value & 0xFF
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	  }

	  return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	  if (value < 0) value = 0xff + value + 1
	  this[offset] = (value & 0xff)
	  return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	  } else {
	    objectWriteUInt16(this, value, offset, true)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8)
	    this[offset + 1] = (value & 0xff)
	  } else {
	    objectWriteUInt16(this, value, offset, false)
	  }
	  return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff)
	    this[offset + 1] = (value >>> 8)
	    this[offset + 2] = (value >>> 16)
	    this[offset + 3] = (value >>> 24)
	  } else {
	    objectWriteUInt32(this, value, offset, true)
	  }
	  return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value
	  offset = offset | 0
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	  if (value < 0) value = 0xffffffff + value + 1
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24)
	    this[offset + 1] = (value >>> 16)
	    this[offset + 2] = (value >>> 8)
	    this[offset + 3] = (value & 0xff)
	  } else {
	    objectWriteUInt32(this, value, offset, false)
	  }
	  return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (value > max || value < min) throw new RangeError('value is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('index out of range')
	  if (offset < 0) throw new RangeError('index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 23, 4)
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	  }
	  ieee754.write(buf, value, offset, littleEndian, 52, 8)
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0
	  if (!end && end !== 0) end = this.length
	  if (targetStart >= target.length) targetStart = target.length
	  if (!targetStart) targetStart = 0
	  if (end > 0 && end < start) end = start

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start
	  }

	  var len = end - start
	  var i

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; i--) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; i++) {
	      target[i + targetStart] = this[i + start]
	    }
	  } else {
	    target._set(this.subarray(start, start + len), targetStart)
	  }

	  return len
	}

	// fill(value, start=0, end=buffer.length)
	Buffer.prototype.fill = function fill (value, start, end) {
	  if (!value) value = 0
	  if (!start) start = 0
	  if (!end) end = this.length

	  if (end < start) throw new RangeError('end < start')

	  // Fill 0 bytes; we're done
	  if (end === start) return
	  if (this.length === 0) return

	  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
	  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

	  var i
	  if (typeof value === 'number') {
	    for (i = start; i < end; i++) {
	      this[i] = value
	    }
	  } else {
	    var bytes = utf8ToBytes(value.toString())
	    var len = bytes.length
	    for (i = start; i < end; i++) {
	      this[i] = bytes[i % len]
	    }
	  }

	  return this
	}

	/**
	 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
	 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
	 */
	Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
	  if (typeof Uint8Array !== 'undefined') {
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	      return (new Buffer(this)).buffer
	    } else {
	      var buf = new Uint8Array(this.length)
	      for (var i = 0, len = buf.length; i < len; i += 1) {
	        buf[i] = this[i]
	      }
	      return buf.buffer
	    }
	  } else {
	    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
	  }
	}

	// HELPER FUNCTIONS
	// ================

	var BP = Buffer.prototype

	/**
	 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
	 */
	Buffer._augment = function _augment (arr) {
	  arr.constructor = Buffer
	  arr._isBuffer = true

	  // save reference to original Uint8Array set method before overwriting
	  arr._set = arr.set

	  // deprecated
	  arr.get = BP.get
	  arr.set = BP.set

	  arr.write = BP.write
	  arr.toString = BP.toString
	  arr.toLocaleString = BP.toString
	  arr.toJSON = BP.toJSON
	  arr.equals = BP.equals
	  arr.compare = BP.compare
	  arr.indexOf = BP.indexOf
	  arr.copy = BP.copy
	  arr.slice = BP.slice
	  arr.readUIntLE = BP.readUIntLE
	  arr.readUIntBE = BP.readUIntBE
	  arr.readUInt8 = BP.readUInt8
	  arr.readUInt16LE = BP.readUInt16LE
	  arr.readUInt16BE = BP.readUInt16BE
	  arr.readUInt32LE = BP.readUInt32LE
	  arr.readUInt32BE = BP.readUInt32BE
	  arr.readIntLE = BP.readIntLE
	  arr.readIntBE = BP.readIntBE
	  arr.readInt8 = BP.readInt8
	  arr.readInt16LE = BP.readInt16LE
	  arr.readInt16BE = BP.readInt16BE
	  arr.readInt32LE = BP.readInt32LE
	  arr.readInt32BE = BP.readInt32BE
	  arr.readFloatLE = BP.readFloatLE
	  arr.readFloatBE = BP.readFloatBE
	  arr.readDoubleLE = BP.readDoubleLE
	  arr.readDoubleBE = BP.readDoubleBE
	  arr.writeUInt8 = BP.writeUInt8
	  arr.writeUIntLE = BP.writeUIntLE
	  arr.writeUIntBE = BP.writeUIntBE
	  arr.writeUInt16LE = BP.writeUInt16LE
	  arr.writeUInt16BE = BP.writeUInt16BE
	  arr.writeUInt32LE = BP.writeUInt32LE
	  arr.writeUInt32BE = BP.writeUInt32BE
	  arr.writeIntLE = BP.writeIntLE
	  arr.writeIntBE = BP.writeIntBE
	  arr.writeInt8 = BP.writeInt8
	  arr.writeInt16LE = BP.writeInt16LE
	  arr.writeInt16BE = BP.writeInt16BE
	  arr.writeInt32LE = BP.writeInt32LE
	  arr.writeInt32BE = BP.writeInt32BE
	  arr.writeFloatLE = BP.writeFloatLE
	  arr.writeFloatBE = BP.writeFloatBE
	  arr.writeDoubleLE = BP.writeDoubleLE
	  arr.writeDoubleBE = BP.writeDoubleBE
	  arr.fill = BP.fill
	  arr.inspect = BP.inspect
	  arr.toArrayBuffer = BP.toArrayBuffer

	  return arr
	}

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '='
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity
	  var codePoint
	  var length = string.length
	  var leadSurrogate = null
	  var bytes = []

	  for (var i = 0; i < length; i++) {
	    codePoint = string.charCodeAt(i)

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        leadSurrogate = codePoint
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	    }

	    leadSurrogate = null

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint)
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      )
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF)
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo
	  var byteArray = []
	  for (var i = 0; i < str.length; i++) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i)
	    hi = c >> 8
	    lo = c % 256
	    byteArray.push(lo)
	    byteArray.push(hi)
	  }

	  return byteArray
	}

	function base64ToBytes (str) {
	  return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; i++) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i]
	  }
	  return i
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer, (function() { return this; }())))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	;(function (exports) {
		'use strict';

	  var Arr = (typeof Uint8Array !== 'undefined')
	    ? Uint8Array
	    : Array

		var PLUS   = '+'.charCodeAt(0)
		var SLASH  = '/'.charCodeAt(0)
		var NUMBER = '0'.charCodeAt(0)
		var LOWER  = 'a'.charCodeAt(0)
		var UPPER  = 'A'.charCodeAt(0)
		var PLUS_URL_SAFE = '-'.charCodeAt(0)
		var SLASH_URL_SAFE = '_'.charCodeAt(0)

		function decode (elt) {
			var code = elt.charCodeAt(0)
			if (code === PLUS ||
			    code === PLUS_URL_SAFE)
				return 62 // '+'
			if (code === SLASH ||
			    code === SLASH_URL_SAFE)
				return 63 // '/'
			if (code < NUMBER)
				return -1 //no match
			if (code < NUMBER + 10)
				return code - NUMBER + 26 + 26
			if (code < UPPER + 26)
				return code - UPPER
			if (code < LOWER + 26)
				return code - LOWER + 26
		}

		function b64ToByteArray (b64) {
			var i, j, l, tmp, placeHolders, arr

			if (b64.length % 4 > 0) {
				throw new Error('Invalid string. Length must be a multiple of 4')
			}

			// the number of equal signs (place holders)
			// if there are two placeholders, than the two characters before it
			// represent one byte
			// if there is only one, then the three characters before it represent 2 bytes
			// this is just a cheap hack to not do indexOf twice
			var len = b64.length
			placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

			// base64 is 4/3 + up to two characters of the original data
			arr = new Arr(b64.length * 3 / 4 - placeHolders)

			// if there are placeholders, only get up to the last complete 4 chars
			l = placeHolders > 0 ? b64.length - 4 : b64.length

			var L = 0

			function push (v) {
				arr[L++] = v
			}

			for (i = 0, j = 0; i < l; i += 4, j += 3) {
				tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
				push((tmp & 0xFF0000) >> 16)
				push((tmp & 0xFF00) >> 8)
				push(tmp & 0xFF)
			}

			if (placeHolders === 2) {
				tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
				push(tmp & 0xFF)
			} else if (placeHolders === 1) {
				tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
				push((tmp >> 8) & 0xFF)
				push(tmp & 0xFF)
			}

			return arr
		}

		function uint8ToBase64 (uint8) {
			var i,
				extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
				output = "",
				temp, length

			function encode (num) {
				return lookup.charAt(num)
			}

			function tripletToBase64 (num) {
				return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
			}

			// go through the array every three bytes, we'll deal with trailing stuff later
			for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
				temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
				output += tripletToBase64(temp)
			}

			// pad the end with zeros, but make sure to not forget the extra bytes
			switch (extraBytes) {
				case 1:
					temp = uint8[uint8.length - 1]
					output += encode(temp >> 2)
					output += encode((temp << 4) & 0x3F)
					output += '=='
					break
				case 2:
					temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
					output += encode(temp >> 10)
					output += encode((temp >> 4) & 0x3F)
					output += encode((temp << 2) & 0x3F)
					output += '='
					break
			}

			return output
		}

		exports.toByteArray = b64ToByteArray
		exports.fromByteArray = uint8ToBase64
	}( false ? (this.base64js = {}) : exports))


/***/ },
/* 8 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 9 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*
	 * RSA Encryption / Decryption with PKCS1 v2 Padding.
	 * 
	 * Copyright (c) 2003-2005  Tom Wu
	 * All Rights Reserved.
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining
	 * a copy of this software and associated documentation files (the
	 * "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish,
	 * distribute, sublicense, and/or sell copies of the Software, and to
	 * permit persons to whom the Software is furnished to do so, subject to
	 * the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be
	 * included in all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
	 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
	 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
	 *
	 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
	 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
	 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
	 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
	 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
	 *
	 * In addition, the following condition applies:
	 *
	 * All redistributions must retain an intact copy of this copyright notice
	 * and disclaimer.
	 */

	/*
	 * Node.js adaptation
	 * long message support implementation
	 * signing/verifying
	 *
	 * 2014 rzcoder
	 */

	var _ = __webpack_require__(11)._;
	var crypt = __webpack_require__(13);
	var BigInteger = __webpack_require__(31);
	var utils = __webpack_require__(11);
	var schemes = __webpack_require__(32);
	var encryptEngines = __webpack_require__(36);

	exports.BigInteger = BigInteger;
	module.exports.Key = (function () {
	    /**
	     * RSA key constructor
	     *
	     * n - modulus
	     * e - publicExponent
	     * d - privateExponent
	     * p - prime1
	     * q - prime2
	     * dmp1 - exponent1 -- d mod (p1)
	     * dmq1 - exponent2 -- d mod (q-1)
	     * coeff - coefficient -- (inverse of q) mod p
	     */
	    function RSAKey() {
	        this.n = null;
	        this.e = 0;
	        this.d = null;
	        this.p = null;
	        this.q = null;
	        this.dmp1 = null;
	        this.dmq1 = null;
	        this.coeff = null;
	    }

	    RSAKey.prototype.setOptions = function (options) {
	        var signingSchemeProvider = schemes[options.signingScheme];
	        var encryptionSchemeProvider = schemes[options.encryptionScheme];

	        if (signingSchemeProvider === encryptionSchemeProvider) {
	            this.signingScheme = this.encryptionScheme = encryptionSchemeProvider.makeScheme(this, options);
	        } else {
	            this.encryptionScheme = encryptionSchemeProvider.makeScheme(this, options);
	            this.signingScheme = signingSchemeProvider.makeScheme(this, options);
	        }

	        this.encryptEngine = encryptEngines.getEngine(this, options);
	    };

	    /**
	     * Generate a new random private key B bits long, using public expt E
	     * @param B
	     * @param E
	     */
	    RSAKey.prototype.generate = function (B, E) {
	        var qs = B >> 1;
	        this.e = parseInt(E, 16);
	        var ee = new BigInteger(E, 16);
	        while (true) {
	            while (true) {
	                this.p = new BigInteger(B - qs, 1);
	                if (this.p.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) === 0 && this.p.isProbablePrime(10))
	                    break;
	            }
	            while (true) {
	                this.q = new BigInteger(qs, 1);
	                if (this.q.subtract(BigInteger.ONE).gcd(ee).compareTo(BigInteger.ONE) === 0 && this.q.isProbablePrime(10))
	                    break;
	            }
	            if (this.p.compareTo(this.q) <= 0) {
	                var t = this.p;
	                this.p = this.q;
	                this.q = t;
	            }
	            var p1 = this.p.subtract(BigInteger.ONE);
	            var q1 = this.q.subtract(BigInteger.ONE);
	            var phi = p1.multiply(q1);
	            if (phi.gcd(ee).compareTo(BigInteger.ONE) === 0) {
	                this.n = this.p.multiply(this.q);
	                if (this.n.bitLength() < B) {
	                    continue;
	                }
	                this.d = ee.modInverse(phi);
	                this.dmp1 = this.d.mod(p1);
	                this.dmq1 = this.d.mod(q1);
	                this.coeff = this.q.modInverse(this.p);
	                break;
	            }
	        }
	        this.$$recalculateCache();
	    };

	    /**
	     * Set the private key fields N, e, d and CRT params from buffers
	     *
	     * @param N
	     * @param E
	     * @param D
	     * @param P
	     * @param Q
	     * @param DP
	     * @param DQ
	     * @param C
	     */
	    RSAKey.prototype.setPrivate = function (N, E, D, P, Q, DP, DQ, C) {
	        if (N && E && D && N.length > 0 && (_.isNumber(E) || E.length > 0) && D.length > 0) {
	            this.n = new BigInteger(N);
	            this.e = _.isNumber(E) ? E : utils.get32IntFromBuffer(E, 0);
	            this.d = new BigInteger(D);

	            if (P && Q && DP && DQ && C) {
	                this.p = new BigInteger(P);
	                this.q = new BigInteger(Q);
	                this.dmp1 = new BigInteger(DP);
	                this.dmq1 = new BigInteger(DQ);
	                this.coeff = new BigInteger(C);
	            } else {
	                // TODO: re-calculate any missing CRT params
	            }
	            this.$$recalculateCache();
	        } else {
	            throw Error("Invalid RSA private key");
	        }
	    };

	    /**
	     * Set the public key fields N and e from hex strings
	     * @param N
	     * @param E
	     */
	    RSAKey.prototype.setPublic = function (N, E) {
	        if (N && E && N.length > 0 && (_.isNumber(E) || E.length > 0)) {
	            this.n = new BigInteger(N);
	            this.e = _.isNumber(E) ? E : utils.get32IntFromBuffer(E, 0);
	            this.$$recalculateCache();
	        } else {
	            throw Error("Invalid RSA public key");
	        }
	    };

	    /**
	     * private
	     * Perform raw private operation on "x": return x^d (mod n)
	     *
	     * @param x
	     * @returns {*}
	     */
	    RSAKey.prototype.$doPrivate = function (x) {
	        if (this.p || this.q) {
	            return x.modPow(this.d, this.n);
	        }

	        // TODO: re-calculate any missing CRT params
	        var xp = x.mod(this.p).modPow(this.dmp1, this.p);
	        var xq = x.mod(this.q).modPow(this.dmq1, this.q);

	        while (xp.compareTo(xq) < 0) {
	            xp = xp.add(this.p);
	        }
	        return xp.subtract(xq).multiply(this.coeff).mod(this.p).multiply(this.q).add(xq);
	    };

	    /**
	     * private
	     * Perform raw public operation on "x": return x^e (mod n)
	     *
	     * @param x
	     * @returns {*}
	     */
	    RSAKey.prototype.$doPublic = function (x) {
	        return x.modPowInt(this.e, this.n);
	    };

	    /**
	     * Return the PKCS#1 RSA encryption of buffer
	     * @param buffer {Buffer}
	     * @returns {Buffer}
	     */
	    RSAKey.prototype.encrypt = function (buffer, usePrivate) {
	        var buffers = [];
	        var results = [];
	        var bufferSize = buffer.length;
	        var buffersCount = Math.ceil(bufferSize / this.maxMessageLength) || 1; // total buffers count for encrypt
	        var dividedSize = Math.ceil(bufferSize / buffersCount || 1); // each buffer size

	        if (buffersCount == 1) {
	            buffers.push(buffer);
	        } else {
	            for (var bufNum = 0; bufNum < buffersCount; bufNum++) {
	                buffers.push(buffer.slice(bufNum * dividedSize, (bufNum + 1) * dividedSize));
	            }
	        }

	        for (var i = 0; i < buffers.length; i++) {
	            results.push(this.encryptEngine.encrypt(buffers[i], usePrivate));
	        }

	        return Buffer.concat(results);
	    };

	    /**
	     * Return the PKCS#1 RSA decryption of buffer
	     * @param buffer {Buffer}
	     * @returns {Buffer}
	     */
	    RSAKey.prototype.decrypt = function (buffer, usePublic) {
	        if (buffer.length % this.encryptedDataLength > 0) {
	            throw Error('Incorrect data or key');
	        }

	        var result = [];
	        var offset = 0;
	        var length = 0;
	        var buffersCount = buffer.length / this.encryptedDataLength;

	        for (var i = 0; i < buffersCount; i++) {
	            offset = i * this.encryptedDataLength;
	            length = offset + this.encryptedDataLength;
	            result.push(this.encryptEngine.decrypt(buffer.slice(offset, Math.min(length, buffer.length)), usePublic));
	        }

	        return Buffer.concat(result);
	    };

	    RSAKey.prototype.sign = function (buffer) {
	        return this.signingScheme.sign.apply(this.signingScheme, arguments);
	    };

	    RSAKey.prototype.verify = function (buffer, signature, signature_encoding) {
	        return this.signingScheme.verify.apply(this.signingScheme, arguments);
	    };

	    /**
	     * Check if key pair contains private key
	     */
	    RSAKey.prototype.isPrivate = function () {
	        return this.n && this.e && this.d || false;
	    };

	    /**
	     * Check if key pair contains public key
	     * @param strict {boolean} - public key only, return false if have private exponent
	     */
	    RSAKey.prototype.isPublic = function (strict) {
	        return this.n && this.e && !(strict && this.d) || false;
	    };

	    Object.defineProperty(RSAKey.prototype, 'keySize', {
	        get: function () {
	            return this.cache.keyBitLength;
	        }
	    });

	    Object.defineProperty(RSAKey.prototype, 'encryptedDataLength', {
	        get: function () {
	            return this.cache.keyByteLength;
	        }
	    });

	    Object.defineProperty(RSAKey.prototype, 'maxMessageLength', {
	        get: function () {
	            return this.encryptionScheme.maxMessageLength();
	        }
	    });

	    /**
	     * Caching key data
	     */
	    RSAKey.prototype.$$recalculateCache = function () {
	        this.cache = this.cache || {};
	        // Bit & byte length
	        this.cache.keyBitLength = this.n.bitLength();
	        this.cache.keyByteLength = (this.cache.keyBitLength + 6) >> 3;
	    };

	    return RSAKey;
	})();


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/*
	 * Utils functions
	 *
	 */

	var crypt = __webpack_require__(13);

	/**
	 * Break string str each maxLen symbols
	 * @param str
	 * @param maxLen
	 * @returns {string}
	 */
	module.exports.linebrk = function (str, maxLen) {
	    var res = '';
	    var i = 0;
	    while (i + maxLen < str.length) {
	        res += str.substring(i, i + maxLen) + "\n";
	        i += maxLen;
	    }
	    return res + str.substring(i, str.length);
	};

	module.exports.detectEnvironment = function () {
	    if (process && process.title === 'browser' || (typeof(window) !== 'undefined' && window)) {
	        return 'browser';
	    }

	    return 'node';
	};

	/**
	 * Trying get a 32-bit unsigned integer from the partial buffer
	 * @param buffer
	 * @param offset
	 * @returns {Number}
	 */
	module.exports.get32IntFromBuffer = function (buffer, offset) {
	    offset = offset || 0;
	    var size = 0;
	    if ((size = buffer.length - offset) > 0) {
	        if (size >= 4) {
	            return buffer.readUInt32BE(offset);
	        } else {
	            var res = 0;
	            for (var i = offset + size, d = 0; i > offset; i--, d += 2) {
	                res += buffer[i - 1] * Math.pow(16, d);
	            }
	            return res;
	        }
	    } else {
	        return NaN;
	    }
	};

	module.exports._ = {
	    isObject: function (value) {
	        var type = typeof value;
	        return !!value && (type == 'object' || type == 'function');
	    },

	    isString: function (value) {
	        return typeof value == 'string' || value instanceof String;
	    },

	    isNumber: function (value) {
	        return typeof value == 'number' || !isNaN(parseFloat(value)) && isFinite(value);
	    },

	    /**
	     * Returns copy of `obj` without `removeProp` field.
	     * @param obj
	     * @param removeProp
	     * @returns Object
	     */
	    omit: function (obj, removeProp) {
	        var newObj = {};
	        for (var prop in obj) {
	            if (!obj.hasOwnProperty(prop) || prop === removeProp) {
	                continue;
	            }
	            newObj[prop] = obj[prop];
	        }

	        return newObj;
	    }
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(12)))

/***/ },
/* 12 */
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var rng = __webpack_require__(14)

	function error () {
	  var m = [].slice.call(arguments).join(' ')
	  throw new Error([
	    m,
	    'we accept pull requests',
	    'http://github.com/dominictarr/crypto-browserify'
	    ].join('\n'))
	}

	exports.createHash = __webpack_require__(16)

	exports.createHmac = __webpack_require__(28)

	exports.randomBytes = function(size, callback) {
	  if (callback && callback.call) {
	    try {
	      callback.call(this, undefined, new Buffer(rng(size)))
	    } catch (err) { callback(err) }
	  } else {
	    return new Buffer(rng(size))
	  }
	}

	function each(a, f) {
	  for(var i in a)
	    f(a[i], i)
	}

	exports.getHashes = function () {
	  return ['sha1', 'sha256', 'sha512', 'md5', 'rmd160']
	}

	var p = __webpack_require__(29)(exports)
	exports.pbkdf2 = p.pbkdf2
	exports.pbkdf2Sync = p.pbkdf2Sync


	// the least I can do is make error messages for the rest of the node.js/crypto api.
	each(['createCredentials'
	, 'createCipher'
	, 'createCipheriv'
	, 'createDecipher'
	, 'createDecipheriv'
	, 'createSign'
	, 'createVerify'
	, 'createDiffieHellman'
	], function (name) {
	  exports[name] = function () {
	    error('sorry,', name, 'is not implemented yet')
	  }
	})

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, Buffer) {(function() {
	  var g = ('undefined' === typeof window ? global : window) || {}
	  _crypto = (
	    g.crypto || g.msCrypto || __webpack_require__(15)
	  )
	  module.exports = function(size) {
	    // Modern Browsers
	    if(_crypto.getRandomValues) {
	      var bytes = new Buffer(size); //in browserify, this is an extended Uint8Array
	      /* This will not work in older browsers.
	       * See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
	       */
	    
	      _crypto.getRandomValues(bytes);
	      return bytes;
	    }
	    else if (_crypto.randomBytes) {
	      return _crypto.randomBytes(size)
	    }
	    else
	      throw new Error(
	        'secure random number generation not supported by this browser\n'+
	        'use chrome, FireFox or Internet Explorer 11'
	      )
	  }
	}())

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(6).Buffer))

/***/ },
/* 15 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var createHash = __webpack_require__(17)

	var md5 = toConstructor(__webpack_require__(25))
	var rmd160 = toConstructor(__webpack_require__(27))

	function toConstructor (fn) {
	  return function () {
	    var buffers = []
	    var m= {
	      update: function (data, enc) {
	        if(!Buffer.isBuffer(data)) data = new Buffer(data, enc)
	        buffers.push(data)
	        return this
	      },
	      digest: function (enc) {
	        var buf = Buffer.concat(buffers)
	        var r = fn(buf)
	        buffers = null
	        return enc ? r.toString(enc) : r
	      }
	    }
	    return m
	  }
	}

	module.exports = function (alg) {
	  if('md5' === alg) return new md5()
	  if('rmd160' === alg) return new rmd160()
	  return createHash(alg)
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var exports = module.exports = function (alg) {
	  var Alg = exports[alg]
	  if(!Alg) throw new Error(alg + ' is not supported (we accept pull requests)')
	  return new Alg()
	}

	var Buffer = __webpack_require__(6).Buffer
	var Hash   = __webpack_require__(18)(Buffer)

	exports.sha1 = __webpack_require__(19)(Buffer, Hash)
	exports.sha256 = __webpack_require__(23)(Buffer, Hash)
	exports.sha512 = __webpack_require__(24)(Buffer, Hash)


/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = function (Buffer) {

	  //prototype class for hash functions
	  function Hash (blockSize, finalSize) {
	    this._block = new Buffer(blockSize) //new Uint32Array(blockSize/4)
	    this._finalSize = finalSize
	    this._blockSize = blockSize
	    this._len = 0
	    this._s = 0
	  }

	  Hash.prototype.init = function () {
	    this._s = 0
	    this._len = 0
	  }

	  Hash.prototype.update = function (data, enc) {
	    if ("string" === typeof data) {
	      enc = enc || "utf8"
	      data = new Buffer(data, enc)
	    }

	    var l = this._len += data.length
	    var s = this._s = (this._s || 0)
	    var f = 0
	    var buffer = this._block

	    while (s < l) {
	      var t = Math.min(data.length, f + this._blockSize - (s % this._blockSize))
	      var ch = (t - f)

	      for (var i = 0; i < ch; i++) {
	        buffer[(s % this._blockSize) + i] = data[i + f]
	      }

	      s += ch
	      f += ch

	      if ((s % this._blockSize) === 0) {
	        this._update(buffer)
	      }
	    }
	    this._s = s

	    return this
	  }

	  Hash.prototype.digest = function (enc) {
	    // Suppose the length of the message M, in bits, is l
	    var l = this._len * 8

	    // Append the bit 1 to the end of the message
	    this._block[this._len % this._blockSize] = 0x80

	    // and then k zero bits, where k is the smallest non-negative solution to the equation (l + 1 + k) === finalSize mod blockSize
	    this._block.fill(0, this._len % this._blockSize + 1)

	    if (l % (this._blockSize * 8) >= this._finalSize * 8) {
	      this._update(this._block)
	      this._block.fill(0)
	    }

	    // to this append the block which is equal to the number l written in binary
	    // TODO: handle case where l is > Math.pow(2, 29)
	    this._block.writeInt32BE(l, this._blockSize - 4)

	    var hash = this._update(this._block) || this._hash()

	    return enc ? hash.toString(enc) : hash
	  }

	  Hash.prototype._update = function () {
	    throw new Error('_update must be implemented by subclass')
	  }

	  return Hash
	}


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
	 * in FIPS PUB 180-1
	 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for details.
	 */

	var inherits = __webpack_require__(20).inherits

	module.exports = function (Buffer, Hash) {

	  var A = 0|0
	  var B = 4|0
	  var C = 8|0
	  var D = 12|0
	  var E = 16|0

	  var W = new (typeof Int32Array === 'undefined' ? Array : Int32Array)(80)

	  var POOL = []

	  function Sha1 () {
	    if(POOL.length)
	      return POOL.pop().init()

	    if(!(this instanceof Sha1)) return new Sha1()
	    this._w = W
	    Hash.call(this, 16*4, 14*4)

	    this._h = null
	    this.init()
	  }

	  inherits(Sha1, Hash)

	  Sha1.prototype.init = function () {
	    this._a = 0x67452301
	    this._b = 0xefcdab89
	    this._c = 0x98badcfe
	    this._d = 0x10325476
	    this._e = 0xc3d2e1f0

	    Hash.prototype.init.call(this)
	    return this
	  }

	  Sha1.prototype._POOL = POOL
	  Sha1.prototype._update = function (X) {

	    var a, b, c, d, e, _a, _b, _c, _d, _e

	    a = _a = this._a
	    b = _b = this._b
	    c = _c = this._c
	    d = _d = this._d
	    e = _e = this._e

	    var w = this._w

	    for(var j = 0; j < 80; j++) {
	      var W = w[j] = j < 16 ? X.readInt32BE(j*4)
	        : rol(w[j - 3] ^ w[j -  8] ^ w[j - 14] ^ w[j - 16], 1)

	      var t = add(
	        add(rol(a, 5), sha1_ft(j, b, c, d)),
	        add(add(e, W), sha1_kt(j))
	      )

	      e = d
	      d = c
	      c = rol(b, 30)
	      b = a
	      a = t
	    }

	    this._a = add(a, _a)
	    this._b = add(b, _b)
	    this._c = add(c, _c)
	    this._d = add(d, _d)
	    this._e = add(e, _e)
	  }

	  Sha1.prototype._hash = function () {
	    if(POOL.length < 100) POOL.push(this)
	    var H = new Buffer(20)
	    //console.log(this._a|0, this._b|0, this._c|0, this._d|0, this._e|0)
	    H.writeInt32BE(this._a|0, A)
	    H.writeInt32BE(this._b|0, B)
	    H.writeInt32BE(this._c|0, C)
	    H.writeInt32BE(this._d|0, D)
	    H.writeInt32BE(this._e|0, E)
	    return H
	  }

	  /*
	   * Perform the appropriate triplet combination function for the current
	   * iteration
	   */
	  function sha1_ft(t, b, c, d) {
	    if(t < 20) return (b & c) | ((~b) & d);
	    if(t < 40) return b ^ c ^ d;
	    if(t < 60) return (b & c) | (b & d) | (c & d);
	    return b ^ c ^ d;
	  }

	  /*
	   * Determine the appropriate additive constant for the current iteration
	   */
	  function sha1_kt(t) {
	    return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
	           (t < 60) ? -1894007588 : -899497514;
	  }

	  /*
	   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	   * to work around bugs in some JS interpreters.
	   * //dominictarr: this is 10 years old, so maybe this can be dropped?)
	   *
	   */
	  function add(x, y) {
	    return (x + y ) | 0
	  //lets see how this goes on testling.
	  //  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  //  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  //  return (msw << 16) | (lsw & 0xFFFF);
	  }

	  /*
	   * Bitwise rotate a 32-bit number to the left.
	   */
	  function rol(num, cnt) {
	    return (num << cnt) | (num >>> (32 - cnt));
	  }

	  return Sha1
	}


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(21);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(22);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(12)))

/***/ },
/* 21 */
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },
/* 22 */
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	
	/**
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
	 * in FIPS 180-2
	 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 *
	 */

	var inherits = __webpack_require__(20).inherits

	module.exports = function (Buffer, Hash) {

	  var K = [
	      0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
	      0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
	      0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
	      0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
	      0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
	      0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
	      0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
	      0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
	      0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
	      0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
	      0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
	      0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
	      0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
	      0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
	      0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
	      0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
	    ]

	  var W = new Array(64)

	  function Sha256() {
	    this.init()

	    this._w = W //new Array(64)

	    Hash.call(this, 16*4, 14*4)
	  }

	  inherits(Sha256, Hash)

	  Sha256.prototype.init = function () {

	    this._a = 0x6a09e667|0
	    this._b = 0xbb67ae85|0
	    this._c = 0x3c6ef372|0
	    this._d = 0xa54ff53a|0
	    this._e = 0x510e527f|0
	    this._f = 0x9b05688c|0
	    this._g = 0x1f83d9ab|0
	    this._h = 0x5be0cd19|0

	    this._len = this._s = 0

	    return this
	  }

	  function S (X, n) {
	    return (X >>> n) | (X << (32 - n));
	  }

	  function R (X, n) {
	    return (X >>> n);
	  }

	  function Ch (x, y, z) {
	    return ((x & y) ^ ((~x) & z));
	  }

	  function Maj (x, y, z) {
	    return ((x & y) ^ (x & z) ^ (y & z));
	  }

	  function Sigma0256 (x) {
	    return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
	  }

	  function Sigma1256 (x) {
	    return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
	  }

	  function Gamma0256 (x) {
	    return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
	  }

	  function Gamma1256 (x) {
	    return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
	  }

	  Sha256.prototype._update = function(M) {

	    var W = this._w
	    var a, b, c, d, e, f, g, h
	    var T1, T2

	    a = this._a | 0
	    b = this._b | 0
	    c = this._c | 0
	    d = this._d | 0
	    e = this._e | 0
	    f = this._f | 0
	    g = this._g | 0
	    h = this._h | 0

	    for (var j = 0; j < 64; j++) {
	      var w = W[j] = j < 16
	        ? M.readInt32BE(j * 4)
	        : Gamma1256(W[j - 2]) + W[j - 7] + Gamma0256(W[j - 15]) + W[j - 16]

	      T1 = h + Sigma1256(e) + Ch(e, f, g) + K[j] + w

	      T2 = Sigma0256(a) + Maj(a, b, c);
	      h = g; g = f; f = e; e = d + T1; d = c; c = b; b = a; a = T1 + T2;
	    }

	    this._a = (a + this._a) | 0
	    this._b = (b + this._b) | 0
	    this._c = (c + this._c) | 0
	    this._d = (d + this._d) | 0
	    this._e = (e + this._e) | 0
	    this._f = (f + this._f) | 0
	    this._g = (g + this._g) | 0
	    this._h = (h + this._h) | 0

	  };

	  Sha256.prototype._hash = function () {
	    var H = new Buffer(32)

	    H.writeInt32BE(this._a,  0)
	    H.writeInt32BE(this._b,  4)
	    H.writeInt32BE(this._c,  8)
	    H.writeInt32BE(this._d, 12)
	    H.writeInt32BE(this._e, 16)
	    H.writeInt32BE(this._f, 20)
	    H.writeInt32BE(this._g, 24)
	    H.writeInt32BE(this._h, 28)

	    return H
	  }

	  return Sha256

	}


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var inherits = __webpack_require__(20).inherits

	module.exports = function (Buffer, Hash) {
	  var K = [
	    0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
	    0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
	    0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
	    0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
	    0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
	    0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
	    0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
	    0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
	    0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
	    0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
	    0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
	    0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
	    0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
	    0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
	    0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
	    0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
	    0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
	    0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
	    0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
	    0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
	    0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
	    0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
	    0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
	    0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
	    0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
	    0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
	    0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
	    0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
	    0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
	    0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
	    0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
	    0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
	    0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
	    0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
	    0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
	    0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
	    0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
	    0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
	    0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
	    0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
	  ]

	  var W = new Array(160)

	  function Sha512() {
	    this.init()
	    this._w = W

	    Hash.call(this, 128, 112)
	  }

	  inherits(Sha512, Hash)

	  Sha512.prototype.init = function () {

	    this._a = 0x6a09e667|0
	    this._b = 0xbb67ae85|0
	    this._c = 0x3c6ef372|0
	    this._d = 0xa54ff53a|0
	    this._e = 0x510e527f|0
	    this._f = 0x9b05688c|0
	    this._g = 0x1f83d9ab|0
	    this._h = 0x5be0cd19|0

	    this._al = 0xf3bcc908|0
	    this._bl = 0x84caa73b|0
	    this._cl = 0xfe94f82b|0
	    this._dl = 0x5f1d36f1|0
	    this._el = 0xade682d1|0
	    this._fl = 0x2b3e6c1f|0
	    this._gl = 0xfb41bd6b|0
	    this._hl = 0x137e2179|0

	    this._len = this._s = 0

	    return this
	  }

	  function S (X, Xl, n) {
	    return (X >>> n) | (Xl << (32 - n))
	  }

	  function Ch (x, y, z) {
	    return ((x & y) ^ ((~x) & z));
	  }

	  function Maj (x, y, z) {
	    return ((x & y) ^ (x & z) ^ (y & z));
	  }

	  Sha512.prototype._update = function(M) {

	    var W = this._w
	    var a, b, c, d, e, f, g, h
	    var al, bl, cl, dl, el, fl, gl, hl

	    a = this._a | 0
	    b = this._b | 0
	    c = this._c | 0
	    d = this._d | 0
	    e = this._e | 0
	    f = this._f | 0
	    g = this._g | 0
	    h = this._h | 0

	    al = this._al | 0
	    bl = this._bl | 0
	    cl = this._cl | 0
	    dl = this._dl | 0
	    el = this._el | 0
	    fl = this._fl | 0
	    gl = this._gl | 0
	    hl = this._hl | 0

	    for (var i = 0; i < 80; i++) {
	      var j = i * 2

	      var Wi, Wil

	      if (i < 16) {
	        Wi = W[j] = M.readInt32BE(j * 4)
	        Wil = W[j + 1] = M.readInt32BE(j * 4 + 4)

	      } else {
	        var x  = W[j - 15*2]
	        var xl = W[j - 15*2 + 1]
	        var gamma0  = S(x, xl, 1) ^ S(x, xl, 8) ^ (x >>> 7)
	        var gamma0l = S(xl, x, 1) ^ S(xl, x, 8) ^ S(xl, x, 7)

	        x  = W[j - 2*2]
	        xl = W[j - 2*2 + 1]
	        var gamma1  = S(x, xl, 19) ^ S(xl, x, 29) ^ (x >>> 6)
	        var gamma1l = S(xl, x, 19) ^ S(x, xl, 29) ^ S(xl, x, 6)

	        // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
	        var Wi7  = W[j - 7*2]
	        var Wi7l = W[j - 7*2 + 1]

	        var Wi16  = W[j - 16*2]
	        var Wi16l = W[j - 16*2 + 1]

	        Wil = gamma0l + Wi7l
	        Wi  = gamma0  + Wi7 + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0)
	        Wil = Wil + gamma1l
	        Wi  = Wi  + gamma1  + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0)
	        Wil = Wil + Wi16l
	        Wi  = Wi  + Wi16 + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0)

	        W[j] = Wi
	        W[j + 1] = Wil
	      }

	      var maj = Maj(a, b, c)
	      var majl = Maj(al, bl, cl)

	      var sigma0h = S(a, al, 28) ^ S(al, a, 2) ^ S(al, a, 7)
	      var sigma0l = S(al, a, 28) ^ S(a, al, 2) ^ S(a, al, 7)
	      var sigma1h = S(e, el, 14) ^ S(e, el, 18) ^ S(el, e, 9)
	      var sigma1l = S(el, e, 14) ^ S(el, e, 18) ^ S(e, el, 9)

	      // t1 = h + sigma1 + ch + K[i] + W[i]
	      var Ki = K[j]
	      var Kil = K[j + 1]

	      var ch = Ch(e, f, g)
	      var chl = Ch(el, fl, gl)

	      var t1l = hl + sigma1l
	      var t1 = h + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0)
	      t1l = t1l + chl
	      t1 = t1 + ch + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0)
	      t1l = t1l + Kil
	      t1 = t1 + Ki + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0)
	      t1l = t1l + Wil
	      t1 = t1 + Wi + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0)

	      // t2 = sigma0 + maj
	      var t2l = sigma0l + majl
	      var t2 = sigma0h + maj + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0)

	      h  = g
	      hl = gl
	      g  = f
	      gl = fl
	      f  = e
	      fl = el
	      el = (dl + t1l) | 0
	      e  = (d + t1 + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	      d  = c
	      dl = cl
	      c  = b
	      cl = bl
	      b  = a
	      bl = al
	      al = (t1l + t2l) | 0
	      a  = (t1 + t2 + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0
	    }

	    this._al = (this._al + al) | 0
	    this._bl = (this._bl + bl) | 0
	    this._cl = (this._cl + cl) | 0
	    this._dl = (this._dl + dl) | 0
	    this._el = (this._el + el) | 0
	    this._fl = (this._fl + fl) | 0
	    this._gl = (this._gl + gl) | 0
	    this._hl = (this._hl + hl) | 0

	    this._a = (this._a + a + ((this._al >>> 0) < (al >>> 0) ? 1 : 0)) | 0
	    this._b = (this._b + b + ((this._bl >>> 0) < (bl >>> 0) ? 1 : 0)) | 0
	    this._c = (this._c + c + ((this._cl >>> 0) < (cl >>> 0) ? 1 : 0)) | 0
	    this._d = (this._d + d + ((this._dl >>> 0) < (dl >>> 0) ? 1 : 0)) | 0
	    this._e = (this._e + e + ((this._el >>> 0) < (el >>> 0) ? 1 : 0)) | 0
	    this._f = (this._f + f + ((this._fl >>> 0) < (fl >>> 0) ? 1 : 0)) | 0
	    this._g = (this._g + g + ((this._gl >>> 0) < (gl >>> 0) ? 1 : 0)) | 0
	    this._h = (this._h + h + ((this._hl >>> 0) < (hl >>> 0) ? 1 : 0)) | 0
	  }

	  Sha512.prototype._hash = function () {
	    var H = new Buffer(64)

	    function writeInt64BE(h, l, offset) {
	      H.writeInt32BE(h, offset)
	      H.writeInt32BE(l, offset + 4)
	    }

	    writeInt64BE(this._a, this._al, 0)
	    writeInt64BE(this._b, this._bl, 8)
	    writeInt64BE(this._c, this._cl, 16)
	    writeInt64BE(this._d, this._dl, 24)
	    writeInt64BE(this._e, this._el, 32)
	    writeInt64BE(this._f, this._fl, 40)
	    writeInt64BE(this._g, this._gl, 48)
	    writeInt64BE(this._h, this._hl, 56)

	    return H
	  }

	  return Sha512

	}


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */

	var helpers = __webpack_require__(26);

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length
	 */
	function core_md5(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;

	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;

	    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
	    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
	    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
	    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
	    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
	    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
	    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
	    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
	    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
	    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
	    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

	    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
	    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
	    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
	    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
	    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
	    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
	    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
	    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
	    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
	    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
	    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
	    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

	    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
	    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
	    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
	    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
	    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
	    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
	    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
	    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
	    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
	    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
	    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
	    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
	    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

	    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
	    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
	    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
	    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
	    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
	    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
	    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
	    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
	    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
	    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
	    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	  }
	  return Array(a, b, c, d);

	}

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t)
	{
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t)
	{
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t)
	{
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}

	module.exports = function md5(buf) {
	  return helpers.hash(buf, core_md5, 16);
	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var intSize = 4;
	var zeroBuffer = new Buffer(intSize); zeroBuffer.fill(0);
	var chrsz = 8;

	function toArray(buf, bigEndian) {
	  if ((buf.length % intSize) !== 0) {
	    var len = buf.length + (intSize - (buf.length % intSize));
	    buf = Buffer.concat([buf, zeroBuffer], len);
	  }

	  var arr = [];
	  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
	  for (var i = 0; i < buf.length; i += intSize) {
	    arr.push(fn.call(buf, i));
	  }
	  return arr;
	}

	function toBuffer(arr, size, bigEndian) {
	  var buf = new Buffer(size);
	  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
	  for (var i = 0; i < arr.length; i++) {
	    fn.call(buf, arr[i], i * 4, true);
	  }
	  return buf;
	}

	function hash(buf, fn, hashSize, bigEndian) {
	  if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
	  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
	  return toBuffer(arr, hashSize, bigEndian);
	}

	module.exports = { hash: hash };

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {
	module.exports = ripemd160



	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	/** @preserve
	(c) 2012 by Cédric Mesnil. All rights reserved.

	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

	    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
	    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	*/

	// Constants table
	var zl = [
	    0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15,
	    7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8,
	    3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12,
	    1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2,
	    4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13];
	var zr = [
	    5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12,
	    6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2,
	    15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13,
	    8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14,
	    12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11];
	var sl = [
	     11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8,
	    7, 6,   8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12,
	    11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5,
	      11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12,
	    9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6 ];
	var sr = [
	    8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6,
	    9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11,
	    9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5,
	    15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8,
	    8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11 ];

	var hl =  [ 0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
	var hr =  [ 0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];

	var bytesToWords = function (bytes) {
	  var words = [];
	  for (var i = 0, b = 0; i < bytes.length; i++, b += 8) {
	    words[b >>> 5] |= bytes[i] << (24 - b % 32);
	  }
	  return words;
	};

	var wordsToBytes = function (words) {
	  var bytes = [];
	  for (var b = 0; b < words.length * 32; b += 8) {
	    bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
	  }
	  return bytes;
	};

	var processBlock = function (H, M, offset) {

	  // Swap endian
	  for (var i = 0; i < 16; i++) {
	    var offset_i = offset + i;
	    var M_offset_i = M[offset_i];

	    // Swap
	    M[offset_i] = (
	        (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
	        (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
	    );
	  }

	  // Working variables
	  var al, bl, cl, dl, el;
	  var ar, br, cr, dr, er;

	  ar = al = H[0];
	  br = bl = H[1];
	  cr = cl = H[2];
	  dr = dl = H[3];
	  er = el = H[4];
	  // Computation
	  var t;
	  for (var i = 0; i < 80; i += 1) {
	    t = (al +  M[offset+zl[i]])|0;
	    if (i<16){
	        t +=  f1(bl,cl,dl) + hl[0];
	    } else if (i<32) {
	        t +=  f2(bl,cl,dl) + hl[1];
	    } else if (i<48) {
	        t +=  f3(bl,cl,dl) + hl[2];
	    } else if (i<64) {
	        t +=  f4(bl,cl,dl) + hl[3];
	    } else {// if (i<80) {
	        t +=  f5(bl,cl,dl) + hl[4];
	    }
	    t = t|0;
	    t =  rotl(t,sl[i]);
	    t = (t+el)|0;
	    al = el;
	    el = dl;
	    dl = rotl(cl, 10);
	    cl = bl;
	    bl = t;

	    t = (ar + M[offset+zr[i]])|0;
	    if (i<16){
	        t +=  f5(br,cr,dr) + hr[0];
	    } else if (i<32) {
	        t +=  f4(br,cr,dr) + hr[1];
	    } else if (i<48) {
	        t +=  f3(br,cr,dr) + hr[2];
	    } else if (i<64) {
	        t +=  f2(br,cr,dr) + hr[3];
	    } else {// if (i<80) {
	        t +=  f1(br,cr,dr) + hr[4];
	    }
	    t = t|0;
	    t =  rotl(t,sr[i]) ;
	    t = (t+er)|0;
	    ar = er;
	    er = dr;
	    dr = rotl(cr, 10);
	    cr = br;
	    br = t;
	  }
	  // Intermediate hash value
	  t    = (H[1] + cl + dr)|0;
	  H[1] = (H[2] + dl + er)|0;
	  H[2] = (H[3] + el + ar)|0;
	  H[3] = (H[4] + al + br)|0;
	  H[4] = (H[0] + bl + cr)|0;
	  H[0] =  t;
	};

	function f1(x, y, z) {
	  return ((x) ^ (y) ^ (z));
	}

	function f2(x, y, z) {
	  return (((x)&(y)) | ((~x)&(z)));
	}

	function f3(x, y, z) {
	  return (((x) | (~(y))) ^ (z));
	}

	function f4(x, y, z) {
	  return (((x) & (z)) | ((y)&(~(z))));
	}

	function f5(x, y, z) {
	  return ((x) ^ ((y) |(~(z))));
	}

	function rotl(x,n) {
	  return (x<<n) | (x>>>(32-n));
	}

	function ripemd160(message) {
	  var H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];

	  if (typeof message == 'string')
	    message = new Buffer(message, 'utf8');

	  var m = bytesToWords(message);

	  var nBitsLeft = message.length * 8;
	  var nBitsTotal = message.length * 8;

	  // Add padding
	  m[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
	  m[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
	      (((nBitsTotal << 8)  | (nBitsTotal >>> 24)) & 0x00ff00ff) |
	      (((nBitsTotal << 24) | (nBitsTotal >>> 8))  & 0xff00ff00)
	  );

	  for (var i=0 ; i<m.length; i += 16) {
	    processBlock(H, m, i);
	  }

	  // Swap endian
	  for (var i = 0; i < 5; i++) {
	      // Shortcut
	    var H_i = H[i];

	    // Swap
	    H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
	          (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
	  }

	  var digestbytes = wordsToBytes(H);
	  return new Buffer(digestbytes);
	}



	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var createHash = __webpack_require__(16)

	var zeroBuffer = new Buffer(128)
	zeroBuffer.fill(0)

	module.exports = Hmac

	function Hmac (alg, key) {
	  if(!(this instanceof Hmac)) return new Hmac(alg, key)
	  this._opad = opad
	  this._alg = alg

	  var blocksize = (alg === 'sha512') ? 128 : 64

	  key = this._key = !Buffer.isBuffer(key) ? new Buffer(key) : key

	  if(key.length > blocksize) {
	    key = createHash(alg).update(key).digest()
	  } else if(key.length < blocksize) {
	    key = Buffer.concat([key, zeroBuffer], blocksize)
	  }

	  var ipad = this._ipad = new Buffer(blocksize)
	  var opad = this._opad = new Buffer(blocksize)

	  for(var i = 0; i < blocksize; i++) {
	    ipad[i] = key[i] ^ 0x36
	    opad[i] = key[i] ^ 0x5C
	  }

	  this._hash = createHash(alg).update(ipad)
	}

	Hmac.prototype.update = function (data, enc) {
	  this._hash.update(data, enc)
	  return this
	}

	Hmac.prototype.digest = function (enc) {
	  var h = this._hash.digest()
	  return createHash(this._alg).update(this._opad).update(h).digest(enc)
	}


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var pbkdf2Export = __webpack_require__(30)

	module.exports = function (crypto, exports) {
	  exports = exports || {}

	  var exported = pbkdf2Export(crypto)

	  exports.pbkdf2 = exported.pbkdf2
	  exports.pbkdf2Sync = exported.pbkdf2Sync

	  return exports
	}


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {module.exports = function(crypto) {
	  function pbkdf2(password, salt, iterations, keylen, digest, callback) {
	    if ('function' === typeof digest) {
	      callback = digest
	      digest = undefined
	    }

	    if ('function' !== typeof callback)
	      throw new Error('No callback provided to pbkdf2')

	    setTimeout(function() {
	      var result

	      try {
	        result = pbkdf2Sync(password, salt, iterations, keylen, digest)
	      } catch (e) {
	        return callback(e)
	      }

	      callback(undefined, result)
	    })
	  }

	  function pbkdf2Sync(password, salt, iterations, keylen, digest) {
	    if ('number' !== typeof iterations)
	      throw new TypeError('Iterations not a number')

	    if (iterations < 0)
	      throw new TypeError('Bad iterations')

	    if ('number' !== typeof keylen)
	      throw new TypeError('Key length not a number')

	    if (keylen < 0)
	      throw new TypeError('Bad key length')

	    digest = digest || 'sha1'

	    if (!Buffer.isBuffer(password)) password = new Buffer(password)
	    if (!Buffer.isBuffer(salt)) salt = new Buffer(salt)

	    var hLen, l = 1, r, T
	    var DK = new Buffer(keylen)
	    var block1 = new Buffer(salt.length + 4)
	    salt.copy(block1, 0, 0, salt.length)

	    for (var i = 1; i <= l; i++) {
	      block1.writeUInt32BE(i, salt.length)

	      var U = crypto.createHmac(digest, password).update(block1).digest()

	      if (!hLen) {
	        hLen = U.length
	        T = new Buffer(hLen)
	        l = Math.ceil(keylen / hLen)
	        r = keylen - (l - 1) * hLen

	        if (keylen > (Math.pow(2, 32) - 1) * hLen)
	          throw new TypeError('keylen exceeds maximum length')
	      }

	      U.copy(T, 0, 0, hLen)

	      for (var j = 1; j < iterations; j++) {
	        U = crypto.createHmac(digest, password).update(U).digest()

	        for (var k = 0; k < hLen; k++) {
	          T[k] ^= U[k]
	        }
	      }

	      var destPos = (i - 1) * hLen
	      var len = (i == l ? r : hLen)
	      T.copy(DK, destPos, 0, len)
	    }

	    return DK
	  }

	  return {
	    pbkdf2: pbkdf2,
	    pbkdf2Sync: pbkdf2Sync
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/*
	 * Basic JavaScript BN library - subset useful for RSA encryption.
	 * 
	 * Copyright (c) 2003-2005  Tom Wu
	 * All Rights Reserved.
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining
	 * a copy of this software and associated documentation files (the
	 * "Software"), to deal in the Software without restriction, including
	 * without limitation the rights to use, copy, modify, merge, publish,
	 * distribute, sublicense, and/or sell copies of the Software, and to
	 * permit persons to whom the Software is furnished to do so, subject to
	 * the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be
	 * included in all copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS-IS" AND WITHOUT WARRANTY OF ANY KIND, 
	 * EXPRESS, IMPLIED OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY 
	 * WARRANTY OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.  
	 *
	 * IN NO EVENT SHALL TOM WU BE LIABLE FOR ANY SPECIAL, INCIDENTAL,
	 * INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND, OR ANY DAMAGES WHATSOEVER
	 * RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER OR NOT ADVISED OF
	 * THE POSSIBILITY OF DAMAGE, AND ON ANY THEORY OF LIABILITY, ARISING OUT
	 * OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
	 *
	 * In addition, the following condition applies:
	 *
	 * All redistributions must retain an intact copy of this copyright notice
	 * and disclaimer.
	 */

	/*
	 * Added Node.js Buffers support
	 * 2014 rzcoder
	 */

	var crypt = __webpack_require__(13);
	var _ = __webpack_require__(11)._;

	// Bits per digit
	var dbits;

	// JavaScript engine analysis
	var canary = 0xdeadbeefcafe;
	var j_lm = ((canary & 0xffffff) == 0xefcafe);

	// (public) Constructor
	function BigInteger(a, b) {
	    if (a != null) {
	        if ("number" == typeof a) {
	            this.fromNumber(a, b);
	        } else if (Buffer.isBuffer(a)) {
	            this.fromBuffer(a);
	        } else if (b == null && "string" != typeof a) {
	            this.fromByteArray(a);
	        } else {
	            this.fromString(a, b);
	        }
	    }
	}

	// return new, unset BigInteger
	function nbi() {
	    return new BigInteger(null);
	}

	// am: Compute w_j += (x*this_i), propagate carries,
	// c is initial carry, returns final carry.
	// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
	// We need to select the fastest one that works in this environment.

	// am1: use a single mult and divide to get the high bits,
	// max digit bits should be 26 because
	// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
	function am1(i, x, w, j, c, n) {
	    while (--n >= 0) {
	        var v = x * this[i++] + w[j] + c;
	        c = Math.floor(v / 0x4000000);
	        w[j++] = v & 0x3ffffff;
	    }
	    return c;
	}
	// am2 avoids a big mult-and-extract completely.
	// Max digit bits should be <= 30 because we do bitwise ops
	// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
	function am2(i, x, w, j, c, n) {
	    var xl = x & 0x7fff, xh = x >> 15;
	    while (--n >= 0) {
	        var l = this[i] & 0x7fff;
	        var h = this[i++] >> 15;
	        var m = xh * l + h * xl;
	        l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
	        c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
	        w[j++] = l & 0x3fffffff;
	    }
	    return c;
	}
	// Alternately, set max digit bits to 28 since some
	// browsers slow down when dealing with 32-bit numbers.
	function am3(i, x, w, j, c, n) {
	    var xl = x & 0x3fff, xh = x >> 14;
	    while (--n >= 0) {
	        var l = this[i] & 0x3fff;
	        var h = this[i++] >> 14;
	        var m = xh * l + h * xl;
	        l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
	        c = (l >> 28) + (m >> 14) + xh * h;
	        w[j++] = l & 0xfffffff;
	    }
	    return c;
	}

	// We need to select the fastest one that works in this environment. 
	//if (j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
	//	BigInteger.prototype.am = am2;
	//	dbits = 30;
	//} else if (j_lm && (navigator.appName != "Netscape")) {
	//	BigInteger.prototype.am = am1;
	//	dbits = 26;
	//} else { // Mozilla/Netscape seems to prefer am3
	//	BigInteger.prototype.am = am3;
	//	dbits = 28;
	//}

	// For node.js, we pick am3 with max dbits to 28.
	BigInteger.prototype.am = am3;
	dbits = 28;

	BigInteger.prototype.DB = dbits;
	BigInteger.prototype.DM = ((1 << dbits) - 1);
	BigInteger.prototype.DV = (1 << dbits);

	var BI_FP = 52;
	BigInteger.prototype.FV = Math.pow(2, BI_FP);
	BigInteger.prototype.F1 = BI_FP - dbits;
	BigInteger.prototype.F2 = 2 * dbits - BI_FP;

	// Digit conversions
	var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
	var BI_RC = new Array();
	var rr, vv;
	rr = "0".charCodeAt(0);
	for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
	rr = "a".charCodeAt(0);
	for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
	rr = "A".charCodeAt(0);
	for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

	function int2char(n) {
	    return BI_RM.charAt(n);
	}
	function intAt(s, i) {
	    var c = BI_RC[s.charCodeAt(i)];
	    return (c == null) ? -1 : c;
	}

	// (protected) copy this to r
	function bnpCopyTo(r) {
	    for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
	    r.t = this.t;
	    r.s = this.s;
	}

	// (protected) set from integer value x, -DV <= x < DV
	function bnpFromInt(x) {
	    this.t = 1;
	    this.s = (x < 0) ? -1 : 0;
	    if (x > 0) this[0] = x;
	    else if (x < -1) this[0] = x + DV;
	    else this.t = 0;
	}

	// return bigint initialized to value
	function nbv(i) {
	    var r = nbi();
	    r.fromInt(i);
	    return r;
	}

	// (protected) set from string and radix
	function bnpFromString(data, radix, unsigned) {
	    var k;
	    switch (radix) {
	        case 2:
	            k = 1;
	            break;
	        case 4:
	            k = 2;
	            break;
	        case 8:
	            k = 3;
	            break;
	        case 16:
	            k = 4;
	            break;
	        case 32:
	            k = 5;
	            break;
	        case 256:
	            k = 8;
	            break;
	        default:
	            this.fromRadix(data, radix);
	            return;
	    }

	    this.t = 0;
	    this.s = 0;

	    var i = data.length;
	    var mi = false;
	    var sh = 0;

	    while (--i >= 0) {
	        var x = (k == 8) ? data[i] & 0xff : intAt(data, i);
	        if (x < 0) {
	            if (data.charAt(i) == "-") mi = true;
	            continue;
	        }
	        mi = false;
	        if (sh === 0)
	            this[this.t++] = x;
	        else if (sh + k > this.DB) {
	            this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
	            this[this.t++] = (x >> (this.DB - sh));
	        }
	        else
	            this[this.t - 1] |= x << sh;
	        sh += k;
	        if (sh >= this.DB) sh -= this.DB;
	    }
	    if ((!unsigned) && k == 8 && (data[0] & 0x80) != 0) {
	        this.s = -1;
	        if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
	    }
	    this.clamp();
	    if (mi) BigInteger.ZERO.subTo(this, this);
	}

	function bnpFromByteArray(a, unsigned) {
	    this.fromString(a, 256, unsigned)
	}

	function bnpFromBuffer(a) {
	    this.fromString(a, 256, true)
	}

	// (protected) clamp off excess high words
	function bnpClamp() {
	    var c = this.s & this.DM;
	    while (this.t > 0 && this[this.t - 1] == c) --this.t;
	}

	// (public) return string representation in given radix
	function bnToString(b) {
	    if (this.s < 0) return "-" + this.negate().toString(b);
	    var k;
	    if (b == 16) k = 4;
	    else if (b == 8) k = 3;
	    else if (b == 2) k = 1;
	    else if (b == 32) k = 5;
	    else if (b == 4) k = 2;
	    else return this.toRadix(b);
	    var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
	    var p = this.DB - (i * this.DB) % k;
	    if (i-- > 0) {
	        if (p < this.DB && (d = this[i] >> p) > 0) {
	            m = true;
	            r = int2char(d);
	        }
	        while (i >= 0) {
	            if (p < k) {
	                d = (this[i] & ((1 << p) - 1)) << (k - p);
	                d |= this[--i] >> (p += this.DB - k);
	            }
	            else {
	                d = (this[i] >> (p -= k)) & km;
	                if (p <= 0) {
	                    p += this.DB;
	                    --i;
	                }
	            }
	            if (d > 0) m = true;
	            if (m) r += int2char(d);
	        }
	    }
	    return m ? r : "0";
	}

	// (public) -this
	function bnNegate() {
	    var r = nbi();
	    BigInteger.ZERO.subTo(this, r);
	    return r;
	}

	// (public) |this|
	function bnAbs() {
	    return (this.s < 0) ? this.negate() : this;
	}

	// (public) return + if this > a, - if this < a, 0 if equal
	function bnCompareTo(a) {
	    var r = this.s - a.s;
	    if (r != 0) return r;
	    var i = this.t;
	    r = i - a.t;
	    if (r != 0) return (this.s < 0) ? -r : r;
	    while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
	    return 0;
	}

	// returns bit length of the integer x
	function nbits(x) {
	    var r = 1, t;
	    if ((t = x >>> 16) != 0) {
	        x = t;
	        r += 16;
	    }
	    if ((t = x >> 8) != 0) {
	        x = t;
	        r += 8;
	    }
	    if ((t = x >> 4) != 0) {
	        x = t;
	        r += 4;
	    }
	    if ((t = x >> 2) != 0) {
	        x = t;
	        r += 2;
	    }
	    if ((t = x >> 1) != 0) {
	        x = t;
	        r += 1;
	    }
	    return r;
	}

	// (public) return the number of bits in "this"
	function bnBitLength() {
	    if (this.t <= 0) return 0;
	    return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
	}

	// (protected) r = this << n*DB
	function bnpDLShiftTo(n, r) {
	    var i;
	    for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
	    for (i = n - 1; i >= 0; --i) r[i] = 0;
	    r.t = this.t + n;
	    r.s = this.s;
	}

	// (protected) r = this >> n*DB
	function bnpDRShiftTo(n, r) {
	    for (var i = n; i < this.t; ++i) r[i - n] = this[i];
	    r.t = Math.max(this.t - n, 0);
	    r.s = this.s;
	}

	// (protected) r = this << n
	function bnpLShiftTo(n, r) {
	    var bs = n % this.DB;
	    var cbs = this.DB - bs;
	    var bm = (1 << cbs) - 1;
	    var ds = Math.floor(n / this.DB), c = (this.s << bs) & this.DM, i;
	    for (i = this.t - 1; i >= 0; --i) {
	        r[i + ds + 1] = (this[i] >> cbs) | c;
	        c = (this[i] & bm) << bs;
	    }
	    for (i = ds - 1; i >= 0; --i) r[i] = 0;
	    r[ds] = c;
	    r.t = this.t + ds + 1;
	    r.s = this.s;
	    r.clamp();
	}

	// (protected) r = this >> n
	function bnpRShiftTo(n, r) {
	    r.s = this.s;
	    var ds = Math.floor(n / this.DB);
	    if (ds >= this.t) {
	        r.t = 0;
	        return;
	    }
	    var bs = n % this.DB;
	    var cbs = this.DB - bs;
	    var bm = (1 << bs) - 1;
	    r[0] = this[ds] >> bs;
	    for (var i = ds + 1; i < this.t; ++i) {
	        r[i - ds - 1] |= (this[i] & bm) << cbs;
	        r[i - ds] = this[i] >> bs;
	    }
	    if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
	    r.t = this.t - ds;
	    r.clamp();
	}

	// (protected) r = this - a
	function bnpSubTo(a, r) {
	    var i = 0, c = 0, m = Math.min(a.t, this.t);
	    while (i < m) {
	        c += this[i] - a[i];
	        r[i++] = c & this.DM;
	        c >>= this.DB;
	    }
	    if (a.t < this.t) {
	        c -= a.s;
	        while (i < this.t) {
	            c += this[i];
	            r[i++] = c & this.DM;
	            c >>= this.DB;
	        }
	        c += this.s;
	    }
	    else {
	        c += this.s;
	        while (i < a.t) {
	            c -= a[i];
	            r[i++] = c & this.DM;
	            c >>= this.DB;
	        }
	        c -= a.s;
	    }
	    r.s = (c < 0) ? -1 : 0;
	    if (c < -1) r[i++] = this.DV + c;
	    else if (c > 0) r[i++] = c;
	    r.t = i;
	    r.clamp();
	}

	// (protected) r = this * a, r != this,a (HAC 14.12)
	// "this" should be the larger one if appropriate.
	function bnpMultiplyTo(a, r) {
	    var x = this.abs(), y = a.abs();
	    var i = x.t;
	    r.t = i + y.t;
	    while (--i >= 0) r[i] = 0;
	    for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
	    r.s = 0;
	    r.clamp();
	    if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
	}

	// (protected) r = this^2, r != this (HAC 14.16)
	function bnpSquareTo(r) {
	    var x = this.abs();
	    var i = r.t = 2 * x.t;
	    while (--i >= 0) r[i] = 0;
	    for (i = 0; i < x.t - 1; ++i) {
	        var c = x.am(i, x[i], r, 2 * i, 0, 1);
	        if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
	            r[i + x.t] -= x.DV;
	            r[i + x.t + 1] = 1;
	        }
	    }
	    if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
	    r.s = 0;
	    r.clamp();
	}

	// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
	// r != q, this != m.  q or r may be null.
	function bnpDivRemTo(m, q, r) {
	    var pm = m.abs();
	    if (pm.t <= 0) return;
	    var pt = this.abs();
	    if (pt.t < pm.t) {
	        if (q != null) q.fromInt(0);
	        if (r != null) this.copyTo(r);
	        return;
	    }
	    if (r == null) r = nbi();
	    var y = nbi(), ts = this.s, ms = m.s;
	    var nsh = this.DB - nbits(pm[pm.t - 1]);	// normalize modulus
	    if (nsh > 0) {
	        pm.lShiftTo(nsh, y);
	        pt.lShiftTo(nsh, r);
	    }
	    else {
	        pm.copyTo(y);
	        pt.copyTo(r);
	    }
	    var ys = y.t;
	    var y0 = y[ys - 1];
	    if (y0 === 0) return;
	    var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
	    var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2;
	    var i = r.t, j = i - ys, t = (q == null) ? nbi() : q;
	    y.dlShiftTo(j, t);
	    if (r.compareTo(t) >= 0) {
	        r[r.t++] = 1;
	        r.subTo(t, r);
	    }
	    BigInteger.ONE.dlShiftTo(ys, t);
	    t.subTo(y, y);	// "negative" y so we can replace sub with am later
	    while (y.t < ys) y[y.t++] = 0;
	    while (--j >= 0) {
	        // Estimate quotient digit
	        var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
	        if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {	// Try it out
	            y.dlShiftTo(j, t);
	            r.subTo(t, r);
	            while (r[i] < --qd) r.subTo(t, r);
	        }
	    }
	    if (q != null) {
	        r.drShiftTo(ys, q);
	        if (ts != ms) BigInteger.ZERO.subTo(q, q);
	    }
	    r.t = ys;
	    r.clamp();
	    if (nsh > 0) r.rShiftTo(nsh, r);	// Denormalize remainder
	    if (ts < 0) BigInteger.ZERO.subTo(r, r);
	}

	// (public) this mod a
	function bnMod(a) {
	    var r = nbi();
	    this.abs().divRemTo(a, null, r);
	    if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
	    return r;
	}

	// Modular reduction using "classic" algorithm
	function Classic(m) {
	    this.m = m;
	}
	function cConvert(x) {
	    if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
	    else return x;
	}
	function cRevert(x) {
	    return x;
	}
	function cReduce(x) {
	    x.divRemTo(this.m, null, x);
	}
	function cMulTo(x, y, r) {
	    x.multiplyTo(y, r);
	    this.reduce(r);
	}
	function cSqrTo(x, r) {
	    x.squareTo(r);
	    this.reduce(r);
	}

	Classic.prototype.convert = cConvert;
	Classic.prototype.revert = cRevert;
	Classic.prototype.reduce = cReduce;
	Classic.prototype.mulTo = cMulTo;
	Classic.prototype.sqrTo = cSqrTo;

	// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
	// justification:
	//         xy == 1 (mod m)
	//         xy =  1+km
	//   xy(2-xy) = (1+km)(1-km)
	// x[y(2-xy)] = 1-k^2m^2
	// x[y(2-xy)] == 1 (mod m^2)
	// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
	// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
	// JS multiply "overflows" differently from C/C++, so care is needed here.
	function bnpInvDigit() {
	    if (this.t < 1) return 0;
	    var x = this[0];
	    if ((x & 1) === 0) return 0;
	    var y = x & 3;		// y == 1/x mod 2^2
	    y = (y * (2 - (x & 0xf) * y)) & 0xf;	// y == 1/x mod 2^4
	    y = (y * (2 - (x & 0xff) * y)) & 0xff;	// y == 1/x mod 2^8
	    y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff;	// y == 1/x mod 2^16
	    // last step - calculate inverse mod DV directly;
	    // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
	    y = (y * (2 - x * y % this.DV)) % this.DV;		// y == 1/x mod 2^dbits
	    // we really want the negative inverse, and -DV < y < DV
	    return (y > 0) ? this.DV - y : -y;
	}

	// Montgomery reduction
	function Montgomery(m) {
	    this.m = m;
	    this.mp = m.invDigit();
	    this.mpl = this.mp & 0x7fff;
	    this.mph = this.mp >> 15;
	    this.um = (1 << (m.DB - 15)) - 1;
	    this.mt2 = 2 * m.t;
	}

	// xR mod m
	function montConvert(x) {
	    var r = nbi();
	    x.abs().dlShiftTo(this.m.t, r);
	    r.divRemTo(this.m, null, r);
	    if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
	    return r;
	}

	// x/R mod m
	function montRevert(x) {
	    var r = nbi();
	    x.copyTo(r);
	    this.reduce(r);
	    return r;
	}

	// x = x/R mod m (HAC 14.32)
	function montReduce(x) {
	    while (x.t <= this.mt2)	// pad x so am has enough room later
	        x[x.t++] = 0;
	    for (var i = 0; i < this.m.t; ++i) {
	        // faster way of calculating u0 = x[i]*mp mod DV
	        var j = x[i] & 0x7fff;
	        var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
	        // use am to combine the multiply-shift-add into one call
	        j = i + this.m.t;
	        x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
	        // propagate carry
	        while (x[j] >= x.DV) {
	            x[j] -= x.DV;
	            x[++j]++;
	        }
	    }
	    x.clamp();
	    x.drShiftTo(this.m.t, x);
	    if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
	}

	// r = "x^2/R mod m"; x != r
	function montSqrTo(x, r) {
	    x.squareTo(r);
	    this.reduce(r);
	}

	// r = "xy/R mod m"; x,y != r
	function montMulTo(x, y, r) {
	    x.multiplyTo(y, r);
	    this.reduce(r);
	}

	Montgomery.prototype.convert = montConvert;
	Montgomery.prototype.revert = montRevert;
	Montgomery.prototype.reduce = montReduce;
	Montgomery.prototype.mulTo = montMulTo;
	Montgomery.prototype.sqrTo = montSqrTo;

	// (protected) true iff this is even
	function bnpIsEven() {
	    return ((this.t > 0) ? (this[0] & 1) : this.s) === 0;
	}

	// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
	function bnpExp(e, z) {
	    if (e > 0xffffffff || e < 1) return BigInteger.ONE;
	    var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
	    g.copyTo(r);
	    while (--i >= 0) {
	        z.sqrTo(r, r2);
	        if ((e & (1 << i)) > 0) z.mulTo(r2, g, r);
	        else {
	            var t = r;
	            r = r2;
	            r2 = t;
	        }
	    }
	    return z.revert(r);
	}

	// (public) this^e % m, 0 <= e < 2^32
	function bnModPowInt(e, m) {
	    var z;
	    if (e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
	    return this.exp(e, z);
	}

	// Copyright (c) 2005-2009  Tom Wu
	// All Rights Reserved.
	// See "LICENSE" for details.

	// Extended JavaScript BN functions, required for RSA private ops.

	// Version 1.1: new BigInteger("0", 10) returns "proper" zero
	// Version 1.2: square() API, isProbablePrime fix

	//(public)
	function bnClone() {
	    var r = nbi();
	    this.copyTo(r);
	    return r;
	}

	//(public) return value as integer
	function bnIntValue() {
	    if (this.s < 0) {
	        if (this.t == 1) return this[0] - this.DV;
	        else if (this.t === 0) return -1;
	    }
	    else if (this.t == 1) return this[0];
	    else if (this.t === 0) return 0;
	// assumes 16 < DB < 32
	    return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
	}

	//(public) return value as byte
	function bnByteValue() {
	    return (this.t == 0) ? this.s : (this[0] << 24) >> 24;
	}

	//(public) return value as short (assumes DB>=16)
	function bnShortValue() {
	    return (this.t == 0) ? this.s : (this[0] << 16) >> 16;
	}

	//(protected) return x s.t. r^x < DV
	function bnpChunkSize(r) {
	    return Math.floor(Math.LN2 * this.DB / Math.log(r));
	}

	//(public) 0 if this === 0, 1 if this > 0
	function bnSigNum() {
	    if (this.s < 0) return -1;
	    else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
	    else return 1;
	}

	//(protected) convert to radix string
	function bnpToRadix(b) {
	    if (b == null) b = 10;
	    if (this.signum() === 0 || b < 2 || b > 36) return "0";
	    var cs = this.chunkSize(b);
	    var a = Math.pow(b, cs);
	    var d = nbv(a), y = nbi(), z = nbi(), r = "";
	    this.divRemTo(d, y, z);
	    while (y.signum() > 0) {
	        r = (a + z.intValue()).toString(b).substr(1) + r;
	        y.divRemTo(d, y, z);
	    }
	    return z.intValue().toString(b) + r;
	}

	//(protected) convert from radix string
	function bnpFromRadix(s, b) {
	    this.fromInt(0);
	    if (b == null) b = 10;
	    var cs = this.chunkSize(b);
	    var d = Math.pow(b, cs), mi = false, j = 0, w = 0;
	    for (var i = 0; i < s.length; ++i) {
	        var x = intAt(s, i);
	        if (x < 0) {
	            if (s.charAt(i) == "-" && this.signum() === 0) mi = true;
	            continue;
	        }
	        w = b * w + x;
	        if (++j >= cs) {
	            this.dMultiply(d);
	            this.dAddOffset(w, 0);
	            j = 0;
	            w = 0;
	        }
	    }
	    if (j > 0) {
	        this.dMultiply(Math.pow(b, j));
	        this.dAddOffset(w, 0);
	    }
	    if (mi) BigInteger.ZERO.subTo(this, this);
	}

	//(protected) alternate constructor
	function bnpFromNumber(a, b) {
	    if ("number" == typeof b) {
	        // new BigInteger(int,int,RNG)
	        if (a < 2) this.fromInt(1);
	        else {
	            this.fromNumber(a);
	            if (!this.testBit(a - 1))	// force MSB set
	                this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
	            if (this.isEven()) this.dAddOffset(1, 0); // force odd
	            while (!this.isProbablePrime(b)) {
	                this.dAddOffset(2, 0);
	                if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
	            }
	        }
	    } else {
	        // new BigInteger(int,RNG)
	        var x = crypt.randomBytes((a >> 3) + 1)
	        var t = a & 7;

	        if (t > 0)
	            x[0] &= ((1 << t) - 1);
	        else
	            x[0] = 0;

	        this.fromByteArray(x);
	    }
	}

	//(public) convert to bigendian byte array
	function bnToByteArray() {
	    var i = this.t, r = new Array();
	    r[0] = this.s;
	    var p = this.DB - (i * this.DB) % 8, d, k = 0;
	    if (i-- > 0) {
	        if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
	            r[k++] = d | (this.s << (this.DB - p));
	        while (i >= 0) {
	            if (p < 8) {
	                d = (this[i] & ((1 << p) - 1)) << (8 - p);
	                d |= this[--i] >> (p += this.DB - 8);
	            }
	            else {
	                d = (this[i] >> (p -= 8)) & 0xff;
	                if (p <= 0) {
	                    p += this.DB;
	                    --i;
	                }
	            }
	            if ((d & 0x80) != 0) d |= -256;
	            if (k === 0 && (this.s & 0x80) != (d & 0x80)) ++k;
	            if (k > 0 || d != this.s) r[k++] = d;
	        }
	    }
	    return r;
	}

	/**
	 * return Buffer object
	 * @param trim {boolean} slice buffer if first element == 0
	 * @returns {Buffer}
	 */
	function bnToBuffer(trimOrSize) {
	    var res = new Buffer(this.toByteArray());
	    if (trimOrSize === true && res[0] === 0) {
	        res = res.slice(1);
	    } else if (_.isNumber(trimOrSize)) {
	        if (res.length > trimOrSize) {
	            for (var i = 0; i < res.length - trimOrSize; i++) {
	                if (res[i] !== 0) {
	                    return null;
	                }
	            }
	            return res.slice(res.length - trimOrSize);
	        } else if (res.length < trimOrSize) {
	            var padded = new Buffer(trimOrSize);
	            padded.fill(0, 0, trimOrSize - res.length);
	            res.copy(padded, trimOrSize - res.length);
	            return padded;
	        }
	    }
	    return res;
	}

	function bnEquals(a) {
	    return (this.compareTo(a) == 0);
	}
	function bnMin(a) {
	    return (this.compareTo(a) < 0) ? this : a;
	}
	function bnMax(a) {
	    return (this.compareTo(a) > 0) ? this : a;
	}

	//(protected) r = this op a (bitwise)
	function bnpBitwiseTo(a, op, r) {
	    var i, f, m = Math.min(a.t, this.t);
	    for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
	    if (a.t < this.t) {
	        f = a.s & this.DM;
	        for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
	        r.t = this.t;
	    }
	    else {
	        f = this.s & this.DM;
	        for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
	        r.t = a.t;
	    }
	    r.s = op(this.s, a.s);
	    r.clamp();
	}

	//(public) this & a
	function op_and(x, y) {
	    return x & y;
	}
	function bnAnd(a) {
	    var r = nbi();
	    this.bitwiseTo(a, op_and, r);
	    return r;
	}

	//(public) this | a
	function op_or(x, y) {
	    return x | y;
	}
	function bnOr(a) {
	    var r = nbi();
	    this.bitwiseTo(a, op_or, r);
	    return r;
	}

	//(public) this ^ a
	function op_xor(x, y) {
	    return x ^ y;
	}
	function bnXor(a) {
	    var r = nbi();
	    this.bitwiseTo(a, op_xor, r);
	    return r;
	}

	//(public) this & ~a
	function op_andnot(x, y) {
	    return x & ~y;
	}
	function bnAndNot(a) {
	    var r = nbi();
	    this.bitwiseTo(a, op_andnot, r);
	    return r;
	}

	//(public) ~this
	function bnNot() {
	    var r = nbi();
	    for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
	    r.t = this.t;
	    r.s = ~this.s;
	    return r;
	}

	//(public) this << n
	function bnShiftLeft(n) {
	    var r = nbi();
	    if (n < 0) this.rShiftTo(-n, r); else this.lShiftTo(n, r);
	    return r;
	}

	//(public) this >> n
	function bnShiftRight(n) {
	    var r = nbi();
	    if (n < 0) this.lShiftTo(-n, r); else this.rShiftTo(n, r);
	    return r;
	}

	//return index of lowest 1-bit in x, x < 2^31
	function lbit(x) {
	    if (x === 0) return -1;
	    var r = 0;
	    if ((x & 0xffff) === 0) {
	        x >>= 16;
	        r += 16;
	    }
	    if ((x & 0xff) === 0) {
	        x >>= 8;
	        r += 8;
	    }
	    if ((x & 0xf) === 0) {
	        x >>= 4;
	        r += 4;
	    }
	    if ((x & 3) === 0) {
	        x >>= 2;
	        r += 2;
	    }
	    if ((x & 1) === 0) ++r;
	    return r;
	}

	//(public) returns index of lowest 1-bit (or -1 if none)
	function bnGetLowestSetBit() {
	    for (var i = 0; i < this.t; ++i)
	        if (this[i] != 0) return i * this.DB + lbit(this[i]);
	    if (this.s < 0) return this.t * this.DB;
	    return -1;
	}

	//return number of 1 bits in x
	function cbit(x) {
	    var r = 0;
	    while (x != 0) {
	        x &= x - 1;
	        ++r;
	    }
	    return r;
	}

	//(public) return number of set bits
	function bnBitCount() {
	    var r = 0, x = this.s & this.DM;
	    for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
	    return r;
	}

	//(public) true iff nth bit is set
	function bnTestBit(n) {
	    var j = Math.floor(n / this.DB);
	    if (j >= this.t) return (this.s != 0);
	    return ((this[j] & (1 << (n % this.DB))) != 0);
	}

	//(protected) this op (1<<n)
	function bnpChangeBit(n, op) {
	    var r = BigInteger.ONE.shiftLeft(n);
	    this.bitwiseTo(r, op, r);
	    return r;
	}

	//(public) this | (1<<n)
	function bnSetBit(n) {
	    return this.changeBit(n, op_or);
	}

	//(public) this & ~(1<<n)
	function bnClearBit(n) {
	    return this.changeBit(n, op_andnot);
	}

	//(public) this ^ (1<<n)
	function bnFlipBit(n) {
	    return this.changeBit(n, op_xor);
	}

	//(protected) r = this + a
	function bnpAddTo(a, r) {
	    var i = 0, c = 0, m = Math.min(a.t, this.t);
	    while (i < m) {
	        c += this[i] + a[i];
	        r[i++] = c & this.DM;
	        c >>= this.DB;
	    }
	    if (a.t < this.t) {
	        c += a.s;
	        while (i < this.t) {
	            c += this[i];
	            r[i++] = c & this.DM;
	            c >>= this.DB;
	        }
	        c += this.s;
	    }
	    else {
	        c += this.s;
	        while (i < a.t) {
	            c += a[i];
	            r[i++] = c & this.DM;
	            c >>= this.DB;
	        }
	        c += a.s;
	    }
	    r.s = (c < 0) ? -1 : 0;
	    if (c > 0) r[i++] = c;
	    else if (c < -1) r[i++] = this.DV + c;
	    r.t = i;
	    r.clamp();
	}

	//(public) this + a
	function bnAdd(a) {
	    var r = nbi();
	    this.addTo(a, r);
	    return r;
	}

	//(public) this - a
	function bnSubtract(a) {
	    var r = nbi();
	    this.subTo(a, r);
	    return r;
	}

	//(public) this * a
	function bnMultiply(a) {
	    var r = nbi();
	    this.multiplyTo(a, r);
	    return r;
	}

	// (public) this^2
	function bnSquare() {
	    var r = nbi();
	    this.squareTo(r);
	    return r;
	}

	//(public) this / a
	function bnDivide(a) {
	    var r = nbi();
	    this.divRemTo(a, r, null);
	    return r;
	}

	//(public) this % a
	function bnRemainder(a) {
	    var r = nbi();
	    this.divRemTo(a, null, r);
	    return r;
	}

	//(public) [this/a,this%a]
	function bnDivideAndRemainder(a) {
	    var q = nbi(), r = nbi();
	    this.divRemTo(a, q, r);
	    return new Array(q, r);
	}

	//(protected) this *= n, this >= 0, 1 < n < DV
	function bnpDMultiply(n) {
	    this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
	    ++this.t;
	    this.clamp();
	}

	//(protected) this += n << w words, this >= 0
	function bnpDAddOffset(n, w) {
	    if (n === 0) return;
	    while (this.t <= w) this[this.t++] = 0;
	    this[w] += n;
	    while (this[w] >= this.DV) {
	        this[w] -= this.DV;
	        if (++w >= this.t) this[this.t++] = 0;
	        ++this[w];
	    }
	}

	//A "null" reducer
	function NullExp() {
	}
	function nNop(x) {
	    return x;
	}
	function nMulTo(x, y, r) {
	    x.multiplyTo(y, r);
	}
	function nSqrTo(x, r) {
	    x.squareTo(r);
	}

	NullExp.prototype.convert = nNop;
	NullExp.prototype.revert = nNop;
	NullExp.prototype.mulTo = nMulTo;
	NullExp.prototype.sqrTo = nSqrTo;

	//(public) this^e
	function bnPow(e) {
	    return this.exp(e, new NullExp());
	}

	//(protected) r = lower n words of "this * a", a.t <= n
	//"this" should be the larger one if appropriate.
	function bnpMultiplyLowerTo(a, n, r) {
	    var i = Math.min(this.t + a.t, n);
	    r.s = 0; // assumes a,this >= 0
	    r.t = i;
	    while (i > 0) r[--i] = 0;
	    var j;
	    for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
	    for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
	    r.clamp();
	}

	//(protected) r = "this * a" without lower n words, n > 0
	//"this" should be the larger one if appropriate.
	function bnpMultiplyUpperTo(a, n, r) {
	    --n;
	    var i = r.t = this.t + a.t - n;
	    r.s = 0; // assumes a,this >= 0
	    while (--i >= 0) r[i] = 0;
	    for (i = Math.max(n - this.t, 0); i < a.t; ++i)
	        r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
	    r.clamp();
	    r.drShiftTo(1, r);
	}

	//Barrett modular reduction
	function Barrett(m) {
	// setup Barrett
	    this.r2 = nbi();
	    this.q3 = nbi();
	    BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
	    this.mu = this.r2.divide(m);
	    this.m = m;
	}

	function barrettConvert(x) {
	    if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
	    else if (x.compareTo(this.m) < 0) return x;
	    else {
	        var r = nbi();
	        x.copyTo(r);
	        this.reduce(r);
	        return r;
	    }
	}

	function barrettRevert(x) {
	    return x;
	}

	//x = x mod m (HAC 14.42)
	function barrettReduce(x) {
	    x.drShiftTo(this.m.t - 1, this.r2);
	    if (x.t > this.m.t + 1) {
	        x.t = this.m.t + 1;
	        x.clamp();
	    }
	    this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
	    this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
	    while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
	    x.subTo(this.r2, x);
	    while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
	}

	//r = x^2 mod m; x != r
	function barrettSqrTo(x, r) {
	    x.squareTo(r);
	    this.reduce(r);
	}

	//r = x*y mod m; x,y != r
	function barrettMulTo(x, y, r) {
	    x.multiplyTo(y, r);
	    this.reduce(r);
	}

	Barrett.prototype.convert = barrettConvert;
	Barrett.prototype.revert = barrettRevert;
	Barrett.prototype.reduce = barrettReduce;
	Barrett.prototype.mulTo = barrettMulTo;
	Barrett.prototype.sqrTo = barrettSqrTo;

	//(public) this^e % m (HAC 14.85)
	function bnModPow(e, m) {
	    var i = e.bitLength(), k, r = nbv(1), z;
	    if (i <= 0) return r;
	    else if (i < 18) k = 1;
	    else if (i < 48) k = 3;
	    else if (i < 144) k = 4;
	    else if (i < 768) k = 5;
	    else k = 6;
	    if (i < 8)
	        z = new Classic(m);
	    else if (m.isEven())
	        z = new Barrett(m);
	    else
	        z = new Montgomery(m);

	// precomputation
	    var g = new Array(), n = 3, k1 = k - 1, km = (1 << k) - 1;
	    g[1] = z.convert(this);
	    if (k > 1) {
	        var g2 = nbi();
	        z.sqrTo(g[1], g2);
	        while (n <= km) {
	            g[n] = nbi();
	            z.mulTo(g2, g[n - 2], g[n]);
	            n += 2;
	        }
	    }

	    var j = e.t - 1, w, is1 = true, r2 = nbi(), t;
	    i = nbits(e[j]) - 1;
	    while (j >= 0) {
	        if (i >= k1) w = (e[j] >> (i - k1)) & km;
	        else {
	            w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
	            if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
	        }

	        n = k;
	        while ((w & 1) === 0) {
	            w >>= 1;
	            --n;
	        }
	        if ((i -= n) < 0) {
	            i += this.DB;
	            --j;
	        }
	        if (is1) {	// ret == 1, don't bother squaring or multiplying it
	            g[w].copyTo(r);
	            is1 = false;
	        }
	        else {
	            while (n > 1) {
	                z.sqrTo(r, r2);
	                z.sqrTo(r2, r);
	                n -= 2;
	            }
	            if (n > 0) z.sqrTo(r, r2); else {
	                t = r;
	                r = r2;
	                r2 = t;
	            }
	            z.mulTo(r2, g[w], r);
	        }

	        while (j >= 0 && (e[j] & (1 << i)) === 0) {
	            z.sqrTo(r, r2);
	            t = r;
	            r = r2;
	            r2 = t;
	            if (--i < 0) {
	                i = this.DB - 1;
	                --j;
	            }
	        }
	    }
	    return z.revert(r);
	}

	//(public) gcd(this,a) (HAC 14.54)
	function bnGCD(a) {
	    var x = (this.s < 0) ? this.negate() : this.clone();
	    var y = (a.s < 0) ? a.negate() : a.clone();
	    if (x.compareTo(y) < 0) {
	        var t = x;
	        x = y;
	        y = t;
	    }
	    var i = x.getLowestSetBit(), g = y.getLowestSetBit();
	    if (g < 0) return x;
	    if (i < g) g = i;
	    if (g > 0) {
	        x.rShiftTo(g, x);
	        y.rShiftTo(g, y);
	    }
	    while (x.signum() > 0) {
	        if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
	        if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
	        if (x.compareTo(y) >= 0) {
	            x.subTo(y, x);
	            x.rShiftTo(1, x);
	        }
	        else {
	            y.subTo(x, y);
	            y.rShiftTo(1, y);
	        }
	    }
	    if (g > 0) y.lShiftTo(g, y);
	    return y;
	}

	//(protected) this % n, n < 2^26
	function bnpModInt(n) {
	    if (n <= 0) return 0;
	    var d = this.DV % n, r = (this.s < 0) ? n - 1 : 0;
	    if (this.t > 0)
	        if (d === 0) r = this[0] % n;
	        else for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
	    return r;
	}

	//(public) 1/this % m (HAC 14.61)
	function bnModInverse(m) {
	    var ac = m.isEven();
	    if ((this.isEven() && ac) || m.signum() === 0) return BigInteger.ZERO;
	    var u = m.clone(), v = this.clone();
	    var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
	    while (u.signum() != 0) {
	        while (u.isEven()) {
	            u.rShiftTo(1, u);
	            if (ac) {
	                if (!a.isEven() || !b.isEven()) {
	                    a.addTo(this, a);
	                    b.subTo(m, b);
	                }
	                a.rShiftTo(1, a);
	            }
	            else if (!b.isEven()) b.subTo(m, b);
	            b.rShiftTo(1, b);
	        }
	        while (v.isEven()) {
	            v.rShiftTo(1, v);
	            if (ac) {
	                if (!c.isEven() || !d.isEven()) {
	                    c.addTo(this, c);
	                    d.subTo(m, d);
	                }
	                c.rShiftTo(1, c);
	            }
	            else if (!d.isEven()) d.subTo(m, d);
	            d.rShiftTo(1, d);
	        }
	        if (u.compareTo(v) >= 0) {
	            u.subTo(v, u);
	            if (ac) a.subTo(c, a);
	            b.subTo(d, b);
	        }
	        else {
	            v.subTo(u, v);
	            if (ac) c.subTo(a, c);
	            d.subTo(b, d);
	        }
	    }
	    if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
	    if (d.compareTo(m) >= 0) return d.subtract(m);
	    if (d.signum() < 0) d.addTo(m, d); else return d;
	    if (d.signum() < 0) return d.add(m); else return d;
	}

	var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
	var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];

	//(public) test primality with certainty >= 1-.5^t
	function bnIsProbablePrime(t) {
	    var i, x = this.abs();
	    if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
	        for (i = 0; i < lowprimes.length; ++i)
	            if (x[0] == lowprimes[i]) return true;
	        return false;
	    }
	    if (x.isEven()) return false;
	    i = 1;
	    while (i < lowprimes.length) {
	        var m = lowprimes[i], j = i + 1;
	        while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
	        m = x.modInt(m);
	        while (i < j) if (m % lowprimes[i++] === 0) return false;
	    }
	    return x.millerRabin(t);
	}

	//(protected) true if probably prime (HAC 4.24, Miller-Rabin)
	function bnpMillerRabin(t) {
	    var n1 = this.subtract(BigInteger.ONE);
	    var k = n1.getLowestSetBit();
	    if (k <= 0) return false;
	    var r = n1.shiftRight(k);
	    t = (t + 1) >> 1;
	    if (t > lowprimes.length) t = lowprimes.length;
	    var a = nbi();
	    for (var i = 0; i < t; ++i) {
	        //Pick bases at random, instead of starting at 2
	        a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
	        var y = a.modPow(r, this);
	        if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
	            var j = 1;
	            while (j++ < k && y.compareTo(n1) != 0) {
	                y = y.modPowInt(2, this);
	                if (y.compareTo(BigInteger.ONE) === 0) return false;
	            }
	            if (y.compareTo(n1) != 0) return false;
	        }
	    }
	    return true;
	}

	// protected
	BigInteger.prototype.copyTo = bnpCopyTo;
	BigInteger.prototype.fromInt = bnpFromInt;
	BigInteger.prototype.fromString = bnpFromString;
	BigInteger.prototype.fromByteArray = bnpFromByteArray;
	BigInteger.prototype.fromBuffer = bnpFromBuffer;
	BigInteger.prototype.clamp = bnpClamp;
	BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
	BigInteger.prototype.drShiftTo = bnpDRShiftTo;
	BigInteger.prototype.lShiftTo = bnpLShiftTo;
	BigInteger.prototype.rShiftTo = bnpRShiftTo;
	BigInteger.prototype.subTo = bnpSubTo;
	BigInteger.prototype.multiplyTo = bnpMultiplyTo;
	BigInteger.prototype.squareTo = bnpSquareTo;
	BigInteger.prototype.divRemTo = bnpDivRemTo;
	BigInteger.prototype.invDigit = bnpInvDigit;
	BigInteger.prototype.isEven = bnpIsEven;
	BigInteger.prototype.exp = bnpExp;

	BigInteger.prototype.chunkSize = bnpChunkSize;
	BigInteger.prototype.toRadix = bnpToRadix;
	BigInteger.prototype.fromRadix = bnpFromRadix;
	BigInteger.prototype.fromNumber = bnpFromNumber;
	BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
	BigInteger.prototype.changeBit = bnpChangeBit;
	BigInteger.prototype.addTo = bnpAddTo;
	BigInteger.prototype.dMultiply = bnpDMultiply;
	BigInteger.prototype.dAddOffset = bnpDAddOffset;
	BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
	BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
	BigInteger.prototype.modInt = bnpModInt;
	BigInteger.prototype.millerRabin = bnpMillerRabin;


	// public
	BigInteger.prototype.toString = bnToString;
	BigInteger.prototype.negate = bnNegate;
	BigInteger.prototype.abs = bnAbs;
	BigInteger.prototype.compareTo = bnCompareTo;
	BigInteger.prototype.bitLength = bnBitLength;
	BigInteger.prototype.mod = bnMod;
	BigInteger.prototype.modPowInt = bnModPowInt;

	BigInteger.prototype.clone = bnClone;
	BigInteger.prototype.intValue = bnIntValue;
	BigInteger.prototype.byteValue = bnByteValue;
	BigInteger.prototype.shortValue = bnShortValue;
	BigInteger.prototype.signum = bnSigNum;
	BigInteger.prototype.toByteArray = bnToByteArray;
	BigInteger.prototype.toBuffer = bnToBuffer;
	BigInteger.prototype.equals = bnEquals;
	BigInteger.prototype.min = bnMin;
	BigInteger.prototype.max = bnMax;
	BigInteger.prototype.and = bnAnd;
	BigInteger.prototype.or = bnOr;
	BigInteger.prototype.xor = bnXor;
	BigInteger.prototype.andNot = bnAndNot;
	BigInteger.prototype.not = bnNot;
	BigInteger.prototype.shiftLeft = bnShiftLeft;
	BigInteger.prototype.shiftRight = bnShiftRight;
	BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
	BigInteger.prototype.bitCount = bnBitCount;
	BigInteger.prototype.testBit = bnTestBit;
	BigInteger.prototype.setBit = bnSetBit;
	BigInteger.prototype.clearBit = bnClearBit;
	BigInteger.prototype.flipBit = bnFlipBit;
	BigInteger.prototype.add = bnAdd;
	BigInteger.prototype.subtract = bnSubtract;
	BigInteger.prototype.multiply = bnMultiply;
	BigInteger.prototype.divide = bnDivide;
	BigInteger.prototype.remainder = bnRemainder;
	BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
	BigInteger.prototype.modPow = bnModPow;
	BigInteger.prototype.modInverse = bnModInverse;
	BigInteger.prototype.pow = bnPow;
	BigInteger.prototype.gcd = bnGCD;
	BigInteger.prototype.isProbablePrime = bnIsProbablePrime;
	BigInteger.int2char = int2char;

	// "constants"
	BigInteger.ZERO = nbv(0);
	BigInteger.ONE = nbv(1);

	// JSBN-specific extension
	BigInteger.prototype.square = bnSquare;

	//BigInteger interfaces not implemented in jsbn:

	//BigInteger(int signum, byte[] magnitude)
	//double doubleValue()
	//float floatValue()
	//int hashCode()
	//long longValue()
	//static BigInteger valueOf(long val)

	module.exports = BigInteger;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = {
	    pkcs1: __webpack_require__(33),
	    pkcs1_oaep: __webpack_require__(34),
	    pss: __webpack_require__(35),

	    /**
	     * Check if scheme has padding methods
	     * @param scheme {string}
	     * @returns {Boolean}
	     */
	    isEncryption: function (scheme) {
	        return module.exports[scheme] && module.exports[scheme].isEncryption;
	    },

	    /**
	     * Check if scheme has sign/verify methods
	     * @param scheme {string}
	     * @returns {Boolean}
	     */
	    isSignature: function (scheme) {
	        return module.exports[scheme] && module.exports[scheme].isSignature;
	    }
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * PKCS1 padding and signature scheme
	 */

	var BigInteger = __webpack_require__(31);
	var crypt = __webpack_require__(13);
	var SIGN_INFO_HEAD = {
	    md2: new Buffer('3020300c06082a864886f70d020205000410', 'hex'),
	    md5: new Buffer('3020300c06082a864886f70d020505000410', 'hex'),
	    sha1: new Buffer('3021300906052b0e03021a05000414', 'hex'),
	    sha224: new Buffer('302d300d06096086480165030402040500041c', 'hex'),
	    sha256: new Buffer('3031300d060960864801650304020105000420', 'hex'),
	    sha384: new Buffer('3041300d060960864801650304020205000430', 'hex'),
	    sha512: new Buffer('3051300d060960864801650304020305000440', 'hex'),
	    ripemd160: new Buffer('3021300906052b2403020105000414', 'hex'),
	    rmd160: new Buffer('3021300906052b2403020105000414', 'hex')
	};

	var SIGN_ALG_TO_HASH_ALIASES = {
	    'ripemd160': 'rmd160'
	};

	var DEFAULT_HASH_FUNCTION = 'sha256';

	module.exports = {
	    isEncryption: true,
	    isSignature: true
	};

	module.exports.makeScheme = function (key, options) {
	    function Scheme(key, options) {
	        this.key = key;
	        this.options = options;
	    }

	    Scheme.prototype.maxMessageLength = function () {
	        return this.key.encryptedDataLength - 11;
	    };

	    /**
	     * Pad input Buffer to encryptedDataLength bytes, and return new Buffer
	     * alg: PKCS#1
	     * @param buffer
	     * @returns {Buffer}
	     */
	    Scheme.prototype.encPad = function (buffer, options) {
	        options = options || {};
	        var filled;
	        if (buffer.length > this.key.maxMessageLength) {
	            throw new Error("Message too long for RSA (n=" + this.key.encryptedDataLength + ", l=" + buffer.length + ")");
	        }

	        if (options.type === 1) {
	            filled = new Buffer(this.key.encryptedDataLength - buffer.length - 1);
	            filled.fill(0xff, 0, filled.length - 1);
	            filled[0] = 1;
	            filled[filled.length - 1] = 0;

	            return Buffer.concat([filled, buffer]);
	        } else {
	            filled = new Buffer(this.key.encryptedDataLength - buffer.length);
	            filled[0] = 0;
	            filled[1] = 2;
	            var rand = crypt.randomBytes(filled.length - 3);
	            for (var i = 0; i < rand.length; i++) {
	                var r = rand[i];
	                while (r === 0) { // non-zero only
	                    r = crypt.randomBytes(1)[0];
	                }
	                filled[i + 2] = r;
	            }
	            filled[filled.length - 1] = 0;
	            return Buffer.concat([filled, buffer]);
	        }
	    };

	    /**
	     * Unpad input Buffer and, if valid, return the Buffer object
	     * alg: PKCS#1 (type 2, random)
	     * @param buffer
	     * @returns {Buffer}
	     */
	    Scheme.prototype.encUnPad = function (buffer, options) {
	        options = options || {};
	        var i = 0;

	        if (buffer.length < 4) {
	            return null;
	        }

	        if (options.type === 1) {
	            if (buffer[0] !== 0 && buffer[1] !== 1) {
	                return null;
	            }
	            i = 3;
	            while (buffer[i] !== 0) {
	                if (buffer[i] != 0xFF || ++i >= buffer.length) {
	                    return null;
	                }
	            }
	        } else {
	            if (buffer[0] !== 0 && buffer[1] !== 2) {
	                return null;
	            }
	            i = 3;
	            while (buffer[i] !== 0) {
	                if (++i >= buffer.length) {
	                    return null;
	                }
	            }
	        }
	        return buffer.slice(i + 1, buffer.length);
	    };

	    Scheme.prototype.sign = function (buffer) {
	        var hashAlgorithm = this.options.signingSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
	        if (this.options.environment === 'browser') {
	            hashAlgorithm = SIGN_ALG_TO_HASH_ALIASES[hashAlgorithm] || hashAlgorithm;

	            var hasher = crypt.createHash(hashAlgorithm);
	            hasher.update(buffer);
	            var hash = this.pkcs1pad(hasher.digest(), hashAlgorithm);
	            var res = this.key.$doPrivate(new BigInteger(hash)).toBuffer(this.key.encryptedDataLength);

	            return res;
	        } else {
	            var signer = crypt.createSign('RSA-' + hashAlgorithm.toUpperCase());
	            signer.update(buffer);
	            return signer.sign(this.options.rsaUtils.exportKey('private'));
	        }
	    };

	    Scheme.prototype.verify = function (buffer, signature, signature_encoding) {
	        var hashAlgorithm = this.options.signingSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
	        if (this.options.environment === 'browser') {
	            hashAlgorithm = SIGN_ALG_TO_HASH_ALIASES[hashAlgorithm] || hashAlgorithm;

	            if (signature_encoding) {
	                signature = new Buffer(signature, signature_encoding);
	            }

	            var hasher = crypt.createHash(hashAlgorithm);
	            hasher.update(buffer);
	            var hash = this.pkcs1pad(hasher.digest(), hashAlgorithm);
	            var m = this.key.$doPublic(new BigInteger(signature));

	            return m.toBuffer().toString('hex') == hash.toString('hex');
	        } else {
	            var verifier = crypt.createVerify('RSA-' + hashAlgorithm.toUpperCase());
	            verifier.update(buffer);
	            return verifier.verify(this.options.rsaUtils.exportKey('public'), signature, signature_encoding);
	        }
	    };

	    /**
	     * PKCS#1 pad input buffer to max data length
	     * @param hashBuf
	     * @param hashAlgorithm
	     * @returns {*}
	     */
	    Scheme.prototype.pkcs1pad = function (hashBuf, hashAlgorithm) {
	        var digest = SIGN_INFO_HEAD[hashAlgorithm];
	        if (!digest) {
	            throw Error('Unsupported hash algorithm');
	        }

	        var data = Buffer.concat([digest, hashBuf]);

	        if (data.length + 10 > this.key.encryptedDataLength) {
	            throw Error('Key is too short for signing algorithm (' + hashAlgorithm + ')');
	        }

	        var filled = new Buffer(this.key.encryptedDataLength - data.length - 1);
	        filled.fill(0xff, 0, filled.length - 1);
	        filled[0] = 1;
	        filled[filled.length - 1] = 0;

	        var res = Buffer.concat([filled, data]);

	        return res;
	    };

	    return new Scheme(key, options);
	};



	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * PKCS_OAEP signature scheme
	 */

	var BigInteger = __webpack_require__(31);
	var crypt = __webpack_require__(13);

	module.exports = {
	    isEncryption: true,
	    isSignature: false
	};

	module.exports.digestLength = {
	    md4: 16,
	    md5: 16,
	    ripemd160: 20,
	    rmd160: 20,
	    sha: 20,
	    sha1: 20,
	    sha224: 28,
	    sha256: 32,
	    sha384: 48,
	    sha512: 64
	};

	var DEFAULT_HASH_FUNCTION = 'sha1';

	/*
	 * OAEP Mask Generation Function 1
	 * Generates a buffer full of pseudorandom bytes given seed and maskLength.
	 * Giving the same seed, maskLength, and hashFunction will result in the same exact byte values in the buffer.
	 *
	 * https://tools.ietf.org/html/rfc3447#appendix-B.2.1
	 *
	 * Parameters:
	 * seed			[Buffer]	The pseudo random seed for this function
	 * maskLength	[int]		The length of the output
	 * hashFunction	[String]	The hashing function to use. Will accept any valid crypto hash. Default "sha1"
	 *		Supports "sha1" and "sha256".
	 *		To add another algorythm the algorythem must be accepted by crypto.createHash, and then the length of the output of the hash function (the digest) must be added to the digestLength object below.
	 *		Most RSA implementations will be expecting sha1
	 */
	module.exports.eme_oaep_mgf1 = function (seed, maskLength, hashFunction) {
	    hashFunction = hashFunction || DEFAULT_HASH_FUNCTION;
	    var hLen = module.exports.digestLength[hashFunction];
	    var count = Math.ceil(maskLength / hLen);
	    var T = new Buffer(hLen * count);
	    var c = new Buffer(4);
	    for (var i = 0; i < count; ++i) {
	        var hash = crypt.createHash(hashFunction);
	        hash.update(seed);
	        c.writeUInt32BE(i, 0);
	        hash.update(c);
	        hash.digest().copy(T, i * hLen);
	    }
	    return T.slice(0, maskLength);
	};

	module.exports.makeScheme = function (key, options) {
	    function Scheme(key, options) {
	        this.key = key;
	        this.options = options;
	    }

	    Scheme.prototype.maxMessageLength = function () {
	        return this.key.encryptedDataLength - 2 * module.exports.digestLength[this.options.encryptionSchemeOptions.hash || DEFAULT_HASH_FUNCTION] - 2;
	    };

	    /**
	     * Pad input
	     * alg: PKCS1_OAEP
	     *
	     * https://tools.ietf.org/html/rfc3447#section-7.1.1
	     */
	    Scheme.prototype.encPad = function (buffer) {
	        var hash = this.options.encryptionSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
	        var mgf = this.options.encryptionSchemeOptions.mgf || module.exports.eme_oaep_mgf1;
	        var label = this.options.encryptionSchemeOptions.label || new Buffer(0);
	        var emLen = this.key.encryptedDataLength;

	        var hLen = module.exports.digestLength[hash];

	        // Make sure we can put message into an encoded message of emLen bytes
	        if (buffer.length > emLen - 2 * hLen - 2) {
	            throw new Error("Message is too long to encode into an encoded message with a length of " + emLen + " bytes, increase" +
	            "emLen to fix this error (minimum value for given parameters and options: " + (emLen - 2 * hLen - 2) + ")");
	        }

	        var lHash = crypt.createHash(hash);
	        lHash.update(label);
	        lHash = lHash.digest();

	        var PS = new Buffer(emLen - buffer.length - 2 * hLen - 1); // Padding "String"
	        PS.fill(0); // Fill the buffer with octets of 0
	        PS[PS.length - 1] = 1;

	        var DB = Buffer.concat([lHash, PS, buffer]);
	        var seed = crypt.randomBytes(hLen);

	        // mask = dbMask
	        var mask = mgf(seed, DB.length, hash);
	        // XOR DB and dbMask together.
	        for (var i = 0; i < DB.length; i++) {
	            DB[i] ^= mask[i];
	        }
	        // DB = maskedDB

	        // mask = seedMask
	        mask = mgf(DB, hLen, hash);
	        // XOR seed and seedMask together.
	        for (i = 0; i < seed.length; i++) {
	            seed[i] ^= mask[i];
	        }
	        // seed = maskedSeed

	        var em = new Buffer(1 + seed.length + DB.length);
	        em[0] = 0;
	        seed.copy(em, 1);
	        DB.copy(em, 1 + seed.length);

	        return em;
	    };

	    /**
	     * Unpad input
	     * alg: PKCS1_OAEP
	     *
	     * Note: This method works within the buffer given and modifies the values. It also returns a slice of the EM as the return Message.
	     * If the implementation requires that the EM parameter be unmodified then the implementation should pass in a clone of the EM buffer.
	     *
	     * https://tools.ietf.org/html/rfc3447#section-7.1.2
	     */
	    Scheme.prototype.encUnPad = function (buffer) {
	        var hash = this.options.encryptionSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
	        var mgf = this.options.encryptionSchemeOptions.mgf || module.exports.eme_oaep_mgf1;
	        var label = this.options.encryptionSchemeOptions.label || new Buffer(0);

	        var hLen = module.exports.digestLength[hash];

	        // Check to see if buffer is a properly encoded OAEP message
	        if (buffer.length < 2 * hLen + 2) {
	            throw new Error("Error decoding message, the supplied message is not long enough to be a valid OAEP encoded message");
	        }

	        var seed = buffer.slice(1, hLen + 1);	// seed = maskedSeed
	        var DB = buffer.slice(1 + hLen);		// DB = maskedDB

	        var mask = mgf(DB, hLen, hash); // seedMask
	        // XOR maskedSeed and seedMask together to get the original seed.
	        for (var i = 0; i < seed.length; i++) {
	            seed[i] ^= mask[i];
	        }

	        mask = mgf(seed, DB.length, hash); // dbMask
	        // XOR DB and dbMask together to get the original data block.
	        for (i = 0; i < DB.length; i++) {
	            DB[i] ^= mask[i];
	        }

	        var lHash = crypt.createHash(hash);
	        lHash.update(label);
	        lHash = lHash.digest();

	        var lHashEM = DB.slice(0, hLen);
	        if (lHashEM.toString("hex") != lHash.toString("hex")) {
	            throw new Error("Error decoding message, the lHash calculated from the label provided and the lHash in the encrypted data do not match.");
	        }

	        // Filter out padding
	        i = hLen;
	        while (DB[i++] === 0 && i < DB.length);
	        if (DB[i - 1] != 1) {
	            throw new Error("Error decoding message, there is no padding message separator byte");
	        }

	        return DB.slice(i); // Message
	    };

	    return new Scheme(key, options);
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {/**
	 * PSS signature scheme
	 */

	var BigInteger = __webpack_require__(31);
	var crypt = __webpack_require__(13);

	module.exports = {
	    isEncryption: false,
	    isSignature: true
	};

	var DEFAULT_HASH_FUNCTION = 'sha1';
	var DEFAULT_SALT_LENGTH = 20;

	module.exports.makeScheme = function (key, options) {
	    var OAEP = __webpack_require__(32).pkcs1_oaep;

	    /**
	     * @param key
	     * options    [Object]    An object that contains the following keys that specify certain options for encoding.
	     *  └>signingSchemeOptions
	     *     ├>hash    [String]    Hash function to use when encoding and generating masks. Must be a string accepted by node's crypto.createHash function. (default = "sha1")
	     *     ├>mgf    [function]    The mask generation function to use when encoding. (default = mgf1SHA1)
	     *     └>sLen    [uint]        The length of the salt to generate. (default = 20)
	     * @constructor
	     */
	    function Scheme(key, options) {
	        this.key = key;
	        this.options = options;
	    }

	    Scheme.prototype.sign = function (buffer) {
	        var encoded = this.emsa_pss_encode(buffer, this.key.keySize - 1);
	        var res = this.key.$doPrivate(new BigInteger(encoded)).toBuffer(this.key.encryptedDataLength);
	        return res;
	    };

	    Scheme.prototype.verify = function (buffer, signature, signature_encoding) {
	        if (signature_encoding) {
	            signature = new Buffer(signature, signature_encoding);
	        }
	        signature = new BigInteger(signature);

	        var emLen = Math.ceil((this.key.keySize - 1) / 8);
	        var m = this.key.$doPublic(signature).toBuffer(emLen);

	        return this.emsa_pss_verify(buffer, m, this.key.keySize - 1);
	    };

	    /*
	     * https://tools.ietf.org/html/rfc3447#section-9.1.1
	     *
	     * M		[Buffer]	Message to encode
	     * emBits	[uint]		Maximum length of output in bits. Must be at least 8hLen + 8sLen + 9 (hLen = Hash digest length in bytes | sLen = length of salt in bytes)
	     * @returns {Buffer} The encoded message
	     */
	    Scheme.prototype.emsa_pss_encode = function (M, emBits) {
	        var hash = this.options.signingSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
	        var mgf = this.options.signingSchemeOptions.mgf || OAEP.eme_oaep_mgf1;
	        var sLen = this.options.signingSchemeOptions.saltLength || DEFAULT_SALT_LENGTH;

	        var hLen = OAEP.digestLength[hash];
	        var emLen = Math.ceil(emBits / 8);

	        if (emLen < hLen + sLen + 2) {
	            throw new Error("Output length passed to emBits(" + emBits + ") is too small for the options " +
	                "specified(" + hash + ", " + sLen + "). To fix this issue increase the value of emBits. (minimum size: " +
	                (8 * hLen + 8 * sLen + 9) + ")"
	            );
	        }

	        var mHash = crypt.createHash(hash);
	        mHash.update(M);
	        mHash = mHash.digest();

	        var salt = crypt.randomBytes(sLen);

	        var Mapostrophe = new Buffer(8 + hLen + sLen);
	        Mapostrophe.fill(0, 0, 8);
	        mHash.copy(Mapostrophe, 8);
	        salt.copy(Mapostrophe, 8 + mHash.length);

	        var H = crypt.createHash(hash);
	        H.update(Mapostrophe);
	        H = H.digest();

	        var PS = new Buffer(emLen - salt.length - hLen - 2);
	        PS.fill(0);

	        var DB = new Buffer(PS.length + 1 + salt.length);
	        PS.copy(DB);
	        DB[PS.length] = 0x01;
	        salt.copy(DB, PS.length + 1);

	        var dbMask = mgf(H, DB.length, hash);

	        // XOR DB and dbMask together
	        var maskedDB = new Buffer(DB.length);
	        for (var i = 0; i < dbMask.length; i++) {
	            maskedDB[i] = DB[i] ^ dbMask[i];
	        }

	        var bits = emBits - 8 * (emLen - 1);
	        var mask = 255 << 8 - bits >> 8 - bits;
	        maskedDB[0] &= ((maskedDB[0] ^ mask) & maskedDB[0]);

	        var EM = new Buffer(maskedDB.length + H.length + 1);
	        maskedDB.copy(EM, 0);
	        H.copy(EM, maskedDB.length);
	        EM[EM.length - 1] = 0xbc;

	        return EM;
	    };

	    /*
	     * https://tools.ietf.org/html/rfc3447#section-9.1.2
	     *
	     * M		[Buffer]	Message
	     * EM		[Buffer]	Signature
	     * emBits	[uint]		Length of EM in bits. Must be at least 8hLen + 8sLen + 9 to be a valid signature. (hLen = Hash digest length in bytes | sLen = length of salt in bytes)
	     * @returns {Boolean} True if signature(EM) matches message(M)
	     */
	    Scheme.prototype.emsa_pss_verify = function (M, EM, emBits) {
	        var hash = this.options.signingSchemeOptions.hash || DEFAULT_HASH_FUNCTION;
	        var mgf = this.options.signingSchemeOptions.mgf || OAEP.eme_oaep_mgf1;
	        var sLen = this.options.signingSchemeOptions.saltLength || DEFAULT_SALT_LENGTH;

	        var hLen = OAEP.digestLength[hash];
	        var emLen = Math.ceil(emBits / 8);

	        if (emLen < hLen + sLen + 2 || EM[EM.length - 1] != 0xbc) {
	            return false;
	        }

	        var DB = new Buffer(emLen - hLen - 1);
	        EM.copy(DB, 0, 0, emLen - hLen - 1);

	        var mask = 0;
	        for (var i = 0, bits = 8 * emLen - emBits; i < bits; i++) {
	            mask |= 1 << (7 - i);
	        }

	        if ((DB[0] & mask) !== 0) {
	            return false;
	        }

	        var H = EM.slice(emLen - hLen - 1, emLen - 1);
	        var dbMask = mgf(H, DB.length, hash);

	        // Unmask DB
	        for (i = 0; i < DB.length; i++) {
	            DB[i] ^= dbMask[i];
	        }

	        mask = 0;
	        for (i = 0, bits = emBits - 8 * (emLen - 1); i < bits; i++) {
	            mask |= 1 << i;
	        }
	        DB[0] &= mask;

	        // Filter out padding
	        while (DB[i++] === 0 && i < DB.length);
	        if (DB[i - 1] != 1) {
	            return false;
	        }

	        var salt = DB.slice(DB.length - sLen);

	        var mHash = crypt.createHash(hash);
	        mHash.update(M);
	        mHash = mHash.digest();

	        var Mapostrophe = new Buffer(8 + hLen + sLen);
	        Mapostrophe.fill(0, 0, 8);
	        mHash.copy(Mapostrophe, 8);
	        salt.copy(Mapostrophe, 8 + mHash.length);

	        var Hapostrophe = crypt.createHash(hash);
	        Hapostrophe.update(Mapostrophe);
	        Hapostrophe = Hapostrophe.digest();

	        return H.toString("hex") === Hapostrophe.toString("hex");
	    };

	    return new Scheme(key, options);
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var crypt = __webpack_require__(13);

	module.exports = {
	    getEngine: function (keyPair, options) {
	        var engine = __webpack_require__(37);
	        if (options.environment === 'node') {
	            if (typeof crypt.publicEncrypt === 'function' && typeof crypt.privateDecrypt === 'function') {
	                if (typeof crypt.privateEncrypt === 'function' && typeof crypt.publicDecrypt === 'function') {
	                    engine = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./io.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	                } else {
	                    engine = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./node12.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	                }
	            }
	        }
	        return engine(keyPair, options);
	    }
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var BigInteger = __webpack_require__(31);
	var schemes = __webpack_require__(32);

	module.exports = function (keyPair, options) {
	    var pkcs1Scheme = schemes.pkcs1.makeScheme(keyPair, options);

	    return {
	        encrypt: function (buffer, usePrivate) {
	            var m, c;
	            if (usePrivate) {
	                m = new BigInteger(pkcs1Scheme.encPad(buffer, {type: 1}));
	                c = keyPair.$doPrivate(m);
	            } else {
	                m = new BigInteger(keyPair.encryptionScheme.encPad(buffer));
	                c = keyPair.$doPublic(m);
	            }
	            return c.toBuffer(keyPair.encryptedDataLength);
	        },

	        decrypt: function (buffer, usePublic) {
	            var m, c = new BigInteger(buffer);

	            if (usePublic) {
	                m = keyPair.$doPublic(c);
	                return pkcs1Scheme.encUnPad(m.toBuffer(keyPair.encryptedDataLength), {type: 1});
	            } else {
	                m = keyPair.$doPrivate(c);
	                return keyPair.encryptionScheme.encUnPad(m.toBuffer(keyPair.encryptedDataLength));
	            }
	        }
	    };
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

	// If you have no idea what ASN.1 or BER is, see this:
	// ftp://ftp.rsa.com/pub/pkcs/ascii/layman.asc

	var Ber = __webpack_require__(39);



	///--- Exported API

	module.exports = {

	  Ber: Ber,

	  BerReader: Ber.Reader,

	  BerWriter: Ber.Writer

	};


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

	var errors = __webpack_require__(40);
	var types = __webpack_require__(41);

	var Reader = __webpack_require__(42);
	var Writer = __webpack_require__(44);


	///--- Exports

	module.exports = {

	  Reader: Reader,

	  Writer: Writer

	};

	for (var t in types) {
	  if (types.hasOwnProperty(t))
	    module.exports[t] = types[t];
	}
	for (var e in errors) {
	  if (errors.hasOwnProperty(e))
	    module.exports[e] = errors[e];
	}


/***/ },
/* 40 */
/***/ function(module, exports) {

	// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.


	module.exports = {

	  newInvalidAsn1Error: function(msg) {
	    var e = new Error();
	    e.name = 'InvalidAsn1Error';
	    e.message = msg || '';
	    return e;
	  }

	};


/***/ },
/* 41 */
/***/ function(module, exports) {

	// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.


	module.exports = {
	  EOC: 0,
	  Boolean: 1,
	  Integer: 2,
	  BitString: 3,
	  OctetString: 4,
	  Null: 5,
	  OID: 6,
	  ObjectDescriptor: 7,
	  External: 8,
	  Real: 9, // float
	  Enumeration: 10,
	  PDV: 11,
	  Utf8String: 12,
	  RelativeOID: 13,
	  Sequence: 16,
	  Set: 17,
	  NumericString: 18,
	  PrintableString: 19,
	  T61String: 20,
	  VideotexString: 21,
	  IA5String: 22,
	  UTCTime: 23,
	  GeneralizedTime: 24,
	  GraphicString: 25,
	  VisibleString: 26,
	  GeneralString: 28,
	  UniversalString: 29,
	  CharacterString: 30,
	  BMPString: 31,
	  Constructor: 32,
	  Context: 128
	};


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

	var assert = __webpack_require__(43);

	var ASN1 = __webpack_require__(41);
	var errors = __webpack_require__(40);


	///--- Globals

	var newInvalidAsn1Error = errors.newInvalidAsn1Error;



	///--- API

	function Reader(data) {
	  if (!data || !Buffer.isBuffer(data))
	    throw new TypeError('data must be a node Buffer');

	  this._buf = data;
	  this._size = data.length;

	  // These hold the "current" state
	  this._len = 0;
	  this._offset = 0;
	}

	Object.defineProperty(Reader.prototype, 'length', {
	  enumerable: true,
	  get: function () { return (this._len); }
	});

	Object.defineProperty(Reader.prototype, 'offset', {
	  enumerable: true,
	  get: function () { return (this._offset); }
	});

	Object.defineProperty(Reader.prototype, 'remain', {
	  get: function () { return (this._size - this._offset); }
	});

	Object.defineProperty(Reader.prototype, 'buffer', {
	  get: function () { return (this._buf.slice(this._offset)); }
	});


	/**
	 * Reads a single byte and advances offset; you can pass in `true` to make this
	 * a "peek" operation (i.e., get the byte, but don't advance the offset).
	 *
	 * @param {Boolean} peek true means don't move offset.
	 * @return {Number} the next byte, null if not enough data.
	 */
	Reader.prototype.readByte = function(peek) {
	  if (this._size - this._offset < 1)
	    return null;

	  var b = this._buf[this._offset] & 0xff;

	  if (!peek)
	    this._offset += 1;

	  return b;
	};


	Reader.prototype.peek = function() {
	  return this.readByte(true);
	};


	/**
	 * Reads a (potentially) variable length off the BER buffer.  This call is
	 * not really meant to be called directly, as callers have to manipulate
	 * the internal buffer afterwards.
	 *
	 * As a result of this call, you can call `Reader.length`, until the
	 * next thing called that does a readLength.
	 *
	 * @return {Number} the amount of offset to advance the buffer.
	 * @throws {InvalidAsn1Error} on bad ASN.1
	 */
	Reader.prototype.readLength = function(offset) {
	  if (offset === undefined)
	    offset = this._offset;

	  if (offset >= this._size)
	    return null;

	  var lenB = this._buf[offset++] & 0xff;
	  if (lenB === null)
	    return null;

	  if ((lenB & 0x80) == 0x80) {
	    lenB &= 0x7f;

	    if (lenB == 0)
	      throw newInvalidAsn1Error('Indefinite length not supported');

	    if (lenB > 4)
	      throw newInvalidAsn1Error('encoding too long');

	    if (this._size - offset < lenB)
	      return null;

	    this._len = 0;
	    for (var i = 0; i < lenB; i++)
	      this._len = (this._len << 8) + (this._buf[offset++] & 0xff);

	  } else {
	    // Wasn't a variable length
	    this._len = lenB;
	  }

	  return offset;
	};


	/**
	 * Parses the next sequence in this BER buffer.
	 *
	 * To get the length of the sequence, call `Reader.length`.
	 *
	 * @return {Number} the sequence's tag.
	 */
	Reader.prototype.readSequence = function(tag) {
	  var seq = this.peek();
	  if (seq === null)
	    return null;
	  if (tag !== undefined && tag !== seq)
	    throw newInvalidAsn1Error('Expected 0x' + tag.toString(16) +
	                              ': got 0x' + seq.toString(16));

	  var o = this.readLength(this._offset + 1); // stored in `length`
	  if (o === null)
	    return null;

	  this._offset = o;
	  return seq;
	};


	Reader.prototype.readInt = function() {
	  return this._readTag(ASN1.Integer);
	};


	Reader.prototype.readBoolean = function() {
	  return (this._readTag(ASN1.Boolean) === 0 ? false : true);
	};


	Reader.prototype.readEnumeration = function() {
	  return this._readTag(ASN1.Enumeration);
	};


	Reader.prototype.readString = function(tag, retbuf) {
	  if (!tag)
	    tag = ASN1.OctetString;

	  var b = this.peek();
	  if (b === null)
	    return null;

	  if (b !== tag)
	    throw newInvalidAsn1Error('Expected 0x' + tag.toString(16) +
	                              ': got 0x' + b.toString(16));

	  var o = this.readLength(this._offset + 1); // stored in `length`

	  if (o === null)
	    return null;

	  if (this.length > this._size - o)
	    return null;

	  this._offset = o;

	  if (this.length === 0)
	    return retbuf ? new Buffer(0) : '';

	  var str = this._buf.slice(this._offset, this._offset + this.length);
	  this._offset += this.length;

	  return retbuf ? str : str.toString('utf8');
	};

	Reader.prototype.readOID = function(tag) {
	  if (!tag)
	    tag = ASN1.OID;

	  var b = this.readString(tag, true);
	  if (b === null)
	    return null;

	  var values = [];
	  var value = 0;

	  for (var i = 0; i < b.length; i++) {
	    var byte = b[i] & 0xff;

	    value <<= 7;
	    value += byte & 0x7f;
	    if ((byte & 0x80) == 0) {
	      values.push(value);
	      value = 0;
	    }
	  }

	  value = values.shift();
	  values.unshift(value % 40);
	  values.unshift((value / 40) >> 0);

	  return values.join('.');
	};


	Reader.prototype._readTag = function(tag) {
	  assert.ok(tag !== undefined);

	  var b = this.peek();

	  if (b === null)
	    return null;

	  if (b !== tag)
	    throw newInvalidAsn1Error('Expected 0x' + tag.toString(16) +
	                              ': got 0x' + b.toString(16));

	  var o = this.readLength(this._offset + 1); // stored in `length`
	  if (o === null)
	    return null;

	  if (this.length > 4)
	    throw newInvalidAsn1Error('Integer too long: ' + this.length);

	  if (this.length > this._size - o)
	    return null;
	  this._offset = o;

	  var fb = this._buf[this._offset];
	  var value = 0;

	  for (var i = 0; i < this.length; i++) {
	    value <<= 8;
	    value |= (this._buf[this._offset++] & 0xff);
	  }

	  if ((fb & 0x80) == 0x80 && i !== 4)
	    value -= (1 << (i * 8));

	  return value >> 0;
	};



	///--- Exported API

	module.exports = Reader;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
	//
	// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
	//
	// Originally from narwhal.js (http://narwhaljs.org)
	// Copyright (c) 2009 Thomas Robinson <280north.com>
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the 'Software'), to
	// deal in the Software without restriction, including without limitation the
	// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
	// sell copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	// when used in node, this will actually load the util module we depend on
	// versus loading the builtin util module as happens otherwise
	// this is a bug in node module loading as far as I am concerned
	var util = __webpack_require__(20);

	var pSlice = Array.prototype.slice;
	var hasOwn = Object.prototype.hasOwnProperty;

	// 1. The assert module provides functions that throw
	// AssertionError's when particular conditions are not met. The
	// assert module must conform to the following interface.

	var assert = module.exports = ok;

	// 2. The AssertionError is defined in assert.
	// new assert.AssertionError({ message: message,
	//                             actual: actual,
	//                             expected: expected })

	assert.AssertionError = function AssertionError(options) {
	  this.name = 'AssertionError';
	  this.actual = options.actual;
	  this.expected = options.expected;
	  this.operator = options.operator;
	  if (options.message) {
	    this.message = options.message;
	    this.generatedMessage = false;
	  } else {
	    this.message = getMessage(this);
	    this.generatedMessage = true;
	  }
	  var stackStartFunction = options.stackStartFunction || fail;

	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, stackStartFunction);
	  }
	  else {
	    // non v8 browsers so we can have a stacktrace
	    var err = new Error();
	    if (err.stack) {
	      var out = err.stack;

	      // try to strip useless frames
	      var fn_name = stackStartFunction.name;
	      var idx = out.indexOf('\n' + fn_name);
	      if (idx >= 0) {
	        // once we have located the function frame
	        // we need to strip out everything before it (and its line)
	        var next_line = out.indexOf('\n', idx + 1);
	        out = out.substring(next_line + 1);
	      }

	      this.stack = out;
	    }
	  }
	};

	// assert.AssertionError instanceof Error
	util.inherits(assert.AssertionError, Error);

	function replacer(key, value) {
	  if (util.isUndefined(value)) {
	    return '' + value;
	  }
	  if (util.isNumber(value) && !isFinite(value)) {
	    return value.toString();
	  }
	  if (util.isFunction(value) || util.isRegExp(value)) {
	    return value.toString();
	  }
	  return value;
	}

	function truncate(s, n) {
	  if (util.isString(s)) {
	    return s.length < n ? s : s.slice(0, n);
	  } else {
	    return s;
	  }
	}

	function getMessage(self) {
	  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
	         self.operator + ' ' +
	         truncate(JSON.stringify(self.expected, replacer), 128);
	}

	// At present only the three keys mentioned above are used and
	// understood by the spec. Implementations or sub modules can pass
	// other keys to the AssertionError's constructor - they will be
	// ignored.

	// 3. All of the following functions must throw an AssertionError
	// when a corresponding condition is not met, with a message that
	// may be undefined if not provided.  All assertion methods provide
	// both the actual and expected values to the assertion error for
	// display purposes.

	function fail(actual, expected, message, operator, stackStartFunction) {
	  throw new assert.AssertionError({
	    message: message,
	    actual: actual,
	    expected: expected,
	    operator: operator,
	    stackStartFunction: stackStartFunction
	  });
	}

	// EXTENSION! allows for well behaved errors defined elsewhere.
	assert.fail = fail;

	// 4. Pure assertion tests whether a value is truthy, as determined
	// by !!guard.
	// assert.ok(guard, message_opt);
	// This statement is equivalent to assert.equal(true, !!guard,
	// message_opt);. To test strictly for the value true, use
	// assert.strictEqual(true, guard, message_opt);.

	function ok(value, message) {
	  if (!value) fail(value, true, message, '==', assert.ok);
	}
	assert.ok = ok;

	// 5. The equality assertion tests shallow, coercive equality with
	// ==.
	// assert.equal(actual, expected, message_opt);

	assert.equal = function equal(actual, expected, message) {
	  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
	};

	// 6. The non-equality assertion tests for whether two objects are not equal
	// with != assert.notEqual(actual, expected, message_opt);

	assert.notEqual = function notEqual(actual, expected, message) {
	  if (actual == expected) {
	    fail(actual, expected, message, '!=', assert.notEqual);
	  }
	};

	// 7. The equivalence assertion tests a deep equality relation.
	// assert.deepEqual(actual, expected, message_opt);

	assert.deepEqual = function deepEqual(actual, expected, message) {
	  if (!_deepEqual(actual, expected)) {
	    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
	  }
	};

	function _deepEqual(actual, expected) {
	  // 7.1. All identical values are equivalent, as determined by ===.
	  if (actual === expected) {
	    return true;

	  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
	    if (actual.length != expected.length) return false;

	    for (var i = 0; i < actual.length; i++) {
	      if (actual[i] !== expected[i]) return false;
	    }

	    return true;

	  // 7.2. If the expected value is a Date object, the actual value is
	  // equivalent if it is also a Date object that refers to the same time.
	  } else if (util.isDate(actual) && util.isDate(expected)) {
	    return actual.getTime() === expected.getTime();

	  // 7.3 If the expected value is a RegExp object, the actual value is
	  // equivalent if it is also a RegExp object with the same source and
	  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
	  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
	    return actual.source === expected.source &&
	           actual.global === expected.global &&
	           actual.multiline === expected.multiline &&
	           actual.lastIndex === expected.lastIndex &&
	           actual.ignoreCase === expected.ignoreCase;

	  // 7.4. Other pairs that do not both pass typeof value == 'object',
	  // equivalence is determined by ==.
	  } else if (!util.isObject(actual) && !util.isObject(expected)) {
	    return actual == expected;

	  // 7.5 For all other Object pairs, including Array objects, equivalence is
	  // determined by having the same number of owned properties (as verified
	  // with Object.prototype.hasOwnProperty.call), the same set of keys
	  // (although not necessarily the same order), equivalent values for every
	  // corresponding key, and an identical 'prototype' property. Note: this
	  // accounts for both named and indexed properties on Arrays.
	  } else {
	    return objEquiv(actual, expected);
	  }
	}

	function isArguments(object) {
	  return Object.prototype.toString.call(object) == '[object Arguments]';
	}

	function objEquiv(a, b) {
	  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
	    return false;
	  // an identical 'prototype' property.
	  if (a.prototype !== b.prototype) return false;
	  // if one is a primitive, the other must be same
	  if (util.isPrimitive(a) || util.isPrimitive(b)) {
	    return a === b;
	  }
	  var aIsArgs = isArguments(a),
	      bIsArgs = isArguments(b);
	  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
	    return false;
	  if (aIsArgs) {
	    a = pSlice.call(a);
	    b = pSlice.call(b);
	    return _deepEqual(a, b);
	  }
	  var ka = objectKeys(a),
	      kb = objectKeys(b),
	      key, i;
	  // having the same number of owned properties (keys incorporates
	  // hasOwnProperty)
	  if (ka.length != kb.length)
	    return false;
	  //the same set of keys (although not necessarily the same order),
	  ka.sort();
	  kb.sort();
	  //~~~cheap key test
	  for (i = ka.length - 1; i >= 0; i--) {
	    if (ka[i] != kb[i])
	      return false;
	  }
	  //equivalent values for every corresponding key, and
	  //~~~possibly expensive deep test
	  for (i = ka.length - 1; i >= 0; i--) {
	    key = ka[i];
	    if (!_deepEqual(a[key], b[key])) return false;
	  }
	  return true;
	}

	// 8. The non-equivalence assertion tests for any deep inequality.
	// assert.notDeepEqual(actual, expected, message_opt);

	assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
	  if (_deepEqual(actual, expected)) {
	    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
	  }
	};

	// 9. The strict equality assertion tests strict equality, as determined by ===.
	// assert.strictEqual(actual, expected, message_opt);

	assert.strictEqual = function strictEqual(actual, expected, message) {
	  if (actual !== expected) {
	    fail(actual, expected, message, '===', assert.strictEqual);
	  }
	};

	// 10. The strict non-equality assertion tests for strict inequality, as
	// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

	assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
	  if (actual === expected) {
	    fail(actual, expected, message, '!==', assert.notStrictEqual);
	  }
	};

	function expectedException(actual, expected) {
	  if (!actual || !expected) {
	    return false;
	  }

	  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
	    return expected.test(actual);
	  } else if (actual instanceof expected) {
	    return true;
	  } else if (expected.call({}, actual) === true) {
	    return true;
	  }

	  return false;
	}

	function _throws(shouldThrow, block, expected, message) {
	  var actual;

	  if (util.isString(expected)) {
	    message = expected;
	    expected = null;
	  }

	  try {
	    block();
	  } catch (e) {
	    actual = e;
	  }

	  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
	            (message ? ' ' + message : '.');

	  if (shouldThrow && !actual) {
	    fail(actual, expected, 'Missing expected exception' + message);
	  }

	  if (!shouldThrow && expectedException(actual, expected)) {
	    fail(actual, expected, 'Got unwanted exception' + message);
	  }

	  if ((shouldThrow && actual && expected &&
	      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
	    throw actual;
	  }
	}

	// 11. Expected to throw an error:
	// assert.throws(block, Error_opt, message_opt);

	assert.throws = function(block, /*optional*/error, /*optional*/message) {
	  _throws.apply(this, [true].concat(pSlice.call(arguments)));
	};

	// EXTENSION! This is annoying to write outside this module.
	assert.doesNotThrow = function(block, /*optional*/message) {
	  _throws.apply(this, [false].concat(pSlice.call(arguments)));
	};

	assert.ifError = function(err) { if (err) {throw err;}};

	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) {
	    if (hasOwn.call(obj, key)) keys.push(key);
	  }
	  return keys;
	};


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright 2011 Mark Cavage <mcavage@gmail.com> All rights reserved.

	var assert = __webpack_require__(43);
	var ASN1 = __webpack_require__(41);
	var errors = __webpack_require__(40);


	///--- Globals

	var newInvalidAsn1Error = errors.newInvalidAsn1Error;

	var DEFAULT_OPTS = {
	  size: 1024,
	  growthFactor: 8
	};


	///--- Helpers

	function merge(from, to) {
	  assert.ok(from);
	  assert.equal(typeof(from), 'object');
	  assert.ok(to);
	  assert.equal(typeof(to), 'object');

	  var keys = Object.getOwnPropertyNames(from);
	  keys.forEach(function(key) {
	    if (to[key])
	      return;

	    var value = Object.getOwnPropertyDescriptor(from, key);
	    Object.defineProperty(to, key, value);
	  });

	  return to;
	}



	///--- API

	function Writer(options) {
	  options = merge(DEFAULT_OPTS, options || {});

	  this._buf = new Buffer(options.size || 1024);
	  this._size = this._buf.length;
	  this._offset = 0;
	  this._options = options;

	  // A list of offsets in the buffer where we need to insert
	  // sequence tag/len pairs.
	  this._seq = [];
	}

	Object.defineProperty(Writer.prototype, 'buffer', {
	  get: function () {
	    if (this._seq.length)
	      throw new InvalidAsn1Error(this._seq.length + ' unended sequence(s)');

	    return (this._buf.slice(0, this._offset));
	  }
	});

	Writer.prototype.writeByte = function(b) {
	  if (typeof(b) !== 'number')
	    throw new TypeError('argument must be a Number');

	  this._ensure(1);
	  this._buf[this._offset++] = b;
	};


	Writer.prototype.writeInt = function(i, tag) {
	  if (typeof(i) !== 'number')
	    throw new TypeError('argument must be a Number');
	  if (typeof(tag) !== 'number')
	    tag = ASN1.Integer;

	  var sz = 4;

	  while ((((i & 0xff800000) === 0) || ((i & 0xff800000) === 0xff800000 >> 0)) &&
	         (sz > 1)) {
	    sz--;
	    i <<= 8;
	  }

	  if (sz > 4)
	    throw new InvalidAsn1Error('BER ints cannot be > 0xffffffff');

	  this._ensure(2 + sz);
	  this._buf[this._offset++] = tag;
	  this._buf[this._offset++] = sz;

	  while (sz-- > 0) {
	    this._buf[this._offset++] = ((i & 0xff000000) >>> 24);
	    i <<= 8;
	  }

	};


	Writer.prototype.writeNull = function() {
	  this.writeByte(ASN1.Null);
	  this.writeByte(0x00);
	};


	Writer.prototype.writeEnumeration = function(i, tag) {
	  if (typeof(i) !== 'number')
	    throw new TypeError('argument must be a Number');
	  if (typeof(tag) !== 'number')
	    tag = ASN1.Enumeration;

	  return this.writeInt(i, tag);
	};


	Writer.prototype.writeBoolean = function(b, tag) {
	  if (typeof(b) !== 'boolean')
	    throw new TypeError('argument must be a Boolean');
	  if (typeof(tag) !== 'number')
	    tag = ASN1.Boolean;

	  this._ensure(3);
	  this._buf[this._offset++] = tag;
	  this._buf[this._offset++] = 0x01;
	  this._buf[this._offset++] = b ? 0xff : 0x00;
	};


	Writer.prototype.writeString = function(s, tag) {
	  if (typeof(s) !== 'string')
	    throw new TypeError('argument must be a string (was: ' + typeof(s) + ')');
	  if (typeof(tag) !== 'number')
	    tag = ASN1.OctetString;

	  var len = Buffer.byteLength(s);
	  this.writeByte(tag);
	  this.writeLength(len);
	  if (len) {
	    this._ensure(len);
	    this._buf.write(s, this._offset);
	    this._offset += len;
	  }
	};


	Writer.prototype.writeBuffer = function(buf, tag) {
	  if (typeof(tag) !== 'number')
	    throw new TypeError('tag must be a number');
	  if (!Buffer.isBuffer(buf))
	    throw new TypeError('argument must be a buffer');

	  this.writeByte(tag);
	  this.writeLength(buf.length);
	  this._ensure(buf.length);
	  buf.copy(this._buf, this._offset, 0, buf.length);
	  this._offset += buf.length;
	};


	Writer.prototype.writeStringArray = function(strings) {
	  if ((!strings instanceof Array))
	    throw new TypeError('argument must be an Array[String]');

	  var self = this;
	  strings.forEach(function(s) {
	    self.writeString(s);
	  });
	};

	// This is really to solve DER cases, but whatever for now
	Writer.prototype.writeOID = function(s, tag) {
	  if (typeof(s) !== 'string')
	    throw new TypeError('argument must be a string');
	  if (typeof(tag) !== 'number')
	    tag = ASN1.OID;

	  if (!/^([0-9]+\.){3,}[0-9]+$/.test(s))
	    throw new Error('argument is not a valid OID string');

	  function encodeOctet(bytes, octet) {
	    if (octet < 128) {
	        bytes.push(octet);
	    } else if (octet < 16384) {
	        bytes.push((octet >>> 7) | 0x80);
	        bytes.push(octet & 0x7F);
	    } else if (octet < 2097152) {
	      bytes.push((octet >>> 14) | 0x80);
	      bytes.push(((octet >>> 7) | 0x80) & 0xFF);
	      bytes.push(octet & 0x7F);
	    } else if (octet < 268435456) {
	      bytes.push((octet >>> 21) | 0x80);
	      bytes.push(((octet >>> 14) | 0x80) & 0xFF);
	      bytes.push(((octet >>> 7) | 0x80) & 0xFF);
	      bytes.push(octet & 0x7F);
	    } else {
	      bytes.push(((octet >>> 28) | 0x80) & 0xFF);
	      bytes.push(((octet >>> 21) | 0x80) & 0xFF);
	      bytes.push(((octet >>> 14) | 0x80) & 0xFF);
	      bytes.push(((octet >>> 7) | 0x80) & 0xFF);
	      bytes.push(octet & 0x7F);
	    }
	  }

	  var tmp = s.split('.');
	  var bytes = [];
	  bytes.push(parseInt(tmp[0], 10) * 40 + parseInt(tmp[1], 10));
	  tmp.slice(2).forEach(function(b) {
	    encodeOctet(bytes, parseInt(b, 10));
	  });

	  var self = this;
	  this._ensure(2 + bytes.length);
	  this.writeByte(tag);
	  this.writeLength(bytes.length);
	  bytes.forEach(function(b) {
	    self.writeByte(b);
	  });
	};


	Writer.prototype.writeLength = function(len) {
	  if (typeof(len) !== 'number')
	    throw new TypeError('argument must be a Number');

	  this._ensure(4);

	  if (len <= 0x7f) {
	    this._buf[this._offset++] = len;
	  } else if (len <= 0xff) {
	    this._buf[this._offset++] = 0x81;
	    this._buf[this._offset++] = len;
	  } else if (len <= 0xffff) {
	    this._buf[this._offset++] = 0x82;
	    this._buf[this._offset++] = len >> 8;
	    this._buf[this._offset++] = len;
	  } else if (len <= 0xffffff) {
	    this._buf[this._offset++] = 0x83;
	    this._buf[this._offset++] = len >> 16;
	    this._buf[this._offset++] = len >> 8;
	    this._buf[this._offset++] = len;
	  } else {
	    throw new InvalidAsn1ERror('Length too long (> 4 bytes)');
	  }
	};

	Writer.prototype.startSequence = function(tag) {
	  if (typeof(tag) !== 'number')
	    tag = ASN1.Sequence | ASN1.Constructor;

	  this.writeByte(tag);
	  this._seq.push(this._offset);
	  this._ensure(3);
	  this._offset += 3;
	};


	Writer.prototype.endSequence = function() {
	  var seq = this._seq.pop();
	  var start = seq + 3;
	  var len = this._offset - start;

	  if (len <= 0x7f) {
	    this._shift(start, len, -2);
	    this._buf[seq] = len;
	  } else if (len <= 0xff) {
	    this._shift(start, len, -1);
	    this._buf[seq] = 0x81;
	    this._buf[seq + 1] = len;
	  } else if (len <= 0xffff) {
	    this._buf[seq] = 0x82;
	    this._buf[seq + 1] = len >> 8;
	    this._buf[seq + 2] = len;
	  } else if (len <= 0xffffff) {
	    this._shift(start, len, 1);
	    this._buf[seq] = 0x83;
	    this._buf[seq + 1] = len >> 16;
	    this._buf[seq + 2] = len >> 8;
	    this._buf[seq + 3] = len;
	  } else {
	    throw new InvalidAsn1Error('Sequence too long');
	  }
	};


	Writer.prototype._shift = function(start, len, shift) {
	  assert.ok(start !== undefined);
	  assert.ok(len !== undefined);
	  assert.ok(shift);

	  this._buf.copy(this._buf, start + shift, start, start + len);
	  this._offset += shift;
	};

	Writer.prototype._ensure = function(len) {
	  assert.ok(len);

	  if (this._size - this._offset < len) {
	    var sz = this._size * this._options.growthFactor;
	    if (sz - this._offset < len)
	      sz += len;

	    var buf = new Buffer(sz);

	    this._buf.copy(buf, 0, 0, this._offset);
	    this._buf = buf;
	    this._size = sz;
	  }
	};



	///--- Exported API

	module.exports = Writer;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(11)._;

	function formatParse(format) {
	    format = format.split('-');
	    var keyType = 'private';
	    var keyOpt = {type: 'default'};

	    for (var i = 1; i < format.length; i++) {
	        if (format[i]) {
	            switch (format[i]) {
	                case 'public':
	                    keyType = format[i];
	                    break;
	                case 'private':
	                    keyType = format[i];
	                    break;
	                case 'pem':
	                    keyOpt.type = format[i];
	                    break;
	                case 'der':
	                    keyOpt.type = format[i];
	                    break;
	            }
	        }
	    }

	    return {scheme: format[0], keyType: keyType, keyOpt: keyOpt};
	}

	module.exports = {
	    pkcs1: __webpack_require__(46),
	    pkcs8: __webpack_require__(47),
	    components: __webpack_require__(48),

	    isPrivateExport: function (format) {
	        return module.exports[format] && typeof module.exports[format].privateExport === 'function';
	    },

	    isPrivateImport: function (format) {
	        return module.exports[format] && typeof module.exports[format].privateImport === 'function';
	    },

	    isPublicExport: function (format) {
	        return module.exports[format] && typeof module.exports[format].publicExport === 'function';
	    },

	    isPublicImport: function (format) {
	        return module.exports[format] && typeof module.exports[format].publicImport === 'function';
	    },

	    detectAndImport: function (key, data, format) {
	        if (format === undefined) {
	            for (var scheme in module.exports) {
	                if (typeof module.exports[scheme].autoImport === 'function' && module.exports[scheme].autoImport(key, data)) {
	                    return true;
	                }
	            }
	        } else if (format) {
	            var fmt = formatParse(format);

	            if (module.exports[fmt.scheme]) {
	                if (fmt.keyType === 'private') {
	                    module.exports[fmt.scheme].privateImport(key, data, fmt.keyOpt);
	                } else {
	                    module.exports[fmt.scheme].publicImport(key, data, fmt.keyOpt);
	                }
	            } else {
	                throw Error('Unsupported key format');
	            }
	        }

	        return false;
	    },

	    detectAndExport: function (key, format) {
	        if (format) {
	            var fmt = formatParse(format);

	            if (module.exports[fmt.scheme]) {
	                if (fmt.keyType === 'private') {
	                    if (!key.isPrivate()) {
	                        throw Error("This is not private key");
	                    }
	                    return module.exports[fmt.scheme].privateExport(key, fmt.keyOpt);
	                } else {
	                    if (!key.isPublic()) {
	                        throw Error("This is not public key");
	                    }
	                    return module.exports[fmt.scheme].publicExport(key, fmt.keyOpt);
	                }
	            } else {
	                throw Error('Unsupported key format');
	            }
	        }
	    }
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var ber = __webpack_require__(38).Ber;
	var _ = __webpack_require__(11)._;
	var utils = __webpack_require__(11);

	module.exports = {
	    privateExport: function (key, options) {
	        options = options || {};

	        var n = key.n.toBuffer();
	        var d = key.d.toBuffer();
	        var p = key.p.toBuffer();
	        var q = key.q.toBuffer();
	        var dmp1 = key.dmp1.toBuffer();
	        var dmq1 = key.dmq1.toBuffer();
	        var coeff = key.coeff.toBuffer();

	        var length = n.length + d.length + p.length + q.length + dmp1.length + dmq1.length + coeff.length + 512; // magic
	        var writer = new ber.Writer({size: length});

	        writer.startSequence();
	        writer.writeInt(0);
	        writer.writeBuffer(n, 2);
	        writer.writeInt(key.e);
	        writer.writeBuffer(d, 2);
	        writer.writeBuffer(p, 2);
	        writer.writeBuffer(q, 2);
	        writer.writeBuffer(dmp1, 2);
	        writer.writeBuffer(dmq1, 2);
	        writer.writeBuffer(coeff, 2);
	        writer.endSequence();

	        if (options.type === 'der') {
	            return writer.buffer;
	        } else {
	            return '-----BEGIN RSA PRIVATE KEY-----\n' + utils.linebrk(writer.buffer.toString('base64'), 64) + '\n-----END RSA PRIVATE KEY-----';
	        }
	    },

	    privateImport: function (key, data, options) {
	        options = options || {};
	        var buffer;

	        if (options.type !== 'der') {
	            if (Buffer.isBuffer(data)) {
	                data = data.toString('utf8');
	            }

	            if (_.isString(data)) {
	                var pem = data.replace('-----BEGIN RSA PRIVATE KEY-----', '')
	                    .replace('-----END RSA PRIVATE KEY-----', '')
	                    .replace(/\s+|\n\r|\n|\r$/gm, '');
	                buffer = new Buffer(pem, 'base64');
	            } else {
	                throw Error('Unsupported key format');
	            }
	        } else if (Buffer.isBuffer(data)) {
	            buffer = data;
	        } else {
	            throw Error('Unsupported key format');
	        }

	        var reader = new ber.Reader(buffer);
	        reader.readSequence();
	        reader.readString(2, true); // just zero
	        key.setPrivate(
	            reader.readString(2, true),  // modulus
	            reader.readString(2, true),  // publicExponent
	            reader.readString(2, true),  // privateExponent
	            reader.readString(2, true),  // prime1
	            reader.readString(2, true),  // prime2
	            reader.readString(2, true),  // exponent1 -- d mod (p1)
	            reader.readString(2, true),  // exponent2 -- d mod (q-1)
	            reader.readString(2, true)   // coefficient -- (inverse of q) mod p
	        );
	    },

	    publicExport: function (key, options) {
	        options = options || {};

	        var n = key.n.toBuffer();
	        var length = n.length + 512; // magic

	        var bodyWriter = new ber.Writer({size: length});
	        bodyWriter.startSequence();
	        bodyWriter.writeBuffer(n, 2);
	        bodyWriter.writeInt(key.e);
	        bodyWriter.endSequence();

	        if (options.type === 'der') {
	            return bodyWriter.buffer;
	        } else {
	            return '-----BEGIN RSA PUBLIC KEY-----\n' + utils.linebrk(bodyWriter.buffer.toString('base64'), 64) + '\n-----END RSA PUBLIC KEY-----';
	        }
	    },

	    publicImport: function (key, data, options) {
	        options = options || {};
	        var buffer;

	        if (options.type !== 'der') {
	            if (Buffer.isBuffer(data)) {
	                data = data.toString('utf8');
	            }

	            if (_.isString(data)) {
	                var pem = data.replace('-----BEGIN RSA PUBLIC KEY-----', '')
	                    .replace('-----END RSA PUBLIC KEY-----', '')
	                    .replace(/\s+|\n\r|\n|\r$/gm, '');
	                buffer = new Buffer(pem, 'base64');
	            }
	        } else if (Buffer.isBuffer(data)) {
	            buffer = data;
	        } else {
	            throw Error('Unsupported key format');
	        }

	        var body = new ber.Reader(buffer);
	        body.readSequence();
	        key.setPublic(
	            body.readString(0x02, true), // modulus
	            body.readString(0x02, true)  // publicExponent
	        );
	    },

	    /**
	     * Trying autodetect and import key
	     * @param key
	     * @param data
	     */
	    autoImport: function (key, data) {
	        if (/^\s*-----BEGIN RSA PRIVATE KEY-----\s*(?=(([A-Za-z0-9+/=]+\s*)+))\1-----END RSA PRIVATE KEY-----\s*$/g.test(data)) {
	            module.exports.privateImport(key, data);
	            return true;
	        }

	        if (/^\s*-----BEGIN RSA PUBLIC KEY-----\s*(?=(([A-Za-z0-9+/=]+\s*)+))\1-----END RSA PUBLIC KEY-----\s*$/g.test(data)) {
	            module.exports.publicImport(key, data);
	            return true;
	        }

	        return false;
	    }
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Buffer) {var ber = __webpack_require__(38).Ber;
	var _ = __webpack_require__(11)._;
	var PUBLIC_RSA_OID = '1.2.840.113549.1.1.1';
	var utils = __webpack_require__(11);

	module.exports = {
	    privateExport: function (key, options) {
	        options = options || {};

	        var n = key.n.toBuffer();
	        var d = key.d.toBuffer();
	        var p = key.p.toBuffer();
	        var q = key.q.toBuffer();
	        var dmp1 = key.dmp1.toBuffer();
	        var dmq1 = key.dmq1.toBuffer();
	        var coeff = key.coeff.toBuffer();

	        var length = n.length + d.length + p.length + q.length + dmp1.length + dmq1.length + coeff.length + 512; // magic
	        var bodyWriter = new ber.Writer({size: length});

	        bodyWriter.startSequence();
	        bodyWriter.writeInt(0);
	        bodyWriter.writeBuffer(n, 2);
	        bodyWriter.writeInt(key.e);
	        bodyWriter.writeBuffer(d, 2);
	        bodyWriter.writeBuffer(p, 2);
	        bodyWriter.writeBuffer(q, 2);
	        bodyWriter.writeBuffer(dmp1, 2);
	        bodyWriter.writeBuffer(dmq1, 2);
	        bodyWriter.writeBuffer(coeff, 2);
	        bodyWriter.endSequence();

	        var writer = new ber.Writer({size: length});
	        writer.startSequence();
	        writer.writeInt(0);
	        writer.startSequence();
	        writer.writeOID(PUBLIC_RSA_OID);
	        writer.writeNull();
	        writer.endSequence();
	        writer.writeBuffer(bodyWriter.buffer, 4);
	        writer.endSequence();

	        if (options.type === 'der') {
	            return writer.buffer;
	        } else {
	            return '-----BEGIN PRIVATE KEY-----\n' + utils.linebrk(writer.buffer.toString('base64'), 64) + '\n-----END PRIVATE KEY-----';
	        }
	    },

	    privateImport: function (key, data, options) {
	        options = options || {};
	        var buffer;

	        if (options.type !== 'der') {
	            if (Buffer.isBuffer(data)) {
	                data = data.toString('utf8');
	            }

	            if (_.isString(data)) {
	                var pem = data.replace('-----BEGIN PRIVATE KEY-----', '')
	                    .replace('-----END PRIVATE KEY-----', '')
	                    .replace(/\s+|\n\r|\n|\r$/gm, '');
	                buffer = new Buffer(pem, 'base64');
	            } else {
	                throw Error('Unsupported key format');
	            }
	        } else if (Buffer.isBuffer(data)) {
	            buffer = data;
	        } else {
	            throw Error('Unsupported key format');
	        }

	        var reader = new ber.Reader(buffer);
	        reader.readSequence();
	        reader.readInt(0);
	        var header = new ber.Reader(reader.readString(0x30, true));

	        if (header.readOID(0x06, true) !== PUBLIC_RSA_OID) {
	            throw Error('Invalid Public key format');
	        }

	        var body = new ber.Reader(reader.readString(0x04, true));
	        body.readSequence();
	        body.readString(2, true); // just zero
	        key.setPrivate(
	            body.readString(2, true),  // modulus
	            body.readString(2, true),  // publicExponent
	            body.readString(2, true),  // privateExponent
	            body.readString(2, true),  // prime1
	            body.readString(2, true),  // prime2
	            body.readString(2, true),  // exponent1 -- d mod (p1)
	            body.readString(2, true),  // exponent2 -- d mod (q-1)
	            body.readString(2, true)   // coefficient -- (inverse of q) mod p
	        );
	    },

	    publicExport: function (key, options) {
	        options = options || {};

	        var n = key.n.toBuffer();
	        var length = n.length + 512; // magic

	        var bodyWriter = new ber.Writer({size: length});
	        bodyWriter.writeByte(0);
	        bodyWriter.startSequence();
	        bodyWriter.writeBuffer(n, 2);
	        bodyWriter.writeInt(key.e);
	        bodyWriter.endSequence();

	        var writer = new ber.Writer({size: length});
	        writer.startSequence();
	        writer.startSequence();
	        writer.writeOID(PUBLIC_RSA_OID);
	        writer.writeNull();
	        writer.endSequence();
	        writer.writeBuffer(bodyWriter.buffer, 3);
	        writer.endSequence();

	        if (options.type === 'der') {
	            return writer.buffer;
	        } else {
	            return '-----BEGIN PUBLIC KEY-----\n' + utils.linebrk(writer.buffer.toString('base64'), 64) + '\n-----END PUBLIC KEY-----';
	        }
	    },

	    publicImport: function (key, data, options) {
	        options = options || {};
	        var buffer;

	        if (options.type !== 'der') {
	            if (Buffer.isBuffer(data)) {
	                data = data.toString('utf8');
	            }

	            if (_.isString(data)) {
	                var pem = data.replace('-----BEGIN PUBLIC KEY-----', '')
	                    .replace('-----END PUBLIC KEY-----', '')
	                    .replace(/\s+|\n\r|\n|\r$/gm, '');
	                buffer = new Buffer(pem, 'base64');
	            }
	        } else if (Buffer.isBuffer(data)) {
	            buffer = data;
	        } else {
	            throw Error('Unsupported key format');
	        }

	        var reader = new ber.Reader(buffer);
	        reader.readSequence();
	        var header = new ber.Reader(reader.readString(0x30, true));

	        if (header.readOID(0x06, true) !== PUBLIC_RSA_OID) {
	            throw Error('Invalid Public key format');
	        }

	        var body = new ber.Reader(reader.readString(0x03, true));
	        body.readByte();
	        body.readSequence();
	        key.setPublic(
	            body.readString(0x02, true), // modulus
	            body.readString(0x02, true)  // publicExponent
	        );
	    },

	    /**
	     * Trying autodetect and import key
	     * @param key
	     * @param data
	     */
	    autoImport: function (key, data) {
	        if (/^\s*-----BEGIN PRIVATE KEY-----\s*(?=(([A-Za-z0-9+/=]+\s*)+))\1-----END PRIVATE KEY-----\s*$/g.test(data)) {
	            module.exports.privateImport(key, data);
	            return true;
	        }

	        if (/^\s*-----BEGIN PUBLIC KEY-----\s*(?=(([A-Za-z0-9+/=]+\s*)+))\1-----END PUBLIC KEY-----\s*$/g.test(data)) {
	            module.exports.publicImport(key, data);
	            return true;
	        }

	        return false;
	    }
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6).Buffer))

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(11)._;
	var utils = __webpack_require__(11);

	module.exports = {
	    privateExport: function (key, options) {
	        return {
	            n: key.n.toBuffer(),
	            e: key.e,
	            d: key.d.toBuffer(),
	            p: key.p.toBuffer(),
	            q: key.q.toBuffer(),
	            dmp1: key.dmp1.toBuffer(),
	            dmq1: key.dmq1.toBuffer(),
	            coeff: key.coeff.toBuffer()
	        };
	    },

	    privateImport: function (key, data, options) {
	        if (data.n && data.e && data.d && data.p && data.q && data.dmp1 && data.dmq1 && data.coeff) {
	            key.setPrivate(
	                data.n,
	                data.e,
	                data.d,
	                data.p,
	                data.q,
	                data.dmp1,
	                data.dmq1,
	                data.coeff
	            );
	        } else {
	            throw Error("Invalid key data");
	        }
	    },

	    publicExport: function (key, options) {
	        return {
	            n: key.n.toBuffer(),
	            e: key.e
	        };
	    },

	    publicImport: function (key, data, options) {
	        if (data.n && data.e) {
	            key.setPublic(
	                data.n,
	                data.e
	            );
	        } else {
	            throw Error("Invalid key data");
	        }
	    },

	    /**
	     * Trying autodetect and import key
	     * @param key
	     * @param data
	     */
	    autoImport: function (key, data) {
	        if (data.n && data.e) {
	            if (data.d && data.p && data.q && data.dmp1 && data.dmq1 && data.coeff) {
	                module.exports.privateImport(key, data);
	                return true;
	            } else {
	                module.exports.publicImport(key, data);
	                return true;
	            }
	        }

	        return false;
	    }
	};


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var CryptoJS = __webpack_require__(50).CryptoJS;
	__webpack_require__(51);
	__webpack_require__(52);
	__webpack_require__(53);
	__webpack_require__(54);
	__webpack_require__(55);
	var JsonFormatter = __webpack_require__(56).JsonFormatter;

	exports.CryptoJS = CryptoJS;
	exports.JsonFormatter = JsonFormatter;

/***/ },
/* 50 */
/***/ function(module, exports) {

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	/**
	 * CryptoJS core components.
	 */
	var CryptoJS = CryptoJS || (function (Math, undefined) {
	    /**
	     * CryptoJS namespace.
	     */
	    var C = {};

	    /**
	     * Library namespace.
	     */
	    var C_lib = C.lib = {};

	    /**
	     * Base object for prototypal inheritance.
	     */
	    var Base = C_lib.Base = (function () {
	        function F() {}

	        return {
	            /**
	             * Creates a new object that inherits from this object.
	             *
	             * @param {Object} overrides Properties to copy into the new object.
	             *
	             * @return {Object} The new object.
	             *
	             * @static
	             *
	             * @example
	             *
	             *     var MyType = CryptoJS.lib.Base.extend({
	             *         field: 'value',
	             *
	             *         method: function () {
	             *         }
	             *     });
	             */
	            extend: function (overrides) {
	                // Spawn
	                F.prototype = this;
	                var subtype = new F();

	                // Augment
	                if (overrides) {
	                    subtype.mixIn(overrides);
	                }

	                // Create default initializer
	                if (!subtype.hasOwnProperty('init')) {
	                    subtype.init = function () {
	                        subtype.$super.init.apply(this, arguments);
	                    };
	                }

	                // Initializer's prototype is the subtype object
	                subtype.init.prototype = subtype;

	                // Reference supertype
	                subtype.$super = this;

	                return subtype;
	            },

	            /**
	             * Extends this object and runs the init method.
	             * Arguments to create() will be passed to init().
	             *
	             * @return {Object} The new object.
	             *
	             * @static
	             *
	             * @example
	             *
	             *     var instance = MyType.create();
	             */
	            create: function () {
	                var instance = this.extend();
	                instance.init.apply(instance, arguments);

	                return instance;
	            },

	            /**
	             * Initializes a newly created object.
	             * Override this method to add some logic when your objects are created.
	             *
	             * @example
	             *
	             *     var MyType = CryptoJS.lib.Base.extend({
	             *         init: function () {
	             *             // ...
	             *         }
	             *     });
	             */
	            init: function () {
	            },

	            /**
	             * Copies properties into this object.
	             *
	             * @param {Object} properties The properties to mix in.
	             *
	             * @example
	             *
	             *     MyType.mixIn({
	             *         field: 'value'
	             *     });
	             */
	            mixIn: function (properties) {
	                for (var propertyName in properties) {
	                    if (properties.hasOwnProperty(propertyName)) {
	                        this[propertyName] = properties[propertyName];
	                    }
	                }

	                // IE won't copy toString using the loop above
	                if (properties.hasOwnProperty('toString')) {
	                    this.toString = properties.toString;
	                }
	            },

	            /**
	             * Creates a copy of this object.
	             *
	             * @return {Object} The clone.
	             *
	             * @example
	             *
	             *     var clone = instance.clone();
	             */
	            clone: function () {
	                return this.init.prototype.extend(this);
	            }
	        };
	    }());

	    /**
	     * An array of 32-bit words.
	     *
	     * @property {Array} words The array of 32-bit words.
	     * @property {number} sigBytes The number of significant bytes in this word array.
	     */
	    var WordArray = C_lib.WordArray = Base.extend({
	        /**
	         * Initializes a newly created word array.
	         *
	         * @param {Array} words (Optional) An array of 32-bit words.
	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.lib.WordArray.create();
	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
	         */
	        init: function (words, sigBytes) {
	            words = this.words = words || [];

	            if (sigBytes != undefined) {
	                this.sigBytes = sigBytes;
	            } else {
	                this.sigBytes = words.length * 4;
	            }
	        },

	        /**
	         * Converts this word array to a string.
	         *
	         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
	         *
	         * @return {string} The stringified word array.
	         *
	         * @example
	         *
	         *     var string = wordArray + '';
	         *     var string = wordArray.toString();
	         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
	         */
	        toString: function (encoder) {
	            return (encoder || Hex).stringify(this);
	        },

	        /**
	         * Concatenates a word array to this word array.
	         *
	         * @param {WordArray} wordArray The word array to append.
	         *
	         * @return {WordArray} This word array.
	         *
	         * @example
	         *
	         *     wordArray1.concat(wordArray2);
	         */
	        concat: function (wordArray) {
	            // Shortcuts
	            var thisWords = this.words;
	            var thatWords = wordArray.words;
	            var thisSigBytes = this.sigBytes;
	            var thatSigBytes = wordArray.sigBytes;

	            // Clamp excess bits
	            this.clamp();

	            // Concat
	            if (thisSigBytes % 4) {
	                // Copy one byte at a time
	                for (var i = 0; i < thatSigBytes; i++) {
	                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
	                }
	            } else if (thatWords.length > 0xffff) {
	                // Copy one word at a time
	                for (var i = 0; i < thatSigBytes; i += 4) {
	                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
	                }
	            } else {
	                // Copy all words at once
	                thisWords.push.apply(thisWords, thatWords);
	            }
	            this.sigBytes += thatSigBytes;

	            // Chainable
	            return this;
	        },

	        /**
	         * Removes insignificant bits.
	         *
	         * @example
	         *
	         *     wordArray.clamp();
	         */
	        clamp: function () {
	            // Shortcuts
	            var words = this.words;
	            var sigBytes = this.sigBytes;

	            // Clamp
	            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
	            words.length = Math.ceil(sigBytes / 4);
	        },

	        /**
	         * Creates a copy of this word array.
	         *
	         * @return {WordArray} The clone.
	         *
	         * @example
	         *
	         *     var clone = wordArray.clone();
	         */
	        clone: function () {
	            var clone = Base.clone.call(this);
	            clone.words = this.words.slice(0);

	            return clone;
	        },

	        /**
	         * Creates a word array filled with random bytes.
	         *
	         * @param {number} nBytes The number of random bytes to generate.
	         *
	         * @return {WordArray} The random word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.lib.WordArray.random(16);
	         */
	        random: function (nBytes) {
	            var words = [];
	            for (var i = 0; i < nBytes; i += 4) {
	                words.push((Math.random() * 0x100000000) | 0);
	            }

	            return new WordArray.init(words, nBytes);
	        }
	    });

	    /**
	     * Encoder namespace.
	     */
	    var C_enc = C.enc = {};

	    /**
	     * Hex encoding strategy.
	     */
	    var Hex = C_enc.Hex = {
	        /**
	         * Converts a word array to a hex string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The hex string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            // Shortcuts
	            var words = wordArray.words;
	            var sigBytes = wordArray.sigBytes;

	            // Convert
	            var hexChars = [];
	            for (var i = 0; i < sigBytes; i++) {
	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                hexChars.push((bite >>> 4).toString(16));
	                hexChars.push((bite & 0x0f).toString(16));
	            }

	            return hexChars.join('');
	        },

	        /**
	         * Converts a hex string to a word array.
	         *
	         * @param {string} hexStr The hex string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
	         */
	        parse: function (hexStr) {
	            // Shortcut
	            var hexStrLength = hexStr.length;

	            // Convert
	            var words = [];
	            for (var i = 0; i < hexStrLength; i += 2) {
	                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
	            }

	            return new WordArray.init(words, hexStrLength / 2);
	        }
	    };

	    /**
	     * Latin1 encoding strategy.
	     */
	    var Latin1 = C_enc.Latin1 = {
	        /**
	         * Converts a word array to a Latin1 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The Latin1 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            // Shortcuts
	            var words = wordArray.words;
	            var sigBytes = wordArray.sigBytes;

	            // Convert
	            var latin1Chars = [];
	            for (var i = 0; i < sigBytes; i++) {
	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
	                latin1Chars.push(String.fromCharCode(bite));
	            }

	            return latin1Chars.join('');
	        },

	        /**
	         * Converts a Latin1 string to a word array.
	         *
	         * @param {string} latin1Str The Latin1 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
	         */
	        parse: function (latin1Str) {
	            // Shortcut
	            var latin1StrLength = latin1Str.length;

	            // Convert
	            var words = [];
	            for (var i = 0; i < latin1StrLength; i++) {
	                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
	            }

	            return new WordArray.init(words, latin1StrLength);
	        }
	    };

	    /**
	     * UTF-8 encoding strategy.
	     */
	    var Utf8 = C_enc.Utf8 = {
	        /**
	         * Converts a word array to a UTF-8 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The UTF-8 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            try {
	                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
	            } catch (e) {
	                throw new Error('Malformed UTF-8 data');
	            }
	        },

	        /**
	         * Converts a UTF-8 string to a word array.
	         *
	         * @param {string} utf8Str The UTF-8 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
	         */
	        parse: function (utf8Str) {
	            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
	        }
	    };

	    /**
	     * Abstract buffered block algorithm template.
	     *
	     * The property blockSize must be implemented in a concrete subtype.
	     *
	     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
	     */
	    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
	        /**
	         * Resets this block algorithm's data buffer to its initial state.
	         *
	         * @example
	         *
	         *     bufferedBlockAlgorithm.reset();
	         */
	        reset: function () {
	            // Initial values
	            this._data = new WordArray.init();
	            this._nDataBytes = 0;
	        },

	        /**
	         * Adds new data to this block algorithm's buffer.
	         *
	         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
	         *
	         * @example
	         *
	         *     bufferedBlockAlgorithm._append('data');
	         *     bufferedBlockAlgorithm._append(wordArray);
	         */
	        _append: function (data) {
	            // Convert string to WordArray, else assume WordArray already
	            if (typeof data == 'string') {
	                data = Utf8.parse(data);
	            }

	            // Append
	            this._data.concat(data);
	            this._nDataBytes += data.sigBytes;
	        },

	        /**
	         * Processes available data blocks.
	         *
	         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
	         *
	         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
	         *
	         * @return {WordArray} The processed data.
	         *
	         * @example
	         *
	         *     var processedData = bufferedBlockAlgorithm._process();
	         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
	         */
	        _process: function (doFlush) {
	            // Shortcuts
	            var data = this._data;
	            var dataWords = data.words;
	            var dataSigBytes = data.sigBytes;
	            var blockSize = this.blockSize;
	            var blockSizeBytes = blockSize * 4;

	            // Count blocks ready
	            var nBlocksReady = dataSigBytes / blockSizeBytes;
	            if (doFlush) {
	                // Round up to include partial blocks
	                nBlocksReady = Math.ceil(nBlocksReady);
	            } else {
	                // Round down to include only full blocks,
	                // less the number of blocks that must remain in the buffer
	                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
	            }

	            // Count words ready
	            var nWordsReady = nBlocksReady * blockSize;

	            // Count bytes ready
	            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

	            // Process blocks
	            if (nWordsReady) {
	                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
	                    // Perform concrete-algorithm logic
	                    this._doProcessBlock(dataWords, offset);
	                }

	                // Remove processed words
	                var processedWords = dataWords.splice(0, nWordsReady);
	                data.sigBytes -= nBytesReady;
	            }

	            // Return processed words
	            return new WordArray.init(processedWords, nBytesReady);
	        },

	        /**
	         * Creates a copy of this object.
	         *
	         * @return {Object} The clone.
	         *
	         * @example
	         *
	         *     var clone = bufferedBlockAlgorithm.clone();
	         */
	        clone: function () {
	            var clone = Base.clone.call(this);
	            clone._data = this._data.clone();

	            return clone;
	        },

	        _minBufferSize: 0
	    });

	    /**
	     * Abstract hasher template.
	     *
	     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
	     */
	    var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
	        /**
	         * Configuration options.
	         */
	        cfg: Base.extend(),

	        /**
	         * Initializes a newly created hasher.
	         *
	         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
	         *
	         * @example
	         *
	         *     var hasher = CryptoJS.algo.SHA256.create();
	         */
	        init: function (cfg) {
	            // Apply config defaults
	            this.cfg = this.cfg.extend(cfg);

	            // Set initial values
	            this.reset();
	        },

	        /**
	         * Resets this hasher to its initial state.
	         *
	         * @example
	         *
	         *     hasher.reset();
	         */
	        reset: function () {
	            // Reset data buffer
	            BufferedBlockAlgorithm.reset.call(this);

	            // Perform concrete-hasher logic
	            this._doReset();
	        },

	        /**
	         * Updates this hasher with a message.
	         *
	         * @param {WordArray|string} messageUpdate The message to append.
	         *
	         * @return {Hasher} This hasher.
	         *
	         * @example
	         *
	         *     hasher.update('message');
	         *     hasher.update(wordArray);
	         */
	        update: function (messageUpdate) {
	            // Append
	            this._append(messageUpdate);

	            // Update the hash
	            this._process();

	            // Chainable
	            return this;
	        },

	        /**
	         * Finalizes the hash computation.
	         * Note that the finalize operation is effectively a destructive, read-once operation.
	         *
	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
	         *
	         * @return {WordArray} The hash.
	         *
	         * @example
	         *
	         *     var hash = hasher.finalize();
	         *     var hash = hasher.finalize('message');
	         *     var hash = hasher.finalize(wordArray);
	         */
	        finalize: function (messageUpdate) {
	            // Final message update
	            if (messageUpdate) {
	                this._append(messageUpdate);
	            }

	            // Perform concrete-hasher logic
	            var hash = this._doFinalize();

	            return hash;
	        },

	        blockSize: 512/32,

	        /**
	         * Creates a shortcut function to a hasher's object interface.
	         *
	         * @param {Hasher} hasher The hasher to create a helper for.
	         *
	         * @return {Function} The shortcut function.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
	         */
	        _createHelper: function (hasher) {
	            return function (message, cfg) {
	                return new hasher.init(cfg).finalize(message);
	            };
	        },

	        /**
	         * Creates a shortcut function to the HMAC's object interface.
	         *
	         * @param {Hasher} hasher The hasher to use in this HMAC helper.
	         *
	         * @return {Function} The shortcut function.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
	         */
	        _createHmacHelper: function (hasher) {
	            return function (message, key) {
	                return new C_algo.HMAC.init(hasher, key).finalize(message);
	            };
	        }
	    });

	    /**
	     * Algorithm namespace.
	     */
	    var C_algo = C.algo = {};

	    return C;
	}(Math));

	exports.CryptoJS = CryptoJS;


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var CryptoJS = __webpack_require__(50).CryptoJS;

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function () {
	    // Shortcuts
	    var C = CryptoJS;
	    var C_lib = C.lib;
	    var WordArray = C_lib.WordArray;
	    var C_enc = C.enc;

	    /**
	     * Base64 encoding strategy.
	     */
	    var Base64 = C_enc.Base64 = {
	        /**
	         * Converts a word array to a Base64 string.
	         *
	         * @param {WordArray} wordArray The word array.
	         *
	         * @return {string} The Base64 string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
	         */
	        stringify: function (wordArray) {
	            // Shortcuts
	            var words = wordArray.words;
	            var sigBytes = wordArray.sigBytes;
	            var map = this._map;

	            // Clamp excess bits
	            wordArray.clamp();

	            // Convert
	            var base64Chars = [];
	            for (var i = 0; i < sigBytes; i += 3) {
	                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
	                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
	                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

	                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

	                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
	                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
	                }
	            }

	            // Add padding
	            var paddingChar = map.charAt(64);
	            if (paddingChar) {
	                while (base64Chars.length % 4) {
	                    base64Chars.push(paddingChar);
	                }
	            }

	            return base64Chars.join('');
	        },

	        /**
	         * Converts a Base64 string to a word array.
	         *
	         * @param {string} base64Str The Base64 string.
	         *
	         * @return {WordArray} The word array.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
	         */
	        parse: function (base64Str) {
	            // Shortcuts
	            var base64StrLength = base64Str.length;
	            var map = this._map;

	            // Ignore padding
	            var paddingChar = map.charAt(64);
	            if (paddingChar) {
	                var paddingIndex = base64Str.indexOf(paddingChar);
	                if (paddingIndex != -1) {
	                    base64StrLength = paddingIndex;
	                }
	            }

	            // Convert
	            var words = [];
	            var nBytes = 0;
	            for (var i = 0; i < base64StrLength; i++) {
	                if (i % 4) {
	                    var bits1 = map.indexOf(base64Str.charAt(i - 1)) << ((i % 4) * 2);
	                    var bits2 = map.indexOf(base64Str.charAt(i)) >>> (6 - (i % 4) * 2);
	                    words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8);
	                    nBytes++;
	                }
	            }

	            return WordArray.create(words, nBytes);
	        },

	        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
	    };
	}());


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	var CryptoJS = __webpack_require__(50).CryptoJS;

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function (Math) {
	    // Shortcuts
	    var C = CryptoJS;
	    var C_lib = C.lib;
	    var WordArray = C_lib.WordArray;
	    var Hasher = C_lib.Hasher;
	    var C_algo = C.algo;

	    // Constants table
	    var T = [];

	    // Compute constants
	    (function () {
	        for (var i = 0; i < 64; i++) {
	            T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) | 0;
	        }
	    }());

	    /**
	     * MD5 hash algorithm.
	     */
	    var MD5 = C_algo.MD5 = Hasher.extend({
	        _doReset: function () {
	            this._hash = new WordArray.init([
	                0x67452301, 0xefcdab89,
	                0x98badcfe, 0x10325476
	            ]);
	        },

	        _doProcessBlock: function (M, offset) {
	            // Swap endian
	            for (var i = 0; i < 16; i++) {
	                // Shortcuts
	                var offset_i = offset + i;
	                var M_offset_i = M[offset_i];

	                M[offset_i] = (
	                    (((M_offset_i << 8)  | (M_offset_i >>> 24)) & 0x00ff00ff) |
	                    (((M_offset_i << 24) | (M_offset_i >>> 8))  & 0xff00ff00)
	                );
	            }

	            // Shortcuts
	            var H = this._hash.words;

	            var M_offset_0  = M[offset + 0];
	            var M_offset_1  = M[offset + 1];
	            var M_offset_2  = M[offset + 2];
	            var M_offset_3  = M[offset + 3];
	            var M_offset_4  = M[offset + 4];
	            var M_offset_5  = M[offset + 5];
	            var M_offset_6  = M[offset + 6];
	            var M_offset_7  = M[offset + 7];
	            var M_offset_8  = M[offset + 8];
	            var M_offset_9  = M[offset + 9];
	            var M_offset_10 = M[offset + 10];
	            var M_offset_11 = M[offset + 11];
	            var M_offset_12 = M[offset + 12];
	            var M_offset_13 = M[offset + 13];
	            var M_offset_14 = M[offset + 14];
	            var M_offset_15 = M[offset + 15];

	            // Working varialbes
	            var a = H[0];
	            var b = H[1];
	            var c = H[2];
	            var d = H[3];

	            // Computation
	            a = FF(a, b, c, d, M_offset_0,  7,  T[0]);
	            d = FF(d, a, b, c, M_offset_1,  12, T[1]);
	            c = FF(c, d, a, b, M_offset_2,  17, T[2]);
	            b = FF(b, c, d, a, M_offset_3,  22, T[3]);
	            a = FF(a, b, c, d, M_offset_4,  7,  T[4]);
	            d = FF(d, a, b, c, M_offset_5,  12, T[5]);
	            c = FF(c, d, a, b, M_offset_6,  17, T[6]);
	            b = FF(b, c, d, a, M_offset_7,  22, T[7]);
	            a = FF(a, b, c, d, M_offset_8,  7,  T[8]);
	            d = FF(d, a, b, c, M_offset_9,  12, T[9]);
	            c = FF(c, d, a, b, M_offset_10, 17, T[10]);
	            b = FF(b, c, d, a, M_offset_11, 22, T[11]);
	            a = FF(a, b, c, d, M_offset_12, 7,  T[12]);
	            d = FF(d, a, b, c, M_offset_13, 12, T[13]);
	            c = FF(c, d, a, b, M_offset_14, 17, T[14]);
	            b = FF(b, c, d, a, M_offset_15, 22, T[15]);

	            a = GG(a, b, c, d, M_offset_1,  5,  T[16]);
	            d = GG(d, a, b, c, M_offset_6,  9,  T[17]);
	            c = GG(c, d, a, b, M_offset_11, 14, T[18]);
	            b = GG(b, c, d, a, M_offset_0,  20, T[19]);
	            a = GG(a, b, c, d, M_offset_5,  5,  T[20]);
	            d = GG(d, a, b, c, M_offset_10, 9,  T[21]);
	            c = GG(c, d, a, b, M_offset_15, 14, T[22]);
	            b = GG(b, c, d, a, M_offset_4,  20, T[23]);
	            a = GG(a, b, c, d, M_offset_9,  5,  T[24]);
	            d = GG(d, a, b, c, M_offset_14, 9,  T[25]);
	            c = GG(c, d, a, b, M_offset_3,  14, T[26]);
	            b = GG(b, c, d, a, M_offset_8,  20, T[27]);
	            a = GG(a, b, c, d, M_offset_13, 5,  T[28]);
	            d = GG(d, a, b, c, M_offset_2,  9,  T[29]);
	            c = GG(c, d, a, b, M_offset_7,  14, T[30]);
	            b = GG(b, c, d, a, M_offset_12, 20, T[31]);

	            a = HH(a, b, c, d, M_offset_5,  4,  T[32]);
	            d = HH(d, a, b, c, M_offset_8,  11, T[33]);
	            c = HH(c, d, a, b, M_offset_11, 16, T[34]);
	            b = HH(b, c, d, a, M_offset_14, 23, T[35]);
	            a = HH(a, b, c, d, M_offset_1,  4,  T[36]);
	            d = HH(d, a, b, c, M_offset_4,  11, T[37]);
	            c = HH(c, d, a, b, M_offset_7,  16, T[38]);
	            b = HH(b, c, d, a, M_offset_10, 23, T[39]);
	            a = HH(a, b, c, d, M_offset_13, 4,  T[40]);
	            d = HH(d, a, b, c, M_offset_0,  11, T[41]);
	            c = HH(c, d, a, b, M_offset_3,  16, T[42]);
	            b = HH(b, c, d, a, M_offset_6,  23, T[43]);
	            a = HH(a, b, c, d, M_offset_9,  4,  T[44]);
	            d = HH(d, a, b, c, M_offset_12, 11, T[45]);
	            c = HH(c, d, a, b, M_offset_15, 16, T[46]);
	            b = HH(b, c, d, a, M_offset_2,  23, T[47]);

	            a = II(a, b, c, d, M_offset_0,  6,  T[48]);
	            d = II(d, a, b, c, M_offset_7,  10, T[49]);
	            c = II(c, d, a, b, M_offset_14, 15, T[50]);
	            b = II(b, c, d, a, M_offset_5,  21, T[51]);
	            a = II(a, b, c, d, M_offset_12, 6,  T[52]);
	            d = II(d, a, b, c, M_offset_3,  10, T[53]);
	            c = II(c, d, a, b, M_offset_10, 15, T[54]);
	            b = II(b, c, d, a, M_offset_1,  21, T[55]);
	            a = II(a, b, c, d, M_offset_8,  6,  T[56]);
	            d = II(d, a, b, c, M_offset_15, 10, T[57]);
	            c = II(c, d, a, b, M_offset_6,  15, T[58]);
	            b = II(b, c, d, a, M_offset_13, 21, T[59]);
	            a = II(a, b, c, d, M_offset_4,  6,  T[60]);
	            d = II(d, a, b, c, M_offset_11, 10, T[61]);
	            c = II(c, d, a, b, M_offset_2,  15, T[62]);
	            b = II(b, c, d, a, M_offset_9,  21, T[63]);

	            // Intermediate hash value
	            H[0] = (H[0] + a) | 0;
	            H[1] = (H[1] + b) | 0;
	            H[2] = (H[2] + c) | 0;
	            H[3] = (H[3] + d) | 0;
	        },

	        _doFinalize: function () {
	            // Shortcuts
	            var data = this._data;
	            var dataWords = data.words;

	            var nBitsTotal = this._nDataBytes * 8;
	            var nBitsLeft = data.sigBytes * 8;

	            // Add padding
	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);

	            var nBitsTotalH = Math.floor(nBitsTotal / 0x100000000);
	            var nBitsTotalL = nBitsTotal;
	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = (
	                (((nBitsTotalH << 8)  | (nBitsTotalH >>> 24)) & 0x00ff00ff) |
	                (((nBitsTotalH << 24) | (nBitsTotalH >>> 8))  & 0xff00ff00)
	            );
	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
	                (((nBitsTotalL << 8)  | (nBitsTotalL >>> 24)) & 0x00ff00ff) |
	                (((nBitsTotalL << 24) | (nBitsTotalL >>> 8))  & 0xff00ff00)
	            );

	            data.sigBytes = (dataWords.length + 1) * 4;

	            // Hash final blocks
	            this._process();

	            // Shortcuts
	            var hash = this._hash;
	            var H = hash.words;

	            // Swap endian
	            for (var i = 0; i < 4; i++) {
	                // Shortcut
	                var H_i = H[i];

	                H[i] = (((H_i << 8)  | (H_i >>> 24)) & 0x00ff00ff) |
	                       (((H_i << 24) | (H_i >>> 8))  & 0xff00ff00);
	            }

	            // Return final computed hash
	            return hash;
	        },

	        clone: function () {
	            var clone = Hasher.clone.call(this);
	            clone._hash = this._hash.clone();

	            return clone;
	        }
	    });

	    function FF(a, b, c, d, x, s, t) {
	        var n = a + ((b & c) | (~b & d)) + x + t;
	        return ((n << s) | (n >>> (32 - s))) + b;
	    }

	    function GG(a, b, c, d, x, s, t) {
	        var n = a + ((b & d) | (c & ~d)) + x + t;
	        return ((n << s) | (n >>> (32 - s))) + b;
	    }

	    function HH(a, b, c, d, x, s, t) {
	        var n = a + (b ^ c ^ d) + x + t;
	        return ((n << s) | (n >>> (32 - s))) + b;
	    }

	    function II(a, b, c, d, x, s, t) {
	        var n = a + (c ^ (b | ~d)) + x + t;
	        return ((n << s) | (n >>> (32 - s))) + b;
	    }

	    /**
	     * Shortcut function to the hasher's object interface.
	     *
	     * @param {WordArray|string} message The message to hash.
	     *
	     * @return {WordArray} The hash.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var hash = CryptoJS.MD5('message');
	     *     var hash = CryptoJS.MD5(wordArray);
	     */
	    C.MD5 = Hasher._createHelper(MD5);

	    /**
	     * Shortcut function to the HMAC's object interface.
	     *
	     * @param {WordArray|string} message The message to hash.
	     * @param {WordArray|string} key The secret key.
	     *
	     * @return {WordArray} The HMAC.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var hmac = CryptoJS.HmacMD5(message, key);
	     */
	    C.HmacMD5 = Hasher._createHmacHelper(MD5);
	}(Math));


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var CryptoJS = __webpack_require__(50).CryptoJS;

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function () {
	    // Shortcuts
	    var C = CryptoJS;
	    var C_lib = C.lib;
	    var Base = C_lib.Base;
	    var WordArray = C_lib.WordArray;
	    var C_algo = C.algo;
	    var MD5 = C_algo.MD5;

	    /**
	     * This key derivation function is meant to conform with EVP_BytesToKey.
	     * www.openssl.org/docs/crypto/EVP_BytesToKey.html
	     */
	    var EvpKDF = C_algo.EvpKDF = Base.extend({
	        /**
	         * Configuration options.
	         *
	         * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
	         * @property {Hasher} hasher The hash algorithm to use. Default: MD5
	         * @property {number} iterations The number of iterations to perform. Default: 1
	         */
	        cfg: Base.extend({
	            keySize: 128/32,
	            hasher: MD5,
	            iterations: 1
	        }),

	        /**
	         * Initializes a newly created key derivation function.
	         *
	         * @param {Object} cfg (Optional) The configuration options to use for the derivation.
	         *
	         * @example
	         *
	         *     var kdf = CryptoJS.algo.EvpKDF.create();
	         *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
	         *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
	         */
	        init: function (cfg) {
	            this.cfg = this.cfg.extend(cfg);
	        },

	        /**
	         * Derives a key from a password.
	         *
	         * @param {WordArray|string} password The password.
	         * @param {WordArray|string} salt A salt.
	         *
	         * @return {WordArray} The derived key.
	         *
	         * @example
	         *
	         *     var key = kdf.compute(password, salt);
	         */
	        compute: function (password, salt) {
	            // Shortcut
	            var cfg = this.cfg;

	            // Init hasher
	            var hasher = cfg.hasher.create();

	            // Initial values
	            var derivedKey = WordArray.create();

	            // Shortcuts
	            var derivedKeyWords = derivedKey.words;
	            var keySize = cfg.keySize;
	            var iterations = cfg.iterations;

	            // Generate key
	            while (derivedKeyWords.length < keySize) {
	                if (block) {
	                    hasher.update(block);
	                }
	                var block = hasher.update(password).finalize(salt);
	                hasher.reset();

	                // Iterations
	                for (var i = 1; i < iterations; i++) {
	                    block = hasher.finalize(block);
	                    hasher.reset();
	                }

	                derivedKey.concat(block);
	            }
	            derivedKey.sigBytes = keySize * 4;

	            return derivedKey;
	        }
	    });

	    /**
	     * Derives a key from a password.
	     *
	     * @param {WordArray|string} password The password.
	     * @param {WordArray|string} salt A salt.
	     * @param {Object} cfg (Optional) The configuration options to use for this computation.
	     *
	     * @return {WordArray} The derived key.
	     *
	     * @static
	     *
	     * @example
	     *
	     *     var key = CryptoJS.EvpKDF(password, salt);
	     *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8 });
	     *     var key = CryptoJS.EvpKDF(password, salt, { keySize: 8, iterations: 1000 });
	     */
	    C.EvpKDF = function (password, salt, cfg) {
	        return EvpKDF.create(cfg).compute(password, salt);
	    };
	}());


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	var CryptoJS = __webpack_require__(50).CryptoJS;

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	/**
	 * Cipher core components.
	 */
	CryptoJS.lib.Cipher || (function (undefined) {
	    // Shortcuts
	    var C = CryptoJS;
	    var C_lib = C.lib;
	    var Base = C_lib.Base;
	    var WordArray = C_lib.WordArray;
	    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
	    var C_enc = C.enc;
	    var Utf8 = C_enc.Utf8;
	    var Base64 = C_enc.Base64;
	    var C_algo = C.algo;
	    var EvpKDF = C_algo.EvpKDF;

	    /**
	     * Abstract base cipher template.
	     *
	     * @property {number} keySize This cipher's key size. Default: 4 (128 bits)
	     * @property {number} ivSize This cipher's IV size. Default: 4 (128 bits)
	     * @property {number} _ENC_XFORM_MODE A constant representing encryption mode.
	     * @property {number} _DEC_XFORM_MODE A constant representing decryption mode.
	     */
	    var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
	        /**
	         * Configuration options.
	         *
	         * @property {WordArray} iv The IV to use for this operation.
	         */
	        cfg: Base.extend(),

	        /**
	         * Creates this cipher in encryption mode.
	         *
	         * @param {WordArray} key The key.
	         * @param {Object} cfg (Optional) The configuration options to use for this operation.
	         *
	         * @return {Cipher} A cipher instance.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
	         */
	        createEncryptor: function (key, cfg) {
	            return this.create(this._ENC_XFORM_MODE, key, cfg);
	        },

	        /**
	         * Creates this cipher in decryption mode.
	         *
	         * @param {WordArray} key The key.
	         * @param {Object} cfg (Optional) The configuration options to use for this operation.
	         *
	         * @return {Cipher} A cipher instance.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
	         */
	        createDecryptor: function (key, cfg) {
	            return this.create(this._DEC_XFORM_MODE, key, cfg);
	        },

	        /**
	         * Initializes a newly created cipher.
	         *
	         * @param {number} xformMode Either the encryption or decryption transormation mode constant.
	         * @param {WordArray} key The key.
	         * @param {Object} cfg (Optional) The configuration options to use for this operation.
	         *
	         * @example
	         *
	         *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
	         */
	        init: function (xformMode, key, cfg) {
	            // Apply config defaults
	            this.cfg = this.cfg.extend(cfg);

	            // Store transform mode and key
	            this._xformMode = xformMode;
	            this._key = key;

	            // Set initial values
	            this.reset();
	        },

	        /**
	         * Resets this cipher to its initial state.
	         *
	         * @example
	         *
	         *     cipher.reset();
	         */
	        reset: function () {
	            // Reset data buffer
	            BufferedBlockAlgorithm.reset.call(this);

	            // Perform concrete-cipher logic
	            this._doReset();
	        },

	        /**
	         * Adds data to be encrypted or decrypted.
	         *
	         * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
	         *
	         * @return {WordArray} The data after processing.
	         *
	         * @example
	         *
	         *     var encrypted = cipher.process('data');
	         *     var encrypted = cipher.process(wordArray);
	         */
	        process: function (dataUpdate) {
	            // Append
	            this._append(dataUpdate);

	            // Process available blocks
	            return this._process();
	        },

	        /**
	         * Finalizes the encryption or decryption process.
	         * Note that the finalize operation is effectively a destructive, read-once operation.
	         *
	         * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
	         *
	         * @return {WordArray} The data after final processing.
	         *
	         * @example
	         *
	         *     var encrypted = cipher.finalize();
	         *     var encrypted = cipher.finalize('data');
	         *     var encrypted = cipher.finalize(wordArray);
	         */
	        finalize: function (dataUpdate) {
	            // Final data update
	            if (dataUpdate) {
	                this._append(dataUpdate);
	            }

	            // Perform concrete-cipher logic
	            var finalProcessedData = this._doFinalize();

	            return finalProcessedData;
	        },

	        keySize: 128/32,

	        ivSize: 128/32,

	        _ENC_XFORM_MODE: 1,

	        _DEC_XFORM_MODE: 2,

	        /**
	         * Creates shortcut functions to a cipher's object interface.
	         *
	         * @param {Cipher} cipher The cipher to create a helper for.
	         *
	         * @return {Object} An object with encrypt and decrypt shortcut functions.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
	         */
	        _createHelper: (function () {
	            function selectCipherStrategy(key) {
	                if (typeof key == 'string') {
	                    return PasswordBasedCipher;
	                } else {
	                    return SerializableCipher;
	                }
	            }

	            return function (cipher) {
	                return {
	                    encrypt: function (message, key, cfg) {
	                        return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
	                    },

	                    decrypt: function (ciphertext, key, cfg) {
	                        return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
	                    }
	                };
	            };
	        }())
	    });

	    /**
	     * Abstract base stream cipher template.
	     *
	     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 1 (32 bits)
	     */
	    var StreamCipher = C_lib.StreamCipher = Cipher.extend({
	        _doFinalize: function () {
	            // Process partial blocks
	            var finalProcessedBlocks = this._process(!!'flush');

	            return finalProcessedBlocks;
	        },

	        blockSize: 1
	    });

	    /**
	     * Mode namespace.
	     */
	    var C_mode = C.mode = {};

	    /**
	     * Abstract base block cipher mode template.
	     */
	    var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
	        /**
	         * Creates this mode for encryption.
	         *
	         * @param {Cipher} cipher A block cipher instance.
	         * @param {Array} iv The IV words.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
	         */
	        createEncryptor: function (cipher, iv) {
	            return this.Encryptor.create(cipher, iv);
	        },

	        /**
	         * Creates this mode for decryption.
	         *
	         * @param {Cipher} cipher A block cipher instance.
	         * @param {Array} iv The IV words.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
	         */
	        createDecryptor: function (cipher, iv) {
	            return this.Decryptor.create(cipher, iv);
	        },

	        /**
	         * Initializes a newly created mode.
	         *
	         * @param {Cipher} cipher A block cipher instance.
	         * @param {Array} iv The IV words.
	         *
	         * @example
	         *
	         *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
	         */
	        init: function (cipher, iv) {
	            this._cipher = cipher;
	            this._iv = iv;
	        }
	    });

	    /**
	     * Cipher Block Chaining mode.
	     */
	    var CBC = C_mode.CBC = (function () {
	        /**
	         * Abstract base CBC mode.
	         */
	        var CBC = BlockCipherMode.extend();

	        /**
	         * CBC encryptor.
	         */
	        CBC.Encryptor = CBC.extend({
	            /**
	             * Processes the data block at offset.
	             *
	             * @param {Array} words The data words to operate on.
	             * @param {number} offset The offset where the block starts.
	             *
	             * @example
	             *
	             *     mode.processBlock(data.words, offset);
	             */
	            processBlock: function (words, offset) {
	                // Shortcuts
	                var cipher = this._cipher;
	                var blockSize = cipher.blockSize;

	                // XOR and encrypt
	                xorBlock.call(this, words, offset, blockSize);
	                cipher.encryptBlock(words, offset);

	                // Remember this block to use with next block
	                this._prevBlock = words.slice(offset, offset + blockSize);
	            }
	        });

	        /**
	         * CBC decryptor.
	         */
	        CBC.Decryptor = CBC.extend({
	            /**
	             * Processes the data block at offset.
	             *
	             * @param {Array} words The data words to operate on.
	             * @param {number} offset The offset where the block starts.
	             *
	             * @example
	             *
	             *     mode.processBlock(data.words, offset);
	             */
	            processBlock: function (words, offset) {
	                // Shortcuts
	                var cipher = this._cipher;
	                var blockSize = cipher.blockSize;

	                // Remember this block to use with next block
	                var thisBlock = words.slice(offset, offset + blockSize);

	                // Decrypt and XOR
	                cipher.decryptBlock(words, offset);
	                xorBlock.call(this, words, offset, blockSize);

	                // This block becomes the previous block
	                this._prevBlock = thisBlock;
	            }
	        });

	        function xorBlock(words, offset, blockSize) {
	            // Shortcut
	            var iv = this._iv;

	            // Choose mixing block
	            if (iv) {
	                var block = iv;

	                // Remove IV for subsequent blocks
	                this._iv = undefined;
	            } else {
	                var block = this._prevBlock;
	            }

	            // XOR blocks
	            for (var i = 0; i < blockSize; i++) {
	                words[offset + i] ^= block[i];
	            }
	        }

	        return CBC;
	    }());

	    /**
	     * Padding namespace.
	     */
	    var C_pad = C.pad = {};

	    /**
	     * PKCS #5/7 padding strategy.
	     */
	    var Pkcs7 = C_pad.Pkcs7 = {
	        /**
	         * Pads data using the algorithm defined in PKCS #5/7.
	         *
	         * @param {WordArray} data The data to pad.
	         * @param {number} blockSize The multiple that the data should be padded to.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
	         */
	        pad: function (data, blockSize) {
	            // Shortcut
	            var blockSizeBytes = blockSize * 4;

	            // Count padding bytes
	            var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;

	            // Create padding word
	            var paddingWord = (nPaddingBytes << 24) | (nPaddingBytes << 16) | (nPaddingBytes << 8) | nPaddingBytes;

	            // Create padding
	            var paddingWords = [];
	            for (var i = 0; i < nPaddingBytes; i += 4) {
	                paddingWords.push(paddingWord);
	            }
	            var padding = WordArray.create(paddingWords, nPaddingBytes);

	            // Add padding
	            data.concat(padding);
	        },

	        /**
	         * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
	         *
	         * @param {WordArray} data The data to unpad.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     CryptoJS.pad.Pkcs7.unpad(wordArray);
	         */
	        unpad: function (data) {
	            // Get number of padding bytes from last byte
	            var nPaddingBytes = data.words[(data.sigBytes - 1) >>> 2] & 0xff;

	            // Remove padding
	            data.sigBytes -= nPaddingBytes;
	        }
	    };

	    /**
	     * Abstract base block cipher template.
	     *
	     * @property {number} blockSize The number of 32-bit words this cipher operates on. Default: 4 (128 bits)
	     */
	    var BlockCipher = C_lib.BlockCipher = Cipher.extend({
	        /**
	         * Configuration options.
	         *
	         * @property {Mode} mode The block mode to use. Default: CBC
	         * @property {Padding} padding The padding strategy to use. Default: Pkcs7
	         */
	        cfg: Cipher.cfg.extend({
	            mode: CBC,
	            padding: Pkcs7
	        }),

	        reset: function () {
	            // Reset cipher
	            Cipher.reset.call(this);

	            // Shortcuts
	            var cfg = this.cfg;
	            var iv = cfg.iv;
	            var mode = cfg.mode;

	            // Reset block mode
	            if (this._xformMode == this._ENC_XFORM_MODE) {
	                var modeCreator = mode.createEncryptor;
	            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
	                var modeCreator = mode.createDecryptor;

	                // Keep at least one block in the buffer for unpadding
	                this._minBufferSize = 1;
	            }
	            this._mode = modeCreator.call(mode, this, iv && iv.words);
	        },

	        _doProcessBlock: function (words, offset) {
	            this._mode.processBlock(words, offset);
	        },

	        _doFinalize: function () {
	            // Shortcut
	            var padding = this.cfg.padding;

	            // Finalize
	            if (this._xformMode == this._ENC_XFORM_MODE) {
	                // Pad data
	                padding.pad(this._data, this.blockSize);

	                // Process final blocks
	                var finalProcessedBlocks = this._process(!!'flush');
	            } else /* if (this._xformMode == this._DEC_XFORM_MODE) */ {
	                // Process final blocks
	                var finalProcessedBlocks = this._process(!!'flush');

	                // Unpad data
	                padding.unpad(finalProcessedBlocks);
	            }

	            return finalProcessedBlocks;
	        },

	        blockSize: 128/32
	    });

	    /**
	     * A collection of cipher parameters.
	     *
	     * @property {WordArray} ciphertext The raw ciphertext.
	     * @property {WordArray} key The key to this ciphertext.
	     * @property {WordArray} iv The IV used in the ciphering operation.
	     * @property {WordArray} salt The salt used with a key derivation function.
	     * @property {Cipher} algorithm The cipher algorithm.
	     * @property {Mode} mode The block mode used in the ciphering operation.
	     * @property {Padding} padding The padding scheme used in the ciphering operation.
	     * @property {number} blockSize The block size of the cipher.
	     * @property {Format} formatter The default formatting strategy to convert this cipher params object to a string.
	     */
	    var CipherParams = C_lib.CipherParams = Base.extend({
	        /**
	         * Initializes a newly created cipher params object.
	         *
	         * @param {Object} cipherParams An object with any of the possible cipher parameters.
	         *
	         * @example
	         *
	         *     var cipherParams = CryptoJS.lib.CipherParams.create({
	         *         ciphertext: ciphertextWordArray,
	         *         key: keyWordArray,
	         *         iv: ivWordArray,
	         *         salt: saltWordArray,
	         *         algorithm: CryptoJS.algo.AES,
	         *         mode: CryptoJS.mode.CBC,
	         *         padding: CryptoJS.pad.PKCS7,
	         *         blockSize: 4,
	         *         formatter: CryptoJS.format.OpenSSL
	         *     });
	         */
	        init: function (cipherParams) {
	            this.mixIn(cipherParams);
	        },

	        /**
	         * Converts this cipher params object to a string.
	         *
	         * @param {Format} formatter (Optional) The formatting strategy to use.
	         *
	         * @return {string} The stringified cipher params.
	         *
	         * @throws Error If neither the formatter nor the default formatter is set.
	         *
	         * @example
	         *
	         *     var string = cipherParams + '';
	         *     var string = cipherParams.toString();
	         *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
	         */
	        toString: function (formatter) {
	            return (formatter || this.formatter).stringify(this);
	        }
	    });

	    /**
	     * Format namespace.
	     */
	    var C_format = C.format = {};

	    /**
	     * OpenSSL formatting strategy.
	     */
	    var OpenSSLFormatter = C_format.OpenSSL = {
	        /**
	         * Converts a cipher params object to an OpenSSL-compatible string.
	         *
	         * @param {CipherParams} cipherParams The cipher params object.
	         *
	         * @return {string} The OpenSSL-compatible string.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
	         */
	        stringify: function (cipherParams) {
	            // Shortcuts
	            var ciphertext = cipherParams.ciphertext;
	            var salt = cipherParams.salt;

	            // Format
	            if (salt) {
	                var wordArray = WordArray.create([0x53616c74, 0x65645f5f]).concat(salt).concat(ciphertext);
	            } else {
	                var wordArray = ciphertext;
	            }

	            return wordArray.toString(Base64);
	        },

	        /**
	         * Converts an OpenSSL-compatible string to a cipher params object.
	         *
	         * @param {string} openSSLStr The OpenSSL-compatible string.
	         *
	         * @return {CipherParams} The cipher params object.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
	         */
	        parse: function (openSSLStr) {
	            // Parse base64
	            var ciphertext = Base64.parse(openSSLStr);

	            // Shortcut
	            var ciphertextWords = ciphertext.words;

	            // Test for salt
	            if (ciphertextWords[0] == 0x53616c74 && ciphertextWords[1] == 0x65645f5f) {
	                // Extract salt
	                var salt = WordArray.create(ciphertextWords.slice(2, 4));

	                // Remove salt from ciphertext
	                ciphertextWords.splice(0, 4);
	                ciphertext.sigBytes -= 16;
	            }

	            return CipherParams.create({ ciphertext: ciphertext, salt: salt });
	        }
	    };

	    /**
	     * A cipher wrapper that returns ciphertext as a serializable cipher params object.
	     */
	    var SerializableCipher = C_lib.SerializableCipher = Base.extend({
	        /**
	         * Configuration options.
	         *
	         * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
	         */
	        cfg: Base.extend({
	            format: OpenSSLFormatter
	        }),

	        /**
	         * Encrypts a message.
	         *
	         * @param {Cipher} cipher The cipher algorithm to use.
	         * @param {WordArray|string} message The message to encrypt.
	         * @param {WordArray} key The key.
	         * @param {Object} cfg (Optional) The configuration options to use for this operation.
	         *
	         * @return {CipherParams} A cipher params object.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
	         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
	         *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
	         */
	        encrypt: function (cipher, message, key, cfg) {
	            // Apply config defaults
	            cfg = this.cfg.extend(cfg);

	            // Encrypt
	            var encryptor = cipher.createEncryptor(key, cfg);
	            var ciphertext = encryptor.finalize(message);

	            // Shortcut
	            var cipherCfg = encryptor.cfg;

	            // Create and return serializable cipher params
	            return CipherParams.create({
	                ciphertext: ciphertext,
	                key: key,
	                iv: cipherCfg.iv,
	                algorithm: cipher,
	                mode: cipherCfg.mode,
	                padding: cipherCfg.padding,
	                blockSize: cipher.blockSize,
	                formatter: cfg.format
	            });
	        },

	        /**
	         * Decrypts serialized ciphertext.
	         *
	         * @param {Cipher} cipher The cipher algorithm to use.
	         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
	         * @param {WordArray} key The key.
	         * @param {Object} cfg (Optional) The configuration options to use for this operation.
	         *
	         * @return {WordArray} The plaintext.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
	         *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
	         */
	        decrypt: function (cipher, ciphertext, key, cfg) {
	            // Apply config defaults
	            cfg = this.cfg.extend(cfg);

	            // Convert string to CipherParams
	            ciphertext = this._parse(ciphertext, cfg.format);

	            // Decrypt
	            var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);

	            return plaintext;
	        },

	        /**
	         * Converts serialized ciphertext to CipherParams,
	         * else assumed CipherParams already and returns ciphertext unchanged.
	         *
	         * @param {CipherParams|string} ciphertext The ciphertext.
	         * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
	         *
	         * @return {CipherParams} The unserialized ciphertext.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
	         */
	        _parse: function (ciphertext, format) {
	            if (typeof ciphertext == 'string') {
	                return format.parse(ciphertext, this);
	            } else {
	                return ciphertext;
	            }
	        }
	    });

	    /**
	     * Key derivation function namespace.
	     */
	    var C_kdf = C.kdf = {};

	    /**
	     * OpenSSL key derivation function.
	     */
	    var OpenSSLKdf = C_kdf.OpenSSL = {
	        /**
	         * Derives a key and IV from a password.
	         *
	         * @param {string} password The password to derive from.
	         * @param {number} keySize The size in words of the key to generate.
	         * @param {number} ivSize The size in words of the IV to generate.
	         * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
	         *
	         * @return {CipherParams} A cipher params object with the key, IV, and salt.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
	         *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
	         */
	        execute: function (password, keySize, ivSize, salt) {
	            // Generate random salt
	            if (!salt) {
	                salt = WordArray.random(64/8);
	            }

	            // Derive key and IV
	            var key = EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);

	            // Separate key and IV
	            var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
	            key.sigBytes = keySize * 4;

	            // Return params
	            return CipherParams.create({ key: key, iv: iv, salt: salt });
	        }
	    };

	    /**
	     * A serializable cipher wrapper that derives the key from a password,
	     * and returns ciphertext as a serializable cipher params object.
	     */
	    var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
	        /**
	         * Configuration options.
	         *
	         * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
	         */
	        cfg: SerializableCipher.cfg.extend({
	            kdf: OpenSSLKdf
	        }),

	        /**
	         * Encrypts a message using a password.
	         *
	         * @param {Cipher} cipher The cipher algorithm to use.
	         * @param {WordArray|string} message The message to encrypt.
	         * @param {string} password The password.
	         * @param {Object} cfg (Optional) The configuration options to use for this operation.
	         *
	         * @return {CipherParams} A cipher params object.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
	         *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
	         */
	        encrypt: function (cipher, message, password, cfg) {
	            // Apply config defaults
	            cfg = this.cfg.extend(cfg);

	            // Derive key and other params
	            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize);

	            // Add IV to config
	            cfg.iv = derivedParams.iv;

	            // Encrypt
	            var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);

	            // Mix in derived params
	            ciphertext.mixIn(derivedParams);

	            return ciphertext;
	        },

	        /**
	         * Decrypts serialized ciphertext using a password.
	         *
	         * @param {Cipher} cipher The cipher algorithm to use.
	         * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
	         * @param {string} password The password.
	         * @param {Object} cfg (Optional) The configuration options to use for this operation.
	         *
	         * @return {WordArray} The plaintext.
	         *
	         * @static
	         *
	         * @example
	         *
	         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
	         *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
	         */
	        decrypt: function (cipher, ciphertext, password, cfg) {
	            // Apply config defaults
	            cfg = this.cfg.extend(cfg);

	            // Convert string to CipherParams
	            ciphertext = this._parse(ciphertext, cfg.format);

	            // Derive key and other params
	            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt);

	            // Add IV to config
	            cfg.iv = derivedParams.iv;

	            // Decrypt
	            var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);

	            return plaintext;
	        }
	    });
	}());


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var CryptoJS = __webpack_require__(50).CryptoJS;

	/*
	CryptoJS v3.1.2
	code.google.com/p/crypto-js
	(c) 2009-2013 by Jeff Mott. All rights reserved.
	code.google.com/p/crypto-js/wiki/License
	*/
	(function () {
	    // Shortcuts
	    var C = CryptoJS;
	    var C_lib = C.lib;
	    var BlockCipher = C_lib.BlockCipher;
	    var C_algo = C.algo;

	    // Lookup tables
	    var SBOX = [];
	    var INV_SBOX = [];
	    var SUB_MIX_0 = [];
	    var SUB_MIX_1 = [];
	    var SUB_MIX_2 = [];
	    var SUB_MIX_3 = [];
	    var INV_SUB_MIX_0 = [];
	    var INV_SUB_MIX_1 = [];
	    var INV_SUB_MIX_2 = [];
	    var INV_SUB_MIX_3 = [];

	    // Compute lookup tables
	    (function () {
	        // Compute double table
	        var d = [];
	        for (var i = 0; i < 256; i++) {
	            if (i < 128) {
	                d[i] = i << 1;
	            } else {
	                d[i] = (i << 1) ^ 0x11b;
	            }
	        }

	        // Walk GF(2^8)
	        var x = 0;
	        var xi = 0;
	        for (var i = 0; i < 256; i++) {
	            // Compute sbox
	            var sx = xi ^ (xi << 1) ^ (xi << 2) ^ (xi << 3) ^ (xi << 4);
	            sx = (sx >>> 8) ^ (sx & 0xff) ^ 0x63;
	            SBOX[x] = sx;
	            INV_SBOX[sx] = x;

	            // Compute multiplication
	            var x2 = d[x];
	            var x4 = d[x2];
	            var x8 = d[x4];

	            // Compute sub bytes, mix columns tables
	            var t = (d[sx] * 0x101) ^ (sx * 0x1010100);
	            SUB_MIX_0[x] = (t << 24) | (t >>> 8);
	            SUB_MIX_1[x] = (t << 16) | (t >>> 16);
	            SUB_MIX_2[x] = (t << 8)  | (t >>> 24);
	            SUB_MIX_3[x] = t;

	            // Compute inv sub bytes, inv mix columns tables
	            var t = (x8 * 0x1010101) ^ (x4 * 0x10001) ^ (x2 * 0x101) ^ (x * 0x1010100);
	            INV_SUB_MIX_0[sx] = (t << 24) | (t >>> 8);
	            INV_SUB_MIX_1[sx] = (t << 16) | (t >>> 16);
	            INV_SUB_MIX_2[sx] = (t << 8)  | (t >>> 24);
	            INV_SUB_MIX_3[sx] = t;

	            // Compute next counter
	            if (!x) {
	                x = xi = 1;
	            } else {
	                x = x2 ^ d[d[d[x8 ^ x2]]];
	                xi ^= d[d[xi]];
	            }
	        }
	    }());

	    // Precomputed Rcon lookup
	    var RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

	    /**
	     * AES block cipher algorithm.
	     */
	    var AES = C_algo.AES = BlockCipher.extend({
	        _doReset: function () {
	            // Shortcuts
	            var key = this._key;
	            var keyWords = key.words;
	            var keySize = key.sigBytes / 4;

	            // Compute number of rounds
	            var nRounds = this._nRounds = keySize + 6

	            // Compute number of key schedule rows
	            var ksRows = (nRounds + 1) * 4;

	            // Compute key schedule
	            var keySchedule = this._keySchedule = [];
	            for (var ksRow = 0; ksRow < ksRows; ksRow++) {
	                if (ksRow < keySize) {
	                    keySchedule[ksRow] = keyWords[ksRow];
	                } else {
	                    var t = keySchedule[ksRow - 1];

	                    if (!(ksRow % keySize)) {
	                        // Rot word
	                        t = (t << 8) | (t >>> 24);

	                        // Sub word
	                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];

	                        // Mix Rcon
	                        t ^= RCON[(ksRow / keySize) | 0] << 24;
	                    } else if (keySize > 6 && ksRow % keySize == 4) {
	                        // Sub word
	                        t = (SBOX[t >>> 24] << 24) | (SBOX[(t >>> 16) & 0xff] << 16) | (SBOX[(t >>> 8) & 0xff] << 8) | SBOX[t & 0xff];
	                    }

	                    keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
	                }
	            }

	            // Compute inv key schedule
	            var invKeySchedule = this._invKeySchedule = [];
	            for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
	                var ksRow = ksRows - invKsRow;

	                if (invKsRow % 4) {
	                    var t = keySchedule[ksRow];
	                } else {
	                    var t = keySchedule[ksRow - 4];
	                }

	                if (invKsRow < 4 || ksRow <= 4) {
	                    invKeySchedule[invKsRow] = t;
	                } else {
	                    invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[(t >>> 16) & 0xff]] ^
	                                               INV_SUB_MIX_2[SBOX[(t >>> 8) & 0xff]] ^ INV_SUB_MIX_3[SBOX[t & 0xff]];
	                }
	            }
	        },

	        encryptBlock: function (M, offset) {
	            this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
	        },

	        decryptBlock: function (M, offset) {
	            // Swap 2nd and 4th rows
	            var t = M[offset + 1];
	            M[offset + 1] = M[offset + 3];
	            M[offset + 3] = t;

	            this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);

	            // Inv swap 2nd and 4th rows
	            var t = M[offset + 1];
	            M[offset + 1] = M[offset + 3];
	            M[offset + 3] = t;
	        },

	        _doCryptBlock: function (M, offset, keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX) {
	            // Shortcut
	            var nRounds = this._nRounds;

	            // Get input, add round key
	            var s0 = M[offset]     ^ keySchedule[0];
	            var s1 = M[offset + 1] ^ keySchedule[1];
	            var s2 = M[offset + 2] ^ keySchedule[2];
	            var s3 = M[offset + 3] ^ keySchedule[3];

	            // Key schedule row counter
	            var ksRow = 4;

	            // Rounds
	            for (var round = 1; round < nRounds; round++) {
	                // Shift rows, sub bytes, mix columns, add round key
	                var t0 = SUB_MIX_0[s0 >>> 24] ^ SUB_MIX_1[(s1 >>> 16) & 0xff] ^ SUB_MIX_2[(s2 >>> 8) & 0xff] ^ SUB_MIX_3[s3 & 0xff] ^ keySchedule[ksRow++];
	                var t1 = SUB_MIX_0[s1 >>> 24] ^ SUB_MIX_1[(s2 >>> 16) & 0xff] ^ SUB_MIX_2[(s3 >>> 8) & 0xff] ^ SUB_MIX_3[s0 & 0xff] ^ keySchedule[ksRow++];
	                var t2 = SUB_MIX_0[s2 >>> 24] ^ SUB_MIX_1[(s3 >>> 16) & 0xff] ^ SUB_MIX_2[(s0 >>> 8) & 0xff] ^ SUB_MIX_3[s1 & 0xff] ^ keySchedule[ksRow++];
	                var t3 = SUB_MIX_0[s3 >>> 24] ^ SUB_MIX_1[(s0 >>> 16) & 0xff] ^ SUB_MIX_2[(s1 >>> 8) & 0xff] ^ SUB_MIX_3[s2 & 0xff] ^ keySchedule[ksRow++];

	                // Update state
	                s0 = t0;
	                s1 = t1;
	                s2 = t2;
	                s3 = t3;
	            }

	            // Shift rows, sub bytes, add round key
	            var t0 = ((SBOX[s0 >>> 24] << 24) | (SBOX[(s1 >>> 16) & 0xff] << 16) | (SBOX[(s2 >>> 8) & 0xff] << 8) | SBOX[s3 & 0xff]) ^ keySchedule[ksRow++];
	            var t1 = ((SBOX[s1 >>> 24] << 24) | (SBOX[(s2 >>> 16) & 0xff] << 16) | (SBOX[(s3 >>> 8) & 0xff] << 8) | SBOX[s0 & 0xff]) ^ keySchedule[ksRow++];
	            var t2 = ((SBOX[s2 >>> 24] << 24) | (SBOX[(s3 >>> 16) & 0xff] << 16) | (SBOX[(s0 >>> 8) & 0xff] << 8) | SBOX[s1 & 0xff]) ^ keySchedule[ksRow++];
	            var t3 = ((SBOX[s3 >>> 24] << 24) | (SBOX[(s0 >>> 16) & 0xff] << 16) | (SBOX[(s1 >>> 8) & 0xff] << 8) | SBOX[s2 & 0xff]) ^ keySchedule[ksRow++];

	            // Set output
	            M[offset]     = t0;
	            M[offset + 1] = t1;
	            M[offset + 2] = t2;
	            M[offset + 3] = t3;
	        },

	        keySize: 256/32
	    });

	    /**
	     * Shortcut functions to the cipher's object interface.
	     *
	     * @example
	     *
	     *     var ciphertext = CryptoJS.AES.encrypt(message, key, cfg);
	     *     var plaintext  = CryptoJS.AES.decrypt(ciphertext, key, cfg);
	     */
	    C.AES = BlockCipher._createHelper(AES);
	}());


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	var CryptoJS = __webpack_require__(50).CryptoJS;

	// create custom json serialization format
	var JsonFormatter = {
		stringify: function (cipherParams) {
			// create json object with ciphertext
			var jsonObj = {
				ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
			};
			
			// optionally add iv and salt
			if (cipherParams.iv) {
				jsonObj.iv = cipherParams.iv.toString();
			}
			
			if (cipherParams.salt) {
				jsonObj.s = cipherParams.salt.toString();
			}

			// stringify json object
			return JSON.stringify(jsonObj)
		},

		parse: function (jsonStr) {
			// parse json string
			var jsonObj = JSON.parse(jsonStr);
			
			// extract ciphertext from json object, and create cipher params object
			var cipherParams = CryptoJS.lib.CipherParams.create({
				ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
			});
			
			// optionally extract iv and salt
			if (jsonObj.iv) {
				cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv);
			}
	            
			if (jsonObj.s) {
				cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s);
			}
			
			return cipherParams;
		}
	};

	exports.JsonFormatter = JsonFormatter;

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	var require;var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process, global, module) {/*!
	 * @overview es6-promise - a tiny implementation of Promises/A+.
	 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
	 * @license   Licensed under MIT license
	 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
	 * @version   3.1.2
	 */

	(function() {
	    "use strict";
	    function lib$es6$promise$utils$$objectOrFunction(x) {
	      return typeof x === 'function' || (typeof x === 'object' && x !== null);
	    }

	    function lib$es6$promise$utils$$isFunction(x) {
	      return typeof x === 'function';
	    }

	    function lib$es6$promise$utils$$isMaybeThenable(x) {
	      return typeof x === 'object' && x !== null;
	    }

	    var lib$es6$promise$utils$$_isArray;
	    if (!Array.isArray) {
	      lib$es6$promise$utils$$_isArray = function (x) {
	        return Object.prototype.toString.call(x) === '[object Array]';
	      };
	    } else {
	      lib$es6$promise$utils$$_isArray = Array.isArray;
	    }

	    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
	    var lib$es6$promise$asap$$len = 0;
	    var lib$es6$promise$asap$$vertxNext;
	    var lib$es6$promise$asap$$customSchedulerFn;

	    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
	      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
	      lib$es6$promise$asap$$len += 2;
	      if (lib$es6$promise$asap$$len === 2) {
	        // If len is 2, that means that we need to schedule an async flush.
	        // If additional callbacks are queued before the queue is flushed, they
	        // will be processed by this flush that we are scheduling.
	        if (lib$es6$promise$asap$$customSchedulerFn) {
	          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
	        } else {
	          lib$es6$promise$asap$$scheduleFlush();
	        }
	      }
	    }

	    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
	      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
	    }

	    function lib$es6$promise$asap$$setAsap(asapFn) {
	      lib$es6$promise$asap$$asap = asapFn;
	    }

	    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
	    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
	    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
	    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

	    // test for web worker but not in IE10
	    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
	      typeof importScripts !== 'undefined' &&
	      typeof MessageChannel !== 'undefined';

	    // node
	    function lib$es6$promise$asap$$useNextTick() {
	      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
	      // see https://github.com/cujojs/when/issues/410 for details
	      return function() {
	        process.nextTick(lib$es6$promise$asap$$flush);
	      };
	    }

	    // vertx
	    function lib$es6$promise$asap$$useVertxTimer() {
	      return function() {
	        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
	      };
	    }

	    function lib$es6$promise$asap$$useMutationObserver() {
	      var iterations = 0;
	      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
	      var node = document.createTextNode('');
	      observer.observe(node, { characterData: true });

	      return function() {
	        node.data = (iterations = ++iterations % 2);
	      };
	    }

	    // web worker
	    function lib$es6$promise$asap$$useMessageChannel() {
	      var channel = new MessageChannel();
	      channel.port1.onmessage = lib$es6$promise$asap$$flush;
	      return function () {
	        channel.port2.postMessage(0);
	      };
	    }

	    function lib$es6$promise$asap$$useSetTimeout() {
	      return function() {
	        setTimeout(lib$es6$promise$asap$$flush, 1);
	      };
	    }

	    var lib$es6$promise$asap$$queue = new Array(1000);
	    function lib$es6$promise$asap$$flush() {
	      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
	        var callback = lib$es6$promise$asap$$queue[i];
	        var arg = lib$es6$promise$asap$$queue[i+1];

	        callback(arg);

	        lib$es6$promise$asap$$queue[i] = undefined;
	        lib$es6$promise$asap$$queue[i+1] = undefined;
	      }

	      lib$es6$promise$asap$$len = 0;
	    }

	    function lib$es6$promise$asap$$attemptVertx() {
	      try {
	        var r = require;
	        var vertx = __webpack_require__(59);
	        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
	        return lib$es6$promise$asap$$useVertxTimer();
	      } catch(e) {
	        return lib$es6$promise$asap$$useSetTimeout();
	      }
	    }

	    var lib$es6$promise$asap$$scheduleFlush;
	    // Decide what async method to use to triggering processing of queued callbacks:
	    if (lib$es6$promise$asap$$isNode) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
	    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
	    } else if (lib$es6$promise$asap$$isWorker) {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
	    } else if (lib$es6$promise$asap$$browserWindow === undefined && "function" === 'function') {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
	    } else {
	      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
	    }
	    function lib$es6$promise$then$$then(onFulfillment, onRejection) {
	      var parent = this;
	      var state = parent._state;

	      if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
	        return this;
	      }

	      var child = new this.constructor(lib$es6$promise$$internal$$noop);
	      var result = parent._result;

	      if (state) {
	        var callback = arguments[state - 1];
	        lib$es6$promise$asap$$asap(function(){
	          lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
	        });
	      } else {
	        lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
	      }

	      return child;
	    }
	    var lib$es6$promise$then$$default = lib$es6$promise$then$$then;
	    function lib$es6$promise$promise$resolve$$resolve(object) {
	      /*jshint validthis:true */
	      var Constructor = this;

	      if (object && typeof object === 'object' && object.constructor === Constructor) {
	        return object;
	      }

	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$resolve(promise, object);
	      return promise;
	    }
	    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;

	    function lib$es6$promise$$internal$$noop() {}

	    var lib$es6$promise$$internal$$PENDING   = void 0;
	    var lib$es6$promise$$internal$$FULFILLED = 1;
	    var lib$es6$promise$$internal$$REJECTED  = 2;

	    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

	    function lib$es6$promise$$internal$$selfFulfillment() {
	      return new TypeError("You cannot resolve a promise with itself");
	    }

	    function lib$es6$promise$$internal$$cannotReturnOwn() {
	      return new TypeError('A promises callback cannot return that same promise.');
	    }

	    function lib$es6$promise$$internal$$getThen(promise) {
	      try {
	        return promise.then;
	      } catch(error) {
	        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
	        return lib$es6$promise$$internal$$GET_THEN_ERROR;
	      }
	    }

	    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
	      try {
	        then.call(value, fulfillmentHandler, rejectionHandler);
	      } catch(e) {
	        return e;
	      }
	    }

	    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
	       lib$es6$promise$asap$$asap(function(promise) {
	        var sealed = false;
	        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
	          if (sealed) { return; }
	          sealed = true;
	          if (thenable !== value) {
	            lib$es6$promise$$internal$$resolve(promise, value);
	          } else {
	            lib$es6$promise$$internal$$fulfill(promise, value);
	          }
	        }, function(reason) {
	          if (sealed) { return; }
	          sealed = true;

	          lib$es6$promise$$internal$$reject(promise, reason);
	        }, 'Settle: ' + (promise._label || ' unknown promise'));

	        if (!sealed && error) {
	          sealed = true;
	          lib$es6$promise$$internal$$reject(promise, error);
	        }
	      }, promise);
	    }

	    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
	      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
	      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, thenable._result);
	      } else {
	        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      }
	    }

	    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
	      if (maybeThenable.constructor === promise.constructor &&
	          then === lib$es6$promise$then$$default &&
	          constructor.resolve === lib$es6$promise$promise$resolve$$default) {
	        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
	      } else {
	        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
	        } else if (then === undefined) {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        } else if (lib$es6$promise$utils$$isFunction(then)) {
	          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
	        } else {
	          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
	        }
	      }
	    }

	    function lib$es6$promise$$internal$$resolve(promise, value) {
	      if (promise === value) {
	        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
	      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
	        lib$es6$promise$$internal$$handleMaybeThenable(promise, value, lib$es6$promise$$internal$$getThen(value));
	      } else {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      }
	    }

	    function lib$es6$promise$$internal$$publishRejection(promise) {
	      if (promise._onerror) {
	        promise._onerror(promise._result);
	      }

	      lib$es6$promise$$internal$$publish(promise);
	    }

	    function lib$es6$promise$$internal$$fulfill(promise, value) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

	      promise._result = value;
	      promise._state = lib$es6$promise$$internal$$FULFILLED;

	      if (promise._subscribers.length !== 0) {
	        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
	      }
	    }

	    function lib$es6$promise$$internal$$reject(promise, reason) {
	      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
	      promise._state = lib$es6$promise$$internal$$REJECTED;
	      promise._result = reason;

	      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
	    }

	    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
	      var subscribers = parent._subscribers;
	      var length = subscribers.length;

	      parent._onerror = null;

	      subscribers[length] = child;
	      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
	      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

	      if (length === 0 && parent._state) {
	        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
	      }
	    }

	    function lib$es6$promise$$internal$$publish(promise) {
	      var subscribers = promise._subscribers;
	      var settled = promise._state;

	      if (subscribers.length === 0) { return; }

	      var child, callback, detail = promise._result;

	      for (var i = 0; i < subscribers.length; i += 3) {
	        child = subscribers[i];
	        callback = subscribers[i + settled];

	        if (child) {
	          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
	        } else {
	          callback(detail);
	        }
	      }

	      promise._subscribers.length = 0;
	    }

	    function lib$es6$promise$$internal$$ErrorObject() {
	      this.error = null;
	    }

	    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

	    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
	      try {
	        return callback(detail);
	      } catch(e) {
	        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
	        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
	      }
	    }

	    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
	      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
	          value, error, succeeded, failed;

	      if (hasCallback) {
	        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

	        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
	          failed = true;
	          error = value.error;
	          value = null;
	        } else {
	          succeeded = true;
	        }

	        if (promise === value) {
	          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
	          return;
	        }

	      } else {
	        value = detail;
	        succeeded = true;
	      }

	      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
	        // noop
	      } else if (hasCallback && succeeded) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      } else if (failed) {
	        lib$es6$promise$$internal$$reject(promise, error);
	      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
	        lib$es6$promise$$internal$$fulfill(promise, value);
	      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
	        lib$es6$promise$$internal$$reject(promise, value);
	      }
	    }

	    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
	      try {
	        resolver(function resolvePromise(value){
	          lib$es6$promise$$internal$$resolve(promise, value);
	        }, function rejectPromise(reason) {
	          lib$es6$promise$$internal$$reject(promise, reason);
	        });
	      } catch(e) {
	        lib$es6$promise$$internal$$reject(promise, e);
	      }
	    }

	    function lib$es6$promise$promise$all$$all(entries) {
	      return new lib$es6$promise$enumerator$$default(this, entries).promise;
	    }
	    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
	    function lib$es6$promise$promise$race$$race(entries) {
	      /*jshint validthis:true */
	      var Constructor = this;

	      var promise = new Constructor(lib$es6$promise$$internal$$noop);

	      if (!lib$es6$promise$utils$$isArray(entries)) {
	        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
	        return promise;
	      }

	      var length = entries.length;

	      function onFulfillment(value) {
	        lib$es6$promise$$internal$$resolve(promise, value);
	      }

	      function onRejection(reason) {
	        lib$es6$promise$$internal$$reject(promise, reason);
	      }

	      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
	        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
	      }

	      return promise;
	    }
	    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
	    function lib$es6$promise$promise$reject$$reject(reason) {
	      /*jshint validthis:true */
	      var Constructor = this;
	      var promise = new Constructor(lib$es6$promise$$internal$$noop);
	      lib$es6$promise$$internal$$reject(promise, reason);
	      return promise;
	    }
	    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

	    var lib$es6$promise$promise$$counter = 0;

	    function lib$es6$promise$promise$$needsResolver() {
	      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
	    }

	    function lib$es6$promise$promise$$needsNew() {
	      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
	    }

	    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
	    /**
	      Promise objects represent the eventual result of an asynchronous operation. The
	      primary way of interacting with a promise is through its `then` method, which
	      registers callbacks to receive either a promise's eventual value or the reason
	      why the promise cannot be fulfilled.

	      Terminology
	      -----------

	      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
	      - `thenable` is an object or function that defines a `then` method.
	      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
	      - `exception` is a value that is thrown using the throw statement.
	      - `reason` is a value that indicates why a promise was rejected.
	      - `settled` the final resting state of a promise, fulfilled or rejected.

	      A promise can be in one of three states: pending, fulfilled, or rejected.

	      Promises that are fulfilled have a fulfillment value and are in the fulfilled
	      state.  Promises that are rejected have a rejection reason and are in the
	      rejected state.  A fulfillment value is never a thenable.

	      Promises can also be said to *resolve* a value.  If this value is also a
	      promise, then the original promise's settled state will match the value's
	      settled state.  So a promise that *resolves* a promise that rejects will
	      itself reject, and a promise that *resolves* a promise that fulfills will
	      itself fulfill.


	      Basic Usage:
	      ------------

	      ```js
	      var promise = new Promise(function(resolve, reject) {
	        // on success
	        resolve(value);

	        // on failure
	        reject(reason);
	      });

	      promise.then(function(value) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```

	      Advanced Usage:
	      ---------------

	      Promises shine when abstracting away asynchronous interactions such as
	      `XMLHttpRequest`s.

	      ```js
	      function getJSON(url) {
	        return new Promise(function(resolve, reject){
	          var xhr = new XMLHttpRequest();

	          xhr.open('GET', url);
	          xhr.onreadystatechange = handler;
	          xhr.responseType = 'json';
	          xhr.setRequestHeader('Accept', 'application/json');
	          xhr.send();

	          function handler() {
	            if (this.readyState === this.DONE) {
	              if (this.status === 200) {
	                resolve(this.response);
	              } else {
	                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
	              }
	            }
	          };
	        });
	      }

	      getJSON('/posts.json').then(function(json) {
	        // on fulfillment
	      }, function(reason) {
	        // on rejection
	      });
	      ```

	      Unlike callbacks, promises are great composable primitives.

	      ```js
	      Promise.all([
	        getJSON('/posts'),
	        getJSON('/comments')
	      ]).then(function(values){
	        values[0] // => postsJSON
	        values[1] // => commentsJSON

	        return values;
	      });
	      ```

	      @class Promise
	      @param {function} resolver
	      Useful for tooling.
	      @constructor
	    */
	    function lib$es6$promise$promise$$Promise(resolver) {
	      this._id = lib$es6$promise$promise$$counter++;
	      this._state = undefined;
	      this._result = undefined;
	      this._subscribers = [];

	      if (lib$es6$promise$$internal$$noop !== resolver) {
	        typeof resolver !== 'function' && lib$es6$promise$promise$$needsResolver();
	        this instanceof lib$es6$promise$promise$$Promise ? lib$es6$promise$$internal$$initializePromise(this, resolver) : lib$es6$promise$promise$$needsNew();
	      }
	    }

	    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
	    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
	    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
	    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
	    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
	    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
	    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

	    lib$es6$promise$promise$$Promise.prototype = {
	      constructor: lib$es6$promise$promise$$Promise,

	    /**
	      The primary way of interacting with a promise is through its `then` method,
	      which registers callbacks to receive either a promise's eventual value or the
	      reason why the promise cannot be fulfilled.

	      ```js
	      findUser().then(function(user){
	        // user is available
	      }, function(reason){
	        // user is unavailable, and you are given the reason why
	      });
	      ```

	      Chaining
	      --------

	      The return value of `then` is itself a promise.  This second, 'downstream'
	      promise is resolved with the return value of the first promise's fulfillment
	      or rejection handler, or rejected if the handler throws an exception.

	      ```js
	      findUser().then(function (user) {
	        return user.name;
	      }, function (reason) {
	        return 'default name';
	      }).then(function (userName) {
	        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
	        // will be `'default name'`
	      });

	      findUser().then(function (user) {
	        throw new Error('Found user, but still unhappy');
	      }, function (reason) {
	        throw new Error('`findUser` rejected and we're unhappy');
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
	        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
	      });
	      ```
	      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

	      ```js
	      findUser().then(function (user) {
	        throw new PedagogicalException('Upstream error');
	      }).then(function (value) {
	        // never reached
	      }).then(function (value) {
	        // never reached
	      }, function (reason) {
	        // The `PedgagocialException` is propagated all the way down to here
	      });
	      ```

	      Assimilation
	      ------------

	      Sometimes the value you want to propagate to a downstream promise can only be
	      retrieved asynchronously. This can be achieved by returning a promise in the
	      fulfillment or rejection handler. The downstream promise will then be pending
	      until the returned promise is settled. This is called *assimilation*.

	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // The user's comments are now available
	      });
	      ```

	      If the assimliated promise rejects, then the downstream promise will also reject.

	      ```js
	      findUser().then(function (user) {
	        return findCommentsByAuthor(user);
	      }).then(function (comments) {
	        // If `findCommentsByAuthor` fulfills, we'll have the value here
	      }, function (reason) {
	        // If `findCommentsByAuthor` rejects, we'll have the reason here
	      });
	      ```

	      Simple Example
	      --------------

	      Synchronous Example

	      ```javascript
	      var result;

	      try {
	        result = findResult();
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```

	      Errback Example

	      ```js
	      findResult(function(result, err){
	        if (err) {
	          // failure
	        } else {
	          // success
	        }
	      });
	      ```

	      Promise Example;

	      ```javascript
	      findResult().then(function(result){
	        // success
	      }, function(reason){
	        // failure
	      });
	      ```

	      Advanced Example
	      --------------

	      Synchronous Example

	      ```javascript
	      var author, books;

	      try {
	        author = findAuthor();
	        books  = findBooksByAuthor(author);
	        // success
	      } catch(reason) {
	        // failure
	      }
	      ```

	      Errback Example

	      ```js

	      function foundBooks(books) {

	      }

	      function failure(reason) {

	      }

	      findAuthor(function(author, err){
	        if (err) {
	          failure(err);
	          // failure
	        } else {
	          try {
	            findBoooksByAuthor(author, function(books, err) {
	              if (err) {
	                failure(err);
	              } else {
	                try {
	                  foundBooks(books);
	                } catch(reason) {
	                  failure(reason);
	                }
	              }
	            });
	          } catch(error) {
	            failure(err);
	          }
	          // success
	        }
	      });
	      ```

	      Promise Example;

	      ```javascript
	      findAuthor().
	        then(findBooksByAuthor).
	        then(function(books){
	          // found books
	      }).catch(function(reason){
	        // something went wrong
	      });
	      ```

	      @method then
	      @param {Function} onFulfilled
	      @param {Function} onRejected
	      Useful for tooling.
	      @return {Promise}
	    */
	      then: lib$es6$promise$then$$default,

	    /**
	      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
	      as the catch block of a try/catch statement.

	      ```js
	      function findAuthor(){
	        throw new Error('couldn't find that author');
	      }

	      // synchronous
	      try {
	        findAuthor();
	      } catch(reason) {
	        // something went wrong
	      }

	      // async with promises
	      findAuthor().catch(function(reason){
	        // something went wrong
	      });
	      ```

	      @method catch
	      @param {Function} onRejection
	      Useful for tooling.
	      @return {Promise}
	    */
	      'catch': function(onRejection) {
	        return this.then(null, onRejection);
	      }
	    };
	    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;
	    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
	      this._instanceConstructor = Constructor;
	      this.promise = new Constructor(lib$es6$promise$$internal$$noop);

	      if (Array.isArray(input)) {
	        this._input     = input;
	        this.length     = input.length;
	        this._remaining = input.length;

	        this._result = new Array(this.length);

	        if (this.length === 0) {
	          lib$es6$promise$$internal$$fulfill(this.promise, this._result);
	        } else {
	          this.length = this.length || 0;
	          this._enumerate();
	          if (this._remaining === 0) {
	            lib$es6$promise$$internal$$fulfill(this.promise, this._result);
	          }
	        }
	      } else {
	        lib$es6$promise$$internal$$reject(this.promise, this._validationError());
	      }
	    }

	    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
	      return new Error('Array Methods must be provided an Array');
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
	      var length  = this.length;
	      var input   = this._input;

	      for (var i = 0; this._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
	        this._eachEntry(input[i], i);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
	      var c = this._instanceConstructor;
	      var resolve = c.resolve;

	      if (resolve === lib$es6$promise$promise$resolve$$default) {
	        var then = lib$es6$promise$$internal$$getThen(entry);

	        if (then === lib$es6$promise$then$$default &&
	            entry._state !== lib$es6$promise$$internal$$PENDING) {
	          this._settledAt(entry._state, i, entry._result);
	        } else if (typeof then !== 'function') {
	          this._remaining--;
	          this._result[i] = entry;
	        } else if (c === lib$es6$promise$promise$$default) {
	          var promise = new c(lib$es6$promise$$internal$$noop);
	          lib$es6$promise$$internal$$handleMaybeThenable(promise, entry, then);
	          this._willSettleAt(promise, i);
	        } else {
	          this._willSettleAt(new c(function(resolve) { resolve(entry); }), i);
	        }
	      } else {
	        this._willSettleAt(resolve(entry), i);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
	      var promise = this.promise;

	      if (promise._state === lib$es6$promise$$internal$$PENDING) {
	        this._remaining--;

	        if (state === lib$es6$promise$$internal$$REJECTED) {
	          lib$es6$promise$$internal$$reject(promise, value);
	        } else {
	          this._result[i] = value;
	        }
	      }

	      if (this._remaining === 0) {
	        lib$es6$promise$$internal$$fulfill(promise, this._result);
	      }
	    };

	    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
	      var enumerator = this;

	      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
	        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
	      }, function(reason) {
	        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
	      });
	    };
	    function lib$es6$promise$polyfill$$polyfill() {
	      var local;

	      if (typeof global !== 'undefined') {
	          local = global;
	      } else if (typeof self !== 'undefined') {
	          local = self;
	      } else {
	          try {
	              local = Function('return this')();
	          } catch (e) {
	              throw new Error('polyfill failed because global object is unavailable in this environment');
	          }
	      }

	      var P = local.Promise;

	      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
	        return;
	      }

	      local.Promise = lib$es6$promise$promise$$default;
	    }
	    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

	    var lib$es6$promise$umd$$ES6Promise = {
	      'Promise': lib$es6$promise$promise$$default,
	      'polyfill': lib$es6$promise$polyfill$$default
	    };

	    /* global define:true module:true window: true */
	    if ("function" === 'function' && __webpack_require__(60)['amd']) {
	      !(__WEBPACK_AMD_DEFINE_RESULT__ = function() { return lib$es6$promise$umd$$ES6Promise; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (typeof module !== 'undefined' && module['exports']) {
	      module['exports'] = lib$es6$promise$umd$$ES6Promise;
	    } else if (typeof this !== 'undefined') {
	      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
	    }

	    lib$es6$promise$polyfill$$default();
	}).call(this);


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(12), (function() { return this; }()), __webpack_require__(58)(module)))

/***/ },
/* 58 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 59 */
/***/ function(module, exports) {

	/* (ignored) */

/***/ },
/* 60 */
/***/ function(module, exports) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	// the whatwg-fetch polyfill installs the fetch() function
	// on the global object (window or self)
	//
	// Return that as the export for use in Webpack, Browserify etc.
	__webpack_require__(62);
	module.exports = self.fetch.bind(self);


/***/ },
/* 62 */
/***/ function(module, exports) {

	(function(self) {
	  'use strict';

	  if (self.fetch) {
	    return
	  }

	  function normalizeName(name) {
	    if (typeof name !== 'string') {
	      name = String(name)
	    }
	    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	      throw new TypeError('Invalid character in header field name')
	    }
	    return name.toLowerCase()
	  }

	  function normalizeValue(value) {
	    if (typeof value !== 'string') {
	      value = String(value)
	    }
	    return value
	  }

	  function Headers(headers) {
	    this.map = {}

	    if (headers instanceof Headers) {
	      headers.forEach(function(value, name) {
	        this.append(name, value)
	      }, this)

	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        this.append(name, headers[name])
	      }, this)
	    }
	  }

	  Headers.prototype.append = function(name, value) {
	    name = normalizeName(name)
	    value = normalizeValue(value)
	    var list = this.map[name]
	    if (!list) {
	      list = []
	      this.map[name] = list
	    }
	    list.push(value)
	  }

	  Headers.prototype['delete'] = function(name) {
	    delete this.map[normalizeName(name)]
	  }

	  Headers.prototype.get = function(name) {
	    var values = this.map[normalizeName(name)]
	    return values ? values[0] : null
	  }

	  Headers.prototype.getAll = function(name) {
	    return this.map[normalizeName(name)] || []
	  }

	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(normalizeName(name))
	  }

	  Headers.prototype.set = function(name, value) {
	    this.map[normalizeName(name)] = [normalizeValue(value)]
	  }

	  Headers.prototype.forEach = function(callback, thisArg) {
	    Object.getOwnPropertyNames(this.map).forEach(function(name) {
	      this.map[name].forEach(function(value) {
	        callback.call(thisArg, value, name, this)
	      }, this)
	    }, this)
	  }

	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true
	  }

	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result)
	      }
	      reader.onerror = function() {
	        reject(reader.error)
	      }
	    })
	  }

	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader()
	    reader.readAsArrayBuffer(blob)
	    return fileReaderReady(reader)
	  }

	  function readBlobAsText(blob) {
	    var reader = new FileReader()
	    reader.readAsText(blob)
	    return fileReaderReady(reader)
	  }

	  var support = {
	    blob: 'FileReader' in self && 'Blob' in self && (function() {
	      try {
	        new Blob();
	        return true
	      } catch(e) {
	        return false
	      }
	    })(),
	    formData: 'FormData' in self,
	    arrayBuffer: 'ArrayBuffer' in self
	  }

	  function Body() {
	    this.bodyUsed = false


	    this._initBody = function(body) {
	      this._bodyInit = body
	      if (typeof body === 'string') {
	        this._bodyText = body
	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	        this._bodyBlob = body
	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	        this._bodyFormData = body
	      } else if (!body) {
	        this._bodyText = ''
	      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
	        // Only support ArrayBuffers for POST method.
	        // Receiving ArrayBuffers happens via Blobs, instead.
	      } else {
	        throw new Error('unsupported BodyInit type')
	      }

	      if (!this.headers.get('content-type')) {
	        if (typeof body === 'string') {
	          this.headers.set('content-type', 'text/plain;charset=UTF-8')
	        } else if (this._bodyBlob && this._bodyBlob.type) {
	          this.headers.set('content-type', this._bodyBlob.type)
	        }
	      }
	    }

	    if (support.blob) {
	      this.blob = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      }

	      this.arrayBuffer = function() {
	        return this.blob().then(readBlobAsArrayBuffer)
	      }

	      this.text = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }

	        if (this._bodyBlob) {
	          return readBlobAsText(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as text')
	        } else {
	          return Promise.resolve(this._bodyText)
	        }
	      }
	    } else {
	      this.text = function() {
	        var rejected = consumed(this)
	        return rejected ? rejected : Promise.resolve(this._bodyText)
	      }
	    }

	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      }
	    }

	    this.json = function() {
	      return this.text().then(JSON.parse)
	    }

	    return this
	  }

	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase()
	    return (methods.indexOf(upcased) > -1) ? upcased : method
	  }

	  function Request(input, options) {
	    options = options || {}
	    var body = options.body
	    if (Request.prototype.isPrototypeOf(input)) {
	      if (input.bodyUsed) {
	        throw new TypeError('Already read')
	      }
	      this.url = input.url
	      this.credentials = input.credentials
	      if (!options.headers) {
	        this.headers = new Headers(input.headers)
	      }
	      this.method = input.method
	      this.mode = input.mode
	      if (!body) {
	        body = input._bodyInit
	        input.bodyUsed = true
	      }
	    } else {
	      this.url = input
	    }

	    this.credentials = options.credentials || this.credentials || 'omit'
	    if (options.headers || !this.headers) {
	      this.headers = new Headers(options.headers)
	    }
	    this.method = normalizeMethod(options.method || this.method || 'GET')
	    this.mode = options.mode || this.mode || null
	    this.referrer = null

	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(body)
	  }

	  Request.prototype.clone = function() {
	    return new Request(this)
	  }

	  function decode(body) {
	    var form = new FormData()
	    body.trim().split('&').forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=')
	        var name = split.shift().replace(/\+/g, ' ')
	        var value = split.join('=').replace(/\+/g, ' ')
	        form.append(decodeURIComponent(name), decodeURIComponent(value))
	      }
	    })
	    return form
	  }

	  function headers(xhr) {
	    var head = new Headers()
	    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
	    pairs.forEach(function(header) {
	      var split = header.trim().split(':')
	      var key = split.shift().trim()
	      var value = split.join(':').trim()
	      head.append(key, value)
	    })
	    return head
	  }

	  Body.call(Request.prototype)

	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {}
	    }

	    this.type = 'default'
	    this.status = options.status
	    this.ok = this.status >= 200 && this.status < 300
	    this.statusText = options.statusText
	    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
	    this.url = options.url || ''
	    this._initBody(bodyInit)
	  }

	  Body.call(Response.prototype)

	  Response.prototype.clone = function() {
	    return new Response(this._bodyInit, {
	      status: this.status,
	      statusText: this.statusText,
	      headers: new Headers(this.headers),
	      url: this.url
	    })
	  }

	  Response.error = function() {
	    var response = new Response(null, {status: 0, statusText: ''})
	    response.type = 'error'
	    return response
	  }

	  var redirectStatuses = [301, 302, 303, 307, 308]

	  Response.redirect = function(url, status) {
	    if (redirectStatuses.indexOf(status) === -1) {
	      throw new RangeError('Invalid status code')
	    }

	    return new Response(null, {status: status, headers: {location: url}})
	  }

	  self.Headers = Headers;
	  self.Request = Request;
	  self.Response = Response;

	  self.fetch = function(input, init) {
	    return new Promise(function(resolve, reject) {
	      var request
	      if (Request.prototype.isPrototypeOf(input) && !init) {
	        request = input
	      } else {
	        request = new Request(input, init)
	      }

	      var xhr = new XMLHttpRequest()

	      function responseURL() {
	        if ('responseURL' in xhr) {
	          return xhr.responseURL
	        }

	        // Avoid security warnings on getResponseHeader when not allowed by CORS
	        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
	          return xhr.getResponseHeader('X-Request-URL')
	        }

	        return;
	      }

	      xhr.onload = function() {
	        var status = (xhr.status === 1223) ? 204 : xhr.status
	        if (status < 100 || status > 599) {
	          reject(new TypeError('Network request failed'))
	          return
	        }
	        var options = {
	          status: status,
	          statusText: xhr.statusText,
	          headers: headers(xhr),
	          url: responseURL()
	        }
	        var body = 'response' in xhr ? xhr.response : xhr.responseText;
	        resolve(new Response(body, options))
	      }

	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'))
	      }

	      xhr.open(request.method, request.url, true)

	      if (request.credentials === 'include') {
	        xhr.withCredentials = true
	      }

	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob'
	      }

	      request.headers.forEach(function(value, name) {
	        xhr.setRequestHeader(name, value)
	      })

	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
	    })
	  }
	  self.fetch.polyfill = true
	})(typeof self !== 'undefined' ? self : this);


/***/ }
/******/ ])
});
;